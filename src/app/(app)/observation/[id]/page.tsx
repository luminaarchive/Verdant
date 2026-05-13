import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Database,
  FileImage,
  Link2,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type JsonObject = Record<string, unknown>;

type ObservationRecord = {
  id: string;
  scientific_name: string | null;
  local_name: string | null;
  latitude: number | null;
  longitude: number | null;
  text_description: string | null;
  confidence_level: number | null;
  conservation_status: string | null;
  conservation_priority_category: string | null;
  conservation_priority_score: number | null;
  observation_status: string | null;
  review_status: string | null;
  processing_stage: string | null;
  is_anomaly: boolean | null;
  anomaly_flag: boolean | null;
  reasoning_trace_id: string | null;
  reasoning_snapshot: JsonObject | null;
  signal_snapshot: JsonObject | null;
  created_at: string | null;
  timestamp: string | null;
};

type MediaRecord = {
  media_type: string;
  storage_url: string;
  checksum: string | null;
  captured_at: string | null;
};

type AnalysisRun = {
  tool_name: string | null;
  tool_version: string | null;
  status: string | null;
  latency_ms: number | null;
  score_breakdown: JsonObject | null;
  raw_output: string | null;
  error: string | null;
  completed_at: string | null;
};

type ObservationEvent = {
  event_type: string;
  severity: string | null;
  reasoning_trace_id: string | null;
  payload: JsonObject | null;
  event_timestamp: string | null;
};

type FieldCase = {
  id: string;
  case_type: string | null;
  status: string | null;
  priority_score: number | null;
  linked_observation_ids: unknown;
  linked_anomaly_cluster_ids: unknown;
  operational_notes: unknown;
};

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function asStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function textValue(value: unknown, fallback = "Not available") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return fallback;
}

function formatStatus(value: unknown) {
  return textValue(value, "pending").replaceAll("_", " ");
}

function percent(value: number | null) {
  if (typeof value !== "number") return "Pending";
  return `${Math.round(value * 100)}%`;
}

async function signedMediaUrl(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const { data } = await supabase.storage.from("observation_media").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export default async function ObservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!id || !user) return <Unavailable title="Observation record unavailable" />;

  const { data: observationData, error: observationError } = await supabase
    .from("observations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (observationError || !observationData) {
    return (
      <Unavailable
        title="Observation record unavailable"
        detail="NaLI could not load this field observation. Confirm the observation exists in the archive and belongs to the current workspace."
      />
    );
  }

  const observation = observationData as ObservationRecord;
  const [mediaResult, runsResult, eventsResult, casesResult] = await Promise.all([
    supabase.from("observation_media").select("media_type, storage_url, checksum, captured_at").eq("observation_id", id),
    supabase
      .from("analysis_runs")
      .select("tool_name, tool_version, status, latency_ms, score_breakdown, raw_output, error, completed_at")
      .eq("observation_id", id)
      .order("completed_at", { ascending: true }),
    supabase
      .from("observation_events")
      .select("event_type, severity, reasoning_trace_id, payload, event_timestamp")
      .eq("observation_id", id)
      .order("event_timestamp", { ascending: true }),
    supabase
      .from("field_cases")
      .select("id, case_type, status, priority_score, linked_observation_ids, linked_anomaly_cluster_ids, operational_notes")
      .eq("observation_id", id)
      .order("updated_at", { ascending: false }),
  ]);

  const mediaRows = (mediaResult.data ?? []) as MediaRecord[];
  const mediaUrls = await Promise.all(mediaRows.map((media) => signedMediaUrl(supabase, media.storage_url)));
  const runs = (runsResult.data ?? []) as AnalysisRun[];
  const events = (eventsResult.data ?? []) as ObservationEvent[];
  const linkedCases = (casesResult.data ?? []) as FieldCase[];
  const reasoning = asObject(observation.reasoning_snapshot);
  const signals = asObject(observation.signal_snapshot);
  const review = asObject(reasoning.review_recommendation);
  const habitat = asObject(reasoning.habitat_context);
  const temporal = asObject(reasoning.temporal_context);
  const agreement = asObject(signals.agreement_metrics);
  const providerConflicts = asStrings(reasoning.provider_conflicts);

  return (
    <div className="flex min-h-screen flex-col bg-surface-container-lowest text-on-surface">
      <header className="sticky top-0 z-50 flex h-16 items-center border-b border-outline-variant bg-surface-dim px-4 sm:px-6">
        <Link href="/archive" className="flex items-center gap-2 text-on-surface-variant transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-label-caps text-[11px] uppercase tracking-[0.08em]">Back to Archive</span>
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-8">
        <section className="space-y-6 lg:col-span-7">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-outline-variant bg-surface-dim">
            {mediaUrls[0] ? (
              <Image src={mediaUrls[0]} alt="Observation media" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" unoptimized />
            ) : (
              <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                <FileImage className="h-8 w-8" />
                <span className="text-sm">No media preview available</span>
              </div>
            )}
            {observation.is_anomaly || observation.anomaly_flag ? (
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-sm bg-error px-3 py-1 font-label-caps text-[10px] tracking-[0.08em] text-surface-container-lowest shadow-lg">
                <AlertTriangle className="h-3 w-3" />
                Anomaly detected
              </div>
            ) : null}
          </div>

          <div>
            <h1 className="break-words text-3xl font-display-lg text-primary sm:text-4xl">
              {observation.scientific_name || "Species pending"}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
              <span>{observation.local_name || "Common name pending"}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {observation.latitude?.toFixed(4) ?? "--"}, {observation.longitude?.toFixed(4) ?? "--"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(observation.created_at || observation.timestamp || Date.now()).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Fact label="Conservation" value={observation.conservation_status || observation.conservation_priority_category || "Pending"} />
            <Fact label="Confidence" value={percent(observation.confidence_level)} />
            <Fact label="Review" value={formatStatus(review.recommendation || observation.review_status)} />
          </div>

          <AuditCard icon={ShieldCheck} title="Reasoning Snapshot">
            <div className="grid gap-4 md:grid-cols-2">
              <ReasoningList
                title="Confidence strengthened by"
                items={asStrings(reasoning.confidence_contributors)}
                empty="No positive contributors persisted yet."
              />
              <ReasoningList
                title="Confidence reduced by"
                items={asStrings(reasoning.confidence_penalties)}
                empty="No confidence penalties persisted yet."
              />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ContextBlock label="Habitat context" value={textValue(habitat.summary || habitat.biome, "Habitat context pending")} />
              <ContextBlock
                label="Temporal context"
                value={textValue(temporal.summary || temporal.seasonal_alignment, "Temporal context pending")}
              />
            </div>
          </AuditCard>

          <AuditCard icon={AlertTriangle} title="Priority Explanation">
            <p className="mb-3 font-data-sm text-sm text-primary">
              {observation.conservation_priority_category || "Priority pending"}
            </p>
            <ReasoningList
              title="Why this observation matters"
              items={asStrings(reasoning.priority_explanation)}
              empty="Priority explanation will appear after ecological reasoning completes."
            />
          </AuditCard>

          <AuditCard icon={Link2} title="Linked Field Cases">
            {linkedCases.length ? (
              <div className="space-y-3">
                {linkedCases.map((fieldCase) => (
                  <div key={fieldCase.id} className="rounded-sm border border-outline-variant bg-surface-dim px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-data-sm text-sm text-primary">{fieldCase.id}</p>
                      <span className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">
                        {formatStatus(fieldCase.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm capitalize text-on-surface-variant">{formatStatus(fieldCase.case_type)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-on-surface-variant">No field case has been linked to this observation.</p>
            )}
          </AuditCard>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <AuditCard icon={Activity} title="Signal Snapshot">
            <p className="mb-4 rounded-sm bg-surface-variant/30 px-3 py-2 font-data-sm text-xs text-on-surface-variant">
              Trace {observation.reasoning_trace_id || "pending"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Agreement score" value={percent(typeof agreement.agreement_score === "number" ? agreement.agreement_score : null)} />
              <Metric label="Anomaly score" value={percent(typeof agreement.anomaly_score === "number" ? agreement.anomaly_score : null)} />
              <Metric label="Provider outputs" value={String(asStrings(signals.provider_outputs).length || runs.length)} />
              <Metric label="Conflict detected" value={textValue(agreement.conflict_detected, "pending")} />
            </div>
          </AuditCard>

          <AuditCard icon={AlertTriangle} title="Provider Conflict Classification">
            <ReasoningList
              title="Persisted conflicts"
              items={providerConflicts}
              empty="No provider conflicts persisted for this observation."
            />
          </AuditCard>

          <AuditCard icon={Database} title="Analysis Events">
            <div className="space-y-3">
              {events.length ? (
                events.map((event) => (
                  <div key={`${event.event_type}-${event.event_timestamp}`} className="rounded-sm border border-outline-variant bg-surface-container p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-data-sm text-sm text-primary">{event.event_type}</p>
                      <span className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">
                        {event.severity || "info"}
                      </span>
                    </div>
                    <p className="mt-1 break-all text-xs text-on-surface-variant">
                      {event.reasoning_trace_id || observation.reasoning_trace_id || "trace pending"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-on-surface-variant">No analysis events have been persisted yet.</p>
              )}
            </div>
          </AuditCard>

          <AuditCard icon={CheckCircle2} title="Provider Runs">
            <div className="space-y-4">
              {runs.length ? (
                runs.map((run) => (
                  <div key={`${run.tool_name}-${run.completed_at}`} className="rounded-md border border-outline-variant bg-surface-container p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-data-sm text-sm text-primary">
                        {run.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-error" />
                        )}
                        {run.tool_name || "Provider"}
                      </div>
                      <span className="font-data-sm text-[10px] text-on-surface-variant">{run.latency_ms ?? "--"}ms</span>
                    </div>
                    <p className="text-sm leading-6 text-on-surface-variant">{run.error || run.raw_output || "No provider output persisted."}</p>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-outline-variant/20 pt-3">
                      <span className="rounded-sm border border-outline-variant/30 bg-surface-variant/30 px-1.5 py-0.5 text-[10px] font-label-caps text-on-surface-variant">
                        {run.tool_version || "version pending"}
                      </span>
                      {Object.entries(run.score_breakdown ?? {}).map(([key, value]) => (
                        <span key={key} className="rounded-sm border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-data-sm text-[10px] text-primary">
                          {key}: {textValue(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-on-surface-variant">Provider runs will appear after orchestration starts.</p>
              )}
            </div>
          </AuditCard>
        </aside>
      </main>
    </div>
  );
}

function Unavailable({
  detail = "NaLI needs a valid observation identifier before it can load reasoning snapshots, signal evidence, and linked field cases.",
  title,
}: {
  detail?: string;
  title: string;
}) {
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 text-forest-950">
      <section className="mx-auto max-w-xl rounded-md border border-stone-200 bg-white p-6">
        <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">Observation audit</p>
        <h1 className="mt-2 text-2xl font-headline-md">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-forest-700">{detail}</p>
        <Link className="mt-5 inline-flex rounded-sm bg-forest-900 px-4 py-2 text-sm font-semibold text-white" href="/archive">
          Return to Archive
        </Link>
      </section>
    </div>
  );
}

function AuditCard({ children, icon: Icon, title }: { children: ReactNode; icon: LucideIcon; title: string }) {
  return (
    <section className="rounded-md border border-outline-variant bg-surface-container p-5">
      <h2 className="mb-4 flex items-center gap-2 font-label-caps text-xs uppercase tracking-[0.08em] text-primary">
        <Icon className="h-4 w-4" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container p-4">
      <p className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <p className="mt-2 text-sm font-semibold capitalize text-primary">{value}</p>
    </div>
  );
}

function ReasoningList({ empty, items, title }: { empty: string; items: string[]; title: string }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">{title}</p>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-sm border border-outline-variant/60 bg-surface-dim px-3 py-2 text-sm leading-6 text-on-surface-variant">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-sm border border-outline-variant/60 bg-surface-dim px-3 py-2 text-sm leading-6 text-on-surface-variant">
          {empty}
        </p>
      )}
    </div>
  );
}

function ContextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 rounded-sm border border-outline-variant/60 bg-surface-dim px-3 py-2">
      <p className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-sm leading-6 text-on-surface-variant">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-outline-variant bg-surface-container p-3">
      <p className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <p className="mt-2 break-all font-data-sm text-sm text-primary">{value}</p>
    </div>
  );
}
