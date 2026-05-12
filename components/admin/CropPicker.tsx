"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { CropRect } from "@/types";

interface CropPickerProps {
  src: string;
  value?: CropRect;
  onChange: (crop: CropRect) => void;
  /** Display ratio for the preview, e.g. "landscape", "portrait", "wide", "tall", "square" */
  ratio?: string;
}

const DEFAULT_CROP: CropRect = { x: 10, y: 10, width: 80, height: 80 };

const RATIO_VALUES: Record<string, number> = {
  portrait: 3 / 4,
  tall: 2 / 3,
  landscape: 4 / 3,
  wide: 16 / 9,
  square: 1,
};

export function CropPicker({ src, value, onChange, ratio }: CropPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const crop = value ?? DEFAULT_CROP;
  const [dragging, setDragging] = useState<"move" | "nw" | "ne" | "sw" | "se" | null>(null);
  const dragStart = useRef({ mx: 0, my: 0, crop: { ...crop } });
  const [natSize, setNatSize] = useState<{ w: number; h: number } | null>(null);

  const getRelPos = useCallback((e: MouseEvent | React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { px: 0, py: 0 };
    return {
      px: ((e.clientX - rect.left) / rect.width) * 100,
      py: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "move" | "nw" | "ne" | "sw" | "se") => {
      e.preventDefault();
      e.stopPropagation();
      const { px, py } = getRelPos(e);
      dragStart.current = { mx: px, my: py, crop: { ...crop } };
      setDragging(type);
    },
    [crop, getRelPos]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      const { px, py } = getRelPos(e);
      const dx = px - dragStart.current.mx;
      const dy = py - dragStart.current.my;
      const c = dragStart.current.crop;

      let next: CropRect;

      if (dragging === "move") {
        const nx = Math.max(0, Math.min(100 - c.width, c.x + dx));
        const ny = Math.max(0, Math.min(100 - c.height, c.y + dy));
        next = { x: nx, y: ny, width: c.width, height: c.height };
      } else {
        let nx = c.x, ny = c.y, nw = c.width, nh = c.height;

        if (dragging === "nw") {
          nw = Math.max(10, c.width - dx);
          nh = Math.max(10, c.height - dy);
          nx = c.x + c.width - nw;
          ny = c.y + c.height - nh;
        } else if (dragging === "ne") {
          nw = Math.max(10, c.width + dx);
          nh = Math.max(10, c.height - dy);
          ny = c.y + c.height - nh;
        } else if (dragging === "sw") {
          nw = Math.max(10, c.width - dx);
          nh = Math.max(10, c.height + dy);
          nx = c.x + c.width - nw;
        } else if (dragging === "se") {
          nw = Math.max(10, c.width + dx);
          nh = Math.max(10, c.height + dy);
        }

        nx = Math.max(0, nx);
        ny = Math.max(0, ny);
        nw = Math.min(100 - nx, nw);
        nh = Math.min(100 - ny, nh);

        next = { x: nx, y: ny, width: nw, height: nh };
      }

      onChange({
        x: Math.round(next.x * 10) / 10,
        y: Math.round(next.y * 10) / 10,
        width: Math.round(next.width * 10) / 10,
        height: Math.round(next.height * 10) / 10,
      });
    };

    const handleUp = () => setDragging(null);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, getRelPos, onChange]);

  const handleCorner = (corner: "nw" | "ne" | "sw" | "se") => (e: React.MouseEvent) =>
    handleMouseDown(e, corner);

  // Preview: mimics the real site — object-fit:cover + object-position at crop center
  const previewW = 160;
  const displayRatio = ratio ? (RATIO_VALUES[ratio] ?? 4 / 3) : 4 / 3;
  const previewH = previewW / displayRatio;

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400">
        Déplacez le rectangle pour cadrer la zone visible en mosaïque. Redimensionnez par les coins.
      </p>
      <div
        ref={containerRef}
        className="relative cursor-crosshair overflow-hidden border border-gray-300 select-none"
        style={{ maxWidth: 400 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Crop preview"
          className="w-full h-auto block"
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            setNatSize({ w: img.naturalWidth, h: img.naturalHeight });
          }}
        />

        {/* Dark overlay outside crop */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-0 right-0 top-0 bg-black/50"
            style={{ height: `${crop.y}%` }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 bg-black/50"
            style={{ height: `${100 - crop.y - crop.height}%` }}
          />
          <div
            className="absolute left-0 bg-black/50"
            style={{ top: `${crop.y}%`, height: `${crop.height}%`, width: `${crop.x}%` }}
          />
          <div
            className="absolute right-0 bg-black/50"
            style={{
              top: `${crop.y}%`,
              height: `${crop.height}%`,
              width: `${100 - crop.x - crop.width}%`,
            }}
          />
        </div>

        {/* Crop rectangle */}
        <div
          className="absolute border-2 border-white cursor-move"
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.width}%`,
            height: `${crop.height}%`,
          }}
          onMouseDown={(e) => handleMouseDown(e, "move")}
        >
          {(["nw", "ne", "sw", "se"] as const).map((corner) => (
            <div
              key={corner}
              className="absolute w-3 h-3 bg-white border border-gray-500 z-10"
              style={{
                cursor: `${corner}-resize`,
                ...(corner.includes("n") ? { top: -6 } : { bottom: -6 }),
                ...(corner.includes("w") ? { left: -6 } : { right: -6 }),
              }}
              onMouseDown={handleCorner(corner)}
            />
          ))}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
          </div>
        </div>
      </div>

      {/* Preview — matches real site: object-cover + object-position at crop center */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400">Aperçu :</span>
        <div
          className="relative overflow-hidden border border-gray-200"
          style={{ width: previewW, height: previewH }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Crop result"
            className="w-full h-full object-cover"
            style={{
              objectPosition: `${crop.x + crop.width / 2}% ${crop.y + crop.height / 2}%`,
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
