"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { getLocalesForSite } from "@/lib/locale-path";
import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "./language-switcher";
import { Send, Mail, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const base = useLocaleBase();
  const pathname = usePathname();
  const [showLanguage, setShowLanguage] = useState(false);
  const year = new Date().getFullYear();

  const isHome = pathname === base || pathname === `${base}/` || pathname === "/";

  useEffect(() => {
    setShowLanguage(getLocalesForSite(window.location.hostname, pathname).length > 1);
  }, [pathname]);

  return (
    <footer className="relative z-10 border-t border-white/5 mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          <div>
            <Logo href={base || "/"} />
            <p className="mt-3 text-sm text-zinc-500">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">{t("nav.home")}</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              {(["tradeIn", "builder", "advantages", "reviews", "contact"] as const).map((id) => {
                const targetHash = id === "contact" ? "contacts" : id;
                const href =
                  id === "tradeIn"
                    ? `${base}/trade-in`
                    : isHome
                      ? `${base}#${targetHash}`
                      : `${base || "/"}/#${targetHash}`;
                return (
                  <li key={id}>
                    <Link href={href} className="hover:text-yellow-400 transition-colors">
                      {t(`nav.${id}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">{t("contacts.title")}</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-yellow-400" />
                <a href="tel:+48777777777" className="hover:text-white">
                  +48 777 777 777
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                <a href="mailto:pk-help@gmail.com" className="hover:text-white">
                  pk-help@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            {showLanguage ? (
              <>
                <h4 className="text-sm font-semibold text-zinc-300 mb-3">{t("common.language")}</h4>
                <LanguageSwitcher className="mb-3" />
              </>
            ) : null}
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

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-zinc-600">
          <span>
            &copy; {year} PK-HELP Custom. {t("footer.rights")}
          </span>
          <Link href={adminUrl(locale)} className="hover:text-zinc-400 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
