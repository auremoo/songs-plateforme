"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import type { PersonalInfo, LocalizedText, Experience, Education } from "@/types";
import { downloadBackup } from "@/lib/backup";

interface PersonalFormProps {
  initial: PersonalInfo;
}

export function PersonalForm({ initial }: PersonalFormProps) {
  const router = useRouter();
  const [info, setInfo] = useState<PersonalInfo>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: keyof PersonalInfo, value: unknown) {
    setInfo((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function updateLocalized(
    field: "title" | "bio" | "location",
    locale: "fr" | "en",
    value: string
  ) {
    setInfo((prev) => ({
      ...prev,
      [field]: { ...(prev[field] as LocalizedText), [locale]: value },
    }));
    setSaved(false);
  }

  function addSocial() {
    setInfo((prev) => ({
      ...prev,
      socials: [...prev.socials, { label: "", url: "", visible: true }],
    }));
  }

  function toggleSocialVisible(index: number) {
    setInfo((prev) => ({
      ...prev,
      socials: prev.socials.map((s, i) =>
        i === index ? { ...s, visible: !(s.visible ?? true) } : s
      ),
    }));
    setSaved(false);
  }

  function updateSocial(index: number, field: "label" | "url", value: string) {
    setInfo((prev) => ({
      ...prev,
      socials: prev.socials.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
    setSaved(false);
  }

  function removeSocial(index: number) {
    setInfo((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));
  }

  // Skills
  function addSkill() {
    setInfo((prev) => ({
      ...prev,
      skills: [...prev.skills, { fr: "", en: "" }],
    }));
  }

  function updateSkill(index: number, locale: "fr" | "en", value: string) {
    setInfo((prev) => ({
      ...prev,
      skills: prev.skills.map((s, i) =>
        i === index ? { ...s, [locale]: value } : s
      ),
    }));
    setSaved(false);
  }

  function removeSkill(index: number) {
    setInfo((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }

  // Experiences
  function addExperience() {
    setInfo((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { period: "", company: "", role: { fr: "", en: "" }, description: { fr: "", en: "" } },
      ],
    }));
  }

  function updateExperience(index: number, field: string, value: unknown) {
    setInfo((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
    setSaved(false);
  }

  function removeExperience(index: number) {
    setInfo((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  }

  // Education
  function addEducation() {
    setInfo((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { year: "", school: "", diploma: { fr: "", en: "" } },
      ],
    }));
  }

  function updateEducation(index: number, field: string, value: unknown) {
    setInfo((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
    setSaved(false);
  }

  function removeEducation(index: number) {
    setInfo((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Name */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
          Nom
        </label>
        <input
          type="text"
          value={info.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
        />
      </div>

      {/* Title */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Titre (FR)
          </label>
          <input
            type="text"
            value={info.title.fr}
            onChange={(e) => updateLocalized("title", "fr", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Titre (EN)
          </label>
          <input
            type="text"
            value={info.title.en}
            onChange={(e) => updateLocalized("title", "en", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <p className="text-xs text-gray-400 mb-2 italic">
          {"Le 1er paragraphe s'affiche en grand (manifeste). Séparez les paragraphes par une ligne vide."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Bio (FR)
          </label>
          <textarea
            value={info.bio.fr}
            onChange={(e) => updateLocalized("bio", "fr", e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm resize-y"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Bio (EN)
          </label>
          <textarea
            value={info.bio.en}
            onChange={(e) => updateLocalized("bio", "en", e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm resize-y"
          />
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Email
          </label>
          <input
            type="email"
            value={info.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            CV
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={info.cvUrl}
              onChange={(e) => update("cvUrl", e.target.value)}
              placeholder="URL ou chemin du CV"
              className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
            />
            <label className="px-3 py-2 border border-gray-300 hover:border-noir transition-colors text-sm cursor-pointer">
              Parcourir
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: formData });
                  if (res.ok) {
                    const { path } = await res.json();
                    update("cvUrl", path);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Localisation (FR)
          </label>
          <input
            type="text"
            value={info.location.fr}
            onChange={(e) => updateLocalized("location", "fr", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Localisation (EN)
          </label>
          <input
            type="text"
            value={info.location.en}
            onChange={(e) => updateLocalized("location", "en", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Portrait */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
          Portrait
        </label>
        <input
          type="text"
          value={info.portrait}
          onChange={(e) => update("portrait", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm mb-2"
        />
        <ImageUploader onUploaded={(path) => update("portrait", path)} />
      </div>

      {/* Socials */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            Réseaux sociaux
          </label>
          <button
            type="button"
            onClick={addSocial}
            className="text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {info.socials.map((social, i) => (
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
                placeholder="Nom (ex: LinkedIn)"
                className={`w-[140px] px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm ${(social.visible ?? true) ? "" : "opacity-40"}`}
              />
              <input
                type="url"
                value={social.url}
                onChange={(e) => updateSocial(i, "url", e.target.value)}
                placeholder="https://www.linkedin.com/in/..."
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

      {/* Site password gate */}
      <div className="p-4 border border-gray-200 space-y-3">
        <label className="block text-xs uppercase tracking-wider text-gray-500">
          Protection par mot de passe (site public)
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={info.sitePasswordEnabled}
            onChange={(e) => update("sitePasswordEnabled", e.target.checked)}
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
              onChange={(e) => update("sitePassword", e.target.value)}
              placeholder="Mot de passe pour accéder au site"
              className="w-full max-w-sm px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1 italic">
              Ce mot de passe est différent du mot de passe admin.
            </p>
          </div>
        )}
      </div>

      {/* Section visibility toggles */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-3">
          Sections visibles (page À propos)
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={info.showCv}
              onChange={(e) => update("showCv", e.target.checked)}
              className="w-4 h-4 accent-noir"
            />
            <span className="text-sm">{"Bouton CV (téléchargement)"}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={info.showSkills}
              onChange={(e) => update("showSkills", e.target.checked)}
              className="w-4 h-4 accent-noir"
            />
            <span className="text-sm">Compétences</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={info.showExperience}
              onChange={(e) => update("showExperience", e.target.checked)}
              className="w-4 h-4 accent-noir"
            />
            <span className="text-sm">Expériences</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={info.showEducation}
              onChange={(e) => update("showEducation", e.target.checked)}
              className="w-4 h-4 accent-noir"
            />
            <span className="text-sm">Formation</span>
          </label>
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            Compétences
          </label>
          <button
            type="button"
            onClick={addSkill}
            className="text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {info.skills.map((skill, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={skill.fr}
                onChange={(e) => updateSkill(i, "fr", e.target.value)}
                placeholder="FR"
                className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
              <input
                type="text"
                value={skill.en}
                onChange={(e) => updateSkill(i, "en", e.target.value)}
                placeholder="EN"
                className="flex-1 px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => removeSkill(i)}
                className="text-xs text-red-500 hover:text-red-700 px-2"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Experiences */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            Expériences
          </label>
          <button
            type="button"
            onClick={addExperience}
            className="text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-4">
          {info.experiences.map((exp, i) => (
            <div key={i} className="p-4 border border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Expérience {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeExperience(i)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={exp.period}
                  onChange={(e) => updateExperience(i, "period", e.target.value)}
                  placeholder="Période (ex: 2022 — 2025)"
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(i, "company", e.target.value)}
                  placeholder="Entreprise"
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={exp.role.fr}
                  onChange={(e) =>
                    updateExperience(i, "role", { ...exp.role, fr: e.target.value })
                  }
                  placeholder="Rôle (FR)"
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
                <input
                  type="text"
                  value={exp.role.en}
                  onChange={(e) =>
                    updateExperience(i, "role", { ...exp.role, en: e.target.value })
                  }
                  placeholder="Role (EN)"
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <textarea
                  value={exp.description?.fr ?? ""}
                  onChange={(e) =>
                    updateExperience(i, "description", {
                      ...(exp.description ?? { fr: "", en: "" }),
                      fr: e.target.value,
                    })
                  }
                  placeholder="Description (FR)"
                  rows={2}
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm resize-y"
                />
                <textarea
                  value={exp.description?.en ?? ""}
                  onChange={(e) =>
                    updateExperience(i, "description", {
                      ...(exp.description ?? { fr: "", en: "" }),
                      en: e.target.value,
                    })
                  }
                  placeholder="Description (EN)"
                  rows={2}
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            Formation
          </label>
          <button
            type="button"
            onClick={addEducation}
            className="text-xs px-3 py-1 border border-gray-300 hover:border-noir transition-colors"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-4">
          {info.education.map((edu, i) => (
            <div key={i} className="p-4 border border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Formation {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEducation(i)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={edu.year}
                  onChange={(e) => updateEducation(i, "year", e.target.value)}
                  placeholder="Année"
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(i, "school", e.target.value)}
                  placeholder="École"
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={edu.diploma.fr}
                  onChange={(e) =>
                    updateEducation(i, "diploma", { ...edu.diploma, fr: e.target.value })
                  }
                  placeholder="Diplôme (FR)"
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
                <input
                  type="text"
                  value={edu.diploma.en}
                  onChange={(e) =>
                    updateEducation(i, "diploma", { ...edu.diploma, en: e.target.value })
                  }
                  placeholder="Diploma (EN)"
                  className="px-3 py-2 border border-gray-300 focus:border-noir focus:outline-none text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      {saved && (
        <p className="text-green-600 text-sm">Sauvegardé avec succès !</p>
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
