"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import Link from "next/link";

interface FooterProps {
  socials: { label: string; url: string }[];
}

export function Footer({ socials }: FooterProps) {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const isDark = pathname === "/about";

  return (
    <footer className={`px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40 2xl:px-56 py-6 md:py-0 md:h-20 border-t flex items-center ${
      isDark
        ? "bg-noir border-offwhite/20 text-offwhite/70"
        : "border-gris-clair"
    }`}>
      <div className={`w-full flex flex-col md:flex-row items-center justify-between gap-3 md:gap-8 text-xs ${isDark ? "" : "text-gris"}`}>
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        {socials.length > 0 && (
          <div className="flex items-center gap-6">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${isDark ? "hover:text-offwhite" : "hover:text-noir"}`}
              >
                {social.label}
              </a>
            ))}
          </div>
        )}
        {process.env.NODE_ENV === "development" && (
          <Link
            href="/admin"
            className={`transition-colors ${isDark ? "hover:text-offwhite" : "hover:text-noir"}`}
            title="Admin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.295a1 1 0 0 1 .804.98v1.36a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.295 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.295A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.03l1.25.834a6.957 6.957 0 0 1 1.416-.587l.295-1.473ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
      </div>
    </footer>
  );
}
