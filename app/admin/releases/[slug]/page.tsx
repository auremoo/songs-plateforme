"use client";

import { useState, useEffect, use } from "react";
import { ReleaseForm } from "@/components/admin/ReleaseForm";
import type { Release, DesignSettings } from "@/types";

export default function EditReleasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [release, setRelease] = useState<Release | null>(null);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/releases/${slug}`, { cache: "no-store" }).then((res) => res.json()),
      fetch("/api/design", { cache: "no-store" }).then((res) => res.json()),
    ]).then(([rel, design]: [Release, DesignSettings]) => {
      setRelease(rel);
      if (design.categories) setCategories(design.categories);
      setLoading(false);
    });
  }, [slug]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Modifier la sortie</h1>
      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : release ? (
        <ReleaseForm initial={release} categories={categories} />
      ) : (
        <p className="text-red-500">Sortie introuvable</p>
      )}
    </div>
  );
}
