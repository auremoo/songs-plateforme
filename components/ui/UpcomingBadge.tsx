"use client";

import { useState, useEffect } from "react";

interface UpcomingBadgeProps {
  releaseDate?: string;
  className?: string;
}

function getCountdown(releaseDate?: string): string {
  if (!releaseDate) return "BIENTÔT";

  const target = new Date(releaseDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return "BIENTÔT";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `BIENTÔT · Dans ${days} j`;
  if (hours > 0) return `BIENTÔT · Dans ${hours} h`;
  return "BIENTÔT · Aujourd'hui";
}

export function UpcomingBadge({ releaseDate, className = "" }: UpcomingBadgeProps) {
  const [label, setLabel] = useState(() => getCountdown(releaseDate));

  useEffect(() => {
    if (!releaseDate) return;
    const interval = setInterval(() => {
      setLabel(getCountdown(releaseDate));
    }, 60_000);
    return () => clearInterval(interval);
  }, [releaseDate]);

  return (
    <span
      className={`inline-block bg-noir text-offwhite text-[10px] uppercase tracking-widest px-2 py-1 font-medium ${className}`}
    >
      {label}
    </span>
  );
}
