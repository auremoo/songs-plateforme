"use client";

import { useLocale, useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { LocalizedText } from "@/types";

interface SkillsProps {
  skills: LocalizedText[];
}

export function Skills({ skills }: SkillsProps) {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("about");

  return (
    <section className="py-20 md:py-28 border-t border-noir/15">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-20">
        <ScrollReveal>
          <span className="text-xs text-gris uppercase tracking-wider">
            {t("skills")}
          </span>
        </ScrollReveal>
        <div>
          {skills.map((skill, i) => (
            <ScrollReveal key={i} delay={i * 0.03}>
              <div className="py-2.5 border-b border-noir/10">
                <span className="text-sm">{skill[locale]}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
