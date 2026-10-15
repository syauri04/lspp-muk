"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginUrlFor } from "@/lib/auth/returnTo";
import { FullScreenLoader } from "@/components/ui/PageLoader";
import type { MukRole } from "@/types/auth";

/**
 * Guard client-side (token ada di localStorage, tidak terbaca di server/proxy).
 * Ini hanya untuk UX; keamanan sebenarnya ada di API (token + scope kepemilikan).
 */
export default function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: MukRole[];
}) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const roleDitolak = isAuthenticated && roles && role && !roles.includes(role);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const fullPath = typeof window !== "undefined" ? pathname + window.location.search : pathname;
      router.replace(loginUrlFor(fullPath));
    } else if (roleDitolak) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, roleDitolak, router, pathname]);

  if (isLoading || !isAuthenticated || roleDitolak) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
