import { setRequestLocale } from "next-intl/server";
import { TradeInPage } from "@/components/sections/trade-in-page";

type Props = { params: Promise<{ locale: string }> };

export default async function TradeInRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TradeInPage />;
}

