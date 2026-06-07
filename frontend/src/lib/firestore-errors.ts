export function getFriendlyFirestoreError(
  error: unknown,
  fallback: string,
  permissionMessage = "We could not sync your private chat. Please refresh or sign in again.",
) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
  const message = error instanceof Error ? error.message : "";

  if (
    code.includes("permission-denied") ||
    message.toLowerCase().includes("missing or insufficient permissions")
  ) {
    return permissionMessage;
  }

  return error instanceof Error ? error.message : fallback;
}
