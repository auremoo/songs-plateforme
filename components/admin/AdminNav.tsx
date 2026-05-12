"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/releases", label: "Sorties" },
  { href: "/admin/personal", label: "Infos personnelles" },
  { href: "/admin/design",   label: "Design" },
  { href: "/admin/mosaic",   label: "Grille" },
  { href: "/admin/backup",   label: "Backup" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/admin" className="font-semibold text-sm">Admin</Link>
        <div className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-noir font-medium"
                  : "text-gray-500 hover:text-noir"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <Link href="/fr" className="text-xs text-gray-400 hover:text-noir transition-colors">
        Voir le site
      </Link>
    </nav>
  );
}
