"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DesignSettings } from "@/types";
import { downloadBackup } from "@/lib/backup";

const DISPLAY_SUGGESTIONS = [
  { label: "--- Google Fonts ---", value: "", disabled: true },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "EB Garamond", value: "EB Garamond" },
  { label: "Cormorant Garamond", value: "Cormorant Garamond" },
  { label: "Libre Baskerville", value: "Libre Baskerville" },
  { label: "DM Serif Display", value: "DM Serif Display" },
  { label: "Fraunces", value: "Fraunces" },
  { label: "Syne", value: "Syne" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "--- Système / Apple ---", value: "", disabled: true },
  { label: "SF Pro Display", value: "SF Pro Display" },
  { label: "New York", value: "New York" },
  { label: "Georgia", value: "Georgia" },
  { label: "Baskerville", value: "Baskerville" },
  { label: "Didot", value: "Didot" },
  { label: "Palatino", value: "Palatino" },
  { label: "--- Adobe Fonts (Typekit) ---", value: "", disabled: true },
  { label: "Acumin Pro", value: "Acumin Pro" },
  { label: "Freight Display Pro", value: "Freight Display Pro" },
  { label: "Neue Haas Grotesk", value: "Neue Haas Grotesk Display Pro" },
  { label: "Canela", value: "Canela" },
  { label: "Reckless Neue", value: "Reckless Neue" },
];

const BODY_SUGGESTIONS = [
  { label: "--- Google Fonts ---", value: "", disabled: true },
  { label: "Inter", value: "Inter" },
  { label: "DM Sans", value: "DM Sans" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
  { label: "Work Sans", value: "Work Sans" },
  { label: "Manrope", value: "Manrope" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "IBM Plex Sans", value: "IBM Plex Sans" },
  { label: "Outfit", value: "Outfit" },
  { label: "--- Système / Apple ---", value: "", disabled: true },
  { label: "SF Pro Text", value: "SF Pro Text" },
  { label: "Helvetica Neue", value: "Helvetica Neue" },
  { label: "Arial", value: "Arial" },
  { label: "Avenir", value: "Avenir" },
  { label: "Gill Sans", value: "Gill Sans" },
  { label: "--- Adobe Fonts (Typekit) ---", value: "", disabled: true },
  { label: "Acumin Pro", value: "Acumin Pro" },
  { label: "Neue Haas Grotesk Text", value: "Neue Haas Grotesk Text Pro" },
  { label: "Proxima Nova", value: "Proxima Nova" },
  { label: "Brandon Grotesque", value: "Brandon Grotesque" },
];

interface DesignFormProps {
  initial: DesignSettings;
}

export function DesignForm({ initial }: DesignFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<DesignSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customDisplay, setCustomDisplay] = useState(false);
  const [customBody, setCustomBody] = useState(false);

  function update(field: keyof DesignSettings, value: string | number | { value: string; label: string }[]) {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  const cats = settings.categories ?? [
    { value: "identite", label: "Identité" },
    { value: "edition", label: "Édition" },
    { value: "affiche", label: "Affiche" },
    { value: "web", label: "Web" },
    { value: "autre", label: "Autre" },
  ];

  function updateCategory(index: number, field: "value" | "label", val: string) {
    const updated = cats.map((c, i) =>
      i === index ? { ...c, [field]: field === "value" ? val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : val } : c
    );
    update("categories", updated);
  }

  function addCategory() {
    update("categories", [...cats, { value: "", label: "" }]);
  }

  function removeCategory(index: number) {
    update("categories", cats.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/design", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (res.ok) {
      setSaved(true);
      router.refresh();
      downloadBackup();
    }
    setSaving(false);
  }

  const isInList = (value: string, list: typeof DISPLAY_SUGGESTIONS) =>
    list.some((item) => item.value === value && !item.disabled);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Typography */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 mb-4">
          Typographie
        </h2>
        <p className="text-xs text-gray-400 mb-4 italic">
          {"Choisissez dans la liste ou tapez le nom exact d'une police (Google Fonts, Apple, Adobe Fonts, ou locale)."}
        </p>
        <div className="grid grid-cols-2 gap-6">
          {/* Display font */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
              Police titres (display)
            </label>
            {!customDisplay ? (
              <div className="space-y-2">
                <select
                  value={isInList(settings.fontDisplay, DISPLAY_SUGGESTIONS) ? settings.fontDisplay : ""}
                  onChange={(e) => {
                    if (e.target.value) update("fontDisplay", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm bg-white"
                >
                  <option value="" disabled>Choisir...</option>
                  {DISPLAY_SUGGESTIONS.map((f, i) => (
                    <option key={`${f.value}-${i}`} value={f.value} disabled={f.disabled}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setCustomDisplay(true)}
                  className="text-xs text-gray-400 hover:text-noir underline"
                >
                  Autre police (saisie libre)
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={settings.fontDisplay}
                  onChange={(e) => update("fontDisplay", e.target.value)}
                  placeholder="Ex: Canela, SF Pro Display..."
                  className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setCustomDisplay(false)}
                  className="text-xs text-gray-400 hover:text-noir underline"
                >
                  Revenir à la liste
                </button>
              </div>
            )}
            <p
              className="mt-3 text-2xl"
              style={{ fontFamily: `"${settings.fontDisplay}", serif` }}
            >
              Margot Tournier
            </p>
          </div>

          {/* Body font */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
              Police corps (body)
            </label>
            {!customBody ? (
              <div className="space-y-2">
                <select
                  value={isInList(settings.fontBody, BODY_SUGGESTIONS) ? settings.fontBody : ""}
                  onChange={(e) => {
                    if (e.target.value) update("fontBody", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm bg-white"
                >
                  <option value="" disabled>Choisir...</option>
                  {BODY_SUGGESTIONS.map((f, i) => (
                    <option key={`${f.value}-${i}`} value={f.value} disabled={f.disabled}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setCustomBody(true)}
                  className="text-xs text-gray-400 hover:text-noir underline"
                >
                  Autre police (saisie libre)
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={settings.fontBody}
                  onChange={(e) => update("fontBody", e.target.value)}
                  placeholder="Ex: Proxima Nova, Helvetica Neue..."
                  className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setCustomBody(false)}
                  className="text-xs text-gray-400 hover:text-noir underline"
                >
                  Revenir à la liste
                </button>
              </div>
            )}
            <p
              className="mt-3 text-sm"
              style={{ fontFamily: `"${settings.fontBody}", sans-serif` }}
            >
              Directrice artistique par la typographie et le design.
            </p>
          </div>
        </div>

        {/* Adobe Fonts embed field */}
        <div className="mt-6">
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Adobe Fonts (Typekit) — URL du projet
          </label>
          <input
            type="text"
            value={settings.adobeFontsUrl ?? ""}
            onChange={(e) => update("adobeFontsUrl" as keyof DesignSettings, e.target.value)}
            placeholder="https://use.typekit.net/xxxxxxx.css"
            className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            {"Si vous utilisez Adobe Fonts, collez l'URL CSS de votre projet Typekit ici."}
          </p>
        </div>
      </div>

      {/* Custom font files */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 mb-4">
          Polices personnelles (fichiers)
        </h2>
        <p className="text-xs text-gray-400 mb-4 italic">
          {"Uploadez un fichier .woff2, .woff, .ttf ou .otf. Le nom de la police ci-dessus doit correspondre."}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
              Fichier police titres
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={settings.customFontDisplayFile ?? ""}
                readOnly
                placeholder="Aucun fichier"
                className="flex-1 px-3 py-2 border border-gray-300 text-sm bg-gray-50 text-gray-500"
              />
              <label className="px-3 py-2 border border-gray-300 hover:border-noir transition-colors text-sm cursor-pointer whitespace-nowrap">
                Parcourir
                <input
                  type="file"
                  accept=".woff2,.woff,.ttf,.otf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    if (res.ok) {
                      const { path } = await res.json();
                      update("customFontDisplayFile" as keyof DesignSettings, path);
                    }
                  }}
                />
              </label>
              {settings.customFontDisplayFile && (
                <button
                  type="button"
                  onClick={() => update("customFontDisplayFile" as keyof DesignSettings, "")}
                  className="text-xs text-red-500 hover:text-red-700 px-2"
                >
                  x
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
              Fichier police corps
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={settings.customFontBodyFile ?? ""}
                readOnly
                placeholder="Aucun fichier"
                className="flex-1 px-3 py-2 border border-gray-300 text-sm bg-gray-50 text-gray-500"
              />
              <label className="px-3 py-2 border border-gray-300 hover:border-noir transition-colors text-sm cursor-pointer whitespace-nowrap">
                Parcourir
                <input
                  type="file"
                  accept=".woff2,.woff,.ttf,.otf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    if (res.ok) {
                      const { path } = await res.json();
                      update("customFontBodyFile" as keyof DesignSettings, path);
                    }
                  }}
                />
              </label>
              {settings.customFontBodyFile && (
                <button
                  type="button"
                  onClick={() => update("customFontBodyFile" as keyof DesignSettings, "")}
                  className="text-xs text-red-500 hover:text-red-700 px-2"
                >
                  x
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 mb-4">
          Grille accueil
        </h2>
        <div className="max-w-xs">
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Colonnes (desktop)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={3}
              max={6}
              step={1}
              value={settings.gridColumns ?? 5}
              onChange={(e) => update("gridColumns", parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-medium w-6 text-center">
              {settings.gridColumns ?? 5}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {"Nombre de colonnes sur grand écran (mobile/tablette s'adapte automatiquement)."}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 mb-4">
          Catégories de projets
        </h2>
        <p className="text-xs text-gray-400 mb-4 italic">
          {"Ajoutez, modifiez ou supprimez les catégories. Le label s'affiche sur le site, la clé est générée automatiquement."}
        </p>
        <div className="space-y-2">
          {cats.map((cat, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={cat.label}
                onChange={(e) => updateCategory(index, "label", e.target.value)}
                onBlur={() => {
                  if (!cat.value && cat.label) {
                    updateCategory(index, "value", cat.label);
                  }
                }}
                placeholder="Label (ex: Identité)"
                className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
              <span className="text-xs text-gray-400 w-28 truncate" title={cat.value}>
                {cat.value || "—"}
              </span>
              <button
                type="button"
                onClick={() => removeCategory(index)}
                className="text-xs text-red-500 hover:text-red-700 px-2"
              >
                x
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCategory}
          className="mt-3 text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors"
        >
          + Ajouter une catégorie
        </button>
      </div>

      {/* Colors */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 mb-4">
          Couleurs
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
              Fond (offwhite)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.colorOffwhite}
                onChange={(e) => update("colorOffwhite", e.target.value)}
                className="w-10 h-10 border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.colorOffwhite}
                onChange={(e) => update("colorOffwhite", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
              Texte (noir)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.colorNoir}
                onChange={(e) => update("colorNoir", e.target.value)}
                className="w-10 h-10 border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.colorNoir}
                onChange={(e) => update("colorNoir", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
              Gris
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.colorGris}
                onChange={(e) => update("colorGris", e.target.value)}
                className="w-10 h-10 border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.colorGris}
                onChange={(e) => update("colorGris", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
              Gris clair
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.colorGrisClair}
                onChange={(e) => update("colorGrisClair", e.target.value)}
                className="w-10 h-10 border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.colorGrisClair}
                onChange={(e) => update("colorGrisClair", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div
          className="mt-6 p-8 border border-gray-200"
          style={{ backgroundColor: settings.colorOffwhite }}
        >
          <p
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: settings.colorGris }}
          >
            Aperçu
          </p>
          <p
            className="text-3xl mb-3"
            style={{
              color: settings.colorNoir,
              fontFamily: `"${settings.fontDisplay}", serif`,
            }}
          >
            Margot Tournier
          </p>
          <p
            className="text-sm mb-4"
            style={{
              color: settings.colorGris,
              fontFamily: `"${settings.fontBody}", sans-serif`,
            }}
          >
            {"Directrice artistique — Design, typographie, identité visuelle"}
          </p>
          <div
            className="h-px"
            style={{ backgroundColor: settings.colorGrisClair }}
          />
          <div className="mt-4 flex gap-6">
            <span className="text-xs" style={{ color: settings.colorGris }}>
              LinkedIn
            </span>
            <span className="text-xs" style={{ color: settings.colorGris }}>
              Behance
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      {saved && (
        <p className="text-green-600 text-sm">
          {"Design sauvegardé ! Rechargez le site pour voir les changements."}
        </p>
      )}
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
