import { AlertTriangle, ArrowUpRight, Link2, RadioTower, ShieldAlert, TrendingDown } from "lucide-react";

const alerts = [
  {
    id: "ALERT-SUM-044",
    title: "Repeated endangered detections",
    region: "Northern Sumatra Corridor",
    severity: "high",
    confidence: "88%",
    trace: "3c3c3d76-8f64-4d9e-9d59-2e2fd5f4a7d8",
    evidence: ["OBS-SUM-1041", "OBS-SUM-1088", "CASE-SUM-041"],
    reason: "Repeated Pongo abelii detections near fragmented corridor over a 30-day window.",
    icon: ShieldAlert,
  },
  {
    id: "ALERT-HAB-027",
    title: "Habitat conflict escalation",
    region: "West Java Montane Edge",
    severity: "moderate",
    confidence: "74%",
    trace: "91d73a85-c0b1-4de1-a968-9ce9a2b57f0a",
    evidence: ["OBS-JAV-2201", "OBS-JAV-2219", "CASE-HAB-019"],
    reason: "Increasing habitat inconsistency near agricultural edge zones requires reviewer validation.",
    icon: AlertTriangle,
  },
  {
    id: "ALERT-MIG-012",
    title: "Migration disruption pattern",
    region: "Coastal Wetland Survey Cell",
    severity: "watch",
    confidence: "69%",
    trace: "b4d55055-bcc7-43da-bb8f-7130b6b4927b",
    evidence: ["OBS-WET-801", "OBS-WET-817"],
    reason: "Arrival timing for monitored species group deviates from baseline seasonal window.",
    icon: RadioTower,
  },
  {
    id: "ALERT-CONF-006",
    title: "Declining regional confidence",
    region: "Eastern Kalimantan Survey Cell",
    severity: "watch",
    confidence: "63%",
    trace: "e1cf270f-627e-4395-aefc-d408a57d801a",
    evidence: ["REG-KAL-2", "REVIEW-441"],
    reason: "Repeated reviewer disagreement is reducing regional confidence drift for recent observations.",
    icon: TrendingDown,
  },
];

export default function EcologicalAlertsPage() {
  const hasAlerts = alerts.length > 0;

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-6 text-forest-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-stone-200 pb-5">
          <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">
            Ecological monitoring
          </p>
          <h1 className="mt-2 text-3xl font-display-lg text-forest-950">Ecological alerts</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-700">
            Traceable operational alerts generated from longitudinal observation patterns, field cases, and reviewer-confirmed signals.
          </p>
        </header>

        {!hasAlerts && (
          <EmptyState
            title="No ecological alerts are active"
            detail="Alerts appear when longitudinal reasoning detects repeated endangered observations, escalating anomaly clusters, habitat conflict, or migration disruption."
          />
        )}

        {hasAlerts && <div className="grid gap-4 lg:grid-cols-2">
          {alerts.map((alert) => (
            <article key={alert.id} className="rounded-md border border-stone-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-olive-300 bg-olive-100">
                    <alert.icon className="h-5 w-5 text-forest-800" />
                  </div>
                  <div>
                    <p className="font-data-sm text-sm text-forest-700">{alert.id}</p>
                    <h2 className="mt-1 text-xl font-headline-md text-forest-950">{alert.title}</h2>
                    <p className="mt-1 text-sm text-forest-700">{alert.region}</p>
                  </div>
                </div>
                <span className="rounded-sm border border-warning-amber/30 bg-warning-amber/15 px-2 py-1 text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-900">
                  {alert.severity}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Confidence" value={alert.confidence} />
                <Metric label="Reasoning trace" value={alert.trace} compact />
              </div>

              <div className="mt-4 rounded-sm bg-stone-100 px-4 py-3 text-sm leading-6 text-forest-800">
                {alert.reason}
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-label-caps uppercase tracking-[0.08em] text-forest-700">
                  <Link2 className="h-3.5 w-3.5" />
                  Linked evidence
                </div>
                <div className="flex flex-wrap gap-2">
                  {alert.evidence.map((item) => (
                    <span key={item} className="rounded-sm border border-stone-200 px-3 py-2 font-data-sm text-xs text-forest-800">
                      {item}
                    </span>
                  ))}
                </div>
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
      <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">No active alert evidence</p>
      <h2 className="mt-2 text-xl font-headline-md text-forest-950">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-700">{detail}</p>
    </section>
  );
}

function Metric({ compact, label, value }: { compact?: boolean; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-600">{label}</p>
        <ArrowUpRight className="h-3.5 w-3.5 text-forest-500" />
      </div>
      <p className={`mt-2 font-data-sm text-forest-950 ${compact ? "break-all text-[11px]" : "text-sm"}`}>{value}</p>
    </div>
  );
}
