"use client";

import { useState } from "react";

export function PasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      setError(true);
      setPassword("");
    }
    setLoading(false);
  }

  return (
    <html>
      <body>
        <div className="fixed inset-0 bg-offwhite flex flex-col items-center justify-center px-6">
          <p className="text-gris text-sm mb-10 text-center">
            Mot de passe requis pour accéder au site
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-xs">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Mot de passe"
              autoFocus
              className={`w-full bg-transparent border-b ${
                error ? "border-red-400" : "border-gris/30 focus:border-noir"
              } text-noir text-center text-sm py-3 outline-none placeholder:text-gris/40 transition-colors`}
            />

            {error && (
              <p className="text-red-400 text-xs text-center mt-3">
                Mot de passe incorrect
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full mt-8 py-3 border border-noir text-noir text-xs uppercase tracking-widest hover:bg-noir hover:text-offwhite transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              {loading ? "..." : "Entrer"}
            </button>
          </form>
        </div>
      </body>
    </html>
  );
}
