"use client";

import { useLocale, useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { UpcomingBadge } from "@/components/ui/UpcomingBadge";
import type { Release } from "@/types";

interface ReleaseInfoProps {
  release: Release;
  categories?: { value: string; label: string }[];
}

function RichText({ text, className }: { text: string; className?: string }) {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__)/g;
  const parts = text.split(regex);

  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={i} className="font-display font-semibold text-noir">
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.startsWith("__") && part.endsWith("__")) {
          return (
            <span key={i} className="underline decoration-1 underline-offset-4">
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

const STREAMING_LABELS: Record<string, string> = {
  spotify:    "Spotify",
  appleMusic: "Apple Music",
  soundcloud: "SoundCloud",
  youtube:    "YouTube",
  bandcamp:   "Bandcamp",
};

export function ReleaseInfo({ release, categories }: ReleaseInfoProps) {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("release");
  const genreLabel = categories?.find((c) => c.value === release.genre)?.label ?? release.genre;

  const isUpcoming = release.status === "upcoming";
  const streamingEntries = Object.entries(release.streamingLinks).filter(
    ([, url]) => url
  ) as [string, string][];

  return (
    <ScrollReveal>
      <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-[200px_1fr] text-xs text-gris uppercase tracking-wider">
        {/* Row 1: Type | Title */}
        <div className="md:border-r border-noir/15 py-4 sm:py-5 md:py-6 md:pr-6 border-b border-noir/10">
          <span className="block mb-1">{t("type")}</span>
          <span className="text-noir text-sm normal-case tracking-normal">{release.releaseType}</span>
        </div>
        <div className="py-4 sm:py-5 md:py-6 md:pl-8 lg:pl-12 border-b border-noir/10">
          <h1 className="font-display text-xl sm:text-2xl md:text-5xl text-noir normal-case tracking-normal">
            {release.title[locale]}
          </h1>
        </div>

        {/* Row 2: Year | Description */}
        <div className="md:border-r border-noir/15 py-4 sm:py-5 md:py-6 md:pr-6 border-b border-noir/10">
          <span className="block mb-1">{t("year")}</span>
          <span className="text-noir text-sm normal-case tracking-normal">{release.year}</span>
        </div>
        <div className="md:row-span-2 py-4 sm:py-5 md:py-6 md:pl-8 lg:pl-12">
          <RichText
            text={release.description[locale]}
            className="text-base md:text-lg leading-normal text-gris max-w-2xl whitespace-pre-line normal-case tracking-normal"
          />
        </div>

        {/* Row 3: Genre */}
        <div className="md:border-r border-noir/15 py-4 sm:py-5 md:py-6 md:pr-6 border-b border-noir/10">
          <span className="block mb-1">{t("genre")}</span>
          <span className="text-noir text-sm normal-case tracking-normal">{genreLabel}</span>
        </div>

        {/* Row 4: Featuring (conditional) */}
        {release.features.length > 0 && (
          <>
            <div className="md:border-r border-noir/15 py-4 sm:py-5 md:py-6 md:pr-6 border-b border-noir/10">
              <span className="block mb-1">{t("featuring")}</span>
              <span className="text-noir text-sm normal-case tracking-normal">
                {release.features.join(", ")}
              </span>
            </div>
            <div className="py-4 sm:py-5 md:py-6 md:pl-8 lg:pl-12 border-b border-noir/10" />
          </>
        )}

        {/* Upcoming badge row */}
        {isUpcoming && (
          <>
            <div className="md:border-r border-noir/15 py-4 sm:py-5 md:py-6 md:pr-6 border-b border-noir/10">
              <span className="block mb-1">{t("status")}</span>
            </div>
            <div className="py-4 sm:py-5 md:py-6 md:pl-8 lg:pl-12 border-b border-noir/10 flex items-center">
              <UpcomingBadge releaseDate={release.releaseDate} />
            </div>
          </>
        )}

        {/* Streaming links */}
        {!isUpcoming && streamingEntries.length > 0 && (
          <>
            <div className="md:border-r border-noir/15 py-4 sm:py-5 md:py-6 md:pr-6">
              <span className="block mb-1">{t("listenOn")}</span>
            </div>
            <div className="py-4 sm:py-5 md:py-6 md:pl-8 lg:pl-12 flex flex-wrap gap-3">
              {streamingEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs normal-case tracking-normal border border-noir/30 px-4 py-2 hover:border-noir hover:text-noir transition-colors"
                >
                  {STREAMING_LABELS[platform] ?? platform}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </ScrollReveal>
  );
}
