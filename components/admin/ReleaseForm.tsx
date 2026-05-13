"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { CropPicker } from "./CropPicker";
import type { Release, ReleaseType, GalleryItem, CropRect, Track } from "@/types";
import { downloadBackup } from "@/lib/backup";

const defaultGalleryItem: GalleryItem = {
  src: "",
  alt: { fr: "", en: "" },
  layout: "full",
};

const defaultTrack: Track = {
  title: "",
  duration: "",
  features: [],
};

const defaultRelease: Release = {
  slug: "",
  title: { fr: "", en: "" },
  genre: "electronic",
  releaseType: "single",
  year: String(new Date().getFullYear()),
  features: [],
  description: { fr: "", en: "" },
  cover: "",
  color: "#1A1A1A",
  tracklist: [],
  audioPreview: "",
  streamingLinks: {},
  gallery: [],
  scatter: { x: 10, y: 10, width: 280, rotation: 0, zIndex: 1 },
  status: "released",
};

const RELEASE_TYPES: { value: ReleaseType; label: string }[] = [
  { value: "single",  label: "Single" },
  { value: "ep",      label: "EP" },
  { value: "album",   label: "Album" },
  { value: "mixtape", label: "Mixtape" },
];

const DEFAULT_CATEGORIES = [
  { value: "electronic", label: "Electronic" },
  { value: "hip-hop",    label: "Hip-Hop" },
  { value: "ambient",    label: "Ambient" },
  { value: "r&b",        label: "R&B" },
];

interface ReleaseFormProps {
  initial?: Release;
  isNew?: boolean;
  categories?: { value: string; label: string }[];
}

export function ReleaseForm({ initial, isNew = false, categories }: ReleaseFormProps) {
  const cats = categories ?? DEFAULT_CATEGORIES;
  const router = useRouter();
  const [release, setRelease] = useState<Release>(initial ?? defaultRelease);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Blob URLs for immediate preview after upload (avoids waiting for server/redeploy)
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  function update(field: string, value: unknown) {
    setRelease((prev) => ({ ...prev, [field]: value }));
  }

  function updateLocalized(field: "title" | "description", locale: "fr" | "en", value: string) {
    setRelease((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: value } }));
  }

  function updateStreaming(platform: string, value: string) {
    setRelease((prev) => ({
      ...prev,
      streamingLinks: { ...prev.streamingLinks, [platform]: value || undefined },
    }));
  }

  /* ── Tracklist ── */
  function addTrack() {
    setRelease((prev) => ({ ...prev, tracklist: [...prev.tracklist, { ...defaultTrack }] }));
  }

  function updateTrack(index: number, field: keyof Track, value: unknown) {
    setRelease((prev) => ({
      ...prev,
      tracklist: prev.tracklist.map((t, i) => i === index ? { ...t, [field]: value } : t),
    }));
  }

  function removeTrack(index: number) {
    setRelease((prev) => ({ ...prev, tracklist: prev.tracklist.filter((_, i) => i !== index) }));
  }

  /* ── Gallery ── */
  function addGalleryItem() {
    setRelease((prev) => ({ ...prev, gallery: [...prev.gallery, { ...defaultGalleryItem }] }));
  }

  function updateGalleryItem(index: number, field: string, value: unknown) {
    setRelease((prev) => ({
      ...prev,
      gallery: prev.gallery.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  }

  function removeGalleryItem(index: number) {
    setRelease((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  }

  function moveGalleryItem(index: number, direction: "up" | "down") {
    setRelease((prev) => {
      const gallery = [...prev.gallery];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= gallery.length) return prev;
      [gallery[index], gallery[targetIndex]] = [gallery[targetIndex], gallery[index]];
      return { ...prev, gallery };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isNew ? "/api/releases" : `/api/releases/${initial?.slug ?? release.slug}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(release),
    });

    if (res.ok) {
      downloadBackup();
      router.push("/admin/releases");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur lors de la sauvegarde");
    }
    setSaving(false);
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const inputCls = "w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm";
  const labelCls = "block text-xs uppercase tracking-wider text-gray-500 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Slug */}
      <div>
        <label className={labelCls}>Slug</label>
        <div className="flex gap-2">
          <input type="text" value={release.slug} onChange={(e) => update("slug", e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm" required />
          {isNew && (
            <button type="button" onClick={() => update("slug", generateSlug(release.title.fr))} className="px-3 py-2 text-xs border border-gray-300 hover:border-noir transition-colors">Auto</button>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Titre (FR)</label>
          <input type="text" value={release.title.fr} onChange={(e) => updateLocalized("title", "fr", e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Titre (EN)</label>
          <input type="text" value={release.title.en} onChange={(e) => updateLocalized("title", "en", e.target.value)} className={inputCls} required />
        </div>
      </div>

      {/* Genre, Type, Year */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Genre</label>
          <select value={release.genre} onChange={(e) => update("genre", e.target.value)} className={inputCls}>
            {cats.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select value={release.releaseType} onChange={(e) => update("releaseType", e.target.value)} className={inputCls}>
            {RELEASE_TYPES.map((rt) => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Année</label>
          <input type="text" value={release.year} onChange={(e) => update("year", e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Statut</label>
          <select value={release.status ?? "released"} onChange={(e) => update("status", e.target.value)} className={inputCls}>
            <option value="released">Sorti</option>
            <option value="upcoming">À venir</option>
          </select>
        </div>
        {release.status === "upcoming" && (
          <div>
            <label className={labelCls}>Date de sortie</label>
            <input
              type="date"
              value={release.releaseDate ?? ""}
              onChange={(e) => update("releaseDate", e.target.value || undefined)}
              className={inputCls}
            />
          </div>
        )}
      </div>

      {/* Featuring */}
      <div>
        <label className={labelCls}>Featuring (une valeur par ligne)</label>
        <textarea
          value={release.features.join("\n")}
          onChange={(e) => update("features", e.target.value.split("\n").filter(Boolean))}
          onBlur={(e) => update("features", e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))}
          rows={3}
          className={inputCls + " resize-y"}
        />
      </div>

      {/* Description */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Description (FR)</label>
          <textarea value={release.description.fr} onChange={(e) => updateLocalized("description", "fr", e.target.value)} rows={4} className={inputCls + " resize-y"} />
        </div>
        <div>
          <label className={labelCls}>Description (EN)</label>
          <textarea value={release.description.en} onChange={(e) => updateLocalized("description", "en", e.target.value)} rows={4} className={inputCls + " resize-y"} />
        </div>
      </div>

      {/* Cover */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Cover art</label>
          <input type="text" value={release.cover} onChange={(e) => update("cover", e.target.value)} className={inputCls + " mb-2"} placeholder="/images/releases/slug/cover.jpg" />
          <ImageUploader slug={release.slug} onUploaded={(path, _, blob) => {
            update("cover", path);
            if (blob) setBlobUrls((prev) => ({ ...prev, cover: blob }));
          }} accept="image/*" />
          {release.cover && (
            <div className="mt-2">
              <label className={labelCls}>Cadrage cover</label>
              <CropPicker src={blobUrls.cover || release.cover} value={release.coverCrop} onChange={(crop: CropRect) => update("coverCrop", crop)} ratio="square" />
            </div>
          )}
        </div>
        <div>
          <label className={labelCls}>Couleur d&apos;accent</label>
          <div className="flex items-center gap-2">
            <input type="color" value={release.color} onChange={(e) => update("color", e.target.value)} className="w-10 h-10 border border-gray-300 cursor-pointer" />
            <input type="text" value={release.color} onChange={(e) => update("color", e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm" />
          </div>
        </div>
      </div>

      {/* Audio Preview */}
      <div>
        <label className={labelCls}>Audio Preview (URL ou upload)</label>
        <input type="text" value={release.audioPreview} onChange={(e) => update("audioPreview", e.target.value)} className={inputCls + " mb-2"} placeholder="https://... ou /audio/..." />
        <ImageUploader slug={release.slug} onUploaded={(path) => update("audioPreview", path)} accept="audio/mpeg,audio/ogg,audio/wav,audio/*" />
      </div>

      {/* Streaming links */}
      <div className="space-y-3">
        <label className={labelCls}>Liens streaming</label>
        {[
          { key: "spotify",    placeholder: "https://open.spotify.com/album/..." },
          { key: "appleMusic", placeholder: "https://music.apple.com/album/..." },
          { key: "soundcloud", placeholder: "https://soundcloud.com/..." },
          { key: "youtube",    placeholder: "https://youtube.com/..." },
          { key: "bandcamp",   placeholder: "https://....bandcamp.com" },
        ].map(({ key, placeholder }) => (
          <div key={key} className="grid grid-cols-[100px_1fr] gap-3 items-center">
            <span className="text-xs text-gray-500 capitalize">{key === "appleMusic" ? "Apple Music" : key}</span>
            <input
              type="text"
              value={(release.streamingLinks as Record<string, string>)[key] ?? ""}
              onChange={(e) => updateStreaming(key, e.target.value)}
              placeholder={placeholder}
              className={inputCls}
            />
          </div>
        ))}
      </div>

      {/* Tracklist */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className={labelCls}>Tracklist</label>
          <button type="button" onClick={addTrack} className="text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors">+ Ajouter un titre</button>
        </div>
        <div className="space-y-3">
          {release.tracklist.map((track, index) => (
            <div key={index} className="grid grid-cols-[1fr_80px_1fr_32px] gap-2 items-start">
              <input type="text" value={track.title} onChange={(e) => updateTrack(index, "title", e.target.value)} placeholder={`Titre ${index + 1}`} className={inputCls} />
              <input type="text" value={track.duration} onChange={(e) => updateTrack(index, "duration", e.target.value)} placeholder="3:42" className={inputCls} />
              <input
                type="text"
                value={track.features.join(", ")}
                onChange={(e) => updateTrack(index, "features", e.target.value.split(",").map((v) => v.replace(/^ /, "")).filter(Boolean))}
                onBlur={(e) => updateTrack(index, "features", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))}
                placeholder="feat. artiste"
                className={inputCls}
              />
              <button type="button" onClick={() => removeTrack(index)} className="text-red-500 hover:text-red-700 text-xs px-1">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className={labelCls}>Galerie photos</label>
          <button type="button" onClick={addGalleryItem} className="text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors">+ Ajouter un média</button>
        </div>
        <div className="space-y-4">
          {release.gallery.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{item.type === "video" ? "Vidéo" : "Image"} {index + 1}</span>
                  <button type="button" onClick={() => moveGalleryItem(index, "up")} disabled={index === 0} className="text-xs px-1.5 py-0.5 border border-gray-300 hover:border-noir disabled:opacity-30 disabled:pointer-events-none">↑</button>
                  <button type="button" onClick={() => moveGalleryItem(index, "down")} disabled={index === release.gallery.length - 1} className="text-xs px-1.5 py-0.5 border border-gray-300 hover:border-noir disabled:opacity-30 disabled:pointer-events-none">↓</button>
                </div>
                <button type="button" onClick={() => removeGalleryItem(index)} className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
              </div>
              <div className="grid grid-cols-[1fr_120px] gap-3">
                <input type="text" value={item.src} onChange={(e) => updateGalleryItem(index, "src", e.target.value)} placeholder="Chemin de l'image" className={inputCls} />
                <select value={item.layout} onChange={(e) => updateGalleryItem(index, "layout", e.target.value)} className={inputCls}>
                  <option value="full">Plein</option>
                  <option value="half">Demi</option>
                  <option value="third">Tiers</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={item.alt.fr} onChange={(e) => updateGalleryItem(index, "alt", { ...item.alt, fr: e.target.value })} placeholder="Alt text (FR)" className={inputCls} />
                <input type="text" value={item.alt.en} onChange={(e) => updateGalleryItem(index, "alt", { ...item.alt, en: e.target.value })} placeholder="Alt text (EN)" className={inputCls} />
              </div>
              <ImageUploader slug={release.slug} onUploaded={(path, type, blob) => {
                updateGalleryItem(index, "src", path);
                if (type) updateGalleryItem(index, "type", type);
                if (blob) setBlobUrls((prev) => ({ ...prev, [`gallery_${index}`]: blob }));
              }} />
              <div className="pt-1 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={item.showOnMosaic ?? false} onChange={(e) => updateGalleryItem(index, "showOnMosaic", e.target.checked)} className="accent-noir" />
                    <span className="text-xs text-gray-500">Afficher en mosaïque accueil</span>
                  </label>
                  {item.showOnMosaic && (
                    <select value={item.mosaicRatio ?? "square"} onChange={(e) => updateGalleryItem(index, "mosaicRatio", e.target.value)} className="px-2 py-1 border border-gray-300 focus:border-noir focus:outline-none text-xs">
                      <option value="square">Carré (1/1)</option>
                      <option value="landscape">Paysage (4/3)</option>
                      <option value="portrait">Portrait (3/4)</option>
                    </select>
                  )}
                </div>
                {item.showOnMosaic && item.src && item.type !== "video" && (
                  <CropPicker src={blobUrls[`gallery_${index}`] || item.src} value={item.mosaicCrop} onChange={(crop: CropRect) => updateGalleryItem(index, "mosaicCrop", crop)} ratio={item.mosaicRatio ?? "square"} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-4">
        <button type="submit" disabled={saving} className="px-6 py-3 bg-noir text-white hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm">
          {saving ? "Sauvegarde..." : isNew ? "Créer la sortie" : "Sauvegarder"}
        </button>
        <button type="button" onClick={() => router.push("/admin/releases")} className="px-6 py-3 border border-gray-300 hover:border-noir transition-colors text-sm">
          Annuler
        </button>
      </div>
    </form>
  );
}
