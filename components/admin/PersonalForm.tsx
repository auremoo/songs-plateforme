"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import type { PersonalInfo, Artist, Label, Credit, LocalizedText } from "@/types";
import { downloadBackup } from "@/lib/backup";

interface PersonalFormProps {
  initial: PersonalInfo;
}

function newArtist(): Artist {
  return {
    id: `artist-${Date.now()}`,
    name: "",
    title: { fr: "", en: "" },
    bio: { fr: "", en: "" },
    portrait: "",
    email: "",
    location: { fr: "", en: "" },
    socials: [],
    label: null,
    credits: [],
    musicalStyles: [],
  };
}

export function PersonalForm({ initial }: PersonalFormProps) {
  const router = useRouter();
  const [info, setInfo] = useState<PersonalInfo>(initial);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const artist = info.artists[selectedIndex] ?? info.artists[0];

  function updateArtist(updates: Partial<Artist>) {
    setInfo((prev) => ({
      ...prev,
      artists: prev.artists.map((a, i) =>
        i === selectedIndex ? { ...a, ...updates } : a
      ),
    }));
    setSaved(false);
  }

  function updateLocalized(
    field: "title" | "bio" | "location",
    locale: "fr" | "en",
    value: string
  ) {
    updateArtist({
      [field]: { ...(artist[field] as LocalizedText), [locale]: value },
    });
  }

  // Socials
  function addSocial() {
    updateArtist({ socials: [...artist.socials, { label: "", url: "", visible: true }] });
  }

  function updateSocial(index: number, field: "label" | "url", value: string) {
    updateArtist({
      socials: artist.socials.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    });
  }

  function toggleSocialVisible(index: number) {
    updateArtist({
      socials: artist.socials.map((s, i) =>
        i === index ? { ...s, visible: !(s.visible ?? true) } : s
      ),
    });
  }

  function removeSocial(index: number) {
    updateArtist({ socials: artist.socials.filter((_, i) => i !== index) });
  }

  // Label
  function updateLabel(field: keyof Label, value: string) {
    updateArtist({
      label: { ...(artist.label ?? { name: "", logo: "", url: "" }), [field]: value },
    });
  }

  function clearLabel() {
    updateArtist({ label: null });
  }

  // Musical styles
  function addStyle() {
    updateArtist({ musicalStyles: [...artist.musicalStyles, ""] });
  }

  function updateStyle(index: number, value: string) {
    updateArtist({
      musicalStyles: artist.musicalStyles.map((s, i) => (i === index ? value : s)),
    });
  }

  function removeStyle(index: number) {
    updateArtist({ musicalStyles: artist.musicalStyles.filter((_, i) => i !== index) });
  }

  // Credits
  function addCredit() {
    updateArtist({
      credits: [...artist.credits, { role: { fr: "", en: "" }, name: "" }],
    });
  }

  function updateCredit(index: number, field: "name", value: string): void;
  function updateCredit(index: number, field: "role", locale: "fr" | "en", value: string): void;
  function updateCredit(
    index: number,
    field: "name" | "role",
    localeOrValue: string,
    value?: string
  ) {
    updateArtist({
      credits: artist.credits.map((c, i) => {
        if (i !== index) return c;
        if (field === "name") return { ...c, name: localeOrValue };
        return { ...c, role: { ...c.role, [localeOrValue]: value } };
      }),
    });
  }

  function removeCredit(index: number) {
    updateArtist({ credits: artist.credits.filter((_, i) => i !== index) });
  }

  // Artist management
  function addArtist() {
    const next = newArtist();
    setInfo((prev) => ({ ...prev, artists: [...prev.artists, next] }));
    setSelectedIndex(info.artists.length);
    setSaved(false);
  }

  function removeArtist(index: number) {
    if (info.artists.length <= 1) return;
    setInfo((prev) => ({
      ...prev,
      artists: prev.artists.filter((_, i) => i !== index),
    }));
    setSelectedIndex(Math.max(0, index - 1));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/personal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
      downloadBackup();
    }
    setSaving(false);
  }

  const input =
    "w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm";
  const label = "block text-xs uppercase tracking-wider text-gray-500 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Artist tabs */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {info.artists.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`px-3 py-1.5 text-sm border transition-colors ${
                i === selectedIndex
                  ? "border-noir bg-noir text-white"
                  : "border-gray-300 hover:border-noir"
              }`}
            >
              {a.name || `Artiste ${i + 1}`}
            </button>
          ))}
          <button
            type="button"
            onClick={addArtist}
            className="px-3 py-1.5 text-sm border border-dashed border-gray-300 hover:border-noir transition-colors"
          >
            + Artiste
          </button>
        </div>
        {info.artists.length > 1 && (
          <button
            type="button"
            onClick={() => removeArtist(selectedIndex)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Supprimer cet artiste
          </button>
        )}
      </div>

      {/* ID (slug) */}
      <div>
        <label className={label}>Identifiant (URL slug)</label>
        <input
          type="text"
          value={artist.id}
          onChange={(e) =>
            updateArtist({ id: e.target.value.toLowerCase().replace(/\s+/g, "-") })
          }
          placeholder="artist-name"
          className={input}
        />
        <p className="text-xs text-gray-400 mt-1 italic">
          {"Utilisé dans l'URL de la page à propos : /about?a="}
          <strong>{artist.id}</strong>
        </p>
      </div>

      {/* Name */}
      <div>
        <label className={label}>Nom</label>
        <input
          type="text"
          value={artist.name}
          onChange={(e) => updateArtist({ name: e.target.value })}
          className={input}
        />
      </div>

      {/* Title */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Titre (FR)</label>
          <input
            type="text"
            value={artist.title.fr}
            onChange={(e) => updateLocalized("title", "fr", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Titre (EN)</label>
          <input
            type="text"
            value={artist.title.en}
            onChange={(e) => updateLocalized("title", "en", e.target.value)}
            className={input}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <p className="text-xs text-gray-400 mb-2 italic">
          {"Le 1er paragraphe s'affiche en grand (manifeste). Séparez les paragraphes par une ligne vide."}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Bio (FR)</label>
            <textarea
              value={artist.bio.fr}
              onChange={(e) => updateLocalized("bio", "fr", e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm resize-y"
            />
          </div>
          <div>
            <label className={label}>Bio (EN)</label>
            <textarea
              value={artist.bio.en}
              onChange={(e) => updateLocalized("bio", "en", e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm resize-y"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Email</label>
          <input
            type="email"
            value={artist.email}
            onChange={(e) => updateArtist({ email: e.target.value })}
            className={input}
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Localisation (FR)</label>
          <input
            type="text"
            value={artist.location.fr}
            onChange={(e) => updateLocalized("location", "fr", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Localisation (EN)</label>
          <input
            type="text"
            value={artist.location.en}
            onChange={(e) => updateLocalized("location", "en", e.target.value)}
            className={input}
          />
        </div>
      </div>

      {/* Portrait */}
      <div>
        <label className={label}>Portrait</label>
        <input
          type="text"
          value={artist.portrait}
          onChange={(e) => updateArtist({ portrait: e.target.value })}
          className={`${input} mb-2`}
        />
        <ImageUploader onUploaded={(path) => updateArtist({ portrait: path })} />
      </div>

      {/* Socials */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={label}>Réseaux sociaux</label>
          <button
            type="button"
            onClick={addSocial}
            className="text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {artist.socials.map((social, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={social.visible ?? true}
                onChange={() => toggleSocialVisible(i)}
                className="w-4 h-4 accent-noir shrink-0"
                title="Visible sur le site"
              />
              <input
                type="text"
                value={social.label}
                onChange={(e) => updateSocial(i, "label", e.target.value)}
                placeholder="Nom (ex: Spotify)"
                className={`w-[140px] px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm ${(social.visible ?? true) ? "" : "opacity-40"}`}
              />
              <input
                type="url"
                value={social.url}
                onChange={(e) => updateSocial(i, "url", e.target.value)}
                placeholder="https://..."
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
                    updateSocial(i, "url", "https://" + val);
                  }
                }}
                className={`flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm ${(social.visible ?? true) ? "" : "opacity-40"}`}
              />
              <button
                type="button"
                onClick={() => removeSocial(i)}
                className="text-xs text-red-500 hover:text-red-700 px-2"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Label */}
      <div className="p-4 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className={label}>Label</label>
          {artist.label ? (
            <button
              type="button"
              onClick={clearLabel}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Supprimer le label
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                updateArtist({ label: { name: "", logo: "", url: "" } })
              }
              className="text-xs px-3 py-1 border border-dashed border-gray-300 hover:border-noir transition-colors"
            >
              + Ajouter un label
            </button>
          )}
        </div>
        {artist.label && (
          <div className="space-y-2">
            <input
              type="text"
              value={artist.label.name}
              onChange={(e) => updateLabel("name", e.target.value)}
              placeholder="Nom du label"
              className={input}
            />
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={artist.label.logo}
                onChange={(e) => updateLabel("logo", e.target.value)}
                placeholder="Chemin du logo (image)"
                className={`flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm`}
              />
              <ImageUploader onUploaded={(path) => updateLabel("logo", path)} />
            </div>
            <input
              type="url"
              value={artist.label.url}
              onChange={(e) => updateLabel("url", e.target.value)}
              placeholder="https://label.com"
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
                  updateLabel("url", "https://" + val);
                }
              }}
              className={input}
            />
          </div>
        )}
      </div>

      {/* Musical styles */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={label}>Styles musicaux</label>
          <button
            type="button"
            onClick={addStyle}
            className="text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors"
          >
            + Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {artist.musicalStyles.map((style, i) => (
            <div key={i} className="flex gap-1 items-center">
              <input
                type="text"
                value={style}
                onChange={(e) => updateStyle(i, e.target.value)}
                placeholder="Electronic"
                className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm w-36"
              />
              <button
                type="button"
                onClick={() => removeStyle(i)}
                className="text-xs text-red-500 hover:text-red-700 px-1"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={label}>Crédits</label>
          <button
            type="button"
            onClick={addCredit}
            className="text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {artist.credits.map((credit, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={credit.role.fr}
                onChange={(e) => updateCredit(i, "role", "fr", e.target.value)}
                placeholder="Rôle (FR)"
                className="w-36 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
              <input
                type="text"
                value={credit.role.en}
                onChange={(e) => updateCredit(i, "role", "en", e.target.value)}
                placeholder="Role (EN)"
                className="w-36 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
              <input
                type="text"
                value={credit.name}
                onChange={(e) => updateCredit(i, "name", e.target.value)}
                placeholder="Nom"
                className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => removeCredit(i)}
                className="text-xs text-red-500 hover:text-red-700 px-2"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Site password (global) */}
      <div className="p-4 border border-gray-200 space-y-3">
        <label className={label}>Protection par mot de passe (site public)</label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={info.sitePasswordEnabled}
            onChange={(e) =>
              setInfo((prev) => ({ ...prev, sitePasswordEnabled: e.target.checked }))
            }
            className="w-4 h-4 accent-noir"
          />
          <span className="text-sm">Activer la protection</span>
        </label>
        {info.sitePasswordEnabled && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Mot de passe du site (partagé avec les visiteurs)
            </label>
            <input
              type="text"
              value={info.sitePassword}
              onChange={(e) =>
                setInfo((prev) => ({ ...prev, sitePassword: e.target.value }))
              }
              placeholder="Mot de passe pour accéder au site"
              className="w-full max-w-sm px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1 italic">
              Ce mot de passe est différent du mot de passe admin.
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      {saved && <p className="text-green-600 text-sm">Sauvegardé avec succès !</p>}
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-3 bg-noir text-white hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
      >
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </form>
  );
}
