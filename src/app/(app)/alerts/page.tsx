import { AlertTriangle, ArrowUpRight, Link2, ShieldAlert } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AlertRow = {
  id: string;
  alert_type: string;
  severity: string;
  region_key: string;
  evidence_pattern_ids: unknown;
  evidence_observation_ids: unknown;
  operational_summary: string;
  generated_at: string;
};

function asStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export default async function EcologicalAlertsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ecological_alerts")
    .select("id, alert_type, severity, region_key, evidence_pattern_ids, evidence_observation_ids, operational_summary, generated_at")
    .is("resolved_at", null)
    .order("generated_at", { ascending: false })
    .limit(50);

  const alerts = (data ?? []) as AlertRow[];
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
            Traceable operational alerts generated from persisted longitudinal patterns, field cases, and reviewer-confirmed signals.
          </p>
        </header>

        {error ? (
          <EmptyState
            title="Ecological alerts could not be loaded"
            detail="NaLI could not reach persisted alert records. Check Supabase connectivity and longitudinal intelligence migrations."
          />
        ) : null}

        {!error && !hasAlerts ? (
          <EmptyState
            title="No ecological alerts are active"
            detail="Alerts appear when longitudinal reasoning detects repeated endangered observations, escalating anomaly clusters, habitat conflict, or migration disruption."
          />
        ) : null}

        {!error && hasAlerts ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {alerts.map((alert) => {
              const evidence = [...asStrings(alert.evidence_pattern_ids), ...asStrings(alert.evidence_observation_ids)];
              return (
                <article key={alert.id} className="rounded-md border border-stone-200 bg-white p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-olive-300 bg-olive-100">
                        {alert.severity === "high" || alert.severity === "critical" ? (
                          <ShieldAlert className="h-5 w-5 text-forest-800" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-forest-800" />
                        )}
                      </div>
                      <div>
                        <p className="font-data-sm text-sm text-forest-700">{alert.id}</p>
                        <h2 className="mt-1 text-xl font-headline-md capitalize text-forest-950">
                          {formatStatus(alert.alert_type)}
                        </h2>
                        <p className="mt-1 text-sm text-forest-700">{alert.region_key}</p>
                      </div>
                    </div>
                    <span className="rounded-sm border border-warning-amber/30 bg-warning-amber/15 px-2 py-1 text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-900">
                      {alert.severity}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Metric label="Generated" value={new Date(alert.generated_at).toLocaleString()} />
                    <Metric label="Alert type" value={formatStatus(alert.alert_type)} />
                  </div>

                  <div className="mt-4 rounded-sm bg-stone-100 px-4 py-3 text-sm leading-6 text-forest-800">
                    {alert.operational_summary}
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-label-caps uppercase tracking-[0.08em] text-forest-700">
                      <Link2 className="h-3.5 w-3.5" />
                      Linked evidence
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {evidence.length ? (
                        evidence.map((item) => (
                          <span key={item} className="rounded-sm border border-stone-200 px-3 py-2 font-data-sm text-xs text-forest-800">
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-sm border border-stone-200 px-3 py-2 text-xs text-forest-700">
                          Evidence references pending
                        </span>
                      )}
                    </div>
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
      <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">No active alert evidence</p>
      <h2 className="mt-2 text-xl font-headline-md text-forest-950">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-700">{detail}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-600">{label}</p>
        <ArrowUpRight className="h-3.5 w-3.5 text-forest-500" />
      </div>
      <p className="mt-2 break-all font-data-sm text-sm text-forest-950">{value}</p>
    </div>
  );
}
