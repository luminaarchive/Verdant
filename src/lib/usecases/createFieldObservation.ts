import { createServerSupabaseClient } from "@/lib/supabase/server";
import { storageService } from "@/lib/services/storage.service";
import { toAppError } from "@/lib/errors";
import type { ConservationStatus, PopulationTrend } from "@/types/species";
import type { Result } from "@/types/common";

type CreateFieldObservationInput = {
  userId: string;
  photoFile?: File;
  textDescription?: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
};

type GoldenSpecies = {
  gbifTaxonKey: number;
  iucnId: string;
  scientificName: string;
  localName: string;
  commonNameEn: string;
  family: string;
  order: string;
  className: string;
  conservationStatus: ConservationStatus;
  populationTrend: PopulationTrend;
  confidence: number;
  anomalyFlag: boolean;
  anomalyReason: string;
};

const goldenSpecies: GoldenSpecies[] = [
  {
    gbifTaxonKey: 5219426,
    iucnId: "15966",
    scientificName: "Panthera tigris sumatrae",
    localName: "Harimau Sumatera",
    commonNameEn: "Sumatran Tiger",
    family: "Felidae",
    order: "Carnivora",
    className: "Mammalia",
    conservationStatus: "CR",
    populationTrend: "decreasing",
    confidence: 0.91,
    anomalyFlag: true,
    anomalyReason: "Human settlement proximity requires review.",
  },
  {
    gbifTaxonKey: 9365556,
    iucnId: "120588639",
    scientificName: "Pongo tapanuliensis",
    localName: "Orangutan Tapanuli",
    commonNameEn: "Tapanuli Orangutan",
    family: "Hominidae",
    order: "Primates",
    className: "Mammalia",
    conservationStatus: "CR",
    populationTrend: "decreasing",
    confidence: 0.88,
    anomalyFlag: true,
    anomalyReason: "Small-range species: location privacy elevated.",
  },
  {
    gbifTaxonKey: 2466815,
    iucnId: "22884",
    scientificName: "Varanus komodoensis",
    localName: "Komodo",
    commonNameEn: "Komodo Dragon",
    family: "Varanidae",
    order: "Squamata",
    className: "Reptilia",
    conservationStatus: "EN",
    populationTrend: "stable",
    confidence: 0.93,
    anomalyFlag: false,
    anomalyReason: "No distribution anomaly detected.",
  },
  {
    gbifTaxonKey: 2480518,
    iucnId: "22696165",
    scientificName: "Spizaetus bartelsi",
    localName: "Elang Jawa",
    commonNameEn: "Javan Hawk-eagle",
    family: "Accipitridae",
    order: "Accipitriformes",
    className: "Aves",
    conservationStatus: "EN",
    populationTrend: "decreasing",
    confidence: 0.86,
    anomalyFlag: true,
    anomalyReason: "Canopy call record recommended for confirmation.",
  },
  {
    gbifTaxonKey: 2495717,
    iucnId: "22710912",
    scientificName: "Leucopsar rothschildi",
    localName: "Jalak Bali",
    commonNameEn: "Bali Myna",
    family: "Sturnidae",
    order: "Passeriformes",
    className: "Aves",
    conservationStatus: "CR",
    populationTrend: "increasing",
    confidence: 0.89,
    anomalyFlag: true,
    anomalyReason: "Captive-release zone should be checked.",
  },
];

function selectSpecies(textDescription?: string) {
  const text = (textDescription || "").toLowerCase();
  if (text.includes("komodo") || text.includes("biawak")) return goldenSpecies[2];
  if (text.includes("orangutan") || text.includes("pongo")) return goldenSpecies[1];
  if (text.includes("elang") || text.includes("burung") || text.includes("kanopi")) return goldenSpecies[3];
  if (text.includes("jalak") || text.includes("bali")) return goldenSpecies[4];
  return goldenSpecies[0];
}

function datePlus(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60000).toISOString();
}

export async function createFieldObservation(
  input: CreateFieldObservationInput,
): Promise<Result<{ observationId: string }>> {
  const supabase = await createServerSupabaseClient();
  const observationId = crypto.randomUUID();
  const species = selectSpecies(input.textDescription);
  const createdAt = new Date();
  let photoStorageUrl: string | null = null;
  let photoChecksum: string | null = null;
  let mediaUploaded = false;

  try {
    if (input.photoFile) {
      photoChecksum = await storageService.generateChecksum(input.photoFile);
      const upload = await storageService.uploadObservationMedia(
        input.userId,
        observationId,
        input.photoFile,
        photoChecksum,
      );
      photoStorageUrl = upload.path;
      mediaUploaded = true;
    }

    const { data: speciesRef, error: speciesError } = await supabase
      .from("species_reference")
      .upsert(
        {
          gbif_taxon_key: species.gbifTaxonKey,
          iucn_id: species.iucnId,
          scientific_name: species.scientificName,
          common_name_id: species.localName,
          common_name_en: species.commonNameEn,
          family: species.family,
          order: species.order,
          class: species.className,
          is_endemic_indonesia: true,
        },
        { onConflict: "gbif_taxon_key" },
      )
      .select("id")
      .single();

    if (speciesError) throw speciesError;

    await supabase.from("species_cache").insert({
      species_ref_id: speciesRef.id,
      source: "iucn",
      source_version: "field-log-foundation",
      conservation_status: species.conservationStatus,
      threats: [],
      population_trend: species.populationTrend,
      cached_at: createdAt.toISOString(),
      ttl_expires_at: datePlus(createdAt, 60 * 24 * 30),
    });

    const reviewStatus = "unreviewed";
    const status = "pending";

    const { error: observationError } = await supabase.from("observations").insert({
      id: observationId,
      user_id: input.userId,
      timestamp: createdAt.toISOString(),
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy_meters: input.accuracyMeters,
      photo_storage_url: photoStorageUrl,
      photo_checksum: photoChecksum,
      text_description: input.textDescription || null,
      final_species_ref_id: speciesRef.id,
      scientific_name: null,
      local_name: null,
      confidence_level: null,
      conservation_status: null,
      is_anomaly: false,
      anomaly_flag: false,
      processing_stage: "uploaded",
      observation_status: "pending",
      status,
      review_status: reviewStatus,
      verified_by_human: false,
      qa_flag: false,
      sync_state: "synced",
      created_at: createdAt.toISOString(),
    });

    if (observationError) throw observationError;

    if (mediaUploaded && photoStorageUrl && photoChecksum) {
      await storageService.registerMediaRecord(observationId, "photo", photoStorageUrl, photoChecksum);
    }

    await supabase.from("observation_events").insert([
      {
        observation_id: observationId,
        event_type: "OBSERVATION_CREATED",
        severity: "info",
        payload: {
          has_media: Boolean(input.photoFile),
          has_text: Boolean(input.textDescription?.trim()),
          accuracy_meters: input.accuracyMeters,
        },
      },
      ...(mediaUploaded
        ? [
            {
              observation_id: observationId,
              event_type: "MEDIA_UPLOADED",
              severity: "info",
              payload: {
                media_type: "photo",
                storage_path: photoStorageUrl,
                checksum: photoChecksum,
              },
            },
          ]
        : []),
    ]);

    return { success: true, data: { observationId } };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}
