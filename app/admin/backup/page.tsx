"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { downloadBackup, isAutoBackupEnabled, setAutoBackup } from "@/lib/backup";

export default function BackupPage() {
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);
  const [autoBackup, setAutoBackupState] = useState(() => {
    if (typeof window === "undefined") return false;
    return isAutoBackupEnabled();
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function toggleAutoBackup() {
    const next = !autoBackup;
    setAutoBackupState(next);
    setAutoBackup(next);
  }

  async function handleExport() {
    await downloadBackup(true);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setMessage(null);

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.projects || !backup.personal || !backup.design) {
        setMessage({
          type: "error",
          text: "Fichier invalide : il manque projects, personal ou design.",
        });
        setRestoring(false);
        return;
      }

      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: `Backup restaure avec succes ! (${backup.projects.length} projets, export du ${backup._meta?.exportedAt?.slice(0, 10) ?? "inconnu"})`,
        });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Erreur serveur." });
      }
    } catch {
      setMessage({ type: "error", text: "Fichier JSON invalide." });
    }

    setRestoring(false);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Backup & Restauration</h1>

      {/* Export */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 mb-2">
          Exporter
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Telecharge un fichier JSON contenant toutes les donnees du site
          (projets, infos personnelles, design).
        </p>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleExport}
            className="px-6 py-3 bg-noir text-white hover:bg-gray-800 transition-colors text-sm"
          >
            Telecharger le backup
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoBackup}
            onChange={toggleAutoBackup}
            className="accent-noir"
          />
          <span className="text-sm text-gray-600">
            Telecharger automatiquement un backup a chaque sauvegarde
          </span>
        </label>
      </section>

      {/* Import */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 mb-2">
          Restaurer
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Importe un fichier backup JSON pour restaurer toutes les donnees.
          Attention : ceci remplace toutes les donnees actuelles.
        </p>

        <label
          className={`inline-block px-6 py-3 border border-gray-300 hover:border-noir transition-colors text-sm cursor-pointer ${
            restoring ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {restoring ? "Restauration..." : "Choisir un fichier backup"}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            disabled={restoring}
          />
        </label>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}
      </section>
    </div>
  );
}
