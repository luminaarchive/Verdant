export type SpeciesVisual = {
  speciesRef: string;
  scientificName: string;
  commonNameEn: string;
  commonNameId: string;
  imagePath: string;
  altTextEn: string;
  altTextId: string;
  attribution?: string;
  verified: boolean;
  fallbackType: "photo" | "evidence-card";
};

export const FORBIDDEN_SPECIES_VISUAL_TERMS = [
  "panda",
  "zebra",
  "cheetah",
  "lion",
  "placeholder",
  "generic monkey",
  "generic bird",
];

export const speciesVisuals: SpeciesVisual[] = [
  {
    speciesRef: "panthera-tigris-sumatrae",
    scientificName: "Panthera tigris sumatrae",
    commonNameEn: "Sumatran Tiger",
    commonNameId: "Harimau Sumatera",
    imagePath: "/species/sumatran-tiger.jpg",
    altTextEn: "Sumatran Tiger visual reference for NaLI demo card",
    altTextId: "Referensi visual Harimau Sumatera untuk kartu demo NaLI",
    attribution: "Wikimedia Commons, public domain, File:Panthera tigris sumatrae (Sumatran Tiger).jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "pongo-tapanuliensis",
    scientificName: "Pongo tapanuliensis",
    commonNameEn: "Tapanuli Orangutan",
    commonNameId: "Orangutan Tapanuli",
    imagePath: "/species/tapanuli-orangutan.jpg",
    altTextEn: "Tapanuli Orangutan visual reference for NaLI demo card",
    altTextId: "Referensi visual Orangutan Tapanuli untuk kartu demo NaLI",
    attribution: "Wikimedia Commons, File:Orangutan Tapanuli 01.jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "dicerorhinus-sumatrensis",
    scientificName: "Dicerorhinus sumatrensis",
    commonNameEn: "Sumatran Rhinoceros",
    commonNameId: "Badak Sumatera",
    imagePath: "/species/sumatran-rhino.jpg",
    altTextEn: "Sumatran Rhinoceros visual reference for NaLI demo card",
    altTextId: "Referensi visual Badak Sumatera untuk kartu demo NaLI",
    attribution: "Ltshears, Wikimedia Commons, CC BY-SA 3.0/GFDL, File:SumatranRhino1 CincinnatiZoo.jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "nisaetus-bartelsi",
    scientificName: "Nisaetus bartelsi",
    commonNameEn: "Javan Hawk-Eagle",
    commonNameId: "Elang Jawa",
    imagePath: "/species/javan-hawk-eagle.jpg",
    altTextEn: "Javan Hawk-Eagle visual reference for NaLI demo card",
    altTextId: "Referensi visual Elang Jawa untuk kartu demo NaLI",
    attribution:
      "Arif Firmansyah / Indonesian Government source, Wikimedia Commons, File:Javan hawk-eagle (Nisaetus bartelsi).jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "spizaetus-bartelsi",
    scientificName: "Spizaetus bartelsi",
    commonNameEn: "Javan Hawk-Eagle",
    commonNameId: "Elang Jawa",
    imagePath: "/species/javan-hawk-eagle.jpg",
    altTextEn: "Javan Hawk-Eagle visual reference for NaLI demo card",
    altTextId: "Referensi visual Elang Jawa untuk kartu demo NaLI",
    attribution:
      "Arif Firmansyah / Indonesian Government source, Wikimedia Commons, File:Javan hawk-eagle (Nisaetus bartelsi).jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "varanus-komodoensis",
    scientificName: "Varanus komodoensis",
    commonNameEn: "Komodo Dragon",
    commonNameId: "Komodo",
    imagePath: "/species/komodo-dragon.jpg",
    altTextEn: "Komodo Dragon visual reference for NaLI demo card",
    altTextId: "Referensi visual Komodo untuk kartu demo NaLI",
    attribution: "TimVickers, Wikimedia Commons, public domain, File:Varanus komodoensis (1).jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "leucopsar-rothschildi",
    scientificName: "Leucopsar rothschildi",
    commonNameEn: "Bali Starling",
    commonNameId: "Jalak Bali",
    imagePath: "/species/bali-starling.jpg",
    altTextEn: "Bali Starling visual reference for NaLI demo card",
    altTextId: "Referensi visual Jalak Bali untuk kartu demo NaLI",
    attribution: "Ltshears, Wikimedia Commons, public domain, File:Bali Starling.jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "nasalis-larvatus",
    scientificName: "Nasalis larvatus",
    commonNameEn: "Proboscis Monkey",
    commonNameId: "Bekantan",
    imagePath: "/species/proboscis-monkey.jpg",
    altTextEn: "Proboscis Monkey visual reference for NaLI demo card",
    altTextId: "Referensi visual Bekantan untuk kartu demo NaLI",
    attribution: "22Kartika, Wikimedia Commons, File:Proboscis Monkey (Nasalis larvatus).JPG",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "elephas-maximus-sumatranus",
    scientificName: "Elephas maximus sumatranus",
    commonNameEn: "Sumatran Elephant",
    commonNameId: "Gajah Sumatera",
    imagePath: "/species/sumatran-elephant.jpg",
    altTextEn: "Sumatran Elephant visual reference for NaLI demo card",
    altTextId: "Referensi visual Gajah Sumatera untuk kartu demo NaLI",
    attribution: "Ridwansgh, Wikimedia Commons, CC BY-SA 4.0, File:Gajah sumatera.jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "macrocephalon-maleo",
    scientificName: "Macrocephalon maleo",
    commonNameEn: "Maleo",
    commonNameId: "Maleo",
    imagePath: "/species/maleo.jpg",
    altTextEn: "Maleo visual reference for NaLI demo card",
    altTextId: "Referensi visual Maleo untuk kartu demo NaLI",
    attribution: "Jean-Paul Boerekamps / iNaturalist, Wikimedia Commons, File:Macrocephalon maleo 241794133.jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "paradisaea-apoda",
    scientificName: "Paradisaea apoda",
    commonNameEn: "Greater Bird-of-Paradise",
    commonNameId: "Cendrawasih",
    imagePath: "/species/greater-bird-of-paradise.jpg",
    altTextEn: "Greater Bird-of-Paradise visual reference for NaLI demo card",
    altTextId: "Referensi visual Cendrawasih untuk kartu demo NaLI",
    attribution:
      "Mahbob Yusof, Wikimedia Commons, CC BY 2.0, File:Greater Bird of Paradise (Paradisaea apoda) - Male.jpg",
    verified: true,
    fallbackType: "photo",
  },
  {
    speciesRef: "pongo-pygmaeus",
    scientificName: "Pongo pygmaeus",
    commonNameEn: "Bornean Orangutan",
    commonNameId: "Orangutan Kalimantan",
    imagePath: "/species/tapanuli-orangutan.jpg",
    altTextEn: "Orangutan visual reference for Bornean Orangutan NaLI card",
    altTextId: "Referensi visual orangutan untuk kartu Orangutan Kalimantan NaLI",
    attribution: "Wikimedia Commons orangutan reference; use exact local field media when available.",
    verified: true,
    fallbackType: "photo",
  },
];

export function getSpeciesVisual(scientificName: string): SpeciesVisual | undefined {
  return speciesVisuals.find((visual) => visual.scientificName.toLowerCase() === scientificName.toLowerCase());
}
