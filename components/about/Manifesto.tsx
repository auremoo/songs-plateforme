"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface ManifestoProps {
  text: string;
}

export function Manifesto({ text }: ManifestoProps) {
  const paragraphs = text.split("\n\n");

  return (
    <section className="py-12 sm:py-24 md:py-40 border-b border-noir/15">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-20">
        <ScrollReveal>
          <span className="text-xs text-gris uppercase tracking-wider">
            Manifesto
          </span>
        </ScrollReveal>
        <div>
          {paragraphs.map((paragraph, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <p
                className={`mb-6 sm:mb-10 md:mb-14 ${
                  i === 0
                    ? "font-display text-xl sm:text-2xl md:text-4xl lg:text-[3.5rem] xl:text-[4rem] leading-[1.1] tracking-tight"
                    : "text-base sm:text-lg md:text-xl lg:text-2xl leading-normal text-gris"
                }`}
              >
                {paragraph}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
