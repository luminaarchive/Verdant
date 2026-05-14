import { AlertTriangle, ClipboardList, Link2, UserCheck, type LucideIcon } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type FieldCase = {
  id: string;
  case_type: string | null;
  status: string | null;
  priority_score: number | null;
  linked_observation_ids: unknown;
  linked_ecological_patterns: unknown;
  linked_anomaly_cluster_ids: unknown;
  reviewer_assignment_ids: unknown;
  operational_notes: unknown;
  updated_at: string | null;
};

function asStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function formatStatus(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "pending";
}

function percent(value: number | null) {
  if (typeof value !== "number") return "Pending";
  return `${Math.round(value * 100)}%`;
}

export default async function FieldCasesPage() {
  const { t } = await getServerTranslations();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("field_cases")
    .select(
      "id, case_type, status, priority_score, linked_observation_ids, linked_ecological_patterns, linked_anomaly_cluster_ids, reviewer_assignment_ids, operational_notes, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(50);

  const cases = (data ?? []) as FieldCase[];
  const hasCases = cases.length > 0;

  return (
    <div className="text-forest-950 min-h-screen bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-stone-200 pb-5">
          <p className="font-label-caps text-[11px] tracking-[0.08em] text-olive-700 uppercase">{t("cases.eyebrow")}</p>
          <h1 className="font-display-lg text-forest-950 mt-2 text-3xl">{t("cases.title")}</h1>
          <p className="text-forest-700 mt-3 max-w-2xl text-sm leading-6">{t("cases.context")}</p>
        </header>

        {error ? (
          <EmptyState
            eyebrow={t("cases.noRecords")}
            title={t("cases.loadErrorTitle")}
            detail={t("cases.loadErrorDetail")}
          />
        ) : null}

        {!error && !hasCases ? (
          <EmptyState eyebrow={t("cases.noRecords")} title={t("cases.emptyTitle")} detail={t("cases.emptyDetail")} />
        ) : null}

        {!error && hasCases ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {cases.map((fieldCase) => {
              const observations = asStrings(fieldCase.linked_observation_ids);
              const clusters = [
                ...asStrings(fieldCase.linked_ecological_patterns),
                ...asStrings(fieldCase.linked_anomaly_cluster_ids),
              ];
              const reviewers = asStrings(fieldCase.reviewer_assignment_ids);
              const notes = asStrings(fieldCase.operational_notes);

              return (
                <article key={fieldCase.id} className="rounded-md border border-stone-200 bg-white p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-data-sm text-forest-700 text-sm">{fieldCase.id}</p>
                      <h2 className="font-headline-md text-forest-950 mt-1 text-xl capitalize">
                        {formatStatus(fieldCase.case_type)}
                      </h2>
                      <p className="text-forest-700 mt-1 text-sm">
                        Updated{" "}
                        {fieldCase.updated_at ? new Date(fieldCase.updated_at).toLocaleString() : "time unavailable"}
                      </p>
                    </div>
                    <span className="font-label-caps text-forest-800 rounded-sm border border-olive-300 bg-olive-100 px-2 py-1 text-[10px] tracking-[0.08em] uppercase">
                      {formatStatus(fieldCase.status)}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Fact icon={AlertTriangle} label="Severity" value={percent(fieldCase.priority_score)} />
                    <Fact icon={ClipboardList} label="Case Confidence" value={percent(fieldCase.priority_score)} />
                    <Fact icon={UserCheck} label="Reviewer" value={reviewers[0] ?? "Unassigned"} />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <LinkedList
                      title={t("cases.linkedObservations")}
                      items={observations}
                      empty={t("cases.noLinkedObservations")}
                    />
                    <LinkedList
                      title={t("cases.linkedClusters")}
                      items={clusters}
                      empty={t("cases.noLinkedClusters")}
                    />
                  </div>

                  <div className="text-forest-800 mt-4 rounded-sm bg-stone-100 px-4 py-3 text-sm leading-6">
                    {notes[0] ?? t("cases.notesPending")}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ detail, eyebrow, title }: { detail: string; eyebrow: string; title: string }) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-6">
      <p className="font-label-caps text-[11px] tracking-[0.08em] text-olive-700 uppercase">{eyebrow}</p>
      <h2 className="font-headline-md text-forest-950 mt-2 text-xl">{title}</h2>
      <p className="text-forest-700 mt-3 max-w-2xl text-sm leading-6">{detail}</p>
    </section>
  );
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <Icon className="text-forest-700 mb-2 h-4 w-4" />
      <p className="font-label-caps text-forest-600 text-[10px] tracking-[0.08em] uppercase">{label}</p>
      <p className="text-forest-950 mt-1 text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}

function LinkedList({ empty, items, title }: { empty: string; items: string[]; title: string }) {
  return (
    <div>
      <div className="font-label-caps text-forest-700 mb-2 flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase">
        <Link2 className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="space-y-2">
        {items.length ? (
          items.map((item) => (
            <div
              key={item}
              className="font-data-sm text-forest-800 rounded-sm border border-stone-200 px-3 py-2 text-xs"
            >
              {item}
            </div>
          ))
        ) : (
          <div className="text-forest-700 rounded-sm border border-stone-200 px-3 py-2 text-xs">{empty}</div>
        )}
      </div>
    </div>
  );
}
