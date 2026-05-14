import Link from "next/link";
import { AlertTriangle, Database, Plus } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type ArchivedObservation = {
  id: string;
  scientific_name: string | null;
  local_name: string | null;
  confidence_level: number | null;
  conservation_status: string | null;
  conservation_priority_category: string | null;
  observation_status: string | null;
  review_status: string | null;
  processing_stage: string | null;
  is_anomaly: boolean | null;
  anomaly_flag: boolean | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  timestamp: string | null;
};

function percent(value: number | null) {
  if (typeof value !== "number") return "Pending";
  return `${Math.round(value * 100)}%`;
}

function formatStatus(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "pending";
}

export default async function ArchivePage() {
  const { t } = await getServerTranslations();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = user
    ? await supabase
        .from("observations")
        .select(
          "id, scientific_name, local_name, confidence_level, conservation_status, conservation_priority_category, observation_status, review_status, processing_stage, is_anomaly, anomaly_flag, latitude, longitude, created_at, timestamp",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [], error: null };

  const observations = (data ?? []) as ArchivedObservation[];
  const hasObservations = observations.length > 0;

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface flex min-h-screen flex-col">
      <header className="border-outline-variant bg-surface-dim sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-3">
          <div className="border-outline-variant bg-surface-container flex h-8 w-8 items-center justify-center rounded-md border">
            <Database className="text-primary h-4 w-4" />
          </div>
          <span className="font-headline-md text-primary text-xl font-bold tracking-tighter">NaLI</span>
          <span className="text-on-surface-variant/50 mx-2">/</span>
          <span className="font-label-caps text-on-surface-variant text-[11px] tracking-widest uppercase">
            {t("archive.eyebrow")}
          </span>
        </div>
        <span className="font-data-sm text-on-surface-variant hidden text-sm sm:block">{user?.email}</span>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display-lg text-primary text-3xl">{t("archive.title")}</h1>
            <p className="text-on-surface-variant mt-2 max-w-2xl text-sm leading-6">{t("archive.context")}</p>
          </div>
          <Link
            href="/observe"
            className="bg-primary text-surface-container-lowest inline-flex min-h-11 items-center gap-2 rounded-sm px-4 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            {t("archive.newObservation")}
          </Link>
        </div>

        {error ? (
          <EmptyState tone="warning" title={t("archive.loadErrorTitle")} detail={t("archive.loadErrorDetail")} />
        ) : null}

        {!error && !hasObservations ? (
          <EmptyState title={t("archive.emptyTitle")} detail={t("archive.emptyDetail")} />
        ) : null}

        {!error && hasObservations ? (
          <div className="space-y-4">
            {observations.map((obs) => {
              const isAnomaly = Boolean(obs.is_anomaly || obs.anomaly_flag);
              return (
                <Link className="block" href={`/observation/${obs.id}`} key={obs.id}>
                  <article className="border-outline-variant bg-surface-container hover:border-primary flex flex-col gap-4 rounded-md border p-4 transition-colors md:flex-row md:items-center md:justify-between md:p-5">
                    <div className="flex items-start gap-4">
                      <div className="border-outline-variant bg-surface-dim flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border">
                        <Database className="text-primary/70 h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-data-sm text-primary text-sm font-semibold uppercase">
                            {obs.scientific_name || t("archive.speciesPending")}
                          </h2>
                          {isAnomaly ? (
                            <span className="border-error/20 bg-error/10 font-label-caps text-error rounded-sm border px-2 py-0.5 text-[10px]">
                              Anomaly
                            </span>
                          ) : null}
                          {obs.conservation_priority_category ? (
                            <span className="font-label-caps text-forest-800 rounded-sm border border-olive-300 bg-olive-100 px-2 py-0.5 text-[10px]">
                              {obs.conservation_priority_category}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-on-surface-variant mt-1 text-sm">
                          {obs.local_name || t("archive.commonNamePending")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                      <Field label="Confidence" value={percent(obs.confidence_level)} />
                      <Field label="Conservation" value={obs.conservation_status || "Pending"} />
                      <Field label="Observation" value={formatStatus(obs.observation_status || obs.processing_stage)} />
                      <Field label="Review" value={formatStatus(obs.review_status)} />
                    </div>

                    <div className="text-on-surface-variant text-sm md:text-right">
                      <p className="font-data-sm">
                        {obs.latitude?.toFixed(4) ?? "--"}, {obs.longitude?.toFixed(4) ?? "--"}
                      </p>
                      <p className="mt-1 text-xs">
                        {new Date(obs.created_at || obs.timestamp || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-label-caps text-on-surface-variant/70 text-[10px] tracking-[0.08em] uppercase">{label}</p>
      <p className="font-data-sm text-on-surface-variant mt-1 capitalize">{value}</p>
    </div>
  );
}

function EmptyState({ detail, title, tone }: { detail: string; title: string; tone?: "warning" }) {
  return (
    <section className="border-outline-variant bg-surface-container rounded-md border p-6">
      <div className="bg-surface-dim text-primary mb-3 flex h-10 w-10 items-center justify-center rounded-sm">
        {tone === "warning" ? <AlertTriangle className="h-5 w-5" /> : <Database className="h-5 w-5" />}
      </div>
      <p className="font-label-caps text-on-surface-variant text-[11px] tracking-[0.08em] uppercase">Field archive</p>
      <h2 className="font-headline-md text-primary mt-2 text-xl">{title}</h2>
      <p className="text-on-surface-variant mt-3 max-w-2xl text-sm leading-6">{detail}</p>
    </section>
  );
}
