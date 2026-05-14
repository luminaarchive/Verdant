import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ClipboardCheck, Fingerprint, ShieldCheck, type LucideIcon } from "lucide-react";
import { ReviewActionForm } from "@/components/review/ReviewActionForm";
import { getOperationalRole } from "@/lib/auth/roles";
import { getServerTranslations } from "@/lib/i18n/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ReviewQueueRow = {
  id: string;
  scientific_name: string | null;
  local_name: string | null;
  conservation_status: string | null;
  confidence_level: number | null;
  review_status: string | null;
  observation_status: string | null;
  anomaly_flag: boolean | null;
  is_anomaly: boolean | null;
  reasoning_snapshot: Record<string, unknown> | null;
  signal_snapshot: Record<string, unknown> | null;
  created_at: string | null;
};

export default async function ReviewPage() {
  const { t } = await getServerTranslations();
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const role = await getOperationalRole(supabase, session.user.id);
  if (!role.canReview) {
    return (
      <main className="text-forest-950 min-h-screen bg-stone-50 px-4 py-8">
        <section className="mx-auto max-w-2xl rounded-sm border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.08em] text-olive-700 uppercase">
            {t("reviewQueue.roleKicker")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{t("reviewQueue.roleTitle")}</h1>
          <p className="text-forest-700 mt-3 text-sm leading-6">{t("reviewQueue.roleDescription")}</p>
        </section>
      </main>
    );
  }

  const { data } = await supabase
    .from("observations")
    .select(
      "id, scientific_name, local_name, conservation_status, confidence_level, review_status, observation_status, anomaly_flag, is_anomaly, reasoning_snapshot, signal_snapshot, created_at",
    )
    .or("qa_flag.eq.true,review_status.eq.unreviewed,observation_status.eq.pending_review")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (data ?? []) as ReviewQueueRow[];

  return (
    <main className="text-forest-950 min-h-screen bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.08em] text-olive-700 uppercase">{t("reviewQueue.kicker")}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[0]">{t("reviewQueue.title")}</h1>
        <p className="text-forest-700 mt-3 max-w-3xl text-sm leading-6">{t("reviewQueue.description")}</p>

        <div className="mt-6 grid gap-4">
          {rows.length ? (
            rows.map((row) => {
              const reasoning = row.reasoning_snapshot ?? {};
              const signals = row.signal_snapshot ?? {};
              return (
                <article className="rounded-sm border border-stone-200 bg-white p-5 shadow-sm" key={row.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.08em] text-olive-700 uppercase">
                        {row.observation_status || t("reviewQueue.pendingReview")}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold italic">
                        {row.scientific_name || t("reviewQueue.speciesPending")}
                      </h2>
                      <p className="text-forest-700 text-sm">{row.local_name || t("reviewQueue.commonNamePending")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge icon={ShieldCheck} label={row.conservation_status || "NE"} />
                      <Badge icon={ClipboardCheck} label={row.review_status || t("reviewQueue.unreviewed")} />
                      {row.anomaly_flag || row.is_anomaly ? (
                        <Badge icon={AlertTriangle} label={t("reviewQueue.anomaly")} />
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <Metric
                      label={t("reviewQueue.confidence")}
                      value={
                        row.confidence_level ? `${Math.round(row.confidence_level * 100)}%` : t("reviewQueue.pending")
                      }
                    />
                    <Metric label={t("reviewQueue.evidenceHash")} value={t("reviewQueue.openDetailForHash")} />
                    <Metric
                      label={t("reviewQueue.reasoningSnapshot")}
                      value={Object.keys(reasoning).length ? t("reviewQueue.persisted") : t("reviewQueue.pending")}
                    />
                    <Metric
                      label={t("reviewQueue.signalSnapshot")}
                      value={Object.keys(signals).length ? t("reviewQueue.persisted") : t("reviewQueue.pending")}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      className="text-forest-900 inline-flex min-h-10 items-center gap-2 rounded-sm border border-stone-300 px-3 text-sm font-semibold"
                      href={`/observation/${row.id}`}
                    >
                      <Fingerprint className="h-4 w-4" />
                      {t("reviewQueue.openAuditDetail")}
                    </Link>
                  </div>

                  <ReviewActionForm observationId={row.id} />
                </article>
              );
            })
          ) : (
            <div className="text-forest-700 rounded-sm border border-stone-200 bg-white p-6 text-sm leading-6">
              {t("reviewQueue.empty")}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Badge({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="text-forest-800 inline-flex items-center gap-1.5 rounded-sm border border-stone-300 bg-stone-50 px-2.5 py-1 text-xs font-semibold">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <p className="text-forest-600 text-xs font-semibold tracking-[0.08em] uppercase">{label}</p>
      <p className="text-forest-950 mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
