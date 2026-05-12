"use client";

import { useLocale, useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PersonalInfo } from "@/types";

interface ContactSectionProps {
  info: PersonalInfo;
}

export function ContactSection({ info }: ContactSectionProps) {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("about");

  return (
    <section className="py-12 sm:py-24 md:py-36 border-t border-noir/15">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-20">
        <ScrollReveal>
          <span className="text-xs text-gris uppercase tracking-wider">
            {t("contact")}
          </span>
        </ScrollReveal>
        <div>
          {/* Email */}
          <ScrollReveal>
            <div className="py-6 border-b border-noir/10">
              <a
                href={`mailto:${info.email}`}
                className="font-display text-lg sm:text-2xl md:text-4xl lg:text-5xl hover:text-gris transition-colors duration-500 block break-all sm:break-normal"
              >
                {info.email}
              </a>
            </div>
          </ScrollReveal>

          {/* Availability */}
          <ScrollReveal delay={0.1}>
            <div className="py-5 border-b border-noir/10">
              <p className="text-sm text-gris italic">{t("available")}</p>
            </div>
          </ScrollReveal>

          {/* Socials */}
          {info.socials.filter((s) => s.visible !== false).length > 0 && (
            <ScrollReveal delay={0.15}>
              <div className="py-5 border-b border-noir/10 flex flex-wrap gap-4 sm:gap-6">
                {info.socials
                  .filter((s) => s.visible !== false)
                  .map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gris hover:text-noir transition-colors"
                    >
                      {social.label}
                    </a>
                  ))}
              </div>
            </ScrollReveal>
          )}

          {/* Location */}
          <ScrollReveal delay={0.2}>
            <div className="py-5 border-b border-noir/10 grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-3 sm:gap-4">
              <span className="text-xs text-gris uppercase tracking-wider pt-0.5">
                {t("location")}
              </span>
              <span className="text-sm">{info.location[locale]}</span>
            </div>
          </ScrollReveal>

          {/* Press Kit (CV) */}
          {info.showCv && info.cvUrl && (
            <ScrollReveal delay={0.25}>
              <div className="pt-8">
                <a
                  href={info.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm border border-noir px-6 py-3 hover:bg-noir hover:text-offwhite transition-colors"
                >
                  {t("pressKit")}
                </a>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
