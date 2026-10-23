"use client";

/*
 * FR.APL.01 - "3. Lampiran Bukti yang relevan" (tampilan sesuai mockup: No | Bukti | Upload/Link).
 * Butir dari Template VP (CMS) tidak dapat dihapus/diganti nama; asesi dapat menambah & menghapus baris sendiri.
 * Setiap aksi langsung tersimpan ke API (seperti unggah bukti persyaratan dasar); hanya aktif saat mode Ubah.
 * Bukti ini menjadi bukti portofolio FR.IA.08 & FR.IA.09 (metode VP).
 */

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Link2, Loader2, Trash2, Upload, X } from "lucide-react";
import { mukDokumen } from "@/lib/api/muk";
import { fieldErrors, pesanError } from "@/lib/api/axios";
import type { Apl01BuktiRelevan, Apl01Payload } from "@/types/dokumen";

const tombolClass =
  "inline-flex items-center justify-center gap-2 w-44 px-3 py-2 rounded-md border border-gray-300 bg-white text-xs font-semibold text-gray-700 transition-all enabled:hover:border-[#7E9631] enabled:hover:text-[#5A7A22] enabled:cursor-pointer disabled:opacity-50 disabled:cursor-default";
const inputClass =
  "w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#8AA53C] focus:ring-2 focus:ring-[#8AA53C]/20";

export function LampiranRelevan({
  payload,
  editable,
  onTerima,
}: {
  payload: Apl01Payload;
  /** Mode Ubah aktif & dokumen masih dapat diubah asesi. */
  editable: boolean;
  onTerima: (res: Apl01Payload) => Promise<void>;
}) {
  const penilaianId = payload.dokumen.penilaian_id;
  const baris = payload.bukti_relevan;
  const jumlahTambahan = baris.filter((b) => !b.template).length;
  const accept = payload.unggah.mimes.map((m) => `.${m}`).join(",");

  const [proses, setProses] = useState<number | "baru" | null>(null);
  const [draftBaru, setDraftBaru] = useState<string | null>(null);

  const jalankan = async (kunci: number | "baru", aksi: () => Promise<Apl01Payload>, sukses?: string) => {
    setProses(kunci);
    try {
      await onTerima(await aksi());
      if (sukses) toast.success(sukses);
      return true;
    } catch (err) {
      const fe = fieldErrors(err);
      toast.error(fe.file ?? fe.link ?? fe.nama ?? fe.relevan ?? pesanError(err, "Aksi gagal."));
      return false;
    } finally {
      setProses(null);
    }
  };

  const unggah = (b: Apl01BuktiRelevan, file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!payload.unggah.mimes.includes(ext)) return toast.error("Berkas harus berformat PDF, JPG, atau PNG.");
    if (file.size > payload.unggah.max_kb * 1024) return toast.error(`Ukuran berkas maksimal ${Math.round(payload.unggah.max_kb / 1024)} MB.`);
    void jalankan(b.id, () => mukDokumen.unggahRelevanApl01<Apl01Payload>(penilaianId, b.id, file), "Berkas diunggah.");
  };

  const lihat = async (b: Apl01BuktiRelevan) => {
    // Buka tab dulu (sinkron dengan klik) agar tidak diblokir popup blocker.
    const tab = window.open("", "_blank");
    try {
      const url = URL.createObjectURL(await mukDokumen.berkasRelevanApl01(penilaianId, b.id));
      if (tab) tab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      toast.error(pesanError(err, "Berkas tidak dapat dibuka."));
    }
  };

  const simpanBaru = async () => {
    const nama = draftBaru?.trim();
    if (!nama) return toast.error("Tuliskan nama bukti.");
    if (await jalankan("baru", () => mukDokumen.tambahRelevanApl01<Apl01Payload>(penilaianId, nama))) setDraftBaru(null);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-800">3. Lampiran Bukti yang relevan</h3>
      <table className="w-full border border-gray-300 border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-16 px-3 py-3 border border-gray-300 font-semibold text-gray-700">No</th>
            <th className="px-3 py-3 border border-gray-300 font-semibold text-gray-700">Bukti</th>
            <th className="w-1/2 px-3 py-3 border border-gray-300 font-semibold text-gray-700">Upload/Link</th>
          </tr>
        </thead>
        <tbody>
          {baris.length === 0 && draftBaru === null && (
            <tr>
              <td colSpan={3} className="px-4 py-4 border border-gray-300 text-center text-xs text-gray-400 italic">
                Belum ada bukti. {editable ? "Klik Tambah Bukti untuk melampirkan bukti yang relevan." : "Klik Ubah untuk melampirkan bukti yang relevan."}
              </td>
            </tr>
          )}
          {baris.map((b, idx) => (
            <BarisRelevan
              key={b.id}
              no={idx + 1}
              bukti={b}
              editable={editable}
              proses={proses === b.id}
              accept={accept}
              onNama={(nama) => jalankan(b.id, () => mukDokumen.ubahRelevanApl01<Apl01Payload>(penilaianId, b.id, { nama }))}
              onLink={(link) => jalankan(b.id, () => mukDokumen.ubahRelevanApl01<Apl01Payload>(penilaianId, b.id, { link }))}
              onUnggah={(file) => unggah(b, file)}
              onHapusBerkas={() => jalankan(b.id, () => mukDokumen.hapusBerkasRelevanApl01<Apl01Payload>(penilaianId, b.id))}
              onLihat={() => lihat(b)}
              onHapus={() => jalankan(b.id, () => mukDokumen.hapusRelevanApl01<Apl01Payload>(penilaianId, b.id), "Bukti dihapus.")}
            />
          ))}
          {draftBaru !== null && (
            <tr>
              <td className="px-3 py-6 border border-gray-300 text-center font-semibold text-gray-700">{baris.length + 1}.</td>
              <td className="px-3 py-4 border border-gray-300">
                <input
                  autoFocus
                  aria-label="Nama bukti baru"
                  value={draftBaru}
                  maxLength={500}
                  onChange={(e) => setDraftBaru(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void simpanBaru();
                    }
                  }}
                  placeholder="Nama bukti, mis. Laporan kegiatan"
                  className={inputClass}
                />
              </td>
              <td className="px-4 py-4 border border-gray-300">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={simpanBaru} disabled={proses === "baru"} className={tombolClass}>
                    {proses === "baru" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Simpan Bukti
                  </button>
                  <button type="button" aria-label="Batal" onClick={() => setDraftBaru(null)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">Simpan nama bukti terlebih dahulu, lalu unggah dokumen atau sisipkan link.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {editable && draftBaru === null && jumlahTambahan < payload.unggah.maks_relevan_tambahan && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setDraftBaru("")}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#8AA53C] hover:bg-[#7E9631] transition-all shadow-xs cursor-pointer"
          >
            Tambah Bukti
          </button>
        </div>
      )}
    </div>
  );
}

function BarisRelevan({
  no,
  bukti,
  editable,
  proses,
  accept,
  onNama,
  onLink,
  onUnggah,
  onHapusBerkas,
  onLihat,
  onHapus,
}: {
  no: number;
  bukti: Apl01BuktiRelevan;
  editable: boolean;
  proses: boolean;
  accept: string;
  onNama: (nama: string) => Promise<boolean>;
  onLink: (link: string | null) => Promise<boolean>;
  onUnggah: (file: File) => void;
  onHapusBerkas: () => void;
  onLihat: () => void;
  onHapus: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [nama, setNama] = useState(bukti.nama);
  const [link, setLink] = useState<string | null>(null); // null = input link tertutup
  const bisa = editable && !proses;

  const simpanNama = () => {
    const baru = nama.trim();
    if (!baru) return setNama(bukti.nama);
    if (baru !== bukti.nama) void onNama(baru).then((ok) => !ok && setNama(bukti.nama));
  };

  const simpanLink = async () => {
    const nilai = link?.trim() || null;
    if (await onLink(nilai)) setLink(null);
  };

  return (
    <tr>
      <td className="px-3 py-6 border border-gray-300 text-center font-semibold text-gray-700">{no}.</td>
      <td className="px-3 py-4 border border-gray-300 text-center">
        {editable && !bukti.template ? (
          <input
            aria-label={`Nama bukti ${no}`}
            value={nama}
            maxLength={500}
            onChange={(e) => setNama(e.target.value)}
            onBlur={simpanNama}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), (e.target as HTMLInputElement).blur())}
            className={`${inputClass} text-center`}
          />
        ) : (
          <p className="text-sm font-semibold text-gray-700 whitespace-pre-wrap wrap-break-word">{bukti.nama}</p>
        )}
      </td>
      <td className="px-4 py-4 border border-gray-300">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Berkas */}
            {bukti.file ? (
              <div className="flex items-center gap-2 min-w-0">
                <button type="button" onClick={onLihat} className="inline-flex items-center gap-1.5 text-xs text-[#5A7A22] hover:underline cursor-pointer min-w-0">
                  <Upload size={13} className="shrink-0" />
                  <span className="truncate max-w-56">{bukti.file.nama ?? "Berkas"}</span>
                </button>
                {bisa && (
                  <button type="button" onClick={onHapusBerkas} aria-label="Hapus berkas" className="text-gray-400 hover:text-red-500 shrink-0 cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={!bisa} className={tombolClass}>
                {proses ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Unggah Dokumen
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              className="hidden"
              disabled={!bisa}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUnggah(f);
                e.target.value = "";
              }}
            />

            {/* Link */}
            {link !== null ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  type="url"
                  aria-label={`Link bukti ${no}`}
                  value={link}
                  maxLength={2048}
                  onChange={(e) => setLink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void simpanLink();
                    }
                    if (e.key === "Escape") setLink(null);
                  }}
                  placeholder="https://..."
                  className={inputClass}
                />
                <button type="button" aria-label="Simpan link" onClick={simpanLink} disabled={proses} className="text-[#7E9631] hover:text-[#5A7A22] cursor-pointer shrink-0">
                  <Check size={16} />
                </button>
                <button type="button" aria-label="Batal" onClick={() => setLink(null)} className="text-gray-400 hover:text-red-500 cursor-pointer shrink-0">
                  <X size={16} />
                </button>
              </div>
            ) : bukti.link ? (
              <div className="flex items-center gap-2 min-w-0">
                <Link2 size={13} className="text-gray-400 shrink-0" aria-hidden />
                <a href={bukti.link} target="_blank" rel="noopener noreferrer nofollow" title={bukti.link} className="truncate text-xs text-[#5A7A22] underline">
                  {bukti.link}
                </a>
                {bisa && (
                  <button type="button" onClick={() => setLink(bukti.link ?? "")} className="text-xs text-gray-500 hover:text-[#5A7A22] shrink-0 cursor-pointer">
                    Ubah
                  </button>
                )}
                {bisa && (
                  <button type="button" onClick={() => void onLink(null)} aria-label="Hapus link" className="text-gray-400 hover:text-red-500 shrink-0 cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => setLink("")} disabled={!bisa} className={tombolClass}>
                <Link2 size={14} />
                Sisipkan Link
              </button>
            )}
          </div>
          {editable && !bukti.template && (
            <button type="button" onClick={onHapus} disabled={proses} aria-label={`Hapus bukti ${no}`} className="text-gray-400 hover:text-red-500 cursor-pointer pt-1">
              <X size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
