export const DEFAULT_AFTER_LOGIN = "/dashboard";

/**
 * Hanya izinkan path internal ("/dashboard/...") sebagai tujuan setelah login,
 * untuk mencegah open redirect (mis. ?redirect=//situs-jahat.com).
 */
export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (value.startsWith("/login")) return null;
  return value;
}

export function loginUrlFor(currentPath: string | null | undefined): string {
  const target = safeReturnTo(currentPath);
  return target ? `/login?redirect=${encodeURIComponent(target)}` : "/login";
}
