"use client";

import { useState, useEffect } from "react";
import { DesignForm } from "@/components/admin/DesignForm";
import type { DesignSettings } from "@/types";

export default function DesignPage() {
  const [settings, setSettings] = useState<DesignSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/design")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Design</h1>
        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : settings ? (
          <DesignForm initial={settings} />
        ) : (
          <p className="text-red-500">Erreur de chargement</p>
        )}
    </div>
  );
}
