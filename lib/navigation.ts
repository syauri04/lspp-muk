import { Home, List } from "lucide-react";
import { NavSection } from "@/types/navigation";

export const NAVIGATION_CONFIG: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        name: "Home",
        href: "/dashboard",
        icon: Home,
      },
      {
        name: "Informasi",
        href: "/dashboard/informasi",
        icon: List,
      },
      {
        name: "Skema Informasi",
        href: "/dashboard/skema",
        icon: List,
      },
    ],
  },
  {
    title: "Pages",
    items: [
      {
        name: "FR.APL.01",
        href: "/dashboard/fr/apl-01",
        usePageBadge: true,
        children: [
          {
            name: "Rincian Data Permohonan Sertifikasi",
            href: "/dashboard/fr/apl-01#rincian",
          },
          {
            name: "Data Sertifikasi",
            href: "/dashboard/fr/apl-01#data-sertifikasi",
          },
          {
            name: "Bukti Kelengkapan Pemohon",
            href: "/dashboard/fr/apl-01#bukti-kelengkapan",
          },
        ],
      },
      { name: "FR.APL.02", href: "/dashboard/fr/apl-02", usePageBadge: true },
      { name: "FR.MAPA.01", href: "/dashboard/fr/mapa-01", usePageBadge: true },
      { name: "FR.MAPA.02", href: "/dashboard/fr/mapa-02", usePageBadge: true },

      { name: "FR.AK.01", href: "/dashboard/fr/ak-01", usePageBadge: true },
      { name: "FR.AK.02", href: "/dashboard/fr/ak-02", usePageBadge: true },
      { name: "FR.AK.03", href: "/dashboard/fr/ak-03", usePageBadge: true },
      { name: "FR.AK.04", href: "/dashboard/fr/ak-04", usePageBadge: true },
      { name: "FR.AK.05", href: "/dashboard/fr/ak-05", usePageBadge: true },
      { name: "FR.AK.06", href: "/dashboard/fr/ak-06", usePageBadge: true },
      { name: "FR.AK.07", href: "/dashboard/fr/ak-07", usePageBadge: true },
      { name: "FR.IA.01", href: "/dashboard/fr/ia-01", usePageBadge: true },
      { name: "FR.IA.02", href: "/dashboard/fr/ia-02", usePageBadge: true },
      { name: "FR.IA.03", href: "/dashboard/fr/ia-03", usePageBadge: true },
      { name: "FR.IA.04A", href: "/dashboard/fr/ia-04a", usePageBadge: true },
      { name: "FR.IA.04B", href: "/dashboard/fr/ia-04b", usePageBadge: true },
      { name: "FR.IA.06A", href: "/dashboard/fr/ia-06a", usePageBadge: true },
      { name: "FR.IA.06B", href: "/dashboard/fr/ia-06b", usePageBadge: true },
      { name: "FR.IA.06C", href: "/dashboard/fr/ia-06c", usePageBadge: true },
      { name: "FR.IA.08", href: "/dashboard/fr/ia-08", usePageBadge: true },
      { name: "FR.IA.09", href: "/dashboard/fr/ia-09", usePageBadge: true },
      { name: "FR.IA.10", href: "/dashboard/fr/ia-10", usePageBadge: true },
    ],
  },
];

export function isNavItemActive(
  href: string | undefined,
  pathname: string,
): boolean {
  if (!href) return false;
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (pathname === href) {
    return true;
  }
  if (
    href === "/dashboard/fr/apl-01" &&
    (pathname === "/dashboard/fr/apl-01" ||
      pathname.startsWith("/dashboard/fr/apl-01/"))
  ) {
    return true;
  }
  return pathname.startsWith(href + "/");
}

export function getBreadcrumbFromPath(
  pathname: string,
): { label: string; href: string }[] {
  const parts = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];

  let accumulatedPath = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    accumulatedPath += `/${part}`;

    let label = part;
    if (part === "dashboard") label = "Dashboard";
    else if (part === "informasi") label = "Informasi";
    else if (part === "skema") label = "Skema Informasi";
    else if (part === "kategori") label = "Kategori";
    else if (part === "fr") label = "Pages";
    else if (part === "apl-01") label = "FR.APL.01";
    else if (part === "apl-02") label = "FR.APL.02";
    else if (part === "mapa-01") label = "FR.MAPA.01";
    else if (part === "mapa-02") label = "FR.MAPA.02";
    else if (part.startsWith("ak-"))
      label = `FR.AK.${part.replace("ak-", "").padStart(2, "0")}`;
    else if (part.startsWith("ia-"))
      label = `FR.IA.${part.replace("ia-", "").toUpperCase()}`;
    else if (part === "va") label = "FR.VA";
    else if (part === "rincian") label = "Rincian Data Permohonan";
    else if (part === "data-sertifikasi") label = "Data Sertifikasi";
    else if (part === "bukti-kelengkapan") label = "Bukti Kelengkapan Pemohon";
    else if (part === "profile") label = "Profil Pengguna";
    else if (part === "settings") label = "Pengaturan";
    else {
      label = part.charAt(0).toUpperCase() + part.slice(1);
    }

    breadcrumbs.push({
      label,
      href: accumulatedPath,
    });
  }

  return breadcrumbs;
}
