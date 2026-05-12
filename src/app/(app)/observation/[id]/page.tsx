"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

interface ObservationDetail {
  id: string;
  status: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  text_description: string | null;
  confidence_level: number | null;
  is_anomaly: boolean;
  review_status: string;
  // Note: in a real implementation we would join with species_reference to get these, 
  // or fetch them from a dedicated API endpoint that formats the view model.
  // For the sake of the exercise, we will mock the joined fields if they exist in DB.
}

const statusConfig: Record<string, { label: string; color: string }> = {
  EX: { label: "Extinct", color: "bg-black text-white" },
  EW: { label: "Extinct in the Wild", color: "bg-purple-900 text-white" },
  CR: { label: "Critically Endangered", color: "bg-red-600 text-white" },
  EN: { label: "Endangered", color: "bg-orange-500 text-white" },
  VU: { label: "Vulnerable", color: "bg-yellow-500 text-black" },
  NT: { label: "Near Threatened", color: "bg-yellow-200 text-black" },
  LC: { label: "Least Concern", color: "bg-green-500 text-white" },
  DD: { label: "Data Deficient", color: "bg-gray-500 text-white" },
  NE: { label: "Not Evaluated", color: "bg-gray-400 text-white" },
};

export default function ObservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [observation, setObservation] = useState<ObservationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Mocks for joined data that we'd normally get from a robust GET endpoint
  const [speciesData, setSpeciesData] = useState<any>({
    scientificName: "Loading...",
    commonName: "...",
    conservationStatus: "DD",
    populationTrend: "unknown",
  });
  
  const [analysisRun, setAnalysisRun] = useState<any>(null);

  const fetchObservation = async () => {
    try {
      const { data: obs, error } = await supabase
        .from("observations")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      setObservation(obs);

      if (obs.final_species_ref_id) {
        const { data: ref } = await supabase
          .from("species_reference")
          .select("*")
          .eq("id", obs.final_species_ref_id)
          .single();
          
        if (ref) {
          // Also try to get cache for status/trend
          const { data: cache } = await supabase
            .from("species_cache")
            .select("*")
            .eq("species_ref_id", ref.id)
            .single();

          setSpeciesData({
            scientificName: ref.scientific_name,
            commonName: ref.common_name_id || ref.common_name_en,
            conservationStatus: cache?.conservation_status || "DD",
            populationTrend: cache?.population_trend || "unknown",
          });
        }
      }

      const { data: run } = await supabase
        .from("analysis_runs")
        .select("*")
        .eq("observation_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      if (run) setAnalysisRun(run);

    } catch (error) {
      console.error("Error fetching observation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservation();

    // Auto-refresh if pending
    let interval: NodeJS.Timeout;
    if (observation?.status === "pending") {
      interval = setInterval(() => {
        fetchObservation();
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [id, observation?.status]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#22c55e] mb-4" size={40} />
        <p className="text-gray-400">Loading observation data...</p>
      </div>
    );
  }

  if (!observation) {
    return (
      <div className="p-6">
        <p className="text-red-400">Observation not found.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-4 text-[#22c55e]">Return to Dashboard</button>
      </div>
    );
  }

  if (observation.status === "pending") {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#22c55e] mb-6" size={48} />
        <h2 className="text-2xl font-bold text-white mb-2">Analysis in progress...</h2>
        <p className="text-gray-400 text-center">NaLI is identifying the species and checking conservation databases.</p>
        <Link href="/dashboard" className="mt-8 text-gray-500 hover:text-white">Go back to dashboard</Link>
      </div>
    );
  }

  const conf = observation.confidence_level || 0;
  const statusInfo = statusConfig[speciesData.conservationStatus] || statusConfig["DD"];

  return (
    <div className="p-4 pt-6 pb-24 max-w-lg mx-auto">
      <Link href="/dashboard" className="flex items-center text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </Link>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold italic text-white leading-tight">
          {speciesData.scientificName}
        </h1>
        {speciesData.commonName && (
          <p className="text-lg text-gray-300 mt-1">{speciesData.commonName}</p>
        )}
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">AI Confidence Score</span>
            <span className="text-white font-bold">{Math.round(conf * 100)}%</span>
          </div>
          <div className="w-full bg-black rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${conf < 0.6 ? 'bg-red-500' : conf < 0.8 ? 'bg-yellow-500' : 'bg-[#22c55e]'}`} 
              style={{ width: `${Math.round(conf * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* CONSERVATION STATUS CARD */}
      <div className={`rounded-xl p-5 mb-4 border border-gray-800 ${statusInfo.color}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold opacity-90">Conservation Status</span>
          <span className="text-2xl font-black">{speciesData.conservationStatus}</span>
        </div>
        <h3 className="text-xl font-bold mb-4">{statusInfo.label}</h3>
        
        <div className="flex items-center text-sm font-medium bg-black/20 rounded-lg p-2 inline-flex">
          <span className="mr-2 opacity-90">Population Trend:</span>
          {speciesData.populationTrend === "decreasing" && <span className="flex items-center"><TrendingDown size={16} className="mr-1"/> Decreasing</span>}
          {speciesData.populationTrend === "increasing" && <span className="flex items-center"><TrendingUp size={16} className="mr-1"/> Increasing</span>}
          {speciesData.populationTrend === "stable" && <span className="flex items-center"><Minus size={16} className="mr-1"/> Stable</span>}
          {speciesData.populationTrend === "unknown" && <span>Unknown</span>}
        </div>
      </div>

      {/* ANOMALY ALERT */}
      {observation.is_anomaly && (
        <div className="bg-yellow-900/40 border border-yellow-600 rounded-xl p-5 mb-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle size={24} className="text-yellow-500 shrink-0" />
            <div>
              <h3 className="text-yellow-500 font-bold text-lg mb-1">Anomalous Observation</h3>
              <p className="text-yellow-100/80 text-sm leading-relaxed">
                {analysisRun?.raw_output?.anomalyReason || "This species has not been previously recorded in this location. Please ensure the identification is correct."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW STATUS */}
      {observation.review_status === "review_needed" && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6 flex items-center text-red-400">
          <AlertTriangle size={18} className="mr-2" />
          <span className="text-sm font-semibold">Needs Review - Low confidence result</span>
        </div>
      )}
      
      {observation.review_status === "verified" && (
        <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl p-4 mb-6 flex items-center text-[#22c55e]">
          <span className="text-sm font-semibold">✓ Verified by Expert</span>
        </div>
      )}

      {/* OBSERVATION DETAILS */}
      <div className="bg-[#0f2e16] rounded-xl p-5 border border-[#1a4724]">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Field Data</h3>
        
        <div className="space-y-4 text-sm">
          <div className="flex justify-between border-b border-[#1a4724] pb-3">
            <span className="text-gray-400">Date & Time</span>
            <span className="text-white text-right">{new Date(observation.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-[#1a4724] pb-3">
            <span className="text-gray-400">Location</span>
            <span className="text-white text-right">{observation.latitude.toFixed(6)}, {observation.longitude.toFixed(6)}</span>
          </div>
          {observation.text_description && (
            <div className="pt-2">
              <span className="text-gray-400 block mb-2">Field Notes</span>
              <p className="text-white bg-black/30 p-3 rounded-lg leading-relaxed">{observation.text_description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
