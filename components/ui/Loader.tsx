"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface LoaderProps {
  name?: string;
}

export function Loader({ name = "Artist Name" }: LoaderProps) {
  const [visible, setVisible] = useState(true);
  const t = useTranslations("loader");

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-offwhite flex flex-col items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="overflow-hidden">
            <motion.h1
              className="font-display text-4xl md:text-6xl"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {name}
            </motion.h1>
          </div>
          <motion.p
            className="text-gris text-sm mt-1.5 tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
