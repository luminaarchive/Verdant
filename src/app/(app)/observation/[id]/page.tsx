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
  Download,
  Fingerprint,
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
  verified_by_human: boolean | null;
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

type ObservationHashRecord = {
  hash: string;
  hash_algorithm: string;
  created_at: string | null;
};

type AnomalyFlagRecord = {
  flag_type: string;
  severity: string;
  reason: string;
  h3_cell: string | null;
  created_at: string | null;
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
  const [mediaResult, runsResult, eventsResult, casesResult, hashResult, anomalyFlagsResult] = await Promise.all([
    supabase
      .from("observation_media")
      .select("media_type, storage_url, checksum, captured_at")
      .eq("observation_id", id),
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
      .select(
        "id, case_type, status, priority_score, linked_observation_ids, linked_anomaly_cluster_ids, operational_notes",
      )
      .eq("observation_id", id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("observation_hashes")
      .select("hash, hash_algorithm, created_at")
      .eq("observation_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("observation_anomaly_flags")
      .select("flag_type, severity, reason, h3_cell, created_at")
      .eq("observation_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const mediaRows = (mediaResult.data ?? []) as MediaRecord[];
  const mediaUrls = await Promise.all(mediaRows.map((media) => signedMediaUrl(supabase, media.storage_url)));
  const runs = (runsResult.data ?? []) as AnalysisRun[];
  const events = (eventsResult.data ?? []) as ObservationEvent[];
  const linkedCases = (casesResult.data ?? []) as FieldCase[];
  const observationHash = ((hashResult.data ?? []) as ObservationHashRecord[])[0];
  const anomalyFlags = (anomalyFlagsResult.data ?? []) as AnomalyFlagRecord[];
  const reasoning = asObject(observation.reasoning_snapshot);
  const signals = asObject(observation.signal_snapshot);
  const review = asObject(reasoning.review_recommendation);
  const habitat = asObject(reasoning.habitat_context);
  const temporal = asObject(reasoning.temporal_context);
  const agreement = asObject(signals.agreement_metrics);
  const providerConflicts = asStrings(reasoning.provider_conflicts);

  return (
    <div className="bg-surface-container-lowest text-on-surface flex min-h-screen flex-col">
      <header className="border-outline-variant bg-surface-dim sticky top-0 z-50 flex h-16 items-center border-b px-4 sm:px-6">
        <Link
          href="/archive"
          className="text-on-surface-variant hover:text-primary flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-label-caps text-[11px] tracking-[0.08em] uppercase">Back to Archive</span>
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-8">
        <section className="space-y-6 lg:col-span-7">
          <div className="border-outline-variant bg-surface-dim relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border">
            {mediaUrls[0] ? (
              <Image
                src={mediaUrls[0]}
                alt="Observation media"
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="text-on-surface-variant flex flex-col items-center gap-3">
                <FileImage className="h-8 w-8" />
                <span className="text-sm">No media preview available</span>
              </div>
            )}
            {observation.is_anomaly || observation.anomaly_flag ? (
              <div className="bg-error font-label-caps text-surface-container-lowest absolute top-4 left-4 flex items-center gap-1.5 rounded-sm px-3 py-1 text-[10px] tracking-[0.08em] shadow-lg">
                <AlertTriangle className="h-3 w-3" />
                Anomaly detected
              </div>
            ) : null}
          </div>

          <div>
            <h1 className="font-display-lg text-primary text-3xl break-words sm:text-4xl">
              {observation.scientific_name || "Species pending"}
            </h1>
            <div className="text-on-surface-variant mt-3 flex flex-wrap items-center gap-3 text-sm">
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
            <Fact
              label="Conservation"
              value={observation.conservation_status || observation.conservation_priority_category || "Pending"}
            />
            <Fact label="Confidence" value={percent(observation.confidence_level)} />
            <Fact label="Review" value={formatStatus(review.recommendation || observation.review_status)} />
          </div>

          {observation.review_status === "verified" || observation.verified_by_human ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                className="border-outline-variant bg-surface-container text-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border px-4 text-sm font-semibold"
                href={`/api/observations/${observation.id}/darwin-core`}
              >
                <Download className="h-4 w-4" />
                Export Darwin Core CSV
              </Link>
              <Link
                className="border-outline-variant bg-surface-container text-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border px-4 text-sm font-semibold"
                href={`/api/observations/${observation.id}/darwin-core?format=dwca`}
              >
                <Download className="h-4 w-4" />
                Export DwC-A ZIP
              </Link>
            </div>
          ) : null}

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
              <ContextBlock
                label="Habitat context"
                value={textValue(habitat.summary || habitat.biome, "Habitat context pending")}
              />
              <ContextBlock
                label="Temporal context"
                value={textValue(temporal.summary || temporal.seasonal_alignment, "Temporal context pending")}
              />
            </div>
          </AuditCard>

          <AuditCard icon={AlertTriangle} title="Priority Explanation">
            <p className="font-data-sm text-primary mb-3 text-sm">
              {observation.conservation_priority_category || "Priority pending"}
            </p>
            <ReasoningList
              title="Why this observation matters"
              items={asStrings(reasoning.priority_explanation)}
              empty="Priority explanation will appear after ecological reasoning completes."
            />
          </AuditCard>

          <AuditCard icon={AlertTriangle} title="H3 Anomaly Flags">
            {anomalyFlags.length ? (
              <div className="space-y-3">
                {anomalyFlags.map((flag) => (
                  <div
                    key={`${flag.flag_type}-${flag.created_at}`}
                    className="border-outline-variant bg-surface-dim rounded-sm border px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-data-sm text-primary text-sm">{formatStatus(flag.flag_type)}</p>
                      <span className="font-label-caps text-on-surface-variant text-[10px] tracking-[0.08em] uppercase">
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-on-surface-variant mt-1 text-sm leading-6">{flag.reason}</p>
                    {flag.h3_cell ? (
                      <p className="font-data-sm text-on-surface-variant mt-2 text-xs break-all">{flag.h3_cell}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm leading-6">
                No H3 anomaly flags are stored for this observation.
              </p>
            )}
            <p className="border-outline-variant bg-surface-dim text-on-surface-variant mt-3 rounded-sm border px-3 py-2 text-xs leading-5">
              Flags are based on NaLI&apos;s available records. Accuracy improves as more observations are submitted.
            </p>
          </AuditCard>

          <AuditCard icon={Link2} title="Linked Field Cases">
            {linkedCases.length ? (
              <div className="space-y-3">
                {linkedCases.map((fieldCase) => (
                  <div key={fieldCase.id} className="border-outline-variant bg-surface-dim rounded-sm border px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-data-sm text-primary text-sm">{fieldCase.id}</p>
                      <span className="font-label-caps text-on-surface-variant text-[10px] tracking-[0.08em] uppercase">
                        {formatStatus(fieldCase.status)}
                      </span>
                    </div>
                    <p className="text-on-surface-variant mt-1 text-sm capitalize">
                      {formatStatus(fieldCase.case_type)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm leading-6">
                No field case has been linked to this observation.
              </p>
            )}
          </AuditCard>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <AuditCard icon={Fingerprint} title="Evidence Integrity Hash">
            {observationHash ? (
              <div className="space-y-3">
                <p className="border-outline-variant bg-surface-dim font-data-sm text-primary rounded-sm border px-3 py-2 text-xs break-all">
                  {observationHash.hash}
                </p>
                <p className="text-on-surface-variant text-sm leading-6">
                  NaLI Verification Code: {observationHash.hash}
                </p>
                <p className="text-on-surface-variant text-xs leading-5">
                  This hash is a digital integrity check, not automatic legal admissibility. Legal use may require
                  forensic IT expert validation.
                </p>
                <Link
                  className="text-primary inline-flex text-sm font-semibold underline"
                  href={`/verify?hash=${observationHash.hash}`}
                >
                  Open verification page
                </Link>
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm leading-6">
                No evidence hash has been persisted for this observation yet.
              </p>
            )}
          </AuditCard>

          <AuditCard icon={Activity} title="Signal Snapshot">
            <p className="bg-surface-variant/30 font-data-sm text-on-surface-variant mb-4 rounded-sm px-3 py-2 text-xs">
              Trace {observation.reasoning_trace_id || "pending"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric
                label="Agreement score"
                value={percent(typeof agreement.agreement_score === "number" ? agreement.agreement_score : null)}
              />
              <Metric
                label="Anomaly score"
                value={percent(typeof agreement.anomaly_score === "number" ? agreement.anomaly_score : null)}
              />
              <Metric
                label="Provider outputs"
                value={String(asStrings(signals.provider_outputs).length || runs.length)}
              />
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
                  <div
                    key={`${event.event_type}-${event.event_timestamp}`}
                    className="border-outline-variant bg-surface-container rounded-sm border p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-data-sm text-primary text-sm">{event.event_type}</p>
                      <span className="font-label-caps text-on-surface-variant text-[10px] tracking-[0.08em] uppercase">
                        {event.severity || "info"}
                      </span>
                    </div>
                    <p className="text-on-surface-variant mt-1 text-xs break-all">
                      {event.reasoning_trace_id || observation.reasoning_trace_id || "trace pending"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-sm leading-6">No analysis events have been persisted yet.</p>
              )}
            </div>
          </AuditCard>

          <AuditCard icon={CheckCircle2} title="Provider Runs">
            <div className="space-y-4">
              {runs.length ? (
                runs.map((run) => (
                  <div
                    key={`${run.tool_name}-${run.completed_at}`}
                    className="border-outline-variant bg-surface-container rounded-md border p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="font-data-sm text-primary flex items-center gap-2 text-sm">
                        {run.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="text-error h-4 w-4" />
                        )}
                        {run.tool_name || "Provider"}
                      </div>
                      <span className="font-data-sm text-on-surface-variant text-[10px]">
                        {run.latency_ms ?? "--"}ms
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-6">
                      {run.error || run.raw_output || "No provider output persisted."}
                    </p>
                    <div className="border-outline-variant/20 mt-3 flex flex-wrap gap-2 border-t pt-3">
                      <span className="border-outline-variant/30 bg-surface-variant/30 font-label-caps text-on-surface-variant rounded-sm border px-1.5 py-0.5 text-[10px]">
                        {run.tool_version || "version pending"}
                      </span>
                      {Object.entries(run.score_breakdown ?? {}).map(([key, value]) => (
                        <span
                          key={key}
                          className="border-primary/20 bg-primary/10 font-data-sm text-primary rounded-sm border px-1.5 py-0.5 text-[10px]"
                        >
                          {key}: {textValue(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-sm leading-6">
                  Provider runs will appear after orchestration starts.
                </p>
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
    <div className="text-forest-950 min-h-screen bg-stone-50 px-4 py-10">
      <section className="mx-auto max-w-xl rounded-md border border-stone-200 bg-white p-6">
        <p className="font-label-caps text-[11px] tracking-[0.08em] text-olive-700 uppercase">Observation audit</p>
        <h1 className="font-headline-md mt-2 text-2xl">{title}</h1>
        <p className="text-forest-700 mt-3 text-sm leading-6">{detail}</p>
        <Link
          className="bg-forest-900 mt-5 inline-flex rounded-sm px-4 py-2 text-sm font-semibold text-white"
          href="/archive"
        >
          Return to Archive
        </Link>
      </section>
    </div>
  );
}

function AuditCard({ children, icon: Icon, title }: { children: ReactNode; icon: LucideIcon; title: string }) {
  return (
    <section className="border-outline-variant bg-surface-container rounded-md border p-5">
      <h2 className="font-label-caps text-primary mb-4 flex items-center gap-2 text-xs tracking-[0.08em] uppercase">
        <Icon className="h-4 w-4" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-outline-variant bg-surface-container rounded-md border p-4">
      <p className="font-label-caps text-on-surface-variant text-[10px] tracking-[0.08em] uppercase">{label}</p>
      <p className="text-primary mt-2 text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}

function ReasoningList({ empty, items, title }: { empty: string; items: string[]; title: string }) {
  return (
    <div>
      <p className="font-label-caps text-on-surface-variant mb-2 text-[10px] tracking-[0.08em] uppercase">{title}</p>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="border-outline-variant/60 bg-surface-dim text-on-surface-variant rounded-sm border px-3 py-2 text-sm leading-6"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-outline-variant/60 bg-surface-dim text-on-surface-variant rounded-sm border px-3 py-2 text-sm leading-6">
          {empty}
        </p>
      )}
    </div>
  );
}

function ContextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-outline-variant/60 bg-surface-dim mt-3 rounded-sm border px-3 py-2">
      <p className="font-label-caps text-on-surface-variant text-[10px] tracking-[0.08em] uppercase">{label}</p>
      <p className="text-on-surface-variant mt-1 text-sm leading-6">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-outline-variant bg-surface-container rounded-sm border p-3">
      <p className="font-label-caps text-on-surface-variant text-[10px] tracking-[0.08em] uppercase">{label}</p>
      <p className="font-data-sm text-primary mt-2 text-sm break-all">{value}</p>
    </div>
  );
}
