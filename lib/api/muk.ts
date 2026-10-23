import apiClient from "./axios";
import type { LoginCredentials, LoginResponse, MukRole, User } from "@/types/auth";
import type { ApiResource, Paginated } from "@/types/api";
import type { KelompokPenilaian, MetodeAsesmen, Penilaian } from "@/types/penilaian";

/*
 * Semua endpoint /api/muk di satu tempat. Komponen tidak memanggil axios langsung.
 */

export const mukAuth = {
  login: async (role: MukRole, credentials: LoginCredentials) =>
    (await apiClient.post<LoginResponse>(`/muk/auth/${role}/login`, credentials)).data.data,

  me: async () => (await apiClient.get<ApiResource<User>>("/muk/auth/me")).data.data,

  logout: async () => {
    await apiClient.post("/muk/auth/logout");
  },
};

export interface PenilaianQuery {
  kelompok?: KelompokPenilaian;
  page?: number;
  per_page?: number;
}

/** Kunci SWR, dipakai juga untuk mutate() setelah submit dokumen. */
export const swrKey = {
  penilaianList: (q: PenilaianQuery = {}) => ["/muk/penilaian", q] as const,
  penilaian: (id: number | string) => `/muk/penilaian/${id}`,
  dokumen: (id: number | string, slug: string) => `/muk/penilaian/${id}/dokumen/${slug}`,
};

/**
 * Endpoint dokumen generik: /muk/penilaian/{id}/dokumen/{slug}.
 * T = tipe payload dokumen (mis. Apl01Payload), P = tipe body PATCH.
 */
export const mukDokumen = {
  get: async <T>(id: number | string, slug: string) =>
    (await apiClient.get<ApiResource<T>>(swrKey.dokumen(id, slug))).data.data,

  simpan: async <T, P>(id: number | string, slug: string, patch: P) =>
    (await apiClient.patch<ApiResource<T>>(swrKey.dokumen(id, slug), patch)).data.data,

  tandaTangan: async <T>(id: number | string, slug: string, dataUrl: string) =>
    (await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, slug)}/tanda-tangan`, { tanda_tangan: dataUrl })).data.data,

  submit: async <T>(id: number | string, slug: string) =>
    (await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, slug)}/submit`)).data.data,

  /** Pola disiapkan asesor -> dijawab asesi -> dinilai asesor (mis. FR.IA.03). */
  persiapan: async <T, B>(id: number | string, slug: string, body: B) =>
    (await apiClient.patch<ApiResource<T>>(`${swrKey.dokumen(id, slug)}/persiapan`, body)).data.data,

  buka: async <T>(id: number | string, slug: string) =>
    (await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, slug)}/buka`)).data.data,

  simpanPenilaian: async <T, B>(id: number | string, slug: string, body: B) =>
    (await apiClient.patch<ApiResource<T>>(`${swrKey.dokumen(id, slug)}/penilaian`, body)).data.data,

  nilai: async <T, B>(id: number | string, slug: string, body: B & { tanda_tangan: string }) =>
    (await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, slug)}/nilai`, body)).data.data,

  /** Persetujuan pihak kedua dengan tanda tangan (asesi atas FR.AK.07 / FR.AK.01). */
  setujui: async <T>(id: number | string, slug: string, dataUrl: string) =>
    (await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, slug)}/setujui`, { tanda_tangan: dataUrl })).data.data,

  /** Pengisi menarik kembali dokumen yang masih menunggu persetujuan. */
  tarik: async <T>(id: number | string, slug: string) =>
    (await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, slug)}/tarik`)).data.data,

  /** Tinjauan peninjau (asesor) atas dokumen, mis. FR.APL.02. */
  review: async <T>(id: number | string, slug: string, body: { hasil: string; catatan?: string | null; tanda_tangan?: string | null }) =>
    (await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, slug)}/review`, body)).data.data,

  /** FR.APL.01: unggah / hapus / lihat berkas bukti persyaratan dasar. */
  unggahBuktiApl01: async <T>(id: number | string, buktiId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return (
      await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, "apl-01")}/bukti/${buktiId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      })
    ).data.data;
  },

  hapusBuktiApl01: async <T>(id: number | string, buktiId: number) =>
    (await apiClient.delete<ApiResource<T>>(`${swrKey.dokumen(id, "apl-01")}/bukti/${buktiId}`)).data.data,

  berkasBuktiApl01: async (id: number | string, buktiId: number) =>
    (await apiClient.get<Blob>(`${swrKey.dokumen(id, "apl-01")}/bukti/${buktiId}`, { responseType: "blob" })).data,

  /** FR.APL.01 lampiran bukti yang relevan: tambah baris asesi. */
  tambahRelevanApl01: async <T>(id: number | string, nama: string) =>
    (await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, "apl-01")}/relevan`, { nama })).data.data,

  ubahRelevanApl01: async <T>(id: number | string, relevanId: number, data: { nama?: string; link?: string | null }) =>
    (await apiClient.patch<ApiResource<T>>(`${swrKey.dokumen(id, "apl-01")}/relevan/${relevanId}`, data)).data.data,

  hapusRelevanApl01: async <T>(id: number | string, relevanId: number) =>
    (await apiClient.delete<ApiResource<T>>(`${swrKey.dokumen(id, "apl-01")}/relevan/${relevanId}`)).data.data,

  unggahRelevanApl01: async <T>(id: number | string, relevanId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return (
      await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, "apl-01")}/relevan/${relevanId}/file`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      })
    ).data.data;
  },

  hapusBerkasRelevanApl01: async <T>(id: number | string, relevanId: number) =>
    (await apiClient.delete<ApiResource<T>>(`${swrKey.dokumen(id, "apl-01")}/relevan/${relevanId}/file`)).data.data,

  /** Berkas lampiran relevan (asesi pemilik; asesor untuk FR.IA.08). */
  berkasRelevanApl01: async (id: number | string, relevanId: number) =>
    (await apiClient.get<Blob>(`${swrKey.dokumen(id, "apl-01")}/relevan/${relevanId}/file`, { responseType: "blob" })).data,

  /** FR.APL.02: unggah berkas bukti ke baris yang ada (buktiId) atau baris baru. */
  unggahBuktiApl02: async <T>(id: number | string, elemenId: number, file: File, buktiId?: number | null) => {
    const form = new FormData();
    form.append("file", file);
    if (buktiId) form.append("bukti_id", String(buktiId));
    return (
      await apiClient.post<ApiResource<T>>(`${swrKey.dokumen(id, "apl-02")}/elemen/${elemenId}/bukti`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      })
    ).data.data;
  },

  hapusBerkasApl02: async <T>(id: number | string, buktiId: number) =>
    (await apiClient.delete<ApiResource<T>>(`${swrKey.dokumen(id, "apl-02")}/bukti/${buktiId}/file`)).data.data,

  berkasBuktiApl02: async (id: number | string, buktiId: number) =>
    (await apiClient.get<Blob>(`${swrKey.dokumen(id, "apl-02")}/bukti/${buktiId}/file`, { responseType: "blob" })).data,

  /** Gambar tanda tangan sebagai Blob (endpoint butuh Bearer token, jadi tidak bisa <img src> langsung). */
  gambarTandaTangan: async (id: number | string, slug: string, pihak: string) =>
    (await apiClient.get<Blob>(`${swrKey.dokumen(id, slug)}/tanda-tangan/${pihak}`, { responseType: "blob" })).data,

  /** FR.MAPA: gambar tanda tangan penandatangan template (konfirmasi / penyusun & validator). */
  gambarPenandatangan: async (id: number | string, slug: string, penandatanganId: number) =>
    (await apiClient.get<Blob>(`${swrKey.dokumen(id, slug)}/penandatangan/${penandatanganId}`, { responseType: "blob" })).data,
};

export const mukPenilaian = {
  list: async (q: PenilaianQuery = {}) =>
    (await apiClient.get<Paginated<Penilaian>>("/muk/penilaian", { params: q })).data,

  detail: async (id: number | string) =>
    (await apiClient.get<ApiResource<Penilaian>>(`/muk/penilaian/${id}`)).data.data,

  /** Asesor menentukan metode asesmen. */
  tetapkanMetode: async (id: number | string, metode: MetodeAsesmen) =>
    (await apiClient.post<ApiResource<Penilaian>>(`/muk/penilaian/${id}/metode`, { metode })).data.data,
};
