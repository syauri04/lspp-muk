import type { User } from "@/types/auth";

/*
 * Penyimpanan sesi MUK di localStorage (per-origin, terpisah dari website utama).
 * Sengaja TIDAK disalin ke cookie: cookie yang ditulis JS tidak lebih aman dan
 * hanya menambah tempat token bisa bocor.
 * Semua akses dibungkus try/catch (private mode / storage diblokir).
 */

const TOKEN_KEY = "muk_token";
const USER_KEY = "muk_user";
const EXPIRES_KEY = "muk_expires_at";

// Kunci lama dari versi mock; dibersihkan saat aplikasi dimuat.
const LEGACY_KEYS = ["lspp_auth_token", "lspp_auth_user"];

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export interface StoredSession {
  token: string;
  user: User | null;
  expiresAt: string | null;
}

export function getStoredToken(): string | null {
  try {
    return storage()?.getItem(TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function getStoredSession(): StoredSession | null {
  const s = storage();
  if (!s) return null;
  try {
    const token = s.getItem(TOKEN_KEY);
    if (!token) return null;

    const expiresAt = s.getItem(EXPIRES_KEY);
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      removeStoredAuth();
      return null;
    }

    const userStr = s.getItem(USER_KEY);
    return { token, user: userStr ? (JSON.parse(userStr) as User) : null, expiresAt };
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User, expiresAt: string | null): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(TOKEN_KEY, token);
    s.setItem(USER_KEY, JSON.stringify(user));
    if (expiresAt) s.setItem(EXPIRES_KEY, expiresAt);
    else s.removeItem(EXPIRES_KEY);
  } catch {
    // storage penuh / diblokir: sesi tetap jalan di memori sampai reload.
  }
}

export function setStoredUser(user: User): void {
  try {
    storage()?.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* abaikan */
  }
}

export function removeStoredAuth(): void {
  const s = storage();
  if (!s) return;
  try {
    [TOKEN_KEY, USER_KEY, EXPIRES_KEY, ...LEGACY_KEYS].forEach((k) => s.removeItem(k));
  } catch {
    /* abaikan */
  }
}

export function cleanupLegacyStorage(): void {
  const s = storage();
  if (!s) return;
  try {
    LEGACY_KEYS.forEach((k) => s.removeItem(k));
  } catch {
    /* abaikan */
  }
  // Hapus cookie token dari versi mock.
  if (typeof document !== "undefined") {
    document.cookie = "lspp_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
  }
}
