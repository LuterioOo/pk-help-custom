"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { adminUrl } from "@/lib/admin-path";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function AdminLoginPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error();
      window.location.href = adminUrl(locale, "dashboard");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass rounded-2xl p-8 neon-border">
        <div className="flex justify-center mb-8">
          <Logo href={undefined} />
        </div>
        <h1 className="text-xl font-semibold text-center mb-6">{t("login")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">{t("username")}</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl glass border border-white/10 bg-transparent"
              required
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl glass border border-white/10 bg-transparent"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" isLoading={loading}>
            {t("submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
