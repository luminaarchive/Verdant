"use client";

// NaLI: Ecological Field Map System
// WARNING: This component must be dynamically imported by its parent to avoid SSR window issues.
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import of leaflet components to disable SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

type MapObservation = {
  id: string;
  species: string;
  localName: string | null;
  status: string;
  reviewStatus: string;
  anomaly: boolean;
  lat: number;
  lng: number;
  protected: boolean;
};

export default function EcologicalMapPage() {
  const [mounted, setMounted] = useState(false);
  const [observations, setObservations] = useState<MapObservation[]>([]);
  const [error, setError] = useState("");
  const [disclaimer, setDisclaimer] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/map/field-layers")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Map layers unavailable");
        setObservations(body.observations ?? []);
        setDisclaimer(body.disclaimer ?? "");
      })
      .catch((lookupError) => {
        setError(lookupError instanceof Error ? lookupError.message : "Map layers unavailable");
      });
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md flex min-h-screen flex-col">
      <header className="bg-surface-dim border-outline-variant sticky top-0 z-50 flex h-16 items-center border-b px-6">
        <h1 className="font-label-caps text-primary text-xs tracking-widest uppercase">
          Persisted Field Occurrence Map
        </h1>
      </header>

      <main className="relative h-[calc(100vh-64px)] w-full flex-1">
        <MapContainer
          center={[-2.0, 118.0]}
          zoom={5}
          style={{ height: "100%", width: "100%", background: "#1c1b1f" }}
          className="z-0"
        >
          {/* Muted, topographic style tiles suitable for conservation UI */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {observations.map((obs) => {
            return (
              <CircleMarker
                key={obs.id}
                center={[obs.lat, obs.lng]}
                radius={obs.protected ? 12 : 6}
                pathOptions={{
                  fillColor: obs.protected ? "#ff5449" : obs.anomaly ? "#ffb84d" : "#00e57a",
                  color: obs.protected ? "#ff5449" : obs.anomaly ? "#ffb84d" : "#00e57a",
                  fillOpacity: 0.4,
                  weight: 2,
                }}
              >
                <Popup className="bg-surface-dim border-outline-variant text-on-surface border">
                  <div className="font-body-md">
                    <h3 className="font-label-caps text-primary mb-1 text-[11px] tracking-wider uppercase">
                      {obs.species}
                    </h3>
                    <p className="text-on-surface-variant text-sm">Status: {obs.status}</p>
                    <p className="text-on-surface-variant text-sm">Review: {obs.reviewStatus}</p>
                    {obs.protected && (
                      <p className="text-error font-data-sm mt-2 text-[10px]">
                        * Coordinates obfuscated for protection
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {observations.length === 0 ? (
          <div className="border-outline-variant bg-surface-container/95 text-on-surface-variant absolute inset-x-4 top-6 z-[1000] rounded-sm border p-4 text-sm shadow-lg md:right-auto md:left-6 md:max-w-md">
            {error || "No persisted field observations with coordinates are available for this workspace yet."}
          </div>
        ) : null}

        {/* Legend Overlay */}
        <div className="bg-surface-container/90 border-outline-variant pointer-events-auto absolute right-6 bottom-6 z-[1000] rounded-xl border p-4 shadow-lg backdrop-blur-sm">
          <h4 className="font-label-caps text-on-surface-variant mb-3 text-[10px] tracking-widest uppercase">
            Field Layers
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-error/40 border-error h-3 w-3 rounded-full border-2"></div>
              <span className="text-on-surface text-xs">Critical/Endangered (Obfuscated)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-[#ffb84d] bg-[#ffb84d]/40"></div>
              <span className="text-on-surface text-xs">Anomaly flag</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary/40 border-primary h-3 w-3 rounded-full border-2"></div>
              <span className="text-on-surface text-xs">Accessible observation</span>
            </div>
          </div>
          {disclaimer ? (
            <p className="text-on-surface-variant mt-3 max-w-[15rem] text-[10px] leading-4">{disclaimer}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
