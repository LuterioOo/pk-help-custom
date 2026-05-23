import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Preloader } from "@/components/ui/preloader";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <Preloader />
        <AnimatedBackground />
        <Header />
        <main className="relative z-10 min-h-screen">{children}</main>
        <Footer />
        <ScrollToTop />
      </Providers>
    </NextIntlClientProvider>
  );
}
