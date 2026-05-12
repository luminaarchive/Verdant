"use client";

import { AlertTriangle } from "lucide-react";

interface IdentificationCardProps {
  scientificName: string;
  commonNameId: string;
  confidence: number;
  conservationStatus: string;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export default function IdentificationCard({
  scientificName,
  commonNameId,
  confidence,
  conservationStatus,
  isAnomaly,
  anomalyReason,
}: IdentificationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CR": return "bg-red-500 text-white";
      case "EN": return "bg-orange-500 text-white";
      case "VU": return "bg-yellow-500 text-black";
      case "NT": return "bg-yellow-200 text-black";
      case "LC": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="bg-[#0f2e16] rounded-xl p-4 border border-[#1a4724]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-bold italic text-white">{scientificName}</h3>
          <p className="text-gray-300 text-sm">{commonNameId}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(conservationStatus)}`}>
          {conservationStatus}
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Confidence</span>
          <span className="text-white font-medium">{Math.round(confidence * 100)}%</span>
        </div>
        <div className="w-full bg-black rounded-full h-2">
          <div 
            className="bg-[#22c55e] h-2 rounded-full" 
            style={{ width: `${Math.round(confidence * 100)}%` }}
          ></div>
        </div>
      </div>

      {isAnomaly && (
        <div className="mt-3 bg-yellow-900/30 border border-yellow-700 rounded p-2 flex items-start space-x-2">
          <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-yellow-500 text-xs font-bold">Anomalous Observation</p>
            {anomalyReason && <p className="text-yellow-400/80 text-xs mt-0.5">{anomalyReason}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
