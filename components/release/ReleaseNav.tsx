"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Release } from "@/types";

interface ReleaseNavProps {
  prev: Release | null;
  next: Release | null;
}

export function ReleaseNav({ prev, next }: ReleaseNavProps) {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("release");

  return (
    <nav className="border-t border-gris-clair py-8 sm:py-12 mt-8 sm:mt-12">
      <div className="grid grid-cols-3 items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          {prev && (
            <Link href={`/release/${prev.slug}`} className="group inline-block text-left">
              <span className="text-[10px] sm:text-xs text-gris uppercase tracking-wider block mb-1">
                {t("prevRelease")}
              </span>
              <span className="text-xs sm:text-sm group-hover:text-noir transition-colors line-clamp-2">
                {prev.title[locale]}
              </span>
            </Link>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-[10px] sm:text-xs text-gris uppercase tracking-wider hover:text-noir transition-colors">
            {t("allReleases")}
          </Link>
        </div>

        <div className="text-right min-w-0">
          {next && (
            <Link href={`/release/${next.slug}`} className="group inline-block text-right">
              <span className="text-[10px] sm:text-xs text-gris uppercase tracking-wider block mb-1">
                {t("nextRelease")}
              </span>
              <span className="text-xs sm:text-sm group-hover:text-noir transition-colors line-clamp-2">
                {next.title[locale]}
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
