"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { Release } from "@/types";

interface ReleaseHeroProps {
  release: Release;
}

export function ReleaseHero({ release }: ReleaseHeroProps) {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("release");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
      {/* Cover art */}
      <motion.div
        className="aspect-square overflow-hidden relative shadow-md"
        style={{ backgroundColor: release.color !== "transparent" ? release.color : "#E0DEDA" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {release.cover ? (
          <Image
            src={release.cover}
            alt={release.title[locale]}
            fill
            className="object-cover"
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : null}
      </motion.div>

      {/* Release info */}
      <motion.div
        className="flex flex-col justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-xs text-gris uppercase tracking-widest mb-3">
          {release.releaseType} · {release.year}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
          {release.title[locale]}
        </h1>
        <span className="text-sm text-gris uppercase tracking-wider mb-6">
          {release.genre}
        </span>
        {release.features.length > 0 && (
          <p className="text-sm text-gris">
            <span className="uppercase tracking-wider text-xs mr-2">{t("featuring")}</span>
            {release.features.join(", ")}
          </p>
        )}
      </motion.div>
    </div>
  );
}
