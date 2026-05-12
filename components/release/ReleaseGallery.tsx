"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Release, GalleryItem } from "@/types";

/* ─── Audio Preview ─── */
function AudioPreview({ src }: { src: string }) {
  const shouldReduce = useReducedMotion();
  return (
    <div className="mb-8">
      <audio
        controls
        src={src}
        aria-label="Audio preview"
        className="w-full h-14 rounded-none"
        style={{ colorScheme: "light" }}
        preload={shouldReduce ? "none" : "metadata"}
      />
    </div>
  );
}

/* ─── Tracklist ─── */
interface TracklistProps {
  tracks: Release["tracklist"];
}

function Tracklist({ tracks }: TracklistProps) {
  const t = useTranslations("release");
  const shouldReduce = useReducedMotion();

  return (
    <div className="mb-8">
      <h2 className="text-xs text-gris uppercase tracking-wider mb-4">{t("tracklist")}</h2>
      <table className="w-full text-sm">
        <tbody>
          {tracks.map((track, i) => (
            <motion.tr
              key={i}
              className="border-t border-gris-clair/30"
              initial={shouldReduce ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <td className="py-3 pr-4 text-gris text-xs w-8">{String(i + 1).padStart(2, "0")}</td>
              <td className="py-3 pr-4 font-medium">{track.title}</td>
              <td className="py-3 pr-4 text-gris text-xs">
                {track.features.length > 0 ? `feat. ${track.features.join(", ")}` : ""}
              </td>
              <td className="py-3 text-right text-gris text-xs tabular-nums">{track.duration}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Photo Gallery ─── */
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

function isVideo(item: GalleryItem): boolean {
  if (item.type === "video") return true;
  return VIDEO_EXTENSIONS.some((ext) => item.src.toLowerCase().endsWith(ext));
}

interface PhotoGalleryProps {
  items: GalleryItem[];
}

function PhotoGallery({ items }: PhotoGalleryProps) {
  const locale = useLocale() as "fr" | "en";
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const prev = useCallback(() => { if (current > 0) goTo(current - 1); }, [current, goTo]);
  const next = useCallback(() => { if (current < items.length - 1) goTo(current + 1); }, [current, items.length, goTo]);

  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [lightbox]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
    touchStart.current = null;
  }, [next, prev]);

  if (items.length === 0) return null;

  const item = items[current];
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <>
      <div className="py-4 sm:py-8">
        <div className="relative flex items-center justify-center gap-2 sm:gap-3">
          {items.length > 1 && (
            <button
              onClick={prev}
              disabled={current === 0}
              className="hidden sm:block relative w-16 md:w-24 lg:w-32 flex-shrink-0 aspect-[4/3] overflow-hidden opacity-30 hover:opacity-50 transition-opacity disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
              aria-label="Précédent"
            >
              {current > 0 && !isVideo(items[current - 1]) && (
                <Image src={items[current - 1].src} alt={items[current - 1].alt[locale]} fill className="object-cover" unoptimized sizes="128px" />
              )}
            </button>
          )}

          <div className="relative overflow-hidden aspect-[4/3] max-w-5xl w-full cursor-pointer" onClick={() => setLightbox(true)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {isVideo(item) ? (
                  <div className="w-full h-full bg-noir/10 flex items-center justify-center relative">
                    <video src={`${item.src}#t=0.1`} muted playsInline preload="auto" className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-noir/60 flex items-center justify-center backdrop-blur-sm">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image src={item.src} alt={item.alt[locale]} fill className="object-cover" style={item.objectPosition ? { objectPosition: item.objectPosition } : undefined} unoptimized sizes="(max-width: 1024px) 100vw, 1024px" />
                )}
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} disabled={current === 0} className="sm:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-noir/40 hover:bg-noir/70 text-offwhite transition-colors disabled:opacity-0 z-10" aria-label="Précédent">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} disabled={current === items.length - 1} className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-noir/40 hover:bg-noir/70 text-offwhite transition-colors disabled:opacity-0 z-10" aria-label="Suivant">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </>
            )}
          </div>

          {items.length > 1 && (
            <button onClick={next} disabled={current === items.length - 1} className="hidden sm:block relative w-16 md:w-24 lg:w-32 flex-shrink-0 aspect-[4/3] overflow-hidden opacity-30 hover:opacity-50 transition-opacity disabled:opacity-0 disabled:pointer-events-none cursor-pointer" aria-label="Suivant">
              {current < items.length - 1 && !isVideo(items[current + 1]) && (
                <Image src={items[current + 1].src} alt={items[current + 1].alt[locale]} fill className="object-cover" unoptimized sizes="128px" />
              )}
            </button>
          )}
        </div>

        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {items.length <= 10 ? (
              items.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-noir w-4" : "bg-gray-300 hover:bg-gray-400"}`} aria-label={`Image ${i + 1}`} />
              ))
            ) : (
              <span className="text-xs text-gray-500">{current + 1} / {items.length}</span>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-noir/90 flex items-center justify-center cursor-zoom-out"
            onClick={() => setLightbox(false)}
          >
            <button onClick={() => setLightbox(false)} className="absolute top-6 right-4 w-10 h-10 flex items-center justify-center text-offwhite hover:text-white transition-colors z-10" aria-label="Fermer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            {items.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} disabled={current === 0} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-offwhite hover:text-white transition-colors disabled:opacity-0 z-10" aria-label="Précédent">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} disabled={current === items.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-offwhite hover:text-white transition-colors disabled:opacity-0 z-10" aria-label="Suivant">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </>
            )}
            <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              {isVideo(item) ? (
                <video src={item.src} controls playsInline className="max-w-full max-h-[90vh] object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt={item.alt[locale]} className="max-w-full max-h-[90vh] object-contain" />
              )}
            </div>
            {items.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-offwhite text-sm">{current + 1} / {items.length}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Main export ─── */
interface ReleaseGalleryProps {
  release: Release;
}

export function ReleaseGallery({ release }: ReleaseGalleryProps) {
  return (
    <div className="py-4 sm:py-8">
      {release.audioPreview && <AudioPreview src={release.audioPreview} />}
      {release.tracklist.length > 0 && <Tracklist tracks={release.tracklist} />}
      {release.gallery.length > 0 && <PhotoGallery items={release.gallery} />}
    </div>
  );
}
