import type { ReactNode } from "react";
import "../globals.css";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin — Portfolio Musical",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-noir min-h-screen">
        <AdminAuthGuard>
          <AdminNav />
          {children}
        </AdminAuthGuard>
      </body>
    </html>
  );
}
