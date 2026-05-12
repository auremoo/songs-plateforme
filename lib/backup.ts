const AUTO_BACKUP_KEY = "portfolio-auto-backup";

export function isAutoBackupEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTO_BACKUP_KEY) === "true";
}

export function setAutoBackup(enabled: boolean) {
  localStorage.setItem(AUTO_BACKUP_KEY, enabled ? "true" : "false");
}

/**
 * Fetches a full backup from /api/backup and triggers a browser download.
 * Called after admin saves only if auto-backup is enabled.
 */
export async function downloadBackup(force = false) {
  if (!force && !isAutoBackupEnabled()) return;

  try {
    const res = await fetch("/api/backup");
    if (!res.ok) return;

    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const date = new Date().toISOString().slice(0, 10);
    const time = new Date().toISOString().slice(11, 16).replace(":", "h");
    const filename = `backup-portfolio-${date}_${time}.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    console.warn("Backup download failed");
  }
}
