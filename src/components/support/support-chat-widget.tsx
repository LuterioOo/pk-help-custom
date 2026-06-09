"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getFaqReply, type SupportLocale } from "@/lib/support-faq-bot";
import type { SupportTopic } from "@prisma/client";

type ChatLine = { id: string; role: "user" | "bot"; text: string };

const TOPICS: SupportTopic[] = [
  "PC_BUILD",
  "TRADE_IN",
  "INSTALLMENT",
  "READY_PC",
  "SERVICE",
  "OTHER",
];

function isHomeWithCta(pathname: string) {
  const base = pathname.replace(/\/$/, "") || "/";
  return base === "/" || /^\/(ru|uk|en|pl)$/.test(base);
}

export function SupportChatWidget() {
  const t = useTranslations("supportChat");
  const locale = useLocale() as SupportLocale;
  const pathname = usePathname() ?? "";

  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState<SupportTopic>("OTHER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasMobileCta = isHomeWithCta(pathname);

  useEffect(() => {
    if (open && lines.length === 0) {
      setLines([{ id: "welcome", role: "bot", text: t("welcome") }]);
    }
  }, [open, lines.length, t]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, showForm]);

  const addBot = useCallback((text: string) => {
    setLines((prev) => [...prev, { id: `bot-${Date.now()}`, role: "bot", text }]);
  }, []);

  const handleQuickAsk = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setLines((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", text }]);
    setInput("");
    const reply = getFaqReply(text, locale);
    setTimeout(() => addBot(reply), 400);
  }, [input, locale, addBot]);

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (text.length < 3) {
      toast.error(t("needMessage"));
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          topic,
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          telegram: telegram.trim() || undefined,
          locale,
          currentPage: typeof window !== "undefined" ? window.location.href : pathname,
        }),
      });

      if (res.status === 429) {
        toast.error(t("errorRateLimit"));
        return;
      }
      if (!res.ok) {
        toast.error(t("error"));
        return;
      }

      setLines((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", text }]);
      setInput("");
      toast.success(t("sentToast"), {
        description: t("sentToastDesc"),
        duration: 5000,
      });
      addBot(t("sentBotReply"));
      setName("");
      setPhone("");
      setTelegram("");
      setShowForm(false);
    } catch {
      toast.error(t("error"));
    } finally {
      setSending(false);
    }
  }, [input, topic, name, phone, telegram, locale, pathname, t, addBot]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (showForm) void handleSubmit();
      else handleQuickAsk();
    }
  };

  const bottomOffset = hasMobileCta
    ? "bottom-[calc(var(--mobile-bottom-cta-height)+env(safe-area-inset-bottom)+0.75rem)]"
    : "bottom-[max(0.75rem,env(safe-area-inset-bottom))]";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[47] bg-black/50 md:bg-transparent md:pointer-events-none"
            onClick={() => setOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t("title")}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={cn(
              "fixed z-[48] flex flex-col overflow-hidden pointer-events-auto",
              "glass-strong border border-yellow-500/20 shadow-[0_8px_40px_rgba(0,0,0,0.55)]",
              "md:right-5 md:w-[min(100vw-2rem,380px)] md:rounded-2xl md:max-h-[min(560px,calc(100vh-6rem))]",
              "inset-x-0 rounded-t-2xl max-h-[min(72vh,520px)]",
              bottomOffset,
              "md:bottom-20 md:inset-x-auto"
            )}
          >
            <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10 shrink-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-yellow-300 truncate">{t("title")}</p>
                <p className="text-[11px] text-zinc-500 truncate">{t("subtitle")}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors tap-scale"
                aria-label={t("close")}
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-0">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className={cn(
                    "max-w-[88%] text-[13px] leading-snug px-3 py-2 rounded-xl",
                    line.role === "bot"
                      ? "bg-white/[0.06] text-zinc-200 rounded-bl-sm mr-auto"
                      : "bg-yellow-500/15 text-yellow-50 border border-yellow-500/20 rounded-br-sm ml-auto"
                  )}
                >
                  {line.text}
                </div>
              ))}

              {showForm && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] text-zinc-500 px-1">{t("topicLabel")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPICS.map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setTopic(tp)}
                        className={cn(
                          "text-[10px] px-2 py-1 rounded-lg border transition-colors tap-scale",
                          topic === tp
                            ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-200"
                            : "border-white/10 text-zinc-400 hover:border-white/20"
                        )}
                      >
                        {t(`topics.${tp}`)}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowContacts((v) => !v)}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 px-1"
                  >
                    <ChevronDown className={cn("w-3 h-3 transition-transform", showContacts && "rotate-180")} />
                    {t("contactsOptional")}
                  </button>

                  {showContacts && (
                    <div className="grid gap-2">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("namePlaceholder")}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-zinc-200 placeholder:text-zinc-600 focus:border-yellow-500/40 outline-none"
                      />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("phonePlaceholder")}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-zinc-200 placeholder:text-zinc-600 focus:border-yellow-500/40 outline-none"
                      />
                      <input
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder={t("telegramPlaceholder")}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-zinc-200 placeholder:text-zinc-600 focus:border-yellow-500/40 outline-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-white/10 p-3 space-y-2">
              {!showForm ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="text-[11px] text-yellow-400/90 hover:text-yellow-300 transition-colors"
                >
                  {t("leaveRequest")}
                </button>
              ) : null}

              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder={showForm ? t("messagePlaceholder") : t("askPlaceholder")}
                  className="flex-1 resize-none px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-zinc-200 placeholder:text-zinc-600 focus:border-yellow-500/40 outline-none max-h-24"
                />
                <button
                  type="button"
                  disabled={sending || !input.trim()}
                  onClick={() => (showForm ? void handleSubmit() : handleQuickAsk())}
                  className={cn(
                    "shrink-0 p-2.5 rounded-xl transition-all tap-scale",
                    "btn-theme-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                  aria-label={showForm ? t("send") : t("ask")}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("close") : t("open")}
        aria-expanded={open}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "fixed z-[48] pointer-events-auto flex items-center gap-2 tap-scale",
          "rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.45)]",
          "btn-theme-primary font-semibold",
          "right-4 md:right-5",
          bottomOffset,
          "md:bottom-5",
          open ? "px-3 py-3" : "px-4 py-3",
          open && "max-md:opacity-0 max-md:pointer-events-none"
        )}
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm max-md:hidden">{t("button")}</span>
            <span className="text-sm md:hidden">{t("buttonShort")}</span>
          </>
        )}
      </motion.button>
    </>
  );
}
