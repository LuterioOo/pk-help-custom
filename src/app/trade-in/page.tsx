import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { DeferredChrome } from "@/components/layout/deferred-chrome";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TradeInPage } from "@/components/sections/trade-in-page";

export default async function TradeInNoLocaleRoute() {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <DeferredChrome />
        <Header />
        <main className="relative z-10 min-h-screen">
          <TradeInPage />
        </main>
        <Footer />
      </Providers>
    </NextIntlClientProvider>
  );
}

