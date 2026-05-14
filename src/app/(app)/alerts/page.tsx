import { AlertTriangle, ArrowUpRight, Link2, ShieldAlert } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/lib/i18n/server";

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
  const { t } = await getServerTranslations();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ecological_alerts")
    .select(
      "id, alert_type, severity, region_key, evidence_pattern_ids, evidence_observation_ids, operational_summary, generated_at",
    )
    .is("resolved_at", null)
    .order("generated_at", { ascending: false })
    .limit(50);

  const alerts = (data ?? []) as AlertRow[];
  const hasAlerts = alerts.length > 0;

  return (
    <div className="text-forest-950 min-h-screen bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-stone-200 pb-5">
          <p className="font-label-caps text-[11px] tracking-[0.08em] text-olive-700 uppercase">
            {t("alerts.eyebrow")}
          </p>
          <h1 className="font-display-lg text-forest-950 mt-2 text-3xl">{t("alerts.title")}</h1>
          <p className="text-forest-700 mt-3 max-w-2xl text-sm leading-6">{t("alerts.context")}</p>
        </header>

        {error ? (
          <EmptyState
            eyebrow={t("alerts.noEvidence")}
            title={t("alerts.loadErrorTitle")}
            detail={t("alerts.loadErrorDetail")}
          />
        ) : null}

        {!error && !hasAlerts ? (
          <EmptyState
            eyebrow={t("alerts.noEvidence")}
            title={t("alerts.emptyTitle")}
            detail={t("alerts.emptyDetail")}
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
                          <ShieldAlert className="text-forest-800 h-5 w-5" />
                        ) : (
                          <AlertTriangle className="text-forest-800 h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-data-sm text-forest-700 text-sm">{alert.id}</p>
                        <h2 className="font-headline-md text-forest-950 mt-1 text-xl capitalize">
                          {formatStatus(alert.alert_type)}
                        </h2>
                        <p className="text-forest-700 mt-1 text-sm">{alert.region_key}</p>
                      </div>
                    </div>
                    <span className="border-warning-amber/30 bg-warning-amber/15 font-label-caps text-forest-900 rounded-sm border px-2 py-1 text-[10px] tracking-[0.08em] uppercase">
                      {alert.severity}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Metric label="Generated" value={new Date(alert.generated_at).toLocaleString()} />
                    <Metric label="Alert type" value={formatStatus(alert.alert_type)} />
                  </div>

                  <div className="text-forest-800 mt-4 rounded-sm bg-stone-100 px-4 py-3 text-sm leading-6">
                    {alert.operational_summary}
                  </div>

                  <div className="mt-4">
                    <div className="font-label-caps text-forest-700 mb-2 flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase">
                      <Link2 className="h-3.5 w-3.5" />
                      {t("alerts.linkedEvidence")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {evidence.length ? (
                        evidence.map((item) => (
                          <span
                            key={item}
                            className="font-data-sm text-forest-800 rounded-sm border border-stone-200 px-3 py-2 text-xs"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-forest-700 rounded-sm border border-stone-200 px-3 py-2 text-xs">
                          {t("alerts.evidencePending")}
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

function EmptyState({ detail, eyebrow, title }: { detail: string; eyebrow: string; title: string }) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-6">
      <p className="font-label-caps text-[11px] tracking-[0.08em] text-olive-700 uppercase">{eyebrow}</p>
      <h2 className="font-headline-md text-forest-950 mt-2 text-xl">{title}</h2>
      <p className="text-forest-700 mt-3 max-w-2xl text-sm leading-6">{detail}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-label-caps text-forest-600 text-[10px] tracking-[0.08em] uppercase">{label}</p>
        <ArrowUpRight className="text-forest-500 h-3.5 w-3.5" />
      </div>
      <p className="font-data-sm text-forest-950 mt-2 text-sm break-all">{value}</p>
    </div>
  );
}
