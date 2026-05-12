"use client";

import { useState, useEffect } from "react";
import { ReleaseForm } from "@/components/admin/ReleaseForm";
import type { DesignSettings } from "@/types";

export default function NewReleasePage() {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>();

  useEffect(() => {
    fetch("/api/design", { cache: "no-store" })
      .then((res) => res.json())
      .then((design: DesignSettings) => {
        if (design.categories) setCategories(design.categories);
      });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Nouvelle sortie</h1>
      <ReleaseForm isNew categories={categories} />
    </div>
  );
}
