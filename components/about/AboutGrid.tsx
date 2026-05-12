"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PersonalInfo } from "@/types";

interface AboutGridProps {
  info: PersonalInfo;
}

const isDev = process.env.NODE_ENV === "development";

export function AboutGrid({ info }: AboutGridProps) {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("about");
  const paragraphs = info.bio[locale].split("\n\n");
  const visibleSocials = info.socials.filter((s) => s.visible !== false);
  const [dark, setDark] = useState(true);

  // Color tokens based on mode
  const bg = dark ? "bg-noir" : "bg-offwhite";
  const text = dark ? "text-offwhite" : "text-noir";
  const muted = dark ? "text-offwhite/50" : "text-gris";
  const soft = dark ? "text-offwhite/60" : "text-gris";
  const faint = dark ? "text-offwhite/40" : "text-gris/70";
  const fainter = dark ? "text-offwhite/35" : "text-gris/60";
  const border = dark ? "border-offwhite/20" : "border-noir/15";
  const borderFine = dark ? "border-offwhite/10" : "border-noir/10";
  const hoverText = dark ? "hover:text-offwhite/60" : "hover:text-gris";
  const btnBorder = dark ? "border-offwhite" : "border-noir";
  const btnHover = dark ? "hover:bg-offwhite hover:text-noir" : "hover:bg-noir hover:text-offwhite";

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

        {/* ── RIGHT COLUMN — Structured info cells ── */}
        <div className={`border-t lg:border-t-0 ${border}`}>
          {/* Contact */}
          <div className={`p-6 md:p-10 lg:p-12 xl:p-16 border-b ${border}`}>
            <ScrollReveal>
              <span className={`text-xs ${muted} uppercase tracking-wider block mb-8`}>
                Contact
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <a
                href={`mailto:${info.email}`}
                className={`font-display text-base sm:text-xl md:text-2xl lg:text-3xl ${hoverText} transition-colors duration-500 block mb-6 break-all sm:break-normal`}
              >
                {info.email}
              </a>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="flex items-baseline gap-3 mb-2">
                <span className={`text-xs ${muted} uppercase tracking-wider w-8`}>T.</span>
                <span className="text-sm">{info.location[locale]}</span>
              </div>
            </ScrollReveal>
            {visibleSocials.length > 0 && (
              <ScrollReveal delay={0.15}>
                <div className="flex items-baseline gap-3">
                  <span className={`text-xs ${muted} uppercase tracking-wider w-8`}>W.</span>
                  <div className="flex gap-4">
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

          {/* Skills */}
          {info.showSkills && (
            <div className={`p-6 md:p-10 lg:p-12 xl:p-16 border-b ${border}`}>
              <ScrollReveal>
                <span className={`text-xs ${muted} uppercase tracking-wider block mb-6`}>
                  {t("skills")}
                </span>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {info.skills.map((skill, i) => (
                  <ScrollReveal key={i} delay={i * 0.02}>
                    <div className={`py-2 border-b ${borderFine}`}>
                      <span className="text-sm">{skill[locale]}</span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {/* Experience & Education side by side */}
          {(info.showExperience || info.showEducation) && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              {info.showExperience && (
                <div className={`p-6 md:p-10 lg:p-12 xl:p-16 border-b ${border} ${info.showEducation ? "md:border-r" : ""}`}>
                  <ScrollReveal>
                    <span className={`text-xs ${muted} uppercase tracking-wider block mb-6`}>
                      {t("experience")}
                    </span>
                  </ScrollReveal>
                  {info.experiences.map((exp, i) => (
                    <ScrollReveal key={i} delay={i * 0.08}>
                      <div className={`py-4 border-b ${borderFine} last:border-b-0`}>
                        <span className={`text-xs ${faint} tracking-wider block mb-1`}>
                          {exp.period}
                        </span>
                        <span className="text-sm font-medium block">
                          {exp.role[locale]}
                        </span>
                        <span className={`text-sm ${muted}`}>{exp.company}</span>
                        {exp.description && (
                          <p className={`text-xs ${fainter} mt-2 leading-normal whitespace-pre-line`}>
                            {exp.description[locale]}
                          </p>
                        )}
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {info.showEducation && (
                <div className={`p-6 md:p-10 lg:p-12 xl:p-16 border-b ${border}`}>
                  <ScrollReveal>
                    <span className={`text-xs ${muted} uppercase tracking-wider block mb-6`}>
                      {t("education")}
                    </span>
                  </ScrollReveal>
                  {info.education.map((edu, i) => (
                    <ScrollReveal key={i} delay={i * 0.08}>
                      <div className={`py-4 border-b ${borderFine} last:border-b-0`}>
                        <span className={`text-xs ${faint} tracking-wider block mb-1`}>
                          {edu.year}
                        </span>
                        <span className="text-sm font-medium block">
                          {edu.diploma[locale]}
                        </span>
                        <span className={`text-sm ${muted}`}>{edu.school}</span>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Disponibilité + CV */}
          <div className="p-6 md:p-10 lg:p-12 xl:p-16">
            <ScrollReveal>
              <p className={`text-sm ${muted} italic mb-6`}>{t("available")}</p>
            </ScrollReveal>
            {info.showCv && info.cvUrl && (
              <ScrollReveal delay={0.1}>
                <a
                  href={info.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block text-sm border ${btnBorder} px-6 py-3 ${btnHover} transition-colors`}
                >
                  {t("downloadCv")}
                </a>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
