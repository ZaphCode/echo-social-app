export function throwIfError(
  error: { message: string } | null
): asserts error is null {
  if (error) {
    throw new Error(error.message);
  }
}

export function isAuthError(error: unknown) {
  if (!error) return false;

  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  return (
    normalized.includes("jwt") ||
    normalized.includes("auth") ||
    normalized.includes("permission") ||
    normalized.includes("not authorized") ||
    normalized.includes("row-level security")
  );
}
