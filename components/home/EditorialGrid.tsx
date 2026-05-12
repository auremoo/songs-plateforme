"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryFilter } from "./CategoryFilter";
import { HoverPreview } from "./HoverPreview";
import type { Release, Genre } from "@/types";

const DEFAULT_CATEGORIES = [
  { value: "electronic", label: "Electronic" },
  { value: "hip-hop",    label: "Hip-Hop" },
  { value: "ambient",    label: "Ambient" },
  { value: "r&b",        label: "R&B" },
];

interface EditorialGridProps {
  releases: Release[];
  categories?: { value: string; label: string }[];
}

export function EditorialGrid({ releases, categories }: EditorialGridProps) {
  const t = useTranslations("home");
  const locale = useLocale() as "fr" | "en";
  const cats = categories ?? DEFAULT_CATEGORIES;
  const catLabelMap = useMemo(() => Object.fromEntries(cats.map((c) => [c.value, c.label])), [cats]);
  const [activeGenre, setActiveGenre] = useState<Genre | "all">("all");
  const [hoveredRelease, setHoveredRelease] = useState<Release | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const filtered =
    activeGenre === "all"
      ? releases
      : releases.filter((r) => r.genre === activeGenre);

  const grouped = filtered.reduce<Record<string, Release[]>>((acc, r) => {
    (acc[r.year] ||= []).push(r);
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40 2xl:px-56 pt-16 sm:pt-24 md:pt-32 pb-12 border-t border-gris-clair/30">
      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-8 sm:mb-12 md:mb-16">
        {t("archives")}
      </h2>

      <div className="mb-16">
        <CategoryFilter active={activeGenre} onChange={setActiveGenre} categories={categories} />
      </div>

      {/* Grid header — desktop only */}
      <div className="hidden md:grid grid-cols-[100px_1fr_160px_160px] gap-6 text-xs text-gris/70 uppercase tracking-wider pb-5 border-b border-gris-clair/30">
        <span>{t("year")}</span>
        <span>{t("release")}</span>
        <span>{t("type")}</span>
        <span>{t("genre")}</span>
      </div>

      <div onMouseMove={onMouseMove}>
        <AnimatePresence mode="popLayout">
          {years.map((year) =>
            grouped[year].map((release, i) => (
              <motion.div
                key={release.slug}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Link
                  href={`/release/${release.slug}`}
                  className="group block"
                  onMouseEnter={() => setHoveredRelease(release)}
                  onMouseLeave={() => setHoveredRelease(null)}
                >
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-[100px_1fr_160px_160px] gap-6 py-6 border-b border-gris-clair/20 items-start transition-colors group-hover:text-noir">
                    <span className="text-sm text-gris group-hover:text-noir transition-colors">
                      {release.year}
                    </span>
                    <span className="text-lg font-medium">
                      {release.title[locale]}
                    </span>
                    <span className="text-sm text-gris group-hover:text-noir transition-colors normal-case">
                      {release.releaseType}
                    </span>
                    <span className="text-xs text-gris uppercase tracking-wider group-hover:text-noir transition-colors">
                      {catLabelMap[release.genre] ?? release.genre}
                    </span>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden py-4 sm:py-6 border-b border-gris-clair/30">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <span className="font-medium text-sm sm:text-base truncate min-w-0">
                        {release.title[locale]}
                      </span>
                      <span className="text-xs text-gris flex-shrink-0">{release.year}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-3 text-xs text-gris">
                      <span className="truncate min-w-0">{release.releaseType}</span>
                      <span className="uppercase tracking-wider flex-shrink-0">
                        {catLabelMap[release.genre] ?? release.genre}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <HoverPreview
        src={hoveredRelease?.cover ?? null}
        alt={hoveredRelease?.title[locale] ?? ""}
        color={hoveredRelease?.color ?? "#E0DEDA"}
        mouseX={mousePos.x}
        mouseY={mousePos.y}
        hasAudioPreview={!!(hoveredRelease?.audioPreview)}
      />
    </section>
  );
}
