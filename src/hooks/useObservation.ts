"use client";

import { useState, useCallback } from "react";
import type { AgentResult } from "@/types/agent";

export type ObservationState = 
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "analyzing" }
  | { status: "success"; observationId: string; agentResult: AgentResult }
  | { status: "error"; message: string };

export function useObservation() {
  const [state, setState] = useState<ObservationState>({ status: "idle" });

  const submit = useCallback(async (input: {
    photoFile?: File;
    audioFile?: File;
    textDescription?: string;
    latitude: number;
    longitude: number;
    accuracyMeters: number;
  }) => {
    setState({ status: "uploading" });
    
    try {
      const formData = new FormData();
      if (input.photoFile) formData.append("photoFile", input.photoFile);
      if (input.audioFile) formData.append("audioFile", input.audioFile);
      if (input.textDescription) formData.append("textDescription", input.textDescription);
      formData.append("latitude", String(input.latitude));
      formData.append("longitude", String(input.longitude));
      formData.append("accuracyMeters", String(input.accuracyMeters));
      
      setState({ status: "analyzing" });
      
      const res = await fetch("/api/agent/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        setState({ status: "error", message: err.error ?? "Analysis failed" });
        return;
      }
      
      const data = await res.json();
      setState({ 
        status: "success", 
        observationId: data.observationId,
        agentResult: data.agentResult 
      });
      
    } catch (err) {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
