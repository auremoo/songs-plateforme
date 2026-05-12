"use client";

import { useLocale, useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { Experience } from "@/types";

interface ExperienceTimelineProps {
  experiences: Experience[];
}

export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("about");

  return (
    <section className="py-20 md:py-28 border-t border-noir/15">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-20">
        <ScrollReveal>
          <span className="text-xs text-gris uppercase tracking-wider">
            {t("experience")}
          </span>
        </ScrollReveal>
        <div>
          {experiences.map((exp, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="py-5 border-b border-noir/10">
                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-6">
                  <span className="text-xs text-gris tracking-wider pt-0.5">
                    {exp.period}
                  </span>
                  <div>
                    <span className="text-sm font-medium block">
                      {exp.role[locale]}
                    </span>
                    <span className="text-sm text-gris">{exp.company}</span>
                    {exp.description && (
                      <p className="text-sm text-gris/70 mt-2 whitespace-pre-line">
                        {exp.description[locale]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
