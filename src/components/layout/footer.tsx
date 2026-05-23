"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "./language-switcher";
import { Send, Mail, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const base = locale === "ru" ? "" : `/${locale}`;
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Logo href={base || "/"} />
            <p className="mt-4 text-sm text-zinc-500">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-4">{t("nav.home")}</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              {(["builder", "advantages", "reviews", "contact"] as const).map((id) => (
                <li key={id}>
                  <Link href={`${base}#${id === "contact" ? "contacts" : id}`} className="hover:text-yellow-400 transition-colors">
                    {t(`nav.${id}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-4">{t("contacts.title")}</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-yellow-400" />
                <a href="tel:+48777777777" className="hover:text-white">+48 777 777 777</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                <a href="mailto:pk-help@gmail.com" className="hover:text-white">pk-help@gmail.com</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-4">{t("common.language")}</h4>
            <LanguageSwitcher className="mb-4" />
            <div className="flex gap-3">
              <a
                href={process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg glass hover:neon-border text-yellow-400 transition-all"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg glass hover:neon-border text-yellow-400 transition-all"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-600">
          <span>&copy; {year} PK-HELP Custom. {t("footer.rights")}</span>
          <Link href={`${base}/admin`} className="hover:text-zinc-400 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
