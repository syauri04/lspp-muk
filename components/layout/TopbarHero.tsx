"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL } from "@/types/auth";
import { getBreadcrumbFromPath } from "@/lib/navigation";
import { ChevronRight } from "lucide-react";

export function TopbarHero() {
  const pathname = usePathname();
  const { user } = useAuth();

  const breadcrumbs = getBreadcrumbFromPath(pathname);
  const currentTitle =
    breadcrumbs.length > 0
      ? breadcrumbs[breadcrumbs.length - 1].label
      : "Beranda";

  return (
    <div className="relative min-h-35 md:h-40 bg-[#5C723D] flex items-center px-4 sm:px-8 py-6 md:py-0 overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-[url('/images/topbar.png')] bg-cover bg-right opacity-40" />
      <div className="absolute inset-0 bg-linear-to-r from-[#5C723D] 0% via-[#5C723D]/80 35% to-transparent 70%" />

      <div className="relative max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 md:gap-12 z-10">
        <div className="flex items-center sm:flex-col sm:items-center gap-3 sm:gap-1 shrink-0">
          <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-white/30 overflow-hidden relative shadow-md">
            <Image
              src={user?.avatar_url || "/images/avatar.png"}
              alt={user?.name || "Foto profil"}
              width={80}
              height={80}
              unoptimized={!!user?.avatar_url}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left sm:text-center text-white">
            <p className="font-bold text-xs sm:text-sm leading-tight">
              {user?.name}
            </p>
            <p className="text-[11px] sm:text-xs opacity-80">
              {user ? ROLE_LABEL[user.role] : ""}
            </p>
          </div>
        </div>

        {/* Dynamic Breadcrumbs & Page Heading */}
        <div className="text-white flex flex-col justify-center">
          <nav className="text-xs sm:text-sm opacity-90 mb-1 flex items-center flex-wrap gap-1">
            <Link
              href="/dashboard"
              className="hover:underline opacity-80 hover:opacity-100"
            >
              LSPP
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.href} className="inline-flex items-center gap-1">
                <ChevronRight size={12} className="opacity-60" />
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-white">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:underline opacity-80 hover:opacity-100"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {currentTitle}
          </h1>
        </div>
      </div>
    </div>
  );
}
