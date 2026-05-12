"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "./LoginForm";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "auth" | "unauth">("loading");

  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => setStatus(res.ok ? "auth" : "unauth"))
      .catch(() => setStatus("unauth"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    );
  }

  if (status === "unauth") {
    return <LoginForm onSuccess={() => setStatus("auth")} />;
  }

  return <>{children}</>;
}
