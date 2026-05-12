"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CaptureInput from "@/components/observation/CaptureInput";

export default function ObservePage() {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [textDescription, setTextDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = (photoFile !== undefined || textDescription.trim().length > 0) && location !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (photoFile) formData.append("photoFile", photoFile);
      if (textDescription) formData.append("textDescription", textDescription);
      formData.append("latitude", location.lat.toString());
      formData.append("longitude", location.lng.toString());
      formData.append("accuracyMeters", location.accuracy.toString());

      const res = await fetch("/api/agent/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to analyze observation");
      }

      const data = await res.json();
      router.push(`/observation/${data.observationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 pt-6 pb-24 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">New Observation</h1>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <CaptureInput
        photoFile={photoFile}
        onPhotoCapture={setPhotoFile}
        textValue={textDescription}
        onTextChange={setTextDescription}
        onLocationCapture={(lat, lng, accuracy) => setLocation({ lat, lng, accuracy })}
      />

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full bg-[#22c55e] text-black font-bold py-4 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Identify Species</span>
          )}
        </button>
      </div>
    </div>
  );
}
