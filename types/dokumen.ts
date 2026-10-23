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
  /** Peran yang menyetujui dengan tanda tangan setelah dikirim (mis. "asesi" pada AK.07/AK.01). */
  penyetuju: MukRole | null;
  /** Hanya ada bila user adalah penyetuju: boleh menyetujui sekarang? (alasan bila belum) */
  persetujuan?: { bisa: boolean; alasan: string | null };
  /** Pola disiapkan asesor -> dijawab asesi -> dinilai asesor (mis. FR.IA.03). */
  dinilai?: { dibuka: boolean; bisa_siapkan: boolean; bisa_nilai: boolean };
  /** Pengisi boleh menarik kembali dokumen yang menunggu persetujuan. */
  dapat_ditarik: boolean;
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

/** Lampiran bukti yang relevan FR.APL.01 (template = butir dari Template VP di CMS, tidak dapat dihapus). */
export interface Apl01BuktiRelevan {
  id: number;
  nama: string;
  template: boolean;
  link: string | null;
  file: { nama: string | null; mime: string | null; ukuran_kb: number | null } | null;
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
  bukti_relevan: Apl01BuktiRelevan[];
  admin: { nama: string | null };
  opsi: { tujuan_asesmen: Opsi[]; jenis_kelamin: Opsi[] };
  unggah: { mimes: string[]; max_kb: number; maks_relevan_tambahan: number };
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

/* ------------------------------ FR.AK.07 / FR.AK.01 (asesor isi, asesi setujui) ------------------------------ */

export type JenisTuk = "sewaktu" | "tempat_kerja" | "mandiri";

/** Identitas dokumen (otomatis dari skema, jadwal, akun asesor & asesi). */
export interface AkInfo {
  skema: MapaSkema;
  asesor: { nama: string | null; nomor_registrasi: string | null };
  asesi: { nama: string | null };
  jadwal: {
    tanggal: string | null;
    waktu_mulai: string | null;
    waktu_selesai: string | null;
    tuk: { nama: string; kota: string | null; alamat: string | null } | null;
  };
  metode: MetodeKode | null;
  metode_label: string | null;
}

interface AkPayloadDasar<I> extends DokumenPayload {
  isian: I;
  prefill: boolean;
  info: AkInfo;
  opsi_tuk: Opsi[];
}

export interface Ak07Karakter {
  penyesuaian: "ya" | "tidak" | null;
  /** Indeks opsi keterangan yang dicentang. */
  pilihan: number[];
  /** Keterangan tambahan ("Tambah Lampiran"). */
  lainnya: { teks: string | null; checked: boolean }[];
}

export interface Ak07Isian {
  tuk: JenisTuk | null;
  tanggal: string | null;
  potensi: string[];
  karakter: Record<string, Ak07Karakter>;
  hasil: { acuan: string | null; metode: string | null; instrumen: string | null };
}

export interface Ak07Payload extends AkPayloadDasar<Ak07Isian> {
  opsi_potensi: Opsi[];
  karakter: { kunci: string; label: string; opsi: string[] }[];
  maks_lainnya: number;
}

export interface Ak01Isian {
  tuk: JenisTuk | null;
  bukti: string[];
  bukti_lainnya: string | null;
  pelaksanaan: { tanggal: string | null; waktu: string | null; tuk: string | null };
}

export interface Ak01Payload extends AkPayloadDasar<Ak01Isian> {
  opsi_bukti: Opsi[];
  pernyataan: { asesi_banding: string; asesor: string; asesi_setuju: string };
}

/* ------------------------------ FR.IA.01 / 02 / 03 (metode TPD) ------------------------------ */

export type Pencapaian = "ya" | "tidak" | null;

export interface Ia01Elemen {
  kunci: string; // "e{id}"
  nomor: number | string;
  nama: string;
  kuk: { nomor: string | null; deskripsi: string }[];
}

export interface Ia01Isian {
  tuk: JenisTuk | null;
  tanggal: string | null;
  elemen: Record<string, { standar: string | null; pencapaian: Pencapaian; lanjut: string | null }>;
  umpan_balik: string | null;
  rekomendasi: "kompeten" | "lanjutan" | null;
  lanjutan: { kelompok: string | null; unit: string | null; elemen: string | null; kuk: string | null };
}

export interface Ia01Payload extends AkPayloadDasar<Ia01Isian> {
  struktur: { id: number; kode_unit: string | null; judul_unit: string; elemen: Ia01Elemen[] }[];
}

export interface Ia02Isian {
  tuk: JenisTuk | null;
  tanggal: string | null;
}

export interface Ia02Payload extends AkPayloadDasar<Ia02Isian> {
  unit_kompetensi: MapaUnit[];
  instrumen: { skenario: string | null; waktu: string | null };
  penyusun: MapaPenandatangan[];
}

/** FR.IA.03: asesi menjawab (tanggapan), asesor menyiapkan & menilai. */
/** FR.IA.03: asesor mencatat tanggapan asesi, Ya/Tidak & umpan balik, ttd; asesi menyetujui. */
export interface Ia03Isian {
  tuk: JenisTuk | null;
  tanggal: string | null;
  /** Pertanyaan template (Template TPD; hanya tampil, tidak dikirim balik). */
  pertanyaan: string[];
  jawaban: { tanggapan: string | null; pencapaian: Pencapaian }[];
  tambahan: { teks: string | null; tanggapan: string | null; pencapaian: Pencapaian }[];
  umpan_balik: string | null;
}

export interface Ia03Payload extends AkPayloadDasar<Ia03Isian> {
  unit_kompetensi: MapaUnit[];
  maks_tambahan: number;
}

/* ------------------------------ FR.IA.06A / B / C (esai, semua metode) ------------------------------ */

export interface Ia06Header {
  tuk: JenisTuk | null;
  tanggal: string | null;
  waktu: string | null;
}

/** FR.IA.06A: asesor menyiapkan & membuka; asesi menjawab (tanpa ttd). Tidak berisi kunci jawaban. */
export interface Ia06aPayload extends DokumenPayload {
  isian: { jawaban: (string | null)[] };
  info: AkInfo;
  opsi_tuk: Opsi[];
  persiapan: Ia06Header & { dibuka: boolean };
  pertanyaan: string[];
}

/** FR.IA.06B: hanya asesor — kunci jawaban & penyusun/validator. */
export interface Ia06bPayload extends DokumenPayload {
  info: AkInfo;
  opsi_tuk: Opsi[];
  header: Ia06Header;
  soal: { pertanyaan: string; kunci: string | null }[];
  penyusun: MapaPenandatangan[];
}

/** FR.IA.06C: asesor menilai jawaban asesi, asesi menyetujui. */
export interface Ia06cIsian {
  pencapaian: Pencapaian[];
  umpan_balik: string | null;
}

export interface Ia06cPayload extends AkPayloadDasar<Ia06cIsian> {
  header: Ia06Header;
  jawaban_asesi: { pertanyaan: string; jawaban: string | null }[];
}

/* ------------------------------ FR.AK.02 / 03 / 05 / 06 (penutup) ------------------------------ */

export type Rekomendasi = "kompeten" | "belum_kompeten";

export interface Ak02Isian {
  tuk: JenisTuk | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  /** "u{unitId}" -> jenis bukti */
  bukti: Record<string, string[]>;
  rekomendasi: Rekomendasi | null;
  tindak_lanjut: string | null;
  komentar: string | null;
}

export interface Ak02Payload extends AkPayloadDasar<Ak02Isian> {
  unit_kompetensi: MapaUnit[];
  /** Hasil belum tercapai di dokumen IA (bahan pertimbangan keputusan). */
  indikasi: { dokumen: string; keterangan: string }[];
  opsi_bukti: Opsi[];
}

export interface Ak03Isian {
  komponen: { hasil: Pencapaian; catatan: string | null }[];
  catatan_lainnya: string | null;
}

export interface Ak03Payload extends AkPayloadDasar<Ak03Isian> {
  header: { tuk: JenisTuk | null; tanggal_mulai: string | null; tanggal_selesai: string | null };
  komponen: string[];
}

export interface Ak05Isian {
  tuk: JenisTuk | null;
  tanggal: string | null;
  keterangan: string | null;
  aspek: string | null;
  penolakan: string | null;
  saran: string | null;
  catatan: string | null;
}

export interface Ak05Payload extends AkPayloadDasar<Ak05Isian> {
  rekomendasi: Rekomendasi | null;
}

export type Ak06Aspek = "rencana" | "persiapan" | "implementasi" | "keputusan" | "umpan_balik";
export type Ak06Dimensi = "task_skills" | "task_management" | "contingency_management" | "job_role_environment" | "transfer_skills";

export interface Ak06Isian {
  tuk: JenisTuk | null;
  tanggal: string | null;
  prinsip: Record<Ak06Aspek, string[]>;
  rekomendasi_prinsip: string | null;
  dimensi: Record<Ak06Dimensi, string | null>;
  rekomendasi_dimensi: string | null;
  nama_peninjau: string | null;
  komentar: string | null;
}

export interface Ak06Payload extends AkPayloadDasar<Ak06Isian> {
  aspek: { kunci: Ak06Aspek; label: string; tanpa: string[] }[];
  opsi_dimensi: Opsi[];
}

/* ------------------------------ FR.IA.08 / 09 / 10 (metode VP) ------------------------------ */

export type AturanBukti = "valid" | "asli" | "terkini" | "memadai";

export type JenisLanjutan = "observasi" | "kegiatan_terstruktur";

export interface Ia08Isian {
  tuk: JenisTuk | null;
  tanggal: string | null;
  /** relevan_id = lampiran bukti relevan FR.APL.01 (berkas dapat dibuka asesor). */
  portofolio: ({ bukti: string | null; relevan_id?: number | null } & Record<AturanBukti, Pencapaian>)[];
  /** Kunci unit "u{unitId}" yang perlu diklarifikasi saat wawancara (satu centang per unit). */
  klarifikasi: string[];
  /** Materi/substansi wawancara: kunci KUK "k{kukId}" (awal dari Template VP, dapat diubah asesor). */
  materi: string[];
  bukti_tambahan: string | null;
  rekomendasi: "kompeten" | "lanjutan" | null;
  /** Asesmen lanjutan (rekomendasi "lanjutan"): observasi = metode TPD, kegiatan_terstruktur = metode KT.
   * Lingkup: unit "u{id}" dan KUK "k{id}" (KUK kosong untuk suatu unit = seluruh KUK unit tsb). */
  lanjutan: { jenis: JenisLanjutan | null; unit: string[]; kuk: string[] };
}

export interface Ia08Payload extends AkPayloadDasar<Ia08Isian> {
  kuk: { kunci: string; unit_kunci: string; unit_no: number; elemen_no: number | string; nomor: string | null; deskripsi: string }[];
  /** Lampiran bukti relevan FR.APL.01 yang berisi berkas/link. */
  lampiran: Apl01BuktiRelevan[];
  unit_kompetensi: MapaUnit[];
  maks_portofolio: number;
}

export interface Ia09Isian {
  tuk: JenisTuk | null;
  tanggal: string | null;
  bukti: string[];
  /** Pertanyaan template (hanya tampil, tidak dikirim balik). */
  pertanyaan: string[];
  jawaban: { kesimpulan: string | null; pencapaian: Pencapaian }[];
  tambahan: { teks: string | null; kesimpulan: string | null; pencapaian: Pencapaian }[];
}

export interface Ia09Payload extends AkPayloadDasar<Ia09Isian> {
  penyusun: MapaPenandatangan[];
  maks_tambahan: number;
}

export interface Ia10Isian {
  tuk: JenisTuk | null;
  tanggal: string | null;
  pengawas: { nama: string | null; tempat_kerja: string | null; alamat: string | null; telepon: string | null };
  jawaban: Pencapaian[];
  hubungan: string | null;
  lama_bekerja: string | null;
  kedekatan: string | null;
  pengalaman: string | null;
  keyakinan: string | null;
  kebutuhan_pelatihan: string | null;
  komentar: string | null;
}

export interface Ia10Payload extends AkPayloadDasar<Ia10Isian> {
  pertanyaan: string[];
}

/* ------------------------------ FR.IA.04A / 04B (metode KT) ------------------------------ */

export interface Ia04aIsian {
  tuk: JenisTuk | null;
  umpan_balik: string | null;
  supervisor: string | null;
}

export interface Ia04aPayload extends AkPayloadDasar<Ia04aIsian> {
  unit_kompetensi: MapaUnit[];
  instrumen: {
    hal_disiapkan: string | null;
    hal_didemonstrasikan: string | null;
    waktu_pengerjaan: string | null;
    waktu_tanya_jawab: string | null;
    total_waktu: string | null;
  };
  penyusun: MapaPenandatangan[];
}

export interface Ia04bAspek {
  lingkup: string | null;
  pertanyaan: string | null;
  kesesuaian: string | null;
}

export interface Ia04bIsian {
  tuk: JenisTuk | null;
  tanggal: string | null;
  /** Aspek dari template (hanya tampil, tidak dikirim balik). */
  aspek: Ia04bAspek[];
  /** Kesesuaian awal dari template, dapat diubah asesor. */
  jawaban: { tanggapan: string | null; pencapaian: Pencapaian; kesesuaian: string | null }[];
  tambahan: (Ia04bAspek & { tanggapan: string | null; pencapaian: Pencapaian })[];
  rekomendasi_teks: string | null;
  rekomendasi: "kompeten" | "belum_kompeten" | null;
}

export interface Ia04bPayload extends AkPayloadDasar<Ia04bIsian> {
  unit_kompetensi: MapaUnit[];
  penyusun: MapaPenandatangan[];
  maks_tambahan: number;
}
