import { AlertTriangle, ClipboardList, Link2, UserCheck, type LucideIcon } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
    <div className="min-h-screen bg-stone-50 px-4 py-6 text-forest-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-stone-200 pb-5">
          <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">
            Conservation operations
          </p>
          <h1 className="mt-2 text-3xl font-display-lg text-forest-950">Field cases</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-700">
            Escalated ecological signals linked to observations, anomaly clusters, reviewers, and operational notes.
          </p>
        </header>

        {error ? (
          <EmptyState
            title="Field cases could not be loaded"
            detail="NaLI could not reach persisted case records. Check Supabase connectivity and field case migrations."
          />
        ) : null}

        {!error && !hasCases ? (
          <EmptyState
            title="No field cases are open"
            detail="Cases are created when observations meet escalation rules such as endangered overlap, repeated anomaly clusters, or habitat pressure."
          />
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
                      <p className="font-data-sm text-sm text-forest-700">{fieldCase.id}</p>
                      <h2 className="mt-1 text-xl font-headline-md capitalize text-forest-950">
                        {formatStatus(fieldCase.case_type)}
                      </h2>
                      <p className="mt-1 text-sm text-forest-700">
                        Updated {fieldCase.updated_at ? new Date(fieldCase.updated_at).toLocaleString() : "time unavailable"}
                      </p>
                    </div>
                    <span className="rounded-sm border border-olive-300 bg-olive-100 px-2 py-1 text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-800">
                      {formatStatus(fieldCase.status)}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Fact icon={AlertTriangle} label="Severity" value={percent(fieldCase.priority_score)} />
                    <Fact icon={ClipboardList} label="Case Confidence" value={percent(fieldCase.priority_score)} />
                    <Fact icon={UserCheck} label="Reviewer" value={reviewers[0] ?? "Unassigned"} />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <LinkedList title="Linked observations" items={observations} empty="No linked observations persisted." />
                    <LinkedList title="Linked clusters" items={clusters} empty="No linked clusters persisted." />
                  </div>

                  <div className="mt-4 rounded-sm bg-stone-100 px-4 py-3 text-sm leading-6 text-forest-800">
                    {notes[0] ?? "Operational notes will appear after reviewer or escalation updates are persisted."}
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

function EmptyState({ detail, title }: { detail: string; title: string }) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-6">
      <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">No escalation records</p>
      <h2 className="mt-2 text-xl font-headline-md text-forest-950">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-700">{detail}</p>
    </section>
  );
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <Icon className="mb-2 h-4 w-4 text-forest-700" />
      <p className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-600">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-forest-950">{value}</p>
    </div>
  );
}

function LinkedList({ empty, items, title }: { empty: string; items: string[]; title: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-label-caps uppercase tracking-[0.08em] text-forest-700">
        <Link2 className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item} className="rounded-sm border border-stone-200 px-3 py-2 font-data-sm text-xs text-forest-800">
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-sm border border-stone-200 px-3 py-2 text-xs text-forest-700">{empty}</div>
        )}
      </div>
    </div>
  );
}
