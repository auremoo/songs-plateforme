"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Release } from "@/types";

export default function ReleasesListPage() {
  const router = useRouter();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/releases")
      .then((res) => res.json())
      .then((data) => {
        setReleases(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Supprimer la sortie "${slug}" ?`)) return;
    const res = await fetch(`/api/releases/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setReleases((prev) => prev.filter((r) => r.slug !== slug));
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Sorties</h1>
        <button onClick={() => router.push("/admin/releases/new")} className="px-4 py-2 bg-noir text-white text-sm hover:bg-gray-800 transition-colors">
          + Nouvelle sortie
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="space-y-2">
          {releases.map((release) => (
            <div key={release.slug} className="flex items-center justify-between p-4 border border-gray-200 hover:border-gray-400 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: release.color }} />
                <div>
                  <span className="font-medium text-sm">{release.title.fr}</span>
                  <span className="text-xs text-gray-500 ml-3">
                    {release.year} · {release.releaseType} · {release.genre}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => router.push(`/admin/releases/${release.slug}`)} className="text-xs text-gray-500 hover:text-noir transition-colors">Modifier</button>
                <button onClick={() => handleDelete(release.slug)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
