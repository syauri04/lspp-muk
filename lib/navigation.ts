import { ClipboardList, Home, Info, List, ListChecks } from "lucide-react";
import type { NavSection } from "@/types/navigation";
import type { MukRole } from "@/types/auth";
import type { Penilaian } from "@/types/penilaian";

export function penilaianHref(id: number | string): string {
  return `/dashboard/penilaian/${id}`;
}

export function metodeHref(id: number | string): string {
  return `/dashboard/penilaian/${id}/metode`;
}

export function dokumenHref(id: number | string, slug: string): string {
  return `/dashboard/penilaian/${id}/dokumen/${slug}`;
}

/** Sub-menu bagian formulir (anchor) per dokumen. */
const BAGIAN_DOKUMEN: Record<string, { name: string; anchor: string }[]> = {
  "apl-01": [
    { name: "Rincian Data Permohonan Sertifikasi", anchor: "rincian" },
    { name: "Data Sertifikasi", anchor: "data-sertifikasi" },
    { name: "Bukti Kelengkapan Pemohon", anchor: "bukti-kelengkapan" },
  ],
};

/** "apl-01" -> "FR.APL.01", "ia-04a" -> "FR.IA.04A" */
export function kodeDariSlug(slug: string): string {
  return `FR.${slug.toUpperCase().replace("-", ".")}`;
}

/**
 * Menu sidebar per peran. Grup "Dokumen Sertifikasi" dibangun dari data API
 * (bukan hardcode), sehingga dokumen baru (MAPA, AK, IA) muncul otomatis.
 */
export function buildNavigation(role: MukRole | null, penilaian?: Penilaian | null): NavSection[] {
  const sections: NavSection[] = [
    {
      title: "Menu",
      items: [
        {
          name: role === "asesor" ? "Daftar Asesmen" : "Sertifikasi Saya",
          href: "/dashboard",
          icon: Home,
          exact: true,
        },
        { name: "Informasi", href: "/dashboard/informasi", icon: Info },
        { name: "Skema Informasi", href: "/dashboard/skema", icon: List },
      ],
    },
  ];

  if (penilaian) {
    sections.push({
      title: "Dokumen Sertifikasi",
      items: [
        { name: "Ringkasan", href: penilaianHref(penilaian.id), icon: ClipboardList, exact: true },
        ...penilaian.dokumen.map((d) => ({
          name: d.kode,
          href: dokumenHref(penilaian.id, d.slug),
          usePageBadge: true,
          status: d.status,
          locked: !!d.terkunci,
          lockedReason: d.alasan_terkunci,
          children: BAGIAN_DOKUMEN[d.slug]?.map((b) => ({
            name: b.name,
            href: `${dokumenHref(penilaian.id, d.slug)}#${b.anchor}`,
          })),
        })),
        // Asesor: tentukan metode asesmen setelah FR.APL.02 "dapat dilanjutkan".
        ...(role === "asesor"
          ? [
              {
                name: "Tentukan Metode",
                href: metodeHref(penilaian.id),
                icon: ListChecks,
                exact: true,
                locked: !penilaian.metode_asesmen && !penilaian.aksi_metode?.bisa,
                lockedReason: penilaian.aksi_metode?.alasan ?? null,
                badgeText: penilaian.metode_asesmen?.toUpperCase(),
              },
            ]
          : []),
      ],
    });
  }

  return sections;
}

export function isNavItemActive(href: string, pathname: string, exact = false): boolean {
  if (pathname === href) return true;
  return !exact && pathname.startsWith(href + "/");
}

const LABEL_SEGMEN: Record<string, string> = {
  dashboard: "Dashboard",
  informasi: "Informasi",
  skema: "Skema Informasi",
  kategori: "Kategori",
  penilaian: "Penilaian",
  metode: "Tentukan Metode",
  profile: "Profil Pengguna",
  settings: "Pengaturan",
};

export function getBreadcrumbFromPath(pathname: string): { label: string; href: string }[] {
  const parts = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];
  let accumulatedPath = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    accumulatedPath += `/${part}`;

    // Segmen "dokumen" tidak punya halaman sendiri.
    if (part === "dokumen") continue;

    let label: string;
    if (LABEL_SEGMEN[part]) label = LABEL_SEGMEN[part];
    else if (parts[i - 1] === "penilaian" && /^\d+$/.test(part)) label = `#${part}`;
    else if (parts[i - 1] === "dokumen") label = kodeDariSlug(part);
    else label = part.charAt(0).toUpperCase() + part.slice(1);

    breadcrumbs.push({ label, href: accumulatedPath });
  }

  return breadcrumbs;
}
