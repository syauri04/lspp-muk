import type { ComponentType } from "react";
import type { Penilaian, DokumenRingkas } from "@/types/penilaian";
import type { MukRole } from "@/types/auth";
import { Apl01Page } from "@/features/dokumen/apl01/Apl01Page";
import { Apl02Page } from "@/features/dokumen/apl02/Apl02Page";
import { Mapa01Page } from "@/features/dokumen/mapa01/Mapa01Page";
import { Mapa02Page } from "@/features/dokumen/mapa02/Mapa02Page";
import { Ak07Page } from "@/features/dokumen/ak07/Ak07Page";
import { Ak01Page } from "@/features/dokumen/ak01/Ak01Page";
import { Ia01Page } from "@/features/dokumen/ia01/Ia01Page";
import { Ia02Page } from "@/features/dokumen/ia02/Ia02Page";
import { Ia03Page } from "@/features/dokumen/ia03/Ia03Page";
import { Ia04aPage } from "@/features/dokumen/ia04a/Ia04aPage";
import { Ia04bPage } from "@/features/dokumen/ia04b/Ia04bPage";
import { Ia06aPage } from "@/features/dokumen/ia06a/Ia06aPage";
import { Ia08Page } from "@/features/dokumen/ia08/Ia08Page";
import { Ia09Page } from "@/features/dokumen/ia09/Ia09Page";
import { Ia10Page } from "@/features/dokumen/ia10/Ia10Page";
import { Ia06bPage } from "@/features/dokumen/ia06b/Ia06bPage";
import { Ia06cPage } from "@/features/dokumen/ia06c/Ia06cPage";
import { Ak02Page } from "@/features/dokumen/ak02/Ak02Page";
import { Ak03Page } from "@/features/dokumen/ak03/Ak03Page";
import { Ak05Page } from "@/features/dokumen/ak05/Ak05Page";
import { Ak06Page } from "@/features/dokumen/ak06/Ak06Page";

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
 * Fase 5: "apl-02" (asesi), Fase 6: "apl-02" (review asesor), Fase 8b: "mapa-01", "mapa-02" (asesor),
 * Fase 9: "ak-07", "ak-01" (asesor isi, asesi setujui).
 * Fase 10: "ia-01", "ia-02", "ia-03" (metode TPD).
 * Fase 11: "ia-06a" (asesi menjawab), "ia-06b" (kunci, hanya asesor), "ia-06c" (asesor menilai) — semua metode.
 * Fase 12: "ak-02" (keputusan K/BK), "ak-03" (umpan balik asesi), "ak-05" & "ak-06" (hanya asesor).
 * Fase 13: "ia-08", "ia-09", "ia-10" (metode VP).
 * Fase 14: "ia-04a", "ia-04b" (metode KT).
 */
export const DOKUMEN_REGISTRY: Partial<Record<string, ComponentType<DokumenPageProps>>> = {
  "apl-01": Apl01Page,
  "apl-02": Apl02Page,
  "mapa-01": Mapa01Page,
  "mapa-02": Mapa02Page,
  "ak-07": Ak07Page,
  "ak-01": Ak01Page,
  "ia-01": Ia01Page,
  "ia-02": Ia02Page,
  "ia-03": Ia03Page,
  "ia-04a": Ia04aPage,
  "ia-04b": Ia04bPage,
  "ia-06a": Ia06aPage,
  "ia-06b": Ia06bPage,
  "ia-06c": Ia06cPage,
  "ia-08": Ia08Page,
  "ia-09": Ia09Page,
  "ia-10": Ia10Page,
  "ak-02": Ak02Page,
  "ak-03": Ak03Page,
  "ak-05": Ak05Page,
  "ak-06": Ak06Page,
};
