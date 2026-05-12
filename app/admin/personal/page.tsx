"use client";

import { useState, useEffect } from "react";
import { PersonalForm } from "@/components/admin/PersonalForm";
import type { PersonalInfo } from "@/types";

export default function PersonalPage() {
  const [info, setInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/personal")
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Infos personnelles</h1>
        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : info ? (
          <PersonalForm initial={info} />
        ) : (
          <p className="text-red-500">Erreur de chargement</p>
        )}
    </div>
  );
}
