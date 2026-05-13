"use client";

import { useMemo, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { UpcomingBadge } from "@/components/ui/UpcomingBadge";
import Image from "next/image";
import type { Release, CropRect } from "@/types";

interface ArchivesSectionProps {
  releases: Release[];
  gridColumns?: number;
  mosaicOrder?: string[];
  mosaicGrid?: string[][];
  mosaicAlignBottom?: boolean;
}

interface Tile {
  release: Release;
  src: string;
  ratio: string;
  key: string;
  objectPosition?: string;
  crop?: CropRect;
}

const RATIO_MAP: Record<string, string> = {
  portrait:  "aspect-[3/4]",
  tall:      "aspect-[2/3]",
  landscape: "aspect-[4/3]",
  wide:      "aspect-[16/9]",
  square:    "aspect-square",
};

const RATIO_HEIGHT: Record<string, number> = {
  portrait:  4 / 3,
  tall:      3 / 2,
  landscape: 3 / 4,
  wide:      9 / 16,
  square:    1,
};

function useColumnCount(configured: number) {
  const [cols, setCols] = useState(configured);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCols(2);
      else if (w < 768) setCols(3);
      else if (w < 1024) setCols(4);
      else setCols(configured);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [configured]);

  return cols;
}

export function ArchivesSection({ releases, gridColumns = 5, mosaicOrder, mosaicGrid, mosaicAlignBottom = false }: ArchivesSectionProps) {
  const locale = useLocale() as "fr" | "en";
  const cols = useColumnCount(gridColumns);

  const upcomingReleases = useMemo(() => releases.filter((r) => r.status === "upcoming"), [releases]);
  const releasedReleases = useMemo(() => releases.filter((r) => r.status !== "upcoming"), [releases]);

  const tiles = useMemo<Tile[]>(() => {
    const allTiles = releasedReleases.flatMap((release) => {
      const main: Tile = {
        release,
        src: release.cover,
        ratio: release.coverRatio ?? "square",
        key: release.slug,
        crop: release.coverCrop,
      };
      const extras: Tile[] = release.gallery
        .filter((item) => item.showOnMosaic && item.src)
        .map((item, i) => ({
          release,
          src: item.src,
          ratio: item.mosaicRatio ?? "square",
          key: `${release.slug}-mosaic-${i}`,
          objectPosition: item.objectPosition,
          crop: item.mosaicCrop,
        }));
      return [main, ...extras];
    });

    if (mosaicOrder && mosaicOrder.length > 0) {
      const orderMap = new Map(mosaicOrder.map((key, i) => [key, i]));
      allTiles.sort((a, b) => {
        const ai = orderMap.get(a.key) ?? 9999;
        const bi = orderMap.get(b.key) ?? 9999;
        return ai - bi;
      });
    }

    return allTiles;
  }, [releasedReleases, mosaicOrder]);

  const columns = useMemo(() => {
    if (mosaicGrid && mosaicGrid.length === cols) {
      const tileMap = new Map(tiles.map((t) => [t.key, t]));
      const result: Tile[][] = mosaicGrid.map((colKeys) =>
        colKeys.map((key) => tileMap.get(key)).filter((t): t is Tile => !!t)
      );
      const placedKeys = new Set(mosaicGrid.flat());
      const unplaced = tiles.filter((t) => !placedKeys.has(t.key));
      if (unplaced.length > 0) {
        const heights = result.map((col) =>
          col.reduce((h, t) => h + (RATIO_HEIGHT[t.ratio] ?? RATIO_HEIGHT.square), 0)
        );
        for (const tile of unplaced) {
          const minIdx = heights.indexOf(Math.min(...heights));
          result[minIdx].push(tile);
          heights[minIdx] += RATIO_HEIGHT[tile.ratio] ?? RATIO_HEIGHT.square;
        }
      }
      return result;
    }

    const result: Tile[][] = Array.from({ length: cols }, () => []);
    const heights: number[] = new Array(cols).fill(0);

    for (const tile of tiles) {
      const minIdx = heights.indexOf(Math.min(...heights));
      result[minIdx].push(tile);
      heights[minIdx] += RATIO_HEIGHT[tile.ratio] ?? RATIO_HEIGHT.square;
    }

    return result;
  }, [tiles, cols, mosaicGrid]);

  const gap = cols <= 2 ? 6 : 10;

  return (
    <section className="pt-16 sm:pt-20 pb-16 px-3 sm:px-4">
      {/* Upcoming strip */}
      {upcomingReleases.length > 0 && (
        <div className="mb-10 sm:mb-14">
          <p className="text-xs uppercase tracking-widest text-gris mb-4 sm:mb-6">À venir</p>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
            {upcomingReleases.map((release) => (
              <Link
                key={release.slug}
                href={`/release/${release.slug}`}
                className="group flex-none w-28 sm:w-36 md:w-44"
              >
                <div
                  className="aspect-square relative overflow-hidden mb-2"
                  style={{ backgroundColor: release.color }}
                >
                  {release.cover && (
                    <Image
                      src={release.cover}
                      alt={release.title[locale]}
                      fill
                      className="object-cover scale-[1.005] transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                      sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
                    />
                  )}
                  <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/20 transition-colors duration-500" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <UpcomingBadge releaseDate={release.releaseDate} />
                  </div>
                </div>
                <p className="text-xs font-medium truncate">{release.title[locale]}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className={`flex ${mosaicAlignBottom ? "items-stretch" : "items-start"}`} style={{ gap: `${gap}px` }}>
        {columns.map((column, colIdx) => (
          <div
            key={`col-${colIdx}`}
            className="flex flex-col flex-1 min-w-0"
            style={{ gap: `${gap}px` }}
          >
            {column.map((tile, tileIdx) => {
              const isLast = mosaicAlignBottom && tileIdx === column.length - 1;
              const ratioClass = RATIO_MAP[tile.ratio] ?? RATIO_MAP.square;

              return (
                <ScrollReveal
                  key={tile.key}
                  delay={tileIdx * 0.03}
                  className={isLast ? "grow flex flex-col" : undefined}
                >
                  <Link
                    href={`/release/${tile.release.slug}`}
                    className={`group block ${isLast ? "grow flex flex-col" : ""}`}
                  >
                    <div
                      className={`${ratioClass} ${isLast ? "grow" : ""} overflow-hidden relative`}
                      style={{ backgroundColor: tile.release.color }}
                    >
                      {tile.src && tile.crop ? (
                        <Image
                          src={tile.src}
                          alt={tile.release.title[locale]}
                          fill
                          className="object-cover scale-[1.005] transition-transform duration-700 group-hover:scale-110"
                          style={{
                            objectPosition: `${tile.crop.x + tile.crop.width / 2}% ${tile.crop.y + tile.crop.height / 2}%`,
                          }}
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        />
                      ) : tile.src ? (
                        <Image
                          src={tile.src}
                          alt={tile.release.title[locale]}
                          fill
                          className="object-cover scale-[1.005] transition-transform duration-700 group-hover:scale-110"
                          style={tile.objectPosition ? { objectPosition: tile.objectPosition } : undefined}
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/40 transition-colors duration-500 flex items-end p-2 sm:p-3">
                        <span className="text-offwhite text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                          {tile.release.title[locale]}
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
