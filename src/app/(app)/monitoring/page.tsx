import {
  Activity,
  AlertTriangle,
  BarChart3,
  Leaf,
  MapPinned,
  Route,
  ShieldAlert,
} from "lucide-react";

const regions = [
  {
    name: "Northern Sumatra Corridor",
    code: "region:3.2:98.1",
    alert: "High Conservation Attention",
    endangeredDensity: 0.82,
    anomalyPressure: 0.76,
    habitatPressure: 0.71,
    migrationDisruption: 0.64,
  },
  {
    name: "West Java Montane Edge",
    code: "region:-6.8:107.6",
    alert: "Elevated Ecological Significance",
    endangeredDensity: 0.54,
    anomalyPressure: 0.42,
    habitatPressure: 0.58,
    migrationDisruption: 0.31,
  },
  {
    name: "Komodo Dry Forest Range",
    code: "region:-8.6:119.5",
    alert: "Routine Observation",
    endangeredDensity: 0.37,
    anomalyPressure: 0.24,
    habitatPressure: 0.29,
    migrationDisruption: 0.18,
  },
];

const clusters = [
  "Repeated endangered detections near fragmented corridor over 30-day period.",
  "Habitat inconsistency increasing near agricultural boundary observations.",
  "Nocturnal anomaly cluster requires reviewer-confirmed validation.",
];

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function SignalBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] font-label-caps uppercase tracking-[0.08em] text-forest-700">
        <span>{label}</span>
        <span className="font-data-sm">{percent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-stone-200">
        <div
          className="h-full rounded-sm bg-forest-800"
          style={{ width: percent(value) }}
        />
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <section className="border-b border-stone-200 bg-stone-100">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div>
            <p className="mb-2 text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">
              Ecosystem monitoring runtime
            </p>
            <h1 className="max-w-3xl text-3xl font-display-lg text-forest-950 md:text-5xl">
              Regional ecological intelligence
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-700 md:text-base">
              Longitudinal signal tracking across endangered density, anomaly persistence,
              habitat pressure, migration disruption, and reviewer-confirmed ecological events.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric icon={ShieldAlert} label="Escalation Regions" value="2" />
            <Metric icon={AlertTriangle} label="Anomaly Clusters" value="3" />
            <Metric icon={Leaf} label="Habitat Pressure" value="71%" />
            <Metric icon={Route} label="Migration Signals" value="4" />
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="rounded-md border border-stone-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">
                Regional watch grid
              </p>
              <h2 className="text-xl font-headline-md text-forest-950">Escalation regions</h2>
            </div>
            <MapPinned className="h-5 w-5 text-forest-700" />
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
                    {region.alert}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <SignalBar label="Endangered density" value={region.endangeredDensity} />
                  <SignalBar label="Anomaly pressure" value={region.anomalyPressure} />
                  <SignalBar label="Habitat pressure" value={region.habitatPressure} />
                  <SignalBar label="Migration disruption" value={region.migrationDisruption} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-md border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-forest-800" />
              <h2 className="text-lg font-headline-md text-forest-950">Longitudinal patterns</h2>
            </div>
            <div className="space-y-3">
              {clusters.map((cluster) => (
                <div key={cluster} className="border-l-2 border-forest-800 bg-stone-50 px-4 py-3 text-sm leading-6 text-forest-800">
                  {cluster}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-stone-200 bg-forest-950 p-5 text-stone-50">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-olive-300" />
              <h2 className="text-lg font-headline-md">Ecosystem interpretation</h2>
            </div>
            <p className="text-sm leading-6 text-stone-200">
              Repeated fragmented habitat anomalies indicate increasing ecological pressure.
              Migration timing disruptions align with regional instability signals. Evidence
              remains trace-linked to observations, field cases, and reviewer-confirmed events.
            </p>
          </div>
        </section>
      </main>
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
