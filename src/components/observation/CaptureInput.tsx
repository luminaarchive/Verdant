"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, MapPin, X, Image as ImageIcon } from "lucide-react";

interface CaptureInputProps {
  onPhotoCapture: (file: File | undefined) => void;
  onTextChange: (text: string) => void;
  onLocationCapture: (lat: number, lng: number, accuracy: number) => void;
  photoFile?: File;
  textValue?: string;
}

export default function CaptureInput({
  onPhotoCapture,
  onTextChange,
  onLocationCapture,
  photoFile,
  textValue = "",
}: CaptureInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<{ status: string; text: string }>({
    status: "loading",
    text: "Capturing location...",
  });

  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [photoFile]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          onLocationCapture(latitude, longitude, accuracy);
          setLocationState({
            status: "success",
            text: `Location captured: ±${Math.round(accuracy)}m accuracy`,
          });
        },
        (error) => {
          setLocationState({
            status: "error",
            text: "Failed to capture location",
          });
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationState({
        status: "error",
        text: "Geolocation not supported",
      });
    }
  }, [onLocationCapture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoCapture(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Photo */}
      <div className="bg-[#0f2e16] rounded-xl p-4 border border-[#1a4724]">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
          <Camera size={16} className="mr-2" /> Photo Evidence
        </h3>
        
        {previewUrl ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[#22c55e]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => onPhotoCapture(undefined)}
              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-black/80"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-[#1a4724] rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-[#22c55e] hover:border-[#22c55e] cursor-pointer transition-colors bg-black/20"
          >
            <ImageIcon size={32} className="mb-2" />
            <span className="text-sm">Tap to capture or upload photo</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* SECTION 2: Text Description */}
      <div className="bg-[#0f2e16] rounded-xl p-4 border border-[#1a4724]">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Field Notes</h3>
        <textarea
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Describe what you see... (species, behavior, habitat)"
          className="w-full h-24 bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] resize-none text-sm"
          maxLength={2000}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {textValue.length} / 2000
        </div>
      </div>

      {/* SECTION 3: GPS */}
      <div className="bg-[#0f2e16] rounded-xl p-4 border border-[#1a4724]">
        <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
          <MapPin size={16} className="mr-2" /> Location Data
        </h3>
        <div className="flex items-center text-sm">
          {locationState.status === "loading" && <span className="text-yellow-500">{locationState.text}</span>}
          {locationState.status === "success" && <span className="text-[#22c55e]">{locationState.text}</span>}
          {locationState.status === "error" && <span className="text-red-500">{locationState.text}</span>}
        </div>
      </div>
    </div>
  );
}
