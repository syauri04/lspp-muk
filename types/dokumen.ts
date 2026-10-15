import type { StatusDokumen } from "@/types/penilaian";
import type { MukRole } from "@/types/auth";

export type PihakTtd = "asesi" | "asesor" | "admin";

/** Bagian generik payload dokumen (sama untuk semua jenis dokumen). */
export interface DokumenMeta {
  id: number;
  penilaian_id: number;
  kode: string;
  slug: string;
  nama: string;
  status: StatusDokumen;
  submitted_at: string | null;
  pengisi: MukRole;
  dapat_diubah: boolean;
  /** Peran peninjau dokumen ("admin" / "asesor"). */
  peninjau: "admin" | "asesor" | null;
  /** Hanya ada bila user adalah peninjau: boleh meninjau sekarang? */
  review?: { bisa: boolean; alasan: string | null };
  tanda_tangan: Record<PihakTtd, { ada: boolean; tanggal: string | null }>;
  hasil_rekomendasi_admin: "diterima" | "ditolak" | null;
  catatan_admin: string | null;
  hasil_rekomendasi_asesor: "dapat_dilanjutkan" | "tidak_dapat_dilanjutkan" | null;
  catatan_asesor: string | null;
}

export interface DokumenPayload {
  dokumen: DokumenMeta;
}

export interface Opsi {
  value: string;
  label: string;
}

/* ------------------------------ FR.APL.01 ------------------------------ */

export interface Apl01Pribadi {
  nama_lengkap: string | null;
  nik: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: "laki_laki" | "perempuan" | null;
  kebangsaan: string | null;
  alamat_rumah: string | null;
  kode_pos: string | null;
  telp_rumah: string | null;
  telp_kantor: string | null;
  hp: string | null;
  email: string | null;
  kualifikasi_pendidikan: string | null;
}

export interface Apl01Pekerjaan {
  nama_institusi: string | null;
  jabatan: string | null;
  alamat_kantor: string | null;
  kode_pos: string | null;
  telp: string | null;
  fax: string | null;
  email: string | null;
  kualifikasi_pendidikan: string | null;
}

export interface Apl01Isian {
  pribadi: Apl01Pribadi;
  pekerjaan: Apl01Pekerjaan;
  tujuan_asesmen: string | null;
  tujuan_lainnya: string | null;
}

export interface Apl01BuktiPersyaratan {
  id: number;
  deskripsi: string;
  file: { nama: string; mime: string; ukuran_kb: number } | null;
  /** Diisi admin LSP saat verifikasi. */
  ada: boolean | null;
  memenuhi_syarat: boolean | null;
}

export interface Apl01Payload extends DokumenPayload {
  isian: Apl01Isian;
  prefill: boolean;
  skema: {
    id: number;
    judul: string | null;
    nomor: string | null;
    jenis: string | null;
    standar_kompetensi_kerja: string | null;
  };
  unit_kompetensi: { id: number; kode_unit: string; judul_unit: string }[];
  bukti_persyaratan: Apl01BuktiPersyaratan[];
  bukti_administratif: {
    jenis: string;
    label: string;
    ada: boolean;
    nama_file: string | null;
    /** Hasil verifikasi admin LSP. */
    verifikasi: "memenuhi" | "tidak_memenuhi" | "tidak_ada" | null;
  }[];
  admin: { nama: string | null };
  opsi: { tujuan_asesmen: Opsi[]; jenis_kelamin: Opsi[] };
  unggah: { mimes: string[]; max_kb: number };
}

export interface Apl01Patch {
  isian: Apl01Isian;
}

/* ------------------------------ FR.APL.02 ------------------------------ */

export type Kompeten = "K" | "BK";

/** Satu baris "bukti yang relevan": berkas unggahan, link, atau keduanya. */
export interface Apl02Bukti {
  id: number;
  link: string | null;
  file: { nama: string; mime: string; ukuran_kb: number } | null;
}

export interface Apl02Elemen {
  id: number;
  nomor: number;
  nama: string;
  kuk: { id: number; nomor: string; deskripsi: string }[];
  jawaban: { kompeten: Kompeten | null; bukti: Apl02Bukti[] };
}

export interface Apl02Unit {
  id: number;
  kode_unit: string;
  judul_unit: string;
  elemen: Apl02Elemen[];
}

export interface Apl02Payload extends DokumenPayload {
  skema: { id: number; judul: string | null; nomor: string | null; jenis: string | null };
  unit_kompetensi: Apl02Unit[];
  progres: { terisi: number; total: number };
  asesi: { nama: string | null };
  /** "Ditinjau oleh asesor" + rekomendasi, diisi asesor saat review. */
  peninjau: {
    nama: string | null;
    nomor_registrasi: string | null;
    rekomendasi: "dapat_dilanjutkan" | "tidak_dapat_dilanjutkan" | null;
    catatan: string | null;
  };
  batas: { maks_bukti_per_elemen: number; mimes: string[]; max_kb: number };
}

export interface Apl02Patch {
  jawaban: { elemen_id: number; kompeten: Kompeten | null; bukti: { id: number | null; link: string | null }[] }[];
}

/* ------------------------------ FR.MAPA.01 / 02 ------------------------------ */

export type MetodeKode = "kt" | "tpd" | "vp";

export interface MapaSkema {
  id: number;
  judul: string | null;
  nomor: string | null;
  jenis: string | null;
}

export interface MapaUnit {
  id: number;
  kode_unit: string | null;
  judul_unit: string;
}

/** Penandatangan dari template CMS (konfirmasi / penyusun & validator). Gambar via endpoint terotorisasi. */
export interface MapaPenandatangan {
  id: number;
  peran: string;
  nama: string | null;
  no_reg: string | null;
  tanggal: string | null;
  ada_ttd: boolean;
}

export type Emoji = "senang" | "netral" | "sedih";

export interface AdaCatatan {
  ada: boolean | null;
  catatan: string | null;
}

export type Mapa01Grup = "asesi" | "tujuan" | "lingkungan" | "peluang" | "siapa" | "konfirmasi" | "standar";
export type Mapa01Hubungan = "bukti" | "aktivitas" | "pembelajaran";
export type Mapa01Modifikasi = "karakteristik" | "kontekstualisasi" | "saran" | "penyesuaian" | "peluang_terintegrasi";

export type Mapa01Isian = Record<Mapa01Grup, string[]> & {
  hubungan: Record<Mapa01Hubungan, { checked: boolean; emoji: Emoji | null }>;
  modifikasi: Record<Mapa01Modifikasi, AdaCatatan>;
};

export interface Mapa01Rencana {
  unit_id: number;
  judul_unit: string;
  bukti: string | null;
  jenis_l: boolean;
  jenis_tl: boolean;
  jenis_t: boolean;
  observasi_langsung: string | null;
  kegiatan_terstruktur: string | null;
  tanya_jawab: string | null;
  verifikasi_portofolio: string | null;
  reviu_produk: string | null;
  verifikasi_pihak_ketiga: string | null;
}

export interface Mapa01Payload extends DokumenPayload {
  isian: Mapa01Isian;
  /** true = isian awal otomatis (belum pernah disimpan). */
  prefill: boolean;
  skema: MapaSkema;
  unit_kompetensi: MapaUnit[];
  standar_kompetensi: string[];
  metode: MetodeKode | null;
  rencana: Mapa01Rencana[];
  template_lengkap: boolean;
  konfirmasi_orang: MapaPenandatangan[];
  penyusun: MapaPenandatangan[];
  opsi: Record<Mapa01Grup | "hubungan", Opsi[]>;
}

export interface Mapa02Isian {
  potensi: Record<string, number[]>;
}

export interface Mapa02Payload extends DokumenPayload {
  isian: Mapa02Isian;
  skema: MapaSkema;
  unit_kompetensi: MapaUnit[];
  metode: MetodeKode | null;
  instrumen: { kunci: string; nomor: string; kode: string; label: string }[];
  penyusun: MapaPenandatangan[];
  keterangan_potensi: string[];
}
