"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import type { SupportMessageStatus, SupportTopic } from "@prisma/client";

type SupportRow = {
  id: string;
  name: string | null;
  phone: string | null;
  telegram: string | null;
  message: string;
  topic: SupportTopic;
  locale: string;
  currentPage: string | null;
  status: SupportMessageStatus;
  createdAt: string;
};

const STATUSES: SupportMessageStatus[] = ["NEW", "IN_PROGRESS", "ANSWERED", "CLOSED"];

export function SupportPanel() {
  const t = useTranslations("admin.support");
  const [messages, setMessages] = useState<SupportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === "all"
          ? "/api/admin/support"
          : `/api/admin/support?status=${statusFilter}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.status === 401) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: SupportMessageStatus) => {
    await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/admin/support?id=${id}`, { method: "DELETE" });
    void load();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="space-y-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl glass text-sm"
        >
          <option value="all">{t("filterAll")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
        <p className="text-zinc-500 text-sm py-8 text-center">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 rounded-xl glass text-sm"
      >
        <option value="all">{t("filterAll")}</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(`status.${s}`)}
          </option>
        ))}
      </select>

      {messages.map((m) => (
        <div
          key={m.id}
          className="glass rounded-2xl p-4 border border-white/10 space-y-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-lg bg-yellow-500/15 text-yellow-300 border border-yellow-500/25">
                  {t(`topics.${m.topic}`)}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
                <span className="text-xs text-zinc-600 uppercase">{m.locale}</span>
              </div>
              {(m.name || m.phone || m.telegram) && (
                <p className="text-sm text-zinc-300">
                  {[m.name, m.phone, m.telegram].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={m.status}
                onChange={(e) => void updateStatus(m.id, e.target.value as SupportMessageStatus)}
                className="px-2 py-1 rounded-lg glass text-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}`)}
                  </option>
                ))}
              </select>
              <Button variant="ghost" size="sm" onClick={() => void remove(m.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-zinc-200 whitespace-pre-wrap">{m.message}</p>

          {m.currentPage && (
            <a
              href={m.currentPage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-yellow-400/80 hover:text-yellow-300 truncate block"
            >
              {m.currentPage}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
