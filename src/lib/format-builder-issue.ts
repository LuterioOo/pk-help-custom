import type { useTranslations } from "next-intl";

type BuilderT = ReturnType<typeof useTranslations<"builder">>;

export function formatBuilderIssue(
  t: BuilderT,
  messageKey: string,
  params?: Record<string, string | number>
): string {
  const values = params
    ? (Object.fromEntries(
        Object.entries(params).map(([k, v]) => [
          k,
          v != null && String(v).trim() !== "" ? String(v) : "-",
        ])
      ) as Record<string, string>)
    : undefined;

  return t(
    `issues.${messageKey}` as "issues.socketMismatch",
    values
  );
}
