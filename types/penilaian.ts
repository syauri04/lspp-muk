export type StatusPenilaian =
  | "menunggu_pengisian_apl"
  | "menunggu_review"
  | "berlangsung"
  | "selesai_kompeten"
  | "selesai_belum_kompeten";

export type StatusDokumen = "belum_diisi" | "draft" | "menunggu_review" | "menunggu_persetujuan" | "selesai";

export type MetodeAsesmen = "kt" | "tpd" | "vp";

export type KelompokPenilaian = "perlu_tindakan" | "berlangsung" | "selesai";

export interface DokumenRingkas {
  id: number;
  kode: string; // "FR.APL.01"
  slug: string; // "apl-01"
  nama: string;
  status: StatusDokumen;
  // Hanya ada di detail penilaian:
  terkunci?: boolean;
  alasan_terkunci?: string | null;
  submitted_at?: string | null;
  hasil_rekomendasi_asesor?: "dapat_dilanjutkan" | "tidak_dapat_dilanjutkan" | null;
  catatan_asesor?: string | null;
  hasil_rekomendasi_admin?: "diterima" | "ditolak" | null;
  catatan_admin?: string | null;
}

export interface Penilaian {
  id: number;
  status: StatusPenilaian;
  perlu_tindakan: boolean;
  metode_asesmen: MetodeAsesmen | null;
  metode_ditentukan_at: string | null;
  /** Hanya di detail untuk asesor. */
  aksi_metode?: { bisa: boolean; alasan: string | null };
  skema: {
    id: number;
    judul: string | null;
    nomor: string | null;
    jenis: string | null;
  };
  jadwal: {
    tanggal: string | null;
    waktu_mulai: string | null;
    waktu_selesai: string | null;
    status: string;
    tuk: { nama: string; kota: string; alamat: string } | null;
  } | null;
  asesi: { nama: string };
  asesor: { nama: string; nomor_registrasi: string | null } | null;
  dokumen: DokumenRingkas[];
}
