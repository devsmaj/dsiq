export function getFriendlyFirestoreError(error: unknown, fallback: string) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
  const message = error instanceof Error ? error.message : "";

  if (
    code.includes("permission-denied") ||
    message.toLowerCase().includes("missing or insufficient permissions")
  ) {
    return "We could not sync your private chat. Please refresh or sign in again.";
  }

  return error instanceof Error ? error.message : fallback;
}
