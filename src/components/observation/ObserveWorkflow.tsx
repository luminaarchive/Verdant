"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronDown,
  ClipboardList,
  CloudUpload,
  FileImage,
  LocateFixed,
  MapPin,
  Mic,
  RefreshCcw,
  Save,
  SearchCheck,
  ShieldCheck,
  SignalLow,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

type GpsState = "locating" | "acquired" | "low-accuracy" | "unavailable";
type PipelineState = "idle" | "running" | "complete";

type SpeciesResult = {
  scientificName: string;
  localName: string;
  confidence: number;
  status: "CR" | "EN" | "VU";
  trend: string;
  anomaly: string;
  distribution: string;
  notes: string;
  image: string;
};

const pipelineSteps = [
  "Uploading observation...",
  "Running species identification...",
  "Cross-checking GBIF distribution...",
  "Fetching IUCN conservation data...",
  "Running anomaly detection...",
  "Compiling structured field report...",
  "Saving observation log...",
];

const speciesResults: SpeciesResult[] = [
  {
    scientificName: "Panthera tigris sumatrae",
    localName: "Harimau Sumatera",
    confidence: 91,
    status: "CR",
    trend: "Decreasing",
    anomaly: "Human settlement proximity requires review",
    distribution: "Known range overlaps Kerinci Seblat and Bukit Barisan forest systems.",
    notes:
      "Possible large carnivore evidence near riparian vegetation. Verify track scale, camera metadata, and recent patrol reports before sharing coordinates.",
    image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?auto=format&fit=crop&w=1100&q=80",
  },
  {
    scientificName: "Pongo tapanuliensis",
    localName: "Orangutan Tapanuli",
    confidence: 88,
    status: "CR",
    trend: "Decreasing",
    anomaly: "Small-range species: location privacy elevated",
    distribution: "Restricted to the Batang Toru ecosystem in North Sumatra.",
    notes:
      "Observation should be handled as sensitive habitat data. Look for nest evidence and fruiting tree context in follow-up notes.",
    image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1100&q=80",
  },
  {
    scientificName: "Varanus komodoensis",
    localName: "Komodo",
    confidence: 93,
    status: "EN",
    trend: "Stable in monitored zones",
    anomaly: "No distribution anomaly detected",
    distribution: "Primarily associated with Komodo, Rinca, Flores, Gili Motang, and nearby islands.",
    notes:
      "Record distance from settlements, temperature, and observed behavior. Maintain safe approach distance during verification.",
    image: "https://images.unsplash.com/photo-1598755257130-c2aaca1f061c?auto=format&fit=crop&w=1100&q=80",
  },
  {
    scientificName: "Spizaetus bartelsi",
    localName: "Elang Jawa",
    confidence: 86,
    status: "EN",
    trend: "Decreasing",
    anomaly: "Canopy call record recommended for confirmation",
    distribution: "Endemic to Java, usually associated with mature forest and mountain habitats.",
    notes:
      "Raptor identification benefits from silhouette, crest visibility, and call evidence. Add audio when available.",
    image: "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=1100&q=80",
  },
  {
    scientificName: "Leucopsar rothschildi",
    localName: "Jalak Bali",
    confidence: 89,
    status: "CR",
    trend: "Increasing under managed recovery",
    anomaly: "Captive-release zone should be checked",
    distribution: "Native to Bali with highly managed conservation and release populations.",
    notes: "Confirm leg bands if visible and note flock size. Treat exact coordinates as sensitive until reviewed.",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1100&q=80",
  },
];

function pickResult(description: string) {
  const text = description.toLowerCase();
  if (text.includes("elang") || text.includes("burung") || text.includes("kanopi")) {
    return speciesResults[3];
  }
  if (text.includes("komodo") || text.includes("biawak")) {
    return speciesResults[2];
  }
  if (text.includes("orangutan") || text.includes("pongo")) {
    return speciesResults[1];
  }
  if (text.includes("jalak") || text.includes("bali")) {
    return speciesResults[4];
  }
  return speciesResults[0];
}

export default function ObserveWorkflow() {
  const router = useRouter();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState("");
  const [gpsState, setGpsState] = useState<GpsState>("locating");
  const [coords, setCoords] = useState({ latitude: -6.9175, longitude: 107.6191, accuracy: 42 });
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<SpeciesResult | null>(null);
  const [persistedObservationId, setPersistedObservationId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [offlineQueued, setOfflineQueued] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGpsState("unavailable");
      return;
    }

    setGpsState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });
        setGpsState(accuracy > 50 ? "low-accuracy" : "acquired");
      },
      () => setGpsState("low-accuracy"),
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(null);
      setUploadProgress(0);
      return;
    }

    const url = URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    setUploadProgress(18);
    const progressTimer = window.setInterval(() => {
      setUploadProgress((current) => (current >= 100 ? 100 : Math.min(current + 18, 100)));
    }, 180);

    return () => {
      URL.revokeObjectURL(url);
      window.clearInterval(progressTimer);
    };
  }, [photoFile]);

  useEffect(() => {
    if (pipelineState !== "running") return;
    if (!persistedObservationId) return;

    if (activeStep >= pipelineSteps.length - 1) {
      const completeTimer = window.setTimeout(() => {
        setPipelineState("complete");
        setResult(pickResult(description));
      }, 900);
      return () => window.clearTimeout(completeTimer);
    }

    const timer = window.setTimeout(() => {
      setActiveStep((step) => step + 1);
    }, 850);

    return () => window.clearTimeout(timer);
  }, [activeStep, description, persistedObservationId, pipelineState]);

  const canAnalyze = Boolean(photoFile || description.trim()) && gpsState !== "locating";
  const observationId = useMemo(() => {
    const date = new Date();
    return `OBS-IDN-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
      date.getDate(),
    ).padStart(2, "0")}-${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
  }, []);

  const timestamp = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    [],
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      setPhotoFile(file);
      setResult(null);
      setPipelineState("idle");
      setOfflineQueued(false);
    }
  };

  const analyzeObservation = async () => {
    if (!canAnalyze) return;
    setActiveStep(0);
    setResult(null);
    setPersistedObservationId(null);
    setSubmitError(null);
    setOfflineQueued(false);
    setPipelineState("running");

    const formData = new FormData();
    if (photoFile) formData.append("photoFile", photoFile);
    formData.append("textDescription", description);
    formData.append("latitude", String(coords.latitude));
    formData.append("longitude", String(coords.longitude));
    formData.append("accuracyMeters", String(coords.accuracy));

    try {
      const response = await fetch("/api/observations", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to persist observation");
      }
      setPersistedObservationId(payload.observationId);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to persist observation");
      setOfflineQueued(true);
      setPipelineState("idle");
      setActiveStep(0);
    }
  };

  const saveOffline = () => {
    setOfflineQueued(true);
  };

  return (
    <div className="text-forest-950 min-h-screen bg-stone-50 pb-24">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5">
          <p className="text-xs font-semibold tracking-[0.08em] text-olive-700 uppercase">{t("observe.title")}</p>
          <h1 className="text-forest-950 mt-2 text-2xl font-semibold tracking-[0] sm:text-4xl">
            {t("common.fieldObservation")}
          </h1>
          <p className="text-forest-700 mt-2 max-w-2xl text-sm leading-6 sm:text-base">{t("observe.context")}</p>
        </header>

        <OfflineNotice queued={offlineQueued} />

        <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
          <section className="space-y-4">
            <FieldCard
              icon={<FileImage className="h-5 w-5" />}
              title={t("observe.upload")}
              detail={t("observe.uploadHint")}
            >
              <div
                className={`relative overflow-hidden rounded-sm border-2 border-dashed ${
                  isDragging ? "border-olive-700 bg-olive-100" : "border-stone-300 bg-stone-100"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFiles(event.dataTransfer.files);
                }}
              >
                {previewUrl ? (
                  <div className="relative h-64">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="Uploaded observation preview" className="h-full w-full object-cover" src={previewUrl} />
                    <button
                      aria-label="Remove selected photo"
                      className="bg-forest-950/85 absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-sm text-stone-50"
                      onClick={() => setPhotoFile(null)}
                      type="button"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    className="flex min-h-52 w-full flex-col items-center justify-center gap-3 px-4 py-8 text-center"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <Upload className="h-8 w-8 text-olive-700" />
                    <span className="text-forest-950 font-semibold">{t("observe.upload")}</span>
                    <span className="text-forest-700 text-sm">
                      JPG, PNG, or HEIC from field camera and Android gallery
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  className="text-forest-900 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-stone-300 bg-white px-4 text-sm font-semibold"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <CloudUpload className="h-4 w-4" />
                  {t("observe.upload")}
                </button>
                <button
                  className="bg-forest-900 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-semibold text-stone-50"
                  onClick={() => cameraInputRef.current?.click()}
                  type="button"
                >
                  <Camera className="h-4 w-4" />
                  Camera Capture
                </button>
              </div>

              <input
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
                ref={fileInputRef}
                type="file"
              />
              <input
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
                ref={cameraInputRef}
                type="file"
              />

              <UploadProgress progress={uploadProgress} hasPhoto={Boolean(photoFile)} />
            </FieldCard>

            <FieldCard
              icon={<Mic className="h-5 w-5" />}
              title="Audio recording"
              detail="Reserved for bird calls and acoustic observations."
            >
              <div className="rounded-sm border border-stone-200 bg-stone-100 p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <button
                    className="bg-forest-900 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-semibold text-stone-50"
                    type="button"
                  >
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </button>
                  <span className="text-forest-600 text-right text-xs font-semibold tracking-[0.08em] uppercase">
                    Placeholder
                  </span>
                </div>
                <div className="flex h-16 items-end gap-1 rounded-sm border border-stone-200 bg-white px-3 py-2">
                  {[24, 42, 30, 54, 36, 48, 28, 58, 38, 44, 26, 50, 34, 46, 30, 40].map((height, index) => (
                    <span className="w-full rounded-t-sm bg-olive-300" key={`${height}-${index}`} style={{ height }} />
                  ))}
                </div>
                <p className="text-forest-700 mt-3 text-sm">Bird audio identification integration coming soon</p>
              </div>
            </FieldCard>

            <FieldCard
              icon={<ClipboardList className="h-5 w-5" />}
              title={t("observe.description")}
              detail="Write natural field notes in Indonesian or English."
            >
              <textarea
                className="text-forest-950 min-h-36 w-full resize-none rounded-sm border border-stone-300 bg-white p-4 text-base leading-7 transition outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-100"
                maxLength={2000}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setResult(null);
                }}
                placeholder={t("observe.descriptionPlaceholder")}
                value={description}
              />
              <div className="text-forest-600 mt-2 flex items-center justify-between text-xs">
                <span>Supports Bahasa Indonesia and English observations</span>
                <span>{description.length} / 2000</span>
              </div>
            </FieldCard>
          </section>

          <aside className="space-y-4">
            <GpsCard coords={coords} state={gpsState} />

            <div className="rounded-sm border border-stone-200 bg-white p-4">
              {submitError ? (
                <div className="border-rare-red/40 bg-rare-red/10 text-forest-800 mb-3 rounded-sm border p-3 text-sm leading-6">
                  {t("observe.uploadFailed")} {submitError}
                </div>
              ) : null}
              <button
                className="bg-forest-900 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm px-5 text-sm font-semibold text-stone-50 transition disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                disabled={!canAnalyze || pipelineState === "running"}
                onClick={analyzeObservation}
                type="button"
              >
                <SearchCheck className="h-5 w-5" />
                {t("common.analyzeObservation")}
              </button>
              <button
                className="text-forest-900 mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-stone-300 bg-stone-50 px-5 text-sm font-semibold"
                onClick={saveOffline}
                type="button"
              >
                <Save className="h-5 w-5" />
                Save Offline
              </button>
              {!canAnalyze ? (
                <p className="text-forest-700 mt-3 text-sm leading-6">
                  Add a photo or field description and wait for GPS before analysis.
                </p>
              ) : null}
            </div>

            <PipelineCard activeStep={activeStep} state={pipelineState} />

            {result ? (
              <ResultCard
                coords={coords}
                observationId={observationId}
                persistedObservationId={persistedObservationId}
                result={result}
                timestamp={timestamp}
                onOpenPersisted={() => {
                  if (persistedObservationId) router.push(`/observation/${persistedObservationId}`);
                }}
              />
            ) : (
              <EmptyResultCard />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function FieldCard({
  children,
  detail,
  icon,
  title,
}: {
  children: React.ReactNode;
  detail: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-olive-100 text-olive-800">
          {icon}
        </span>
        <div>
          <h2 className="text-forest-950 text-lg font-semibold">{title}</h2>
          <p className="text-forest-700 text-sm leading-6">{detail}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function UploadProgress({ hasPhoto, progress }: { hasPhoto: boolean; progress: number }) {
  if (!hasPhoto) return null;

  return (
    <div className="mt-3 rounded-sm border border-stone-200 bg-stone-50 p-3">
      <div className="text-forest-600 mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.08em] uppercase">
        <span>Upload preparation</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-olive-700 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function GpsCard({
  coords,
  state,
}: {
  coords: { latitude: number; longitude: number; accuracy: number };
  state: GpsState;
}) {
  const stateCopy = {
    locating: {
      label: "locating...",
      tone: "border-warning-amber bg-warning-amber/10 text-forest-950",
      icon: RefreshCcw,
    },
    acquired: {
      label: "GPS acquired",
      tone: "border-olive-300 bg-olive-100 text-forest-950",
      icon: LocateFixed,
    },
    "low-accuracy": {
      label: "low accuracy warning",
      tone: "border-conservation-orange bg-conservation-orange/10 text-forest-950",
      icon: AlertTriangle,
    },
    unavailable: {
      label: "GPS unavailable",
      tone: "border-rare-red bg-rare-red/10 text-forest-950",
      icon: AlertTriangle,
    },
  }[state];
  const Icon = stateCopy.icon;

  return (
    <section className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-olive-100 text-olive-800">
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-forest-950 text-lg font-semibold">GPS detection</h2>
          <p className="text-forest-700 text-sm leading-6">
            Coordinates are attached to the observation log and protected for sensitive species.
          </p>
        </div>
      </div>

      <div className={`mb-3 flex items-center gap-2 rounded-sm border p-3 text-sm ${stateCopy.tone}`}>
        <Icon className={`h-4 w-4 ${state === "locating" ? "animate-spin" : ""}`} />
        <span className="font-semibold">{stateCopy.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <Coordinate label="Latitude" value={coords.latitude.toFixed(5)} />
        <Coordinate label="Longitude" value={coords.longitude.toFixed(5)} />
        <Coordinate label="Accuracy" value={`±${Math.round(coords.accuracy)}m`} />
      </div>
    </section>
  );
}

function Coordinate({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <p className="text-forest-600 text-xs font-semibold tracking-[0.08em] uppercase">{label}</p>
      <p className="text-forest-950 mt-1 text-sm font-semibold break-words">{value}</p>
    </div>
  );
}

function PipelineCard({ activeStep, state }: { activeStep: number; state: PipelineState }) {
  return (
    <section className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-forest-950 text-lg font-semibold">Analysis pipeline</h2>
          <p className="text-forest-700 text-sm">Sequential operational analysis states</p>
        </div>
        <span className="text-forest-700 rounded-sm bg-stone-100 px-2.5 py-1 text-xs font-semibold tracking-[0.08em] uppercase">
          {state === "complete" ? "Complete" : state === "running" ? "Running" : "Ready"}
        </span>
      </div>

      <div className="space-y-2">
        {pipelineSteps.map((step, index) => {
          const isDone = state === "complete" || (state === "running" && index < activeStep);
          const isActive = state === "running" && index === activeStep;
          return (
            <div
              className={`flex items-center gap-3 rounded-sm border p-3 text-sm ${
                isActive
                  ? "text-forest-950 border-olive-300 bg-olive-100"
                  : isDone
                    ? "text-forest-700 border-stone-200 bg-stone-50"
                    : "text-forest-500 border-stone-200 bg-white"
              }`}
              key={step}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  isDone ? "bg-olive-700 text-white" : isActive ? "bg-warning-amber text-forest-950" : "bg-stone-200"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isActive ? (
                  <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                )}
              </span>
              <span className="font-medium">{step}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ResultCard({
  coords,
  observationId,
  onOpenPersisted,
  persistedObservationId,
  result,
  timestamp,
}: {
  coords: { latitude: number; longitude: number; accuracy: number };
  observationId: string;
  onOpenPersisted: () => void;
  persistedObservationId: string | null;
  result: SpeciesResult;
  timestamp: string;
}) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-sm border border-stone-300 bg-white shadow-sm"
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative h-52">
        <Image
          alt={`${result.localName} observation result`}
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 42vw, 100vw"
          src={result.image}
        />
        <span className="bg-forest-950/85 absolute top-3 left-3 rounded-sm px-3 py-2 text-xs font-semibold tracking-[0.08em] text-stone-50 uppercase">
          Structured result
        </span>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-forest-950 text-2xl font-semibold italic">{result.scientificName}</h2>
            <p className="text-forest-700 text-sm">{result.localName}</p>
          </div>
          <StatusBadge status={result.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Coordinate label="Confidence" value={`${result.confidence}%`} />
          <Coordinate label="Trend" value={result.trend} />
          <Coordinate label="Observation ID" value={observationId} />
          <Coordinate label="Timestamp" value={timestamp} />
          <Coordinate label="Latitude" value={coords.latitude.toFixed(5)} />
          <Coordinate label="Longitude" value={coords.longitude.toFixed(5)} />
        </div>

        <div className="border-conservation-orange/40 bg-conservation-orange/10 mt-3 rounded-sm border p-3">
          <div className="flex gap-2">
            <AlertTriangle className="text-conservation-orange mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-forest-950 text-sm font-semibold">Anomaly detection warning</p>
              <p className="text-forest-800 mt-1 text-sm leading-6">{result.anomaly}</p>
            </div>
          </div>
        </div>

        <InfoBlock title="Distribution summary" text={result.distribution} />
        <InfoBlock title="Ecological notes" text={result.notes} />
        {persistedObservationId ? (
          <button
            className="bg-forest-900 mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-sm px-4 text-sm font-semibold text-stone-50"
            onClick={onOpenPersisted}
            type="button"
          >
            Open Archived Field Log
          </button>
        ) : (
          <Link
            className="text-forest-900 mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-stone-300 bg-stone-50 px-4 text-sm font-semibold"
            href="/dashboard"
          >
            View Field Log Dashboard
          </Link>
        )}
      </div>
    </motion.section>
  );
}

function EmptyResultCard() {
  return (
    <section className="text-forest-700 rounded-sm border border-stone-200 bg-stone-100 p-4 text-sm leading-6">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-sm bg-white text-olive-800">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <h2 className="text-forest-950 text-lg font-semibold">Observation result will appear here</h2>
      <p className="mt-2">
        After analysis, NaLI will show species identification, conservation context, anomaly review, coordinates, and
        structured notes in this panel.
      </p>
    </section>
  );
}

function StatusBadge({ status }: { status: SpeciesResult["status"] }) {
  const styles = {
    CR: "bg-rare-red text-white",
    EN: "bg-conservation-orange text-forest-950",
    VU: "bg-warning-amber text-forest-950",
  }[status];
  return <span className={`rounded-sm px-3 py-1.5 text-sm font-bold ${styles}`}>{status}</span>;
}

function InfoBlock({ text, title }: { text: string; title: string }) {
  return (
    <div className="mt-3 rounded-sm border border-stone-200 bg-stone-50 p-3">
      <p className="text-forest-600 text-xs font-semibold tracking-[0.08em] uppercase">{title}</p>
      <p className="text-forest-800 mt-1 text-sm leading-6">{text}</p>
    </div>
  );
}

function OfflineNotice({ queued }: { queued: boolean }) {
  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-3">
      <NoticeItem icon={<WifiOff className="h-4 w-4" />} label="Offline lite ready" />
      <NoticeItem
        icon={<ClipboardList className="h-4 w-4" />}
        label={queued ? "Queued observation pending sync" : "No queued observation"}
      />
      <NoticeItem icon={<SignalLow className="h-4 w-4" />} label="Reconnect notification enabled" />
    </div>
  );
}

function NoticeItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-forest-800 flex items-center gap-2 rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm font-medium">
      <span className="text-olive-700">{icon}</span>
      {label}
    </div>
  );
}
