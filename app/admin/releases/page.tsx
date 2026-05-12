"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Release } from "@/types";

export default function ReleasesListPage() {
  const router = useRouter();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/releases")
      .then((res) => res.json())
      .then((data) => {
        setReleases(data);
        setLoading(false);
      });
  }, []);

  const allChecked = releases.length > 0 && selected.size === releases.length;

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(releases.map((r) => r.slug)));
  }

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  async function deleteSelected() {
    const slugs = Array.from(selected);
    if (!confirm(`Supprimer ${slugs.length} sortie${slugs.length > 1 ? "s" : ""} ?`)) return;

    setDeleting(true);
    const res = await fetch("/api/releases", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    });

    if (res.ok) {
      setReleases((prev) => prev.filter((r) => !selected.has(r.slug)));
      setSelected(new Set());
    }
    setDeleting(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Sorties</h1>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={deleteSelected}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? "Suppression..." : `Supprimer (${selected.size})`}
            </button>
          )}
          <button
            onClick={() => router.push("/admin/releases/new")}
            className="px-4 py-2 bg-noir text-white text-sm hover:bg-gray-800 transition-colors"
          >
            + Nouvelle sortie
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : releases.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucune sortie.</p>
      ) : (
        <div className="border border-gray-200">
          {/* Header row */}
          <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="w-4 h-4 accent-noir mr-4 shrink-0"
              title="Tout sélectionner"
            />
            <span className="text-xs uppercase tracking-wider text-gray-400 flex-1">
              {selected.size > 0 ? `${selected.size} sélectionné${selected.size > 1 ? "s" : ""}` : "Titre"}
            </span>
            <span className="text-xs uppercase tracking-wider text-gray-400 w-24 text-right">Actions</span>
          </div>

          {releases.map((release) => (
            <div
              key={release.slug}
              className={`flex items-center px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${selected.has(release.slug) ? "bg-red-50" : "hover:bg-gray-50"}`}
            >
              <input
                type="checkbox"
                checked={selected.has(release.slug)}
                onChange={() => toggle(release.slug)}
                className="w-4 h-4 accent-noir mr-4 shrink-0"
              />
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: release.color }} />
                <div className="min-w-0">
                  <span className="font-medium text-sm block truncate">{release.title.fr}</span>
                  <span className="text-xs text-gray-400">
                    {release.year} · {release.releaseType} · {release.genre}
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/admin/releases/${release.slug}`)}
                className="text-xs text-gray-500 hover:text-noir transition-colors shrink-0"
              >
                Modifier
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
