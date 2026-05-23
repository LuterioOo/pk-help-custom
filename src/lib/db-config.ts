export function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url || undefined;
}

export function assertDatabaseUrl(): void {
  if (!getDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured");
  }
}

export function isDatabaseError(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (["P1001", "P1003", "P1017", "P2021", "P2022"].includes(code)) return true;
  }
  if (!(error instanceof Error)) return false;
  const msg = error.message;
  return (
    msg.includes("DATABASE_URL is not configured") ||
    msg.includes("Can't reach database") ||
    msg.includes("does not exist in the current database") ||
    msg.includes("P1001") ||
    msg.includes("P1017") ||
    msg.includes("P2021") ||
    msg.includes("connection")
  );
}

export function isSchemaMissingError(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code: string }).code === "P2021";
  }
  if (error instanceof Error) {
    return error.message.includes("does not exist in the current database");
  }
  return false;
}
