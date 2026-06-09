import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/hero";
import { TradeInPreview } from "@/components/sections/trade-in-preview";
import { BuildsForSale } from "@/components/sections/builds-for-sale";
import { MasterBuilds } from "@/components/sections/master-builds";
import { Advantages } from "@/components/sections/advantages";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteUrl } from "@/lib/site-url";
import { getShowcaseData } from "@/lib/showcase-data";
import { getReviewsData } from "@/lib/reviews-data";
import { getMastersData } from "@/lib/masters-data";
import { SectionSkeleton } from "@/components/ui/section-skeleton";

const PcBuilder = dynamic(
  () => import("@/components/builder/pc-builder").then((m) => ({ default: m.PcBuilder })),
  { loading: () => <SectionSkeleton className="min-h-[360px]" /> }
);

const OrderForm = dynamic(
  () => import("@/components/sections/order-form").then((m) => ({ default: m.OrderForm })),
  { loading: () => <SectionSkeleton className="min-h-[280px]" /> }
);

const Reviews = dynamic(
  () => import("@/components/sections/reviews").then((m) => ({ default: m.Reviews })),
  { loading: () => <SectionSkeleton className="min-h-[240px]" /> }
);

const Contacts = dynamic(
  () => import("@/components/sections/contacts").then((m) => ({ default: m.Contacts })),
  { loading: () => <SectionSkeleton className="min-h-[180px]" /> }
);

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const base = getSiteUrl();
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    const path = l === routing.defaultLocale ? "" : `/${l}`;
    languages[l] = `${base}${path}`;
  }
  const canonicalPath = locale === routing.defaultLocale ? "" : `/${locale}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${base}${canonicalPath}`,
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale,
      url: `${base}${canonicalPath}`,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [showcase, reviews, masters] = await Promise.all([
    getShowcaseData(locale),
    getReviewsData(),
    getMastersData(locale),
  ]);

  return (
    <div className="home-fold">
      <Hero />
      <BuildsForSale initialItems={showcase.forSale} />
      <MasterBuilds initialMasters={masters} />
      <TradeInPreview />
      <Advantages />
      <PcBuilder />
      <Reviews initialReviews={reviews} />
      <OrderForm />
      <Contacts />
    </div>
  );
}
