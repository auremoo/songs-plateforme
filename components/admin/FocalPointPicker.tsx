"use client";

import { useRef } from "react";
import Image from "next/image";

interface FocalPointPickerProps {
  src: string;
  value: string;
  onChange: (position: string) => void;
}

export function FocalPointPicker({ src, value, onChange }: FocalPointPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse "50% 50%" into x, y percentages
  const [xStr, yStr] = (value || "50% 50%").split(" ");
  const x = parseFloat(xStr) || 50;
  const y = parseFloat(yStr) || 50;

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const py = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onChange(`${px}% ${py}%`);
  }

  return (
    <div className="space-y-1">
      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative cursor-crosshair overflow-hidden border border-gray-300"
        style={{ maxWidth: 300, aspectRatio: "4/3" }}
      >
        <Image
          src={src}
          alt="Focal point preview"
          fill
          className="object-cover"
          style={{ objectPosition: value || "50% 50%" }}
          unoptimized
        />
        {/* Focal point indicator */}
        <div
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
          style={{ left: `${x}%`, top: `${y}%`, backgroundColor: "rgba(255,0,0,0.6)" }}
        />
        {/* Crosshair lines */}
        <div
          className="absolute w-px h-full bg-white/40"
          style={{ left: `${x}%` }}
        />
        <div
          className="absolute h-px w-full bg-white/40"
          style={{ top: `${y}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400">
        Cliquez pour placer le point focal — {value || "50% 50%"}
      </p>
    </div>
  );
}
