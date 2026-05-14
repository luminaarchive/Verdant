"use client";

type EvidenceTone = "forest" | "amber" | "river" | "sky" | "earth";

const toneClass: Record<EvidenceTone, string> = {
  amber: "from-amber-900 via-orange-700 to-stone-300",
  earth: "from-stone-900 via-stone-600 to-amber-200",
  forest: "from-forest-950 via-olive-700 to-stone-200",
  river: "from-forest-900 via-cyan-800 to-stone-200",
  sky: "from-slate-900 via-sky-700 to-stone-100",
};

export function SpeciesEvidencePanel({
  caption,
  className = "",
  localName,
  scientificName,
  tone = "forest",
}: {
  caption: string;
  className?: string;
  localName: string;
  scientificName: string;
  tone?: EvidenceTone;
}) {
  return (
    <div className={`relative h-full min-h-48 overflow-hidden bg-gradient-to-br ${toneClass[tone]} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_24%),radial-gradient(circle_at_70%_85%,rgba(255,255,255,0.18),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/90 via-forest-950/45 to-transparent p-4 text-stone-50">
        <p className="text-[10px] font-label-caps uppercase tracking-[0.08em] text-stone-200">{caption}</p>
        <p className="mt-1 font-data-sm text-lg italic">{scientificName}</p>
        <p className="text-sm text-stone-200">{localName}</p>
      </div>
    </div>
  );
}
