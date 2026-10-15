import type { ComponentType } from "react";
import type { Penilaian, DokumenRingkas } from "@/types/penilaian";
import type { MukRole } from "@/types/auth";
import { Apl01Page } from "@/features/dokumen/apl01/Apl01Page";
import { Apl02Page } from "@/features/dokumen/apl02/Apl02Page";
import { Mapa01Page } from "@/features/dokumen/mapa01/Mapa01Page";
import { Mapa02Page } from "@/features/dokumen/mapa02/Mapa02Page";

/**
 * Props yang diterima setiap halaman dokumen. Penilaian & dokumen sudah dipastikan
 * milik user dan tidak terkunci oleh halaman dinamis sebelum komponen dirender.
 */
export interface DokumenPageProps {
  penilaian: Penilaian;
  dokumen: DokumenRingkas;
  role: MukRole;
}

/**
 * Peta slug dokumen -> komponen halaman. Menambah dokumen baru (MAPA, AK, IA) =
 * menambah satu entri di sini. Slug yang belum terdaftar tampil "Belum tersedia".
 *
 * Fase 5: "apl-02" (asesi), Fase 6: "apl-02" (review asesor), Fase 8b: "mapa-01", "mapa-02" (asesor).
 */
export const DOKUMEN_REGISTRY: Partial<Record<string, ComponentType<DokumenPageProps>>> = {
  "apl-01": Apl01Page,
  "apl-02": Apl02Page,
  "mapa-01": Mapa01Page,
  "mapa-02": Mapa02Page,
};
