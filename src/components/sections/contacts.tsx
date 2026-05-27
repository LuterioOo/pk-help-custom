"use client";

import { useTranslations } from "next-intl";
import { Phone, Mail, Send } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Contacts() {
  const t = useTranslations("contacts");
  const mapsEmbed =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL?.trim() ?? "";
  const mapsUrl =
    mapsEmbed.length > 0
      ? mapsEmbed
      : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443!2d21!3d52.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1";

  return (
    <section id="contacts" className="section-pad px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-5 md:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold neon-text">{t("title")}</h2>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
          <ScrollReveal>
            <div className="glass rounded-2xl p-5 sm:p-6 space-y-4 h-full">
              <a
                href="tel:+48777777777"
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:neon-border">
                  <Phone className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{t("phone")}</p>
                  <p className="text-lg font-medium">+48 777 777 777</p>
                </div>
              </a>
              <a
                href="mailto:pk-help@gmail.com"
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:neon-border">
                  <Mail className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{t("email")}</p>
                  <p className="text-lg font-medium">pk-help@gmail.com</p>
                </div>
              </a>
              <div className="flex gap-4 pt-4">
                <a
                  href={process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl glass hover:neon-border text-yellow-300 transition-all"
                >
                  <Send className="w-5 h-5" />
                  {t("telegram")}
                </a>
                <a
                  href={process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl glass hover:neon-border text-yellow-300 transition-all"
                >
                  <InstagramIcon />
                  {t("instagram")}
                </a>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="glass rounded-2xl overflow-hidden h-[320px] lg:h-full min-h-[280px] neon-border">
              <iframe
                title={t("map")}
                src={mapsUrl}
                className="w-full h-full border-0 grayscale-[30%] contrast-[1.1]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
