import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Database,
  Link2,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ObservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const observation = {
    id,
    species: { scientific_name: "Pongo abelii", common_name_en: "Sumatran Orangutan", is_endemic_indonesia: true },
    latitude: 3.2,
    longitude: 98.15,
    processing_stage: "completed",
    review_status: "unreviewed",
    is_anomaly: true,
    created_at: "2026-05-13T09:30:00Z",
    confidence_level: 0.89,
    reasoning_trace_id: "3c3c3d76-8f64-4d9e-9d59-2e2fd5f4a7d8",
    media: [
      {
        type: "photo",
        url: "https://images.unsplash.com/photo-1540304603378-0c034375b4f4?auto=format&fit=crop&q=80&w=800",
      },
    ],
    reasoning_snapshot: {
      review_recommendation: "expert_validation_recommended",
      priority: "High Conservation Attention",
      priority_explanation: [
        "Critically endangered species overlap",
        "Repeated observations near fragmented corridor",
        "Habitat pressure increases field significance",
      ],
      confidence_contributors: [
        "Clear morphology signal from image analysis",
        "Regional occurrence support in Northern Sumatra",
        "Seasonal timing aligns with known regional behavior",
      ],
      confidence_penalties: ["Fragmented habitat boundary", "Low recent occurrence density in adjacent survey cells"],
      provider_conflicts: [
        { type: "habitat_conflict", severity: "moderate", impact: "Escalation probability increased" },
        { type: "taxonomy_conflict", severity: "low", impact: "No material confidence reduction" },
      ],
      habitat_context: "Lowland forest edge with agricultural fragmentation pressure.",
      temporal_context: "Morning timestamp aligns with expected activity window.",
      escalation_reasoning: "Endangered overlap and repeated corridor detections meet field case criteria.",
    },
    signal_snapshot: {
      modality_signals: [
        { label: "Vision", confidence: 0.87, status: "supporting" },
        { label: "GBIF occurrence", confidence: 0.92, status: "supporting" },
        { label: "Habitat", confidence: 0.71, status: "conflict" },
        { label: "Seasonality", confidence: 0.86, status: "supporting" },
      ],
      agreement: "strong_provider_agreement_with_moderate_habitat_conflict",
      raw_provider_outputs: ["Vision Engine v4.1", "GBIF Cross-check", "IUCN Analysis", "Habitat Context Engine"],
    },
    linked_cases: ["CASE-SUM-041"],
    memory_signals: [
      "Three related observations inside 30-day regional window",
      "Repeated endangered detections near fragmented corridor",
      "Confidence drift strengthened by reviewer-confirmed regional history",
    ],
    runs: [
      {
        tool_name: "Vision Engine",
        status: "completed",
        latency_ms: 2100,
        score_breakdown: { confidence: 0.87 },
        tool_version: "v4.1",
        retry_count: 0,
        fallback_used: false,
        raw_output: "Detected morphological markers consistent with Pongo abelii.",
      },
      {
        tool_name: "GBIF Cross-check",
        status: "completed",
        latency_ms: 850,
        score_breakdown: { match: 0.92 },
        tool_version: "gbif-api-v1",
        retry_count: 1,
        fallback_used: true,
        raw_output: "Occurrence match found in Northern Sumatra region. Adjusted confidence.",
      },
      {
        tool_name: "IUCN Analysis",
        status: "completed",
        latency_ms: 400,
        score_breakdown: {},
        tool_version: "iucn-redlist-2026",
        retry_count: 0,
        fallback_used: false,
        raw_output: "Status: Critically Endangered.",
      },
      {
        tool_name: "Habitat Context Engine",
        status: "warning",
        latency_ms: 1200,
        score_breakdown: { anomaly_score: 0.85 },
        tool_version: "habitat-v2",
        retry_count: 0,
        fallback_used: false,
        raw_output: "Habitat fragmentation increases anomaly probability for this observation.",
      },
    ],
  };

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
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-outline-variant bg-surface-dim">
            <img src={observation.media[0].url} alt="Observation media" className="h-full w-full object-cover" />
            {observation.is_anomaly && (
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-sm bg-error px-3 py-1 font-label-caps text-[10px] tracking-[0.08em] text-surface-container-lowest shadow-lg">
                <AlertTriangle className="h-3 w-3" />
                Anomaly detected
              </div>
            )}
          </div>

          <div>
            <h1 className="break-words text-3xl font-display-lg text-primary sm:text-4xl">
              {observation.species.scientific_name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
              <span>{observation.species.common_name_en}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(observation.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Fact label="Status" value="Critically Endangered" tone="error" />
            <Fact label="Confidence" value={`${(observation.confidence_level * 100).toFixed(1)}%`} />
            <Fact label="Review" value={observation.reasoning_snapshot.review_recommendation.replaceAll("_", " ")} />
          </div>

          <AuditCard icon={ShieldCheck} title="Reasoning Snapshot">
            <div className="grid gap-4 md:grid-cols-2">
              <ReasoningList title="Confidence strengthened by" items={observation.reasoning_snapshot.confidence_contributors} />
              <ReasoningList title="Confidence reduced by" items={observation.reasoning_snapshot.confidence_penalties} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ContextBlock label="Habitat context" value={observation.reasoning_snapshot.habitat_context} />
              <ContextBlock label="Temporal context" value={observation.reasoning_snapshot.temporal_context} />
            </div>
          </AuditCard>

          <AuditCard icon={AlertTriangle} title="Priority Explanation">
            <p className="mb-3 font-data-sm text-sm text-error">{observation.reasoning_snapshot.priority}</p>
            <ReasoningList title="Why this observation matters" items={observation.reasoning_snapshot.priority_explanation} />
          </AuditCard>

          <AuditCard icon={Link2} title="Ecological Memory Signals">
            <ReasoningList title="Longitudinal context" items={observation.memory_signals} />
            <div className="mt-4 flex flex-wrap gap-2">
              {observation.linked_cases.map((fieldCase) => (
                <Link
                  className="rounded-sm border border-olive-300 bg-olive-100 px-2.5 py-1 font-data-sm text-xs text-forest-800"
                  href="/cases"
                  key={fieldCase}
                >
                  {fieldCase}
                </Link>
              ))}
            </div>
          </AuditCard>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <AuditCard icon={Activity} title="Signal Snapshot">
            <p className="mb-4 rounded-sm bg-surface-variant/30 px-3 py-2 font-data-sm text-xs text-on-surface-variant">
              Trace {observation.reasoning_trace_id}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {observation.signal_snapshot.modality_signals.map((signal) => (
                <div key={signal.label} className="rounded-sm border border-outline-variant bg-surface-container p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-data-sm text-sm text-primary">{signal.label}</p>
                    <span className={signal.status === "conflict" ? "text-error" : "text-primary"}>
                      {(signal.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">
                    {signal.status}
                  </p>
                </div>
              ))}
            </div>
            <ContextBlock label="Agreement metric" value={observation.signal_snapshot.agreement.replaceAll("_", " ")} />
          </AuditCard>

          <AuditCard icon={AlertTriangle} title="Provider Conflict Classification">
            <div className="space-y-3">
              {observation.reasoning_snapshot.provider_conflicts.map((conflict) => (
                <div key={conflict.type} className="rounded-sm border border-outline-variant bg-surface-container p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-data-sm text-sm text-primary">{conflict.type.replaceAll("_", " ")}</p>
                    <span className="rounded-sm bg-warning-amber/20 px-2 py-0.5 text-[10px] font-label-caps uppercase tracking-[0.08em] text-forest-900">
                      {conflict.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{conflict.impact}</p>
                </div>
              ))}
            </div>
          </AuditCard>

          <AuditCard icon={Database} title="Provider Signal Trace">
            <div className="space-y-4">
              {observation.runs.map((run) => (
                <div key={run.tool_name} className="rounded-md border border-outline-variant bg-surface-container p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-data-sm text-sm text-primary">
                      {run.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-error" />
                      )}
                      {run.tool_name}
                    </div>
                    <span className="font-data-sm text-[10px] text-on-surface-variant">{run.latency_ms}ms</span>
                  </div>
                  <p className="text-sm leading-6 text-on-surface-variant">{run.raw_output}</p>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-outline-variant/20 pt-3">
                    <span className="rounded-sm border border-outline-variant/30 bg-surface-variant/30 px-1.5 py-0.5 text-[10px] font-label-caps text-on-surface-variant">
                      {run.tool_version}
                    </span>
                    {Object.entries(run.score_breakdown).map(([key, val]) => (
                      <span key={key} className="rounded-sm border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-data-sm text-[10px] text-primary">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AuditCard>
        </aside>
      </main>
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

function Fact({ label, tone, value }: { label: string; tone?: "error"; value: string }) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container p-4">
      <p className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <p className={`mt-2 text-sm font-semibold capitalize ${tone === "error" ? "text-error" : "text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function ReasoningList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-label-caps uppercase tracking-[0.08em] text-on-surface-variant">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-sm border border-outline-variant/60 bg-surface-dim px-3 py-2 text-sm leading-6 text-on-surface-variant">
            {item}
          </li>
        ))}
      </ul>
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
