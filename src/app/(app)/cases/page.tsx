import { AlertTriangle, ClipboardList, Link2, UserCheck, type LucideIcon } from "lucide-react";

const cases = [
  {
    id: "CASE-SUM-041",
    title: "Endangered species escalation",
    region: "Northern Sumatra Corridor",
    state: "escalated",
    severity: "high",
    confidence: "87%",
    reviewer: "Primate review group",
    observations: ["OBS-SUM-1041", "OBS-SUM-1088", "OBS-SUM-1120"],
    clusters: ["Repeated nocturnal anomaly", "Fragmented habitat boundary"],
    note: "Three linked observations indicate repeated endangered detections near fragmented corridor.",
  },
  {
    id: "CASE-HAB-019",
    title: "Habitat degradation signal",
    region: "West Java Montane Edge",
    state: "investigating",
    severity: "moderate",
    confidence: "72%",
    reviewer: "Habitat review desk",
    observations: ["OBS-JAV-2201", "OBS-JAV-2219"],
    clusters: ["Habitat conflict increase"],
    note: "Field records show repeated habitat inconsistency near agricultural edge zones.",
  },
];

export default function FieldCasesPage() {
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

        {!hasCases && (
          <EmptyState
            title="No field cases are open"
            detail="Cases are created when observations meet escalation rules such as endangered overlap, repeated anomaly clusters, or habitat pressure."
          />
        )}

        {hasCases && <div className="grid gap-4 lg:grid-cols-2">
          {cases.map((fieldCase) => (
            <article key={fieldCase.id} className="rounded-md border border-stone-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-data-sm text-sm text-forest-700">{fieldCase.id}</p>
                  <h2 className="mt-1 text-xl font-headline-md text-forest-950">{fieldCase.title}</h2>
                  <p className="mt-1 text-sm text-forest-700">{fieldCase.region}</p>
                </div>
                <span className="rounded-sm border border-olive-300 bg-olive-100 px-2 py-1 text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-800">
                  {fieldCase.state}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Fact icon={AlertTriangle} label="Severity" value={fieldCase.severity} />
                <Fact icon={ClipboardList} label="Confidence" value={fieldCase.confidence} />
                <Fact icon={UserCheck} label="Reviewer" value={fieldCase.reviewer} />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <LinkedList title="Linked observations" items={fieldCase.observations} />
                <LinkedList title="Linked clusters" items={fieldCase.clusters} />
              </div>

              <div className="mt-4 rounded-sm bg-stone-100 px-4 py-3 text-sm leading-6 text-forest-800">
                {fieldCase.note}
              </div>
            </article>
          ))}
        </div>}
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

function LinkedList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-label-caps uppercase tracking-[0.08em] text-forest-700">
        <Link2 className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-sm border border-stone-200 px-3 py-2 font-data-sm text-xs text-forest-800">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
