import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, MapPin, Database, Activity, RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ObservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Simulated data for UI scaffolding
  const observation = {
    id,
    species: { scientific_name: "Pongo abelii", common_name_en: "Sumatran Orangutan", is_endemic_indonesia: true },
    latitude: 3.20,
    longitude: 98.15,
    processing_stage: "completed",
    review_status: "unreviewed",
    is_anomaly: true,
    created_at: "2026-05-13T09:30:00Z",
    confidence_level: 0.89,
    media: [
      { type: "photo", url: "https://images.unsplash.com/photo-1540304603378-0c034375b4f4?auto=format&fit=crop&q=80&w=800" }
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
        raw_output: "Detected morphological markers consistent with Pongo abelii."
      },
      {
        tool_name: "GBIF Cross-check",
        status: "completed",
        latency_ms: 850,
        score_breakdown: { match: 0.92 },
        tool_version: "gbif-api-v1",
        retry_count: 1,
        fallback_used: true,
        raw_output: "Occurrence match found in Northern Sumatra region. Adjusted confidence."
      },
      {
        tool_name: "IUCN Analysis",
        status: "completed",
        latency_ms: 400,
        score_breakdown: {},
        tool_version: "iucn-redlist-2026",
        retry_count: 0,
        fallback_used: false,
        raw_output: "Status: Critically Endangered (CR)."
      },
      {
        tool_name: "Anomaly Detection",
        status: "warning",
        latency_ms: 1200,
        score_breakdown: { anomaly_score: 0.85 },
        tool_version: "anomaly-model-v2",
        retry_count: 0,
        fallback_used: false,
        raw_output: "Warning: Species occurrence outside expected density zone for this season."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md flex flex-col">
      <header className="bg-surface-dim border-b border-outline-variant h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/archive" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-label-caps text-[11px] uppercase tracking-widest">Back to Archive</span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Media & Primary Info */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-surface-dim border border-outline-variant relative">
            <img 
              src={observation.media[0].url} 
              alt="Observation Media" 
              className="w-full h-full object-cover"
            />
            {observation.is_anomaly && (
              <div className="absolute top-4 left-4 bg-error text-surface-container-lowest font-label-caps text-[10px] px-3 py-1 rounded-sm tracking-wider flex items-center gap-1.5 shadow-lg">
                <AlertTriangle className="w-3 h-3" />
                ANOMALY DETECTED
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-display-lg text-primary">{observation.species.scientific_name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-on-surface-variant">{observation.species.common_name_en}</span>
              <span className="text-outline-variant">•</span>
              <span className="flex items-center gap-1 text-on-surface-variant">
                <MapPin className="w-4 h-4" />
                {observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}
              </span>
              <span className="text-outline-variant">•</span>
              <span className="flex items-center gap-1 text-on-surface-variant">
                <Clock className="w-4 h-4" />
                {new Date(observation.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Conservation Info */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6">
             <h3 className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">Ecological Context</h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <div className="text-on-surface-variant text-sm mb-1">Status</div>
                  <div className="font-data-sm text-error">Critically Endangered</div>
               </div>
               <div>
                  <div className="text-on-surface-variant text-sm mb-1">Endemicity</div>
                  <div className="font-data-sm text-primary">{observation.species.is_endemic_indonesia ? "Endemic to Indonesia" : "Non-Endemic"}</div>
               </div>
               <div>
                  <div className="text-on-surface-variant text-sm mb-1">Confidence Score</div>
                  <div className="font-data-sm text-primary">{(observation.confidence_level * 100).toFixed(1)}%</div>
               </div>
             </div>
          </div>

          {/* Scientific Confidence Notes */}
          <div className="bg-surface-dim border border-outline-variant rounded-xl p-6">
             <h3 className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 text-warning" />
               Scientific Confidence Notes
             </h3>
             <div className="text-sm font-body-md text-on-surface-variant leading-relaxed space-y-2">
               <p>Confidence reduced due to:</p>
               <ul className="list-disc pl-5 space-y-1">
                 <li>Low image sharpness affecting morphological extraction</li>
                 <li>Limited regional occurrence data in local cache</li>
                 <li>Partial body visibility (tail obscured)</li>
               </ul>
             </div>
          </div>
        </div>

        {/* Right Column: AGENT EXECUTION PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-dim border border-outline-variant rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-label-caps text-xs text-primary uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Agent Execution Panel
              </h2>
              <div className="px-2 py-1 bg-surface-variant/30 border border-outline-variant rounded text-[10px] font-data-sm text-on-surface-variant uppercase">
                {observation.processing_stage}
              </div>
            </div>

            <div className="flex-1 space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-outline-variant/30">
              {observation.runs.map((run, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 bg-surface-dim flex items-center justify-center
                    ${run.status === 'completed' ? 'border-primary' : run.status === 'warning' ? 'border-error' : 'border-outline-variant'}`}>
                    {run.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-primary" />}
                    {run.status === 'warning' && <AlertTriangle className="w-3 h-3 text-error" />}
                  </div>

                  <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-data-sm text-sm text-primary">{run.tool_name}</div>
                      <div className="text-[10px] font-data-sm text-on-surface-variant">{run.latency_ms}ms</div>
                    </div>
                    
                    <div className="text-sm font-body-md text-on-surface-variant leading-relaxed mb-3">
                      {run.raw_output}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-outline-variant/20 pt-3">
                      <span className="text-[10px] font-label-caps bg-surface-variant/30 px-1.5 py-0.5 rounded text-on-surface-variant border border-outline-variant/30">
                        {run.tool_version}
                      </span>
                      {Object.entries(run.score_breakdown).map(([key, val]) => (
                        <span key={key} className="text-[10px] font-data-sm bg-primary/10 px-1.5 py-0.5 rounded text-primary border border-primary/20">
                          {key}: {val}
                        </span>
                      ))}
                      {run.retry_count > 0 && (
                        <span className="text-[10px] font-label-caps flex items-center gap-1 bg-surface-variant/30 px-1.5 py-0.5 rounded text-on-surface-variant border border-outline-variant/30">
                          <RotateCcw className="w-3 h-3" />
                          Retry: {run.retry_count}
                        </span>
                      )}
                      {run.fallback_used && (
                        <span className="text-[10px] font-label-caps text-error bg-error/10 px-1.5 py-0.5 rounded border border-error/20">
                          Fallback Used
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}
