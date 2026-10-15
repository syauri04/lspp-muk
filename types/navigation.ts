import { type LucideIcon } from "lucide-react";
import type { StatusDokumen } from "@/types/penilaian";

export interface NavItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  usePageBadge?: boolean;
  /** Status dokumen (menu Dokumen Sertifikasi). */
  status?: StatusDokumen;
  locked?: boolean;
  lockedReason?: string | null;
  /** Hanya aktif jika path persis sama (bukan prefix). */
  exact?: boolean;
  /** Label kecil di kanan menu (mis. metode terpilih "TPD"). */
  badgeText?: string;
  /** Sub-menu bagian di dalam halaman (href berisi #anchor). */
  children?: NavSubItem[];
}

export interface NavSubItem {
  name: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
