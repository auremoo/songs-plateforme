"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface ImageUploaderProps {
  slug?: string;
  onUploaded: (path: string, type?: "image" | "video", blobUrl?: string) => void;
  accept?: string;
}

export function ImageUploader({ slug, onUploaded, accept = "image/*,video/mp4,video/webm,video/quicktime" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function upload(file: File) {
    setUploading(true);
    setProgress(0);
    setError(null);

    // Blob URL for immediate preview — no need to wait for the server
    const blobUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

    const formData = new FormData();
    formData.append("file", file);
    if (slug) formData.append("slug", slug);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          onUploaded(data.path, data.type, blobUrl);
        } catch {
          setError("Reponse invalide du serveur");
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setError(data.error ?? `Erreur ${xhr.status}`);
        } catch {
          setError(`Erreur ${xhr.status}`);
        }
      }
      setUploading(false);
      setProgress(0);
    });

    xhr.addEventListener("error", () => {
      setError("Echec de l\u2019upload — verifiez votre connexion");
      setUploading(false);
      setProgress(0);
    });

    xhr.addEventListener("timeout", () => {
      setError("Upload trop long — le fichier est peut-etre trop volumineux");
      setUploading(false);
      setProgress(0);
    });

    xhr.timeout = 300000; // 5 minutes
    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  const fileSizeMB = progress > 0 ? `${progress}%` : "";

  return (
    <>
      {/* Blocking overlay during upload */}
      {uploading && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] bg-noir/60 flex items-center justify-center">
          <div className="bg-white p-8 max-w-sm w-full mx-4 text-center space-y-4">
            <p className="text-sm font-medium text-noir">
              Upload en cours...
            </p>
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-noir transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {fileSizeMB} — Ne fermez pas cette page
            </p>
          </div>
        </div>,
        document.body
      )}

      <div
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-noir bg-gray-50" : "border-gray-300"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-sm text-gray-500">
            Glisser une image ou video ici ou cliquer pour selectionner
          </p>
        )}
      </div>
    </>
  );
}
