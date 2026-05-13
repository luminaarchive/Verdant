import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  Leaf,
  MapPinned,
  Route,
  ShieldAlert,
} from "lucide-react";
import { generateEcologicalAlerts } from "@/lib/alerts";
import { buildRegionalBaseline } from "@/lib/agent/reasoning/ecological-baselines";
import type { ReasoningHistoryEntry } from "@/lib/agent/reasoning/ecological-memory";
import { detectLongitudinalPatterns } from "@/lib/agent/reasoning/pattern-detection";
import { evolveTemporalConfidence } from "@/lib/agent/reasoning/confidence-evolution";
import { interpretEcosystemPatterns } from "@/lib/agent/reasoning/ecosystem-interpretation";

const observations: ReasoningHistoryEntry[] = [
  {
    observation_id: "OBS-SUM-1041",
    reasoning_trace_id: "trace-sum-1041",
    scientific_name: "Pongo abelii",
    region_key: "region:3.2:98.1",
    ecological_confidence: 0.81,
    anomaly_score: 0.76,
    conservation_priority_score: 0.91,
    observed_at: "2026-04-01T19:00:00.000Z",
    iucn_status: "CR",
    habitat_boundary: "fragmented",
    activity_pattern: "nocturnal",
    reviewer_confirmed: true,
    migration_alignment_score: 0.2,
    habitat_match_score: 0.34,
  },
  {
    observation_id: "OBS-SUM-1088",
    reasoning_trace_id: "trace-sum-1088",
    scientific_name: "Pongo abelii",
    region_key: "region:3.2:98.1",
    ecological_confidence: 0.84,
    anomaly_score: 0.72,
    conservation_priority_score: 0.89,
    observed_at: "2026-04-11T20:00:00.000Z",
    iucn_status: "CR",
    habitat_boundary: "fragmented",
    activity_pattern: "nocturnal",
    reviewer_confirmed: true,
    migration_alignment_score: 0.25,
    habitat_match_score: 0.38,
  },
  {
    observation_id: "OBS-SUM-1120",
    reasoning_trace_id: "trace-sum-1120",
    scientific_name: "Pongo abelii",
    region_key: "region:3.2:98.1",
    ecological_confidence: 0.77,
    anomaly_score: 0.8,
    conservation_priority_score: 0.93,
    observed_at: "2026-04-20T21:00:00.000Z",
    iucn_status: "CR",
    habitat_boundary: "agricultural_boundary",
    activity_pattern: "nocturnal",
    reviewer_confirmed: false,
    migration_alignment_score: 0.18,
    habitat_match_score: 0.28,
  },
];

const baseline = buildRegionalBaseline({
  region_key: "region:3.2:98.1",
  observations,
  expected_species_density: { "Pongo abelii": 1 },
  expected_habitat_consistency: 0.8,
  expected_migration_alignment: 0.75,
});
const patterns = detectLongitudinalPatterns({ observations, baselines: [baseline], window_days: 30 });
const alerts = generateEcologicalAlerts(patterns);
const interpretations = interpretEcosystemPatterns(patterns);
const confidence = evolveTemporalConfidence({
  base_confidence: 0.72,
  confirmations: 2,
  reviewer_disagreements: 1,
  persistent_anomaly_clusters: 2,
});

const regions = [
  {
    name: "Northern Sumatra Corridor",
    code: "region:3.2:98.1",
    priority: "High Conservation Attention",
    endangeredDensity: 0.82,
    anomalyPressure: 0.76,
    habitatPressure: 0.71,
    migrationDisruption: 0.64,
    confidenceDrift: confidence.drift,
  },
  {
    name: "West Java Montane Edge",
    code: "region:-6.8:107.6",
    priority: "Elevated Ecological Significance",
    endangeredDensity: 0.54,
    anomalyPressure: 0.42,
    habitatPressure: 0.58,
    migrationDisruption: 0.31,
    confidenceDrift: -0.03,
  },
];

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function SignalBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-label-caps uppercase tracking-[0.08em] text-forest-700">
        <span>{label}</span>
        <span className="shrink-0 font-data-sm">{percent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-stone-200">
        <div className="h-full rounded-sm bg-forest-800" style={{ width: percent(value) }} />
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <section className="border-b border-stone-200 bg-stone-100">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_390px] lg:px-8">
          <div>
            <p className="mb-2 text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">
              Ecosystem monitoring
            </p>
            <h1 className="max-w-3xl text-3xl font-display-lg leading-tight text-forest-950 md:text-5xl">
              Regional ecological intelligence
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-700 md:text-base">
              Longitudinal monitoring across anomaly clusters, endangered species density,
              habitat pressure, migration disruption, and reviewer-confirmed ecological events.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric icon={ShieldAlert} label="Escalation Regions" value="2" />
            <Metric icon={AlertTriangle} label="Active Alerts" value={String(alerts.length)} />
            <Metric icon={Leaf} label="Habitat Pressure" value="71%" />
            <Metric icon={Route} label="Migration Signals" value="4" />
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="rounded-md border border-stone-200 bg-white p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">
                Regional watch grid
              </p>
              <h2 className="text-xl font-headline-md text-forest-950">Ecological pressure regions</h2>
            </div>
            <MapPinned className="h-5 w-5 shrink-0 text-forest-700" />
          </div>

          <div className="space-y-4">
            {regions.map((region) => (
              <article key={region.code} className="rounded-md border border-stone-200 p-4">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-data-sm text-base text-forest-950">{region.name}</h3>
                    <p className="mt-1 text-xs text-stone-500">{region.code}</p>
                  </div>
                  <span className="rounded-sm border border-olive-300 bg-olive-100 px-2 py-1 text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-800">
                    {region.priority}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <SignalBar label="Endangered density" value={region.endangeredDensity} />
                  <SignalBar label="Anomaly pressure" value={region.anomalyPressure} />
                  <SignalBar label="Habitat pressure" value={region.habitatPressure} />
                  <SignalBar label="Migration disruption" value={region.migrationDisruption} />
                </div>
                <div className="mt-4 rounded-sm bg-stone-100 px-3 py-2 text-xs text-forest-700">
                  Regional confidence drift: <span className="font-data-sm">{region.confidenceDrift >= 0 ? "+" : ""}{region.confidenceDrift.toFixed(2)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <Panel icon={Activity} title="Anomaly clusters">
            <div className="space-y-3">
              {patterns.slice(0, 4).map((pattern) => (
                <div key={pattern.id} className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-data-sm text-sm text-forest-950">{pattern.pattern_type.replaceAll("_", " ")}</span>
                    <span className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-olive-700">{pattern.severity}</span>
                  </div>
                  <p className="text-sm leading-6 text-forest-700">{pattern.evidence_summary[0]}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel icon={AlertTriangle} title="Ecological alerts">
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <Link
                  className="flex items-start justify-between gap-3 rounded-sm border border-stone-200 bg-white px-4 py-3 text-sm text-forest-800 hover:border-olive-600"
                  href="/alerts"
                  key={alert.id}
                >
                  <span>{alert.operational_summary}</span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0" />
                </Link>
              ))}
            </div>
          </Panel>

          <Panel icon={Briefcase} title="Linked field cases">
            <div className="space-y-3 text-sm leading-6 text-forest-800">
              <Link className="block rounded-sm border border-stone-200 bg-stone-50 px-4 py-3 hover:border-olive-600" href="/cases">
                CASE-SUM-041: Endangered species escalation linked to three observations.
              </Link>
              <Link className="block rounded-sm border border-stone-200 bg-stone-50 px-4 py-3 hover:border-olive-600" href="/cases">
                CASE-HAB-019: Habitat degradation signal under review.
              </Link>
            </div>
          </Panel>

          <div className="rounded-md border border-stone-200 bg-forest-950 p-5 text-stone-50">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-olive-300" />
              <h2 className="text-lg font-headline-md">Ecosystem interpretation</h2>
            </div>
            <div className="space-y-3 text-sm leading-6 text-stone-200">
              {interpretations.slice(0, 2).map((item) => (
                <p key={item.evidence_pattern_id}>{item.statement}</p>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Panel({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: typeof Activity;
  title: string;
}) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-forest-800" />
        <h2 className="text-lg font-headline-md text-forest-950">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
      <Icon className="mb-3 h-5 w-5 text-forest-800" />
      <p className="text-2xl font-data-lg text-forest-950">{value}</p>
      <p className="mt-1 text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-600">
        {label}
      </p>
    </div>
  );
}
