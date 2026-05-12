"use client";

import { useTranslations } from "next-intl";
import type { Genre } from "@/types";

const DEFAULT_CATEGORIES = [
  { value: "electronic", label: "Electronic" },
  { value: "hip-hop",    label: "Hip-Hop" },
  { value: "ambient",    label: "Ambient" },
  { value: "r&b",        label: "R&B" },
];

interface CategoryFilterProps {
  active: Genre | "all";
  onChange: (genre: Genre | "all") => void;
  categories?: { value: string; label: string }[];
}

export function CategoryFilter({ active, onChange, categories }: CategoryFilterProps) {
  const tHome = useTranslations("home");
  const cats = categories ?? DEFAULT_CATEGORIES;

  return (
    <div className="flex flex-wrap gap-x-3 sm:gap-x-8 gap-y-3 text-xs sm:text-sm">
      <button
        onClick={() => onChange("all")}
        className={`relative pb-1 transition-colors ${
          active === "all" ? "text-noir" : "text-gris hover:text-noir"
        }`}
      >
        {tHome("filterAll")}
        {active === "all" && (
          <span className="absolute bottom-0 left-0 right-0 h-px bg-noir" />
        )}
      </button>
      {cats.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`relative pb-1 transition-colors ${
            active === cat.value ? "text-noir" : "text-gris hover:text-noir"
          }`}
        >
          {cat.label}
          {active === cat.value && (
            <span className="absolute bottom-0 left-0 right-0 h-px bg-noir" />
          )}
        </button>
      ))}
    </div>
  );
}
