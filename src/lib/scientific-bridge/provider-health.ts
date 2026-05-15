import type { ProviderHealthEntry, ScientificProviderStatus } from "./types";

function configured(key: string | undefined): ScientificProviderStatus {
  return key && key.trim().length > 0 ? "configured" : "unconfigured";
}

export function getScientificProviderHealth(): ProviderHealthEntry[] {
  return [
    {
      name: "GBIF",
      status: "live",
      purpose: "Taxonomy normalization and occurrence context.",
      purposeId: "Normalisasi taksonomi dan konteks kemunculan.",
      note: "Public reads do not normally require a key; rate limits still require caching.",
      noteId: "Pembacaan publik biasanya tidak memerlukan kunci; batas laju tetap memerlukan cache.",
    },
    {
      name: "IUCN Red List",
      status: configured(process.env.IUCN_API_KEY),
      purpose: "Conservation status, trend, threats, habitats, and actions.",
      purposeId: "Status konservasi, tren, ancaman, habitat, dan aksi konservasi.",
      requiresEnv: "IUCN_API_KEY",
      note: "Unconfigured mode must use golden-set/cache and say so.",
      noteId: "Mode belum dikonfigurasi harus memakai golden-set/cache dan menyebutkannya.",
    },
    {
      name: "eBird",
      status: configured(process.env.EBIRD_API_KEY),
      purpose: "Bird taxonomy and occurrence context.",
      purposeId: "Taksonomi burung dan konteks kemunculan.",
      requiresEnv: "EBIRD_API_KEY",
      note: "Use for bird context only after server-side key setup.",
      noteId: "Gunakan untuk konteks burung hanya setelah kunci server-side disiapkan.",
    },
    {
      name: "iNaturalist",
      status: "live",
      purpose: "Citizen-science/community observation signal.",
      purposeId: "Sinyal observasi komunitas/citizen science.",
      note: "Never treat community observations as authoritative verification.",
      noteId: "Jangan perlakukan observasi komunitas sebagai verifikasi otoritatif.",
    },
    {
      name: "Encyclopedia of Life",
      status: "live",
      purpose: "Species descriptions, common names, and trait discovery.",
      purposeId: "Deskripsi spesies, nama umum, dan penemuan trait.",
      note: "Summarize and cite; do not copy long passages.",
      noteId: "Ringkas dan cantumkan sumber; jangan menyalin kutipan panjang.",
    },
    {
      name: "Catalogue of Life",
      status: "live",
      purpose: "Taxonomy cross-check through ChecklistBank.",
      purposeId: "Pemeriksaan silang taksonomi melalui ChecklistBank.",
      note: "Reference only until NaLI adds a taxonomic reconciliation cache.",
      noteId: "Referensi saja sampai NaLI menambahkan cache rekonsiliasi taksonomi.",
    },
    {
      name: "BirdNET",
      status: configured(process.env.BIRDNET_API_KEY),
      purpose: "Bird/bioacoustic inference adapter.",
      purposeId: "Adapter inferensi burung/bioakustik.",
      requiresEnv: "BIRDNET_API_KEY",
      note: "Model licensing and deployment path must be confirmed before live claims.",
      noteId: "Lisensi model dan jalur deployment harus dikonfirmasi sebelum klaim live.",
    },
    {
      name: "NASA FIRMS",
      status: configured(process.env.NASA_FIRMS_API_KEY),
      purpose: "Fire hotspot threat context.",
      purposeId: "Konteks ancaman titik api.",
      requiresEnv: "NASA_FIRMS_API_KEY",
      note: "Configured key does not mean cron/import is active.",
      noteId: "Kunci yang terkonfigurasi tidak berarti cron/import aktif.",
    },
    {
      name: "Global Forest Watch",
      status: configured(process.env.GFW_API_KEY),
      purpose: "Deforestation alert context.",
      purposeId: "Konteks peringatan deforestasi.",
      requiresEnv: "GFW_API_KEY",
      note: "Dataset choice and terms must be documented before scheduled import.",
      noteId: "Pilihan dataset dan ketentuan harus didokumentasikan sebelum impor terjadwal.",
    },
    {
      name: "Claude",
      status: configured(process.env.ANTHROPIC_API_KEY),
      purpose: "Optional patrol planning and parser assistance.",
      purposeId: "Bantuan opsional untuk perencanaan patroli dan parser.",
      requiresEnv: "ANTHROPIC_API_KEY",
      note: "NaLI keeps deterministic fallback paths when absent.",
      noteId: "NaLI tetap menyediakan fallback deterministik saat tidak tersedia.",
    },
    {
      name: "PostGIS",
      status: "configured",
      purpose: "Location memory and radius queries.",
      purposeId: "Riwayat lokasi dan kueri radius.",
      note: "Migration scaffolds geography columns/RPC; live DB still needs validation.",
      noteId: "Migrasi menyiapkan kolom geography/RPC; DB live tetap perlu divalidasi.",
    },
    {
      name: "H3",
      status: "configured",
      purpose: "Grid-based anomaly flags.",
      purposeId: "Flag anomali berbasis grid.",
      note: "h3-js is installed; flags depend on NaLI archive depth.",
      noteId: "h3-js terpasang; flag bergantung pada kedalaman arsip NaLI.",
    },
  ];
}
