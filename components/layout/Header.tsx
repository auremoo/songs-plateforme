"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDark = pathname === "/about";

  const navLinks = [
    { href: "/" as const, label: t("music") },
    { href: "/about" as const, label: t("about") },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md ${isDark ? "bg-noir/80" : "bg-offwhite/80"}`}
        style={{ WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between px-3 sm:px-4 h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className={`font-display text-lg tracking-tight ${isDark ? "text-offwhite" : ""}`}>
            Artist Name
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-colors ${
                  isDark
                    ? `hover:text-offwhite ${pathname === link.href ? "text-offwhite" : "text-offwhite/50"}`
                    : `hover:text-noir ${pathname === link.href ? "text-noir" : "text-gris"}`
                }`}
              >
                {link.label}
              </Link>
            ))}
            <LocaleSwitcher isDark={isDark} />
          </nav>

          {/* Mobile burger */}
          <button
            className="md:hidden relative w-11 h-11 flex items-center justify-center -mr-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <div className="relative w-6 h-4 flex flex-col justify-between">
              <motion.span
                className={`block w-full h-px origin-center ${isDark ? "bg-offwhite" : "bg-noir"}`}
                animate={menuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className={`block w-full h-px ${isDark ? "bg-offwhite" : "bg-noir"}`}
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className={`block w-full h-px origin-center ${isDark ? "bg-offwhite" : "bg-noir"}`}
                animate={menuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={`fixed inset-x-0 top-16 sm:top-20 bottom-0 z-40 flex flex-col items-center justify-center gap-8 overflow-hidden md:hidden ${isDark ? "bg-noir" : "bg-offwhite"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  className={`font-display text-2xl ${isDark ? "text-offwhite" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <LocaleSwitcher isDark={isDark} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
