"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePenilaianDetail } from "@/lib/hooks/usePenilaian";
import { buildNavigation, isNavItemActive } from "@/lib/navigation";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import type { NavItem } from "@/types/navigation";

interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

function PageBadgeIcon({ active = false }: { active?: boolean }) {
  return (
    <span
      className={`shrink-0 flex items-center justify-center w-4 h-4 rounded-[3px] transition-colors ${
        active ? "bg-[#8AA53C]" : "bg-[#8A909D]"
      }`}
    >
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
        <rect x="1.5" y="2" width="7" height="1.2" rx="0.4" />
        <rect x="1.5" y="4.4" width="7" height="1.2" rx="0.4" />
        <rect x="1.5" y="6.8" width="5" height="1.2" rx="0.4" />
      </svg>
    </span>
  );
}

const itemBase = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all";
const itemActive = "bg-[#F2F5E9] border border-[#8AA53C] text-[#5A7A22] font-bold";
const itemIdle = "text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent";

function SidebarItem({ item, pathname, onClick }: { item: NavItem; pathname: string; onClick?: () => void }) {
  const Icon = item.icon;
  const active = isNavItemActive(item.href, pathname, item.exact);

  const icon = item.usePageBadge ? (
    <PageBadgeIcon active={active} />
  ) : Icon ? (
    <Icon size={16} className={active ? "text-[#8AA53C]" : "text-gray-400"} />
  ) : null;

  if (item.locked) {
    return (
      <div
        className={`${itemBase} ${itemIdle} opacity-60 cursor-not-allowed`}
        title={item.lockedReason ?? "Terkunci"}
        aria-disabled
      >
        {icon}
        <span className="flex-1 truncate">{item.name}</span>
        <Lock size={13} className="text-gray-400 shrink-0" aria-label="Terkunci" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Link href={item.href} onClick={onClick} aria-current={active ? "page" : undefined} className={`${itemBase} ${active ? itemActive : itemIdle}`}>
        {icon}
        <span className="flex-1 truncate">{item.name}</span>
        {item.status && <DokumenStatusBadge status={item.status} className="text-[10px] px-1.5" />}
        {item.badgeText && (
          <span className="px-1.5 py-0.5 rounded-full border border-[#8AA53C]/40 bg-[#F2F5E9] text-[10px] font-bold text-[#5A7A22]">
            {item.badgeText}
          </span>
        )}
      </Link>
      {active && item.children && item.children.length > 0 && (
        <SubMenuBagian items={item.children} onClick={onClick} />
      )}
    </div>
  );
}

/**
 * Sub-menu bagian formulir (anchor). Klik = scroll halus ke bagian;
 * bagian aktif mengikuti scroll-spy halaman (event "apl01-section-change").
 */
function SubMenuBagian({ items, onClick }: { items: NonNullable<NavItem["children"]>; onClick?: () => void }) {
  const [aktif, setAktif] = useState<string>(() =>
    typeof window !== "undefined" && window.location.hash ? window.location.hash.slice(1) : (items[0]?.href.split("#")[1] ?? ""),
  );

  useEffect(() => {
    const onSection = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setAktif(detail);
    };
    window.addEventListener("apl01-section-change", onSection);
    return () => window.removeEventListener("apl01-section-change", onSection);
  }, []);

  return (
    <div className="pl-6 space-y-2 py-1 my-1">
      {items.map((child) => {
        const anchor = child.href.split("#")[1];
        const childActive = aktif === anchor;
        return (
          <a
            key={child.href}
            href={child.href}
            onClick={(e) => {
              onClick?.();
              const el = document.getElementById(anchor);
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                setAktif(anchor);
                window.history.replaceState(null, "", `#${anchor}`);
              }
            }}
            className={`flex items-start gap-2.5 text-xs py-1 transition-colors ${
              childActive ? "text-[#5A7A22] font-bold" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span className="mt-0.5">
              <PageBadgeIcon active={childActive} />
            </span>
            <span className="leading-snug">{child.name}</span>
          </a>
        );
      })}
    </div>
  );
}

export function Sidebar({ onItemClick, className = "" }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams<{ id?: string }>();
  const { role } = useAuth();

  // Hanya di bawah /dashboard/penilaian/[id] menu dokumen ditampilkan.
  const penilaianId = pathname.startsWith("/dashboard/penilaian/") ? params?.id : undefined;
  const { data: penilaian, isLoading } = usePenilaianDetail(penilaianId);

  const sections = buildNavigation(role, penilaian);

  return (
    <aside className={`w-64 bg-white border-r border-gray-100 flex flex-col h-full overflow-y-auto select-none ${className}`}>
      <nav className="p-4 space-y-6 flex-1" aria-label="Navigasi utama">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-bold text-gray-700 mb-2 px-1">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onItemClick} />
              ))}
            </div>
          </div>
        ))}

        {penilaianId && isLoading && !penilaian && (
          <p className="px-1 text-xs text-gray-400">Memuat dokumen...</p>
        )}
      </nav>
    </aside>
  );
}
