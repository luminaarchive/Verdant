'use client';

// NaLI: Ecological Field Map System
// WARNING: This component must be dynamically imported by its parent to avoid SSR window issues.
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import of leaflet components to disable SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function EcologicalMapPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulated ecological observations
  const observations = [
    { id: 1, species: "Pongo abelii", status: "CR", isEndangered: true, lat: 3.20, lng: 98.15 },
    { id: 2, species: "Panthera tigris sumatrae", status: "CR", isEndangered: true, lat: -0.5, lng: 101.5 },
    { id: 3, species: "Macaca fascicularis", status: "LC", isEndangered: false, lat: -6.2, lng: 106.8 }
  ];

  /**
   * Coordinate Obfuscation for Endangered Species
   * Jitters the location by up to 10km to protect critical habitats
   */
  const obfuscateCoordinates = (lat: number, lng: number, isEndangered: boolean) => {
    if (!isEndangered) return { lat, lng };
    const jitter = 0.1; // roughly 11km at equator
    return {
      lat: lat + (Math.random() - 0.5) * jitter,
      lng: lng + (Math.random() - 0.5) * jitter
    };
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md flex flex-col">
      <header className="bg-surface-dim border-b border-outline-variant h-16 flex items-center px-6 sticky top-0 z-50">
        <h1 className="font-label-caps text-xs text-primary uppercase tracking-widest">Ecological Occurrence Map</h1>
      </header>

      <main className="flex-1 w-full h-[calc(100vh-64px)] relative">
        <MapContainer 
          center={[-2.0, 118.0]} 
          zoom={5} 
          style={{ height: '100%', width: '100%', background: '#1c1b1f' }}
          className="z-0"
        >
          {/* Muted, topographic style tiles suitable for conservation UI */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {observations.map((obs) => {
            const { lat, lng } = obfuscateCoordinates(obs.lat, obs.lng, obs.isEndangered);
            
            return (
              <CircleMarker
                key={obs.id}
                center={[lat, lng]}
                radius={obs.isEndangered ? 12 : 6}
                pathOptions={{ 
                  fillColor: obs.isEndangered ? '#ff5449' : '#00e57a', // error vs primary
                  color: obs.isEndangered ? '#ff5449' : '#00e57a',
                  fillOpacity: 0.4,
                  weight: 2
                }}
              >
                <Popup className="bg-surface-dim border border-outline-variant text-on-surface">
                  <div className="font-body-md">
                    <h3 className="font-label-caps text-[11px] text-primary mb-1 uppercase tracking-wider">{obs.species}</h3>
                    <p className="text-sm text-on-surface-variant">Status: {obs.status}</p>
                    {obs.isEndangered && (
                      <p className="text-[10px] text-error mt-2 font-data-sm">* Coordinates obfuscated for protection</p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-surface-container/90 backdrop-blur-sm border border-outline-variant rounded-xl p-4 shadow-lg pointer-events-auto">
          <h4 className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Occurrence Density</h4>
          <div className="space-y-2">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error/40 border-2 border-error"></div>
                <span className="text-xs text-on-surface">Critical/Endangered (Obfuscated)</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/40 border-2 border-primary"></div>
                <span className="text-xs text-on-surface">Least Concern (Exact)</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
