import Link from "next/link";
import { AlertTriangle, Database, Plus } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ArchivedObservation = {
  id: string;
  scientific_name: string | null;
  local_name: string | null;
  confidence_level: number | null;
  conservation_status: string | null;
  conservation_priority_category: string | null;
  observation_status: string | null;
  review_status: string | null;
  processing_stage: string | null;
  is_anomaly: boolean | null;
  anomaly_flag: boolean | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  timestamp: string | null;
};

function percent(value: number | null) {
  if (typeof value !== "number") return "Pending";
  return `${Math.round(value * 100)}%`;
}

function formatStatus(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "pending";
}

export default async function ArchivePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = user
    ? await supabase
        .from("observations")
        .select(
          "id, scientific_name, local_name, confidence_level, conservation_status, conservation_priority_category, observation_status, review_status, processing_stage, is_anomaly, anomaly_flag, latitude, longitude, created_at, timestamp",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [], error: null };

  const observations = (data ?? []) as ArchivedObservation[];
  const hasObservations = observations.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-surface-container-lowest font-body-md text-on-surface">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-dim px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-outline-variant bg-surface-container">
            <Database className="h-4 w-4 text-primary" />
          </div>
          <span className="font-headline-md text-xl font-bold tracking-tighter text-primary">NaLI</span>
          <span className="mx-2 text-on-surface-variant/50">/</span>
          <span className="font-label-caps text-[11px] uppercase tracking-widest text-on-surface-variant">
            Field Observation Archive
          </span>
        </div>
        <span className="hidden text-sm font-data-sm text-on-surface-variant sm:block">{user?.email}</span>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display-lg text-primary">Observation Archive</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
              Persisted field observations with processing status, review state, confidence, and conservation priority.
            </p>
          </div>
          <Link
            href="/observe"
            className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-primary px-4 text-sm font-semibold text-surface-container-lowest"
          >
            <Plus className="h-4 w-4" />
            New Observation
          </Link>
        </div>

        {error ? (
          <EmptyState
            tone="warning"
            title="Observation archive could not be loaded"
            detail="NaLI could not reach persisted field records. Check Supabase connectivity and session state before continuing validation."
          />
        ) : null}

        {!error && !hasObservations ? (
          <EmptyState
            title="No observation records yet"
            detail="Create a field observation with media, notes, and GPS coordinates. Completed analysis will appear here with reasoning and review status."
          />
        ) : null}

        {!error && hasObservations ? (
          <div className="space-y-4">
            {observations.map((obs) => {
              const isAnomaly = Boolean(obs.is_anomaly || obs.anomaly_flag);
              return (
                <Link className="block" href={`/observation/${obs.id}`} key={obs.id}>
                  <article className="flex flex-col gap-4 rounded-md border border-outline-variant bg-surface-container p-4 transition-colors hover:border-primary md:flex-row md:items-center md:justify-between md:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-outline-variant bg-surface-dim">
                        <Database className="h-5 w-5 text-primary/70" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-data-sm text-sm font-semibold uppercase text-primary">
                            {obs.scientific_name || "Species pending"}
                          </h2>
                          {isAnomaly ? (
                            <span className="rounded-sm border border-error/20 bg-error/10 px-2 py-0.5 text-[10px] font-label-caps text-error">
                              Anomaly
                            </span>
                          ) : null}
                          {obs.conservation_priority_category ? (
                            <span className="rounded-sm border border-olive-300 bg-olive-100 px-2 py-0.5 text-[10px] font-label-caps text-forest-800">
                              {obs.conservation_priority_category}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-on-surface-variant">{obs.local_name || "Common name pending"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                      <Field label="Confidence" value={percent(obs.confidence_level)} />
                      <Field label="Conservation" value={obs.conservation_status || "Pending"} />
                      <Field label="Observation" value={formatStatus(obs.observation_status || obs.processing_stage)} />
                      <Field label="Review" value={formatStatus(obs.review_status)} />
                    </div>

                    <div className="text-sm text-on-surface-variant md:text-right">
                      <p className="font-data-sm">
                        {obs.latitude?.toFixed(4) ?? "--"}, {obs.longitude?.toFixed(4) ?? "--"}
                      </p>
                      <p className="mt-1 text-xs">
                        {new Date(obs.created_at || obs.timestamp || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant/70">{label}</p>
      <p className="mt-1 font-data-sm capitalize text-on-surface-variant">{value}</p>
    </div>
  );
}

function EmptyState({
  detail,
  title,
  tone,
}: {
  detail: string;
  title: string;
  tone?: "warning";
}) {
  return (
    <section className="rounded-md border border-outline-variant bg-surface-container p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sm bg-surface-dim text-primary">
        {tone === "warning" ? <AlertTriangle className="h-5 w-5" /> : <Database className="h-5 w-5" />}
      </div>
      <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">
        Field archive
      </p>
      <h2 className="mt-2 text-xl font-headline-md text-primary">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">{detail}</p>
    </section>
  );
}
