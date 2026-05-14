"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type RealtimeAlertToast = {
  id: string;
  message: string;
  severity: string;
  distanceKm?: number;
};

export function useRealtimeAlerts(regionId?: string | null, language: "en" | "id" = "en") {
  const [alerts, setAlerts] = useState<RealtimeAlertToast[]>([]);

  useEffect(() => {
    if (!regionId) return;

    const channel = supabase
      .channel(`alerts:region_${regionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "realtime_alerts",
          filter: `region_id=eq.${regionId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            severity?: string;
            payload?: { distance_km?: number };
          };
          setAlerts((current) => [
            {
              id: row.id,
              message:
                language === "id"
                  ? "Observasi prioritas tinggi dilaporkan di kawasan Anda."
                  : "High-priority observation reported in your area.",
              severity: row.severity ?? "high",
              distanceKm: row.payload?.distance_km,
            },
            ...current,
          ]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [language, regionId]);

  return alerts;
}
