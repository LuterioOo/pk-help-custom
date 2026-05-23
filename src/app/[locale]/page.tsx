import { Hero } from "@/components/sections/hero";
import { ShowcaseGallery } from "@/components/sections/showcase-gallery";
import { BuildsForSale } from "@/components/sections/builds-for-sale";
import { PcBuilder } from "@/components/builder/pc-builder";
import { Advantages } from "@/components/sections/advantages";
import { Reviews } from "@/components/sections/reviews";
import { OrderForm } from "@/components/sections/order-form";
import { Contacts } from "@/components/sections/contacts";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ShowcaseGallery />
      <BuildsForSale />
      <PcBuilder />
      <Advantages />
      <Reviews />
      <OrderForm />
      <Contacts />
    </>
  );
}
