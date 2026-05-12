"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import IdentificationCard from "@/components/observation/IdentificationCard";

// Mock types since we are fetching from API
interface ObservationPreview {
  id: string;
  status: string;
  timestamp: string;
  confidenceLevel?: number;
  isAnomaly?: boolean;
  speciesName?: string; // We'd join this in a real query, simplified for UI stub
  commonName?: string;
  conservationStatus?: string;
}

export default function DashboardPage() {
  const [observations, setObservations] = useState<ObservationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        const res = await fetch("/api/observations?page=1&pageSize=50");
        if (res.ok) {
          const data = await res.json();
          // Map backend data to UI preview format
          // Assuming the joined species data is either returned or we show pending
          const mapped = data.data.map((obs: any) => ({
            id: obs.id,
            status: obs.status,
            timestamp: obs.timestamp,
            confidenceLevel: obs.confidence_level,
            isAnomaly: obs.is_anomaly,
            // These would normally come from a joined species_reference table in the query
            speciesName: obs.status === "pending" ? "Pending identification" : "Species identified",
            commonName: obs.status === "pending" ? "Processing..." : "Common name",
            conservationStatus: "LC", // Placeholder
          }));
          setObservations(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch observations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchObservations();
  }, []);

  return (
    <div className="p-4 pt-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#22c55e] tracking-tight">NaLI</h1>
        <div className="bg-[#1a4724] text-[#22c55e] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Ranger
        </div>
      </header>

      <Link 
        href="/observe"
        className="w-full bg-[#22c55e] text-black font-bold py-4 rounded-xl flex items-center justify-center space-x-2 mb-8 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
      >
        <Plus size={20} />
        <span>New Observation</span>
      </Link>

      <h2 className="text-lg font-semibold text-white mb-4">Field Logs</h2>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#0f2e16] h-32 rounded-xl border border-[#1a4724]"></div>
          ))}
        </div>
      ) : observations.length === 0 ? (
        <div className="text-center py-12 bg-black/20 rounded-xl border border-dashed border-[#1a4724]">
          <p className="text-gray-400 mb-4">No observations yet.</p>
          <Link href="/observe" className="text-[#22c55e] font-semibold hover:underline">
            Start by capturing a species
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {observations.map(obs => (
            <Link href={`/observation/${obs.id}`} key={obs.id} className="block transition-transform active:scale-[0.98]">
              <IdentificationCard 
                scientificName={obs.speciesName || "Unknown"}
                commonNameId={obs.commonName || ""}
                confidence={obs.confidenceLevel || 0}
                conservationStatus={obs.conservationStatus || "DD"}
                isAnomaly={!!obs.isAnomaly}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
