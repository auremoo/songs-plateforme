"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface HoverPreviewProps {
  src: string | null;
  alt: string;
  color: string;
  mouseX: number;
  mouseY: number;
  hasAudioPreview?: boolean;
}

export function HoverPreview({
  src,
  alt,
  color,
  mouseX,
  mouseY,
  hasAudioPreview,
}: HoverPreviewProps) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed pointer-events-none z-30 hidden lg:block"
          style={{
            left: mouseX + 20,
            top: mouseY - 100,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div
            className="w-[240px] h-[240px] overflow-hidden relative"
            style={{ backgroundColor: color }}
          >
            <Image
              src={src}
              alt={alt}
              width={240}
              height={240}
              className="w-full h-full object-cover"
              unoptimized
            />
            {hasAudioPreview && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-noir/50 flex items-center justify-center backdrop-blur-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
