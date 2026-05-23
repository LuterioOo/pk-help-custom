import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }
  const allMessages = (await import("../messages")).default;
  return {
    locale,
    messages: allMessages[locale as keyof typeof allMessages],
  };
});
