"use client";

import { useTranslations } from "next-intl";
import { parseOrderComponents, sumComponents } from "@/lib/order-components";

type Props = {
  selectedComponents?: unknown;
  buildJson?: unknown;
  totalPrice?: number | null;
};

export function OrderComponentsTable({ selectedComponents, buildJson, totalPrice }: Props) {
  const t = useTranslations("admin.orderComponents");
  const components = parseOrderComponents({ selectedComponents, buildJson });

  if (components.length === 0) {
    return <p className="text-sm text-zinc-500 italic">{t("noData")}</p>;
  }

  const { componentsSum, finalSum } = sumComponents(components);
  const displayTotal = totalPrice ?? finalSum;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-yellow-300">{t("title")}</h4>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm text-left min-w-[520px]">
          <thead>
            <tr className="text-zinc-500 border-b border-white/10">
              <th className="px-3 py-2 font-medium">{t("category")}</th>
              <th className="px-3 py-2 font-medium">{t("component")}</th>
              <th className="px-3 py-2 font-medium text-right">{t("marketPrice")}</th>
              <th className="px-3 py-2 font-medium text-right">{t("markup")}</th>
              <th className="px-3 py-2 font-medium text-right">{t("finalPrice")}</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={`${c.category}-${c.name}`} className="border-b border-white/5 text-zinc-300">
                <td className="px-3 py-2 text-yellow-400/90">{c.category}</td>
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2 text-right">{c.price.toLocaleString("pl-PL")} PLN</td>
                <td className="px-3 py-2 text-right">{c.markup.toLocaleString("pl-PL")} PLN</td>
                <td className="px-3 py-2 text-right text-yellow-300">
                  {c.finalPrice.toLocaleString("pl-PL")} PLN
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-zinc-400 border-t border-white/10">
              <td colSpan={2} className="px-3 py-2 font-medium">
                {t("componentsSum")}
              </td>
              <td className="px-3 py-2 text-right font-medium">
                {componentsSum.toLocaleString("pl-PL")} PLN
              </td>
              <td colSpan={2} />
            </tr>
            <tr className="text-yellow-300">
              <td colSpan={4} className="px-3 py-2 font-medium">
                {t("buildTotal")}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                {displayTotal.toLocaleString("pl-PL")} PLN
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}