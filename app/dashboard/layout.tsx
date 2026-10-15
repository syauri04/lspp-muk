"use client";

import { SWRConfig } from "swr";
import AuthGuard from "@/components/auth/AuthGuard";
import { DashboardLayoutWrapper } from "@/components/layout/DashboardLayoutWrapper";
import { statusError } from "@/lib/api/axios";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SWRConfig
        value={{
          revalidateOnFocus: true,
          // Error 4xx (404 bukan milik user, 403, 422) tidak akan berubah dengan retry.
          onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
            const status = statusError(error);
            if (status !== null && status >= 400 && status < 500) return;
            if (retryCount >= 3) return;
            setTimeout(() => revalidate({ retryCount }), 2000 * (retryCount + 1));
          },
        }}
      >
        <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
      </SWRConfig>
    </AuthGuard>
  );
}
