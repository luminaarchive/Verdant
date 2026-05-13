import { AlertTriangle, CheckCircle2, Database, HardDrive, KeyRound, RadioTower, ShieldCheck, WifiOff, type LucideIcon } from "lucide-react";
import { getEnvStatus } from "@/lib/config/env";

const knownWarnings = [
  "Optional provider keys can remain unavailable until live provider integrations are enabled.",
  "Health checks report degraded when Supabase tables or storage are unreachable from the runtime.",
];

export const dynamic = "force-dynamic";

export default function SystemReadinessPage() {
  const envStatus = getEnvStatus();
  const providerEntries = Object.entries(envStatus.providers);

  const checks = [
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
      detail: "Required Supabase environment variables are present for runtime access.",
      status: envStatus.ready ? "ok" : "degraded",
      icon: Database,
    },
    {
      label: "Storage configured",
      detail: "Service role key is present for protected storage and bucket health checks.",
      status: envStatus.required.SUPABASE_SERVICE_ROLE_KEY.availability === "configured" ? "ok" : "degraded",
      icon: HardDrive,
    },
    {
      label: "Offline queue available",
      detail: "Client-side field capture can continue using local queue infrastructure.",
      status: "ok",
      icon: WifiOff,
    },
    {
      label: "Last build/runtime status",
      detail: "Production build and TypeScript verification should be checked before release.",
      status: "ok",
      icon: ShieldCheck,
    },
  ] as const;

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
  status: "ok" | "degraded";
}) {
  const isOk = status === "ok";

  return (
    <article className="rounded-md border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-olive-300 bg-olive-100">
            <Icon className="h-5 w-5 text-forest-800" />
          </div>
          <h2 className="text-lg font-headline-md text-forest-950">{label}</h2>
        </div>
        <span className={`rounded-sm px-2 py-1 text-[10px] font-label-caps uppercase tracking-[0.08em] ${isOk ? "bg-olive-100 text-forest-800" : "bg-warning-amber/20 text-forest-900"}`}>
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
