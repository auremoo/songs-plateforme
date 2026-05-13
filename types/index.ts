export interface LocalizedText {
  fr: string;
  en: string;
}

export type Genre = string;

export interface CropRect {
  x: number;      // % from left (0-100)
  y: number;      // % from top (0-100)
  width: number;  // % of image width (0-100)
  height: number; // % of image height (0-100)
}

export interface GalleryItem {
  src: string;
  alt: LocalizedText;
  layout: "full" | "half" | "third";
  type?: "image" | "video";
  showOnMosaic?: boolean;
  mosaicRatio?: "landscape" | "portrait" | "square" | "wide" | "tall";
  mosaicCrop?: CropRect;
  objectPosition?: string;
}

export interface ScatterPosition {
  x: number;
  y: number;
  width: number;
  rotation: number;
  zIndex: number;
}

export type ReleaseType = "single" | "album" | "ep" | "mixtape";

export interface StreamingLinks {
  spotify?:    string;
  appleMusic?: string;
  soundcloud?: string;
  youtube?:    string;
  bandcamp?:   string;
}

export interface Track {
  title:    string;
  duration: string;
  features: string[];
}

export interface Release {
  slug:           string;
  title:          LocalizedText;
  genre:          Genre;
  releaseType:    ReleaseType;
  year:           string;
  features:       string[];
  description:    LocalizedText;
  cover:          string;
  color:          string;
  tracklist:      Track[];
  audioPreview:   string;
  streamingLinks: StreamingLinks;
  gallery:        GalleryItem[];
  scatter:        ScatterPosition;
  coverRatio?:    "square" | "landscape" | "portrait";
  coverCrop?:     CropRect;
  status?:        "released" | "upcoming";
  releaseDate?:   string; // ISO date string e.g. "2025-09-15"
}

export interface Label {
  name: string;
  logo: string;
  url: string;
}

export interface Credit {
  role: LocalizedText;
  name: string;
}

export interface Artist {
  id: string;
  name: string;
  title: LocalizedText;
  bio: LocalizedText;
  portrait: string;
  email: string;
  location: LocalizedText;
  socials: { label: string; url: string; visible?: boolean }[];
  label?: Label | null;
  credits: Credit[];
  musicalStyles: string[];
}

export interface PersonalInfo {
  artists: Artist[];
  sitePassword: string;
  sitePasswordEnabled: boolean;
}

export interface DesignSettings {
  fontDisplay: string;
  fontBody: string;
  colorOffwhite: string;
  colorNoir: string;
  colorGris: string;
  colorGrisClair: string;
  adobeFontsUrl?: string;
  customFontDisplayFile?: string;
  customFontBodyFile?: string;
  gridColumns?: number;
  categories?: { value: string; label: string }[];
  mosaicOrder?: string[];
  mosaicGrid?: string[][];
  mosaicAlignBottom?: boolean;
}
