"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { Artist } from "@/types";

interface AboutGridProps {
  artist: Artist;
}

const isDev = process.env.NODE_ENV === "development";

export function AboutGrid({ artist }: AboutGridProps) {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("about");
  const paragraphs = artist.bio[locale].split("\n\n");
  const visibleSocials = artist.socials.filter((s) => s.visible !== false);
  const [dark, setDark] = useState(true);

  const bg = dark ? "bg-noir" : "bg-offwhite";
  const text = dark ? "text-offwhite" : "text-noir";
  const muted = dark ? "text-offwhite/50" : "text-gris";
  const soft = dark ? "text-offwhite/60" : "text-gris";
  const faint = dark ? "text-offwhite/40" : "text-gris/70";
  const border = dark ? "border-offwhite/20" : "border-noir/15";
  const borderFine = dark ? "border-offwhite/10" : "border-noir/10";
  const hoverText = dark ? "hover:text-offwhite/60" : "hover:text-gris";

  return (
    <div className={`pt-20 ${bg} ${text} flex-1`}>
      {/* Dev-only dark/light toggle */}
      {isDev && (
        <button
          onClick={() => setDark(!dark)}
          className={`fixed bottom-24 right-4 z-50 px-3 py-1.5 text-xs rounded-full border backdrop-blur-sm transition-colors ${
            dark
              ? "border-offwhite/30 text-offwhite/70 bg-offwhite/10 hover:bg-offwhite/20"
              : "border-noir/30 text-noir/70 bg-noir/10 hover:bg-noir/20"
          }`}
        >
          {dark ? "Light" : "Dark"}
        </button>
      )}

      {/* ── Main two-column grid ── */}
      <div className={`grid grid-cols-1 lg:grid-cols-[1fr_1fr] border-t ${border}`}>
        {/* ── LEFT COLUMN — Bio ── */}
        <div className={`p-6 md:p-10 lg:p-12 xl:p-16 lg:border-r ${border}`}>
          <ScrollReveal>
            <span className={`text-xs ${muted} uppercase tracking-wider block mb-8`}>
              {t("bio")}
            </span>
          </ScrollReveal>
          <div className="space-y-8 md:space-y-10">
            {paragraphs.map((paragraph, i) => {
              const isFirst = i === 0;
              return (
                <ScrollReveal key={i} delay={i * 0.12}>
                  <p
                    className={
                      isFirst
                        ? "font-display text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-[2.5rem] leading-[1.15] tracking-tight whitespace-pre-line"
                        : `text-base md:text-lg leading-normal ${soft} whitespace-pre-line`
                    }
                  >
                    {paragraph}
                  </p>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={`border-t lg:border-t-0 ${border}`}>
          {/* Contact */}
          <div className={`p-6 md:p-10 lg:p-12 xl:p-16 border-b ${border}`}>
            <ScrollReveal>
              <span className={`text-xs ${muted} uppercase tracking-wider block mb-8`}>
                {t("contact")}
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <a
                href={`mailto:${artist.email}`}
                className={`font-display text-base sm:text-xl md:text-2xl lg:text-3xl ${hoverText} transition-colors duration-500 block mb-6 break-all sm:break-normal`}
              >
                {artist.email}
              </a>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="flex items-baseline gap-3 mb-2">
                <span className={`text-xs ${muted} uppercase tracking-wider w-8`}>T.</span>
                <span className="text-sm">{artist.location[locale]}</span>
              </div>
            </ScrollReveal>
            {visibleSocials.length > 0 && (
              <ScrollReveal delay={0.15}>
                <div className="flex items-baseline gap-3">
                  <span className={`text-xs ${muted} uppercase tracking-wider w-8`}>W.</span>
                  <div className="flex flex-wrap gap-4">
                    {visibleSocials.map((social) => (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm ${hoverText} transition-colors`}
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Label */}
          {artist.label && (
            <div className={`p-6 md:p-10 lg:p-12 xl:p-16 border-b ${border}`}>
              <ScrollReveal>
                <span className={`text-xs ${muted} uppercase tracking-wider block mb-6`}>
                  {t("label")}
                </span>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                {artist.label.url ? (
                  <a
                    href={artist.label.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-4 ${hoverText} transition-colors group`}
                  >
                    {artist.label.logo && (
                      <Image
                        src={artist.label.logo}
                        alt={artist.label.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    )}
                    <span className="font-display text-xl md:text-2xl tracking-tight">
                      {artist.label.name}
                    </span>
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-4">
                    {artist.label.logo && (
                      <Image
                        src={artist.label.logo}
                        alt={artist.label.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    )}
                    <span className="font-display text-xl md:text-2xl tracking-tight">
                      {artist.label.name}
                    </span>
                  </div>
                )}
              </ScrollReveal>
            </div>
          )}

          {/* Musical Styles */}
          {artist.musicalStyles.length > 0 && (
            <div className={`p-6 md:p-10 lg:p-12 xl:p-16 border-b ${border}`}>
              <ScrollReveal>
                <span className={`text-xs ${muted} uppercase tracking-wider block mb-6`}>
                  {t("styles")}
                </span>
              </ScrollReveal>
              <div className="flex flex-wrap gap-2">
                {artist.musicalStyles.map((style, i) => (
                  <ScrollReveal key={i} delay={i * 0.04}>
                    <span
                      className={`text-sm px-3 py-1 border ${borderFine}`}
                    >
                      {style}
                    </span>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {/* Credits */}
          {artist.credits.length > 0 && (
            <div className={`p-6 md:p-10 lg:p-12 xl:p-16`}>
              <ScrollReveal>
                <span className={`text-xs ${muted} uppercase tracking-wider block mb-6`}>
                  {t("credits")}
                </span>
              </ScrollReveal>
              <div className="space-y-0">
                {artist.credits.map((credit, i) => (
                  <ScrollReveal key={i} delay={i * 0.05}>
                    <div
                      className={`flex items-baseline justify-between py-3 border-b ${borderFine} last:border-b-0`}
                    >
                      <span className={`text-xs ${faint} uppercase tracking-wider`}>
                        {credit.role[locale]}
                      </span>
                      <span className="text-sm">{credit.name}</span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
