export type SensitiveAccessRole = "owner" | "reviewer" | "admin" | "public" | "exporter" | "legal";
export type SensitiveCoordinateMode = "exact" | "obfuscated" | "hidden";

export type SensitiveSpeciesDecision = {
  coordinateMode: SensitiveCoordinateMode;
  accessLogged: boolean;
  reason: string;
};

const SENSITIVE_STATUSES = new Set(["CR", "EN"]);
const ALWAYS_SENSITIVE = new Set([
  "Pongo tapanuliensis",
  "Panthera tigris sumatrae",
  "Dicerorhinus sumatrensis",
  "Leucopsar rothschildi",
  "Macrocephalon maleo",
]);

export function isSensitiveSpecies(scientificName?: string | null, conservationStatus?: string | null) {
  return Boolean(
    (scientificName && ALWAYS_SENSITIVE.has(scientificName)) ||
      (conservationStatus && SENSITIVE_STATUSES.has(conservationStatus.toUpperCase())),
  );
}

export function decideSensitiveCoordinateAccess(input: {
  role: SensitiveAccessRole;
  scientificName?: string | null;
  conservationStatus?: string | null;
  ownsRecord?: boolean;
}): SensitiveSpeciesDecision {
  const sensitive = isSensitiveSpecies(input.scientificName, input.conservationStatus);

  if (!sensitive) {
    return { coordinateMode: "exact", accessLogged: false, reason: "Species is not marked sensitive by NaLI policy." };
  }

  if (input.role === "admin" || input.role === "legal") {
    return {
      coordinateMode: "exact",
      accessLogged: true,
      reason: "Admin/legal exact access is allowed but must be logged.",
    };
  }

  if (input.role === "owner" && input.ownsRecord) {
    return {
      coordinateMode: "exact",
      accessLogged: false,
      reason: "Record owner can see exact coordinates for their own field record.",
    };
  }

  if (input.role === "reviewer") {
    return {
      coordinateMode: "exact",
      accessLogged: true,
      reason: "Reviewer exact access is allowed for validation and should be auditable.",
    };
  }

  if (input.role === "exporter") {
    return {
      coordinateMode: "obfuscated",
      accessLogged: false,
      reason: "Exports should obfuscate sensitive coordinates unless an explicit privileged export is approved.",
    };
  }

  return {
    coordinateMode: "hidden",
    accessLogged: false,
    reason: "Public views hide exact sensitive coordinates.",
  };
}

export function obfuscateCoordinate(value: number | null | undefined, precision = 1) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Number(value.toFixed(precision));
}
