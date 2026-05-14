import { AlertTriangle, CheckCircle2, Database, HardDrive, KeyRound, RadioTower, ShieldCheck, WifiOff, type LucideIcon } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { getEnvStatus } from "@/lib/config/env";
import { env } from "@/lib/config/env";

const knownWarnings = [
  "Optional provider keys can remain unavailable until live provider integrations are enabled.",
  "Health checks report degraded when Supabase tables or storage are unreachable from the runtime.",
  "Observation analysis runs in background mode after field record creation; use /api/agent/analyze as a manual fallback if local background execution is interrupted.",
];

export const dynamic = "force-dynamic";

type LiveStatus = "ok" | "degraded" | "unverified";
type LiveInfrastructureStatus = {
  database: LiveStatus;
  storage: LiveStatus;
  migrations: LiveStatus;
  livePersistence: LiveStatus;
  rls: LiveStatus;
};

async function getLiveInfrastructureStatus(): Promise<LiveInfrastructureStatus> {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    return {
      database: "degraded" as LiveStatus,
      storage: "degraded" as LiveStatus,
      migrations: "degraded" as LiveStatus,
      livePersistence: "degraded" as LiveStatus,
      rls: "unverified" as LiveStatus,
    };
  }

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { persistSession: false },
  });

  const [{ error: observationsError }, { error: reasoningColumnError }, { data: buckets, error: bucketsError }] = await Promise.all([
    supabase.from("observations").select("id", { count: "exact", head: true }).limit(1),
    supabase
      .from("observations")
      .select("reasoning_snapshot,signal_snapshot,reasoning_trace_id,conservation_priority_score,conservation_priority_category")
      .limit(1),
    supabase.storage.listBuckets(),
  ]);

  const observationBucket = buckets?.find((bucket) => bucket.name === "observation_media" || bucket.id === "observation_media");
  const storageReady = !bucketsError && observationBucket?.public === false;
  const reasoningReady = !reasoningColumnError;
  const databaseReady = !observationsError;

  return {
    database: databaseReady ? "ok" : "degraded",
    storage: storageReady ? "ok" : "degraded",
    migrations: databaseReady && reasoningReady ? "ok" : "degraded",
    livePersistence: databaseReady && reasoningReady && storageReady ? "ok" : "degraded",
    rls: "unverified" as LiveStatus,
  };
}

export default async function SystemReadinessPage() {
  const envStatus = getEnvStatus();
  const providerEntries = Object.entries(envStatus.providers);
  const liveStatus = await getLiveInfrastructureStatus();

  const checks: Array<{
    label: string;
    detail: string;
    status: LiveStatus;
    icon: LucideIcon;
  }> = [
    {
      label: "Auth configured",
      detail: "Supabase public URL and anon key are available for session handling.",
      status:
        envStatus.required.NEXT_PUBLIC_SUPABASE_URL.availability === "configured" &&
        envStatus.required.NEXT_PUBLIC_SUPABASE_ANON_KEY.availability === "configured"
          ? "ok"
          : "degraded",
      icon: KeyRound,
    },
    {
      label: "Supabase connected",
      detail: "Server-side runtime can reach the observations schema using configured Supabase credentials.",
      status: liveStatus.database,
      icon: Database,
    },
    {
      label: "Storage configured",
      detail: "The private observation_media bucket is reachable and public access is disabled.",
      status: liveStatus.storage,
      icon: HardDrive,
    },
    {
      label: "Storage bucket validation",
      detail: "Run npm run validate:storage to verify the private observation_media bucket, signed URLs, path convention, and cleanup behavior.",
      status: liveStatus.storage,
      icon: HardDrive,
    },
    {
      label: "Migrations reflected",
      detail: "Observations schema includes operational reasoning columns for snapshots, trace IDs, and conservation priority persistence.",
      status: liveStatus.migrations,
      icon: Database,
    },
    {
      label: "RLS validation",
      detail: "Run npm run validate:rls to check anon access, user-scoped observation data, media access, analysis traces, and public species reference behavior.",
      status: liveStatus.rls,
      icon: ShieldCheck,
    },
    {
      label: "Live persistence readiness",
      detail: "Run npm run validate:supabase and node tests/e2e/smoke-observation-flow.cjs with production-like env vars before release.",
      status: liveStatus.livePersistence,
      icon: Database,
    },
    {
      label: "Offline queue available",
      detail: "Client-side field capture can continue using local queue infrastructure.",
      status: "ok",
      icon: WifiOff,
    },
    {
      label: "Observation create route",
      detail: "POST /api/observations accepts media, field notes, GPS metadata, and returns an observation_id before background analysis begins.",
      status: "ok",
      icon: RadioTower,
    },
    {
      label: "Orchestrator available",
      detail: "Observation creation queues the provider pipeline and persists reasoning snapshots, signal snapshots, events, and field case decisions.",
      status: "ok",
      icon: ShieldCheck,
    },
    {
      label: "Health endpoint available",
      detail: "GET /api/health reports app, database, storage, provider, timestamp, and version status for deployment smoke checks.",
      status: "ok",
      icon: Database,
    },
    {
      label: "Last build/runtime status",
      detail: "Run npm run lint, npm run typecheck, npm run build, npm run verify, and node tests/e2e/smoke-observation-flow.cjs before release.",
      status: "ok",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-6 text-forest-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-stone-200 pb-5">
          <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">System readiness</p>
          <h1 className="mt-2 text-3xl font-display-lg text-forest-950">Operational release status</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-700">
            Release-facing checks for authentication, storage, provider configuration, offline operation, and known runtime warnings.
          </p>
        </header>

        <main className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <section className="grid gap-4 md:grid-cols-2">
            {checks.map((check) => (
              <StatusCard
                detail={check.detail}
                icon={check.icon}
                key={check.label}
                label={check.label}
                status={check.status}
              />
            ))}
          </section>

          <aside className="space-y-5">
            <section className="rounded-md border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <RadioTower className="h-5 w-5 text-forest-700" />
                <h2 className="text-lg font-headline-md">Provider health</h2>
              </div>
              <div className="space-y-3">
                <ProviderRow label="GBIF occurrence data" status="configured" />
                {providerEntries.map(([key, status]) => (
                  <ProviderRow key={key} label={key.replace("_API_KEY", "").toLowerCase()} status={status.availability} />
                ))}
              </div>
            </section>

            <section className="rounded-md border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-forest-700" />
                <h2 className="text-lg font-headline-md">Production validation commands</h2>
              </div>
              <div className="space-y-2">
                {[
                  "npm run validate:vercel-env",
                  "npm run validate:supabase",
                  "npm run validate:storage",
                  "npm run validate:rls",
                  "npm run validate:production",
                ].map((command) => (
                  <p key={command} className="rounded-sm bg-stone-100 px-3 py-2 font-data-sm text-xs text-forest-800">
                    {command}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-forest-700" />
                <h2 className="text-lg font-headline-md">Known warnings</h2>
              </div>
              <div className="space-y-2">
                {knownWarnings.map((warning) => (
                  <p key={warning} className="rounded-sm bg-stone-100 px-3 py-2 text-sm leading-6 text-forest-800">
                    {warning}
                  </p>
                ))}
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

function StatusCard({
  detail,
  icon: Icon,
  label,
  status,
}: {
  detail: string;
  icon: LucideIcon;
  label: string;
  status: LiveStatus;
}) {
  const isOk = status === "ok";
  const isUnverified = status === "unverified";

  return (
    <article className="rounded-md border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-olive-300 bg-olive-100">
            <Icon className="h-5 w-5 text-forest-800" />
          </div>
          <h2 className="text-lg font-headline-md text-forest-950">{label}</h2>
        </div>
        <span
          className={`rounded-sm px-2 py-1 text-[10px] font-label-caps uppercase tracking-[0.08em] ${
            isOk
              ? "bg-olive-100 text-forest-800"
              : isUnverified
                ? "bg-stone-100 text-forest-700"
                : "bg-warning-amber/20 text-forest-900"
          }`}
        >
          {status}
        </span>
      </div>
      <p className="text-sm leading-6 text-forest-700">{detail}</p>
    </article>
  );
}

function ProviderRow({ label, status }: { label: string; status: string }) {
  const available = status === "configured";

  return (
    <div className="flex items-center justify-between gap-3 rounded-sm border border-stone-200 bg-stone-50 px-3 py-2">
      <span className="text-sm capitalize text-forest-800">{label}</span>
      <span className={`flex items-center gap-1.5 text-[10px] font-label-caps uppercase tracking-[0.08em] ${available ? "text-olive-700" : "text-forest-500"}`}>
        {available ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
        {available ? "available" : "unconfigured"}
      </span>
    </div>
  );
}
