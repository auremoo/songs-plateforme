"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

interface LocaleSwitcherProps {
  isDark?: boolean;
}

export function LocaleSwitcher({ isDark = false }: LocaleSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: "fr" | "en") {
    router.replace(pathname, { locale: newLocale });
  }

  const activeColor = isDark ? "text-offwhite" : "text-noir";
  const inactiveColor = isDark ? "text-offwhite/40 hover:text-offwhite/70" : "text-gris/50 hover:text-gris";
  const underlineColor = isDark ? "bg-offwhite" : "bg-noir";

  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-widest">
      <button
        onClick={() => switchLocale("fr")}
        className={`relative pb-0.5 transition-colors duration-300 ${
          locale === "fr" ? activeColor : inactiveColor
        }`}
      >
        Fr
        {locale === "fr" && (
          <span className={`absolute bottom-0 left-0 right-0 h-px ${underlineColor}`} />
        )}
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`relative pb-0.5 transition-colors duration-300 ${
          locale === "en" ? activeColor : inactiveColor
        }`}
      >
        En
        {locale === "en" && (
          <span className={`absolute bottom-0 left-0 right-0 h-px ${underlineColor}`} />
        )}
      </button>
    </div>
  );
}
