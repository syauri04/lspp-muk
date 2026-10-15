"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import type { LoginCredentials, MukRole, User } from "@/types/auth";
import {
  cleanupLegacyStorage,
  getStoredSession,
  removeStoredAuth,
  setStoredAuth,
  setStoredUser,
} from "@/lib/auth/authStore";
import { mukAuth } from "@/lib/api/muk";
import { UNAUTHORIZED_EVENT, statusError } from "@/lib/api/axios";

interface AuthContextType {
  user: User | null;
  role: MukRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: MukRole, credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// setTimeout maksimal ~24,8 hari; token MUK hanya 8 jam jadi aman, tapi tetap dibatasi.
const MAX_TIMEOUT = 2_147_483_647;

/** Kosongkan cache SWR agar data user sebelumnya tidak terlihat oleh user berikutnya. */
function clearDataCache() {
  void mutate(() => true, undefined, { revalidate: false });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = useCallback(() => {
    removeStoredAuth();
    setUser(null);
    clearDataCache();
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
  }, []);

  const scheduleExpiry = useCallback(
    (expiresAt: string | null) => {
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
      if (!expiresAt) return;
      const ms = new Date(expiresAt).getTime() - Date.now();
      expiryTimer.current = setTimeout(() => {
        clearSession();
        toast.info("Sesi Anda telah berakhir. Silakan masuk kembali.");
      }, Math.min(Math.max(ms, 0), MAX_TIMEOUT));
    },
    [clearSession],
  );

  // Bootstrap: validasi token tersimpan ke server lewat /me (user tersimpan bisa usang).
  useEffect(() => {
    cleanupLegacyStorage();
    const session = getStoredSession();

    if (!session) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    let aktif = true;
    mukAuth
      .me()
      .then((fresh) => {
        if (!aktif) return;
        setStoredUser(fresh);
        setUser(fresh);
        scheduleExpiry(session.expiresAt);
      })
      .catch((err) => {
        if (!aktif) return;
        // 401/403 = token tidak berlaku. Error jaringan: pakai data tersimpan, jangan paksa logout.
        const status = statusError(err);
        if (status === 401 || status === 403) clearSession();
        else if (session.user) {
          setUser(session.user);
          scheduleExpiry(session.expiresAt);
        }
      })
      .finally(() => aktif && setIsLoading(false));

    return () => {
      aktif = false;
    };
  }, [clearSession, scheduleExpiry]);

  // Token ditolak server di tengah sesi (kedaluwarsa / dicabut).
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      clearDataCache();
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  useEffect(() => () => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
  }, []);

  const login = useCallback(
    async (role: MukRole, credentials: LoginCredentials) => {
      const { token, user: loggedIn, expires_at } = await mukAuth.login(role, credentials);
      clearDataCache();
      setStoredAuth(token, loggedIn, expires_at);
      setUser(loggedIn);
      scheduleExpiry(expires_at);
      return loggedIn;
    },
    [scheduleExpiry],
  );

  const logout = useCallback(async () => {
    try {
      await mukAuth.logout();
    } catch {
      // Tetap hapus sesi lokal walau request gagal (token mungkin sudah tidak berlaku).
    }
    clearSession();
  }, [clearSession]);

  const value: AuthContextType = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
