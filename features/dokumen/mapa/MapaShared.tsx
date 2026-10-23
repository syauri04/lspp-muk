"use client";

/*
 * Bagian bersama FR.MAPA.01 & FR.MAPA.02 (diisi asesor): kontrol Ubah/Simpan/Selesaikan,
 * header skema, kotak tanda tangan penandatangan template, dan logika simpan/selesaikan.
 * Style mengikuti mockup app/dashboard/fr/mapa-01 & mapa-02.
 */

import { useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Check, CheckCircle2, Loader2, Pencil, Plus, Save } from "lucide-react";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { fieldErrors, pesanError, statusError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import type { DokumenPayload, MapaPenandatangan, MapaSkema } from "@/types/dokumen";

export const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

export const compactInputClass =
  "w-full px-2 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

export const checkboxClass =
  "w-4 h-4 border-gray-300 text-[#8AA53C] focus:ring-[#8AA53C]/40 cursor-pointer disabled:cursor-default shrink-0";

/** Teks yang bisa diedit (textarea saat mode ubah), sama seperti mockup. */
export function EditableText({
  value,
  onChange,
  isEditing,
  className = "",
  rows = 2,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  isEditing: boolean;
  className?: string;
  rows?: number;
  ariaLabel?: string;
}) {
  if (!isEditing) {
    return <p className={`whitespace-pre-wrap ${className}`}>{value}</p>;
  }
  return (
    <textarea
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`w-full px-1.5 py-1 border border-gray-300 bg-white focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 resize-y transition-all ${className}`}
    />
  );
}

export function MapaControls({
  bisaUbah,
  isEditing,
  savedSuccess,
  menyimpan,
  onUbah,
  onSelesaikan,
  siapSelesai,
  alasanBelumSiap,
}: {
  bisaUbah: boolean;
  isEditing: boolean;
  savedSuccess: boolean;
  menyimpan: boolean;
  onUbah: () => void;
  onSelesaikan: () => void;
  siapSelesai: boolean;
  alasanBelumSiap?: string;
}) {
  if (!bisaUbah) return null;

  return (
    <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
      {savedSuccess && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2F5E9] text-[#5A7A22] text-xs font-semibold border border-[#8AA53C]/30 animate-in fade-in">
          <Check size={14} className="stroke-[2.5]" />
          Tersimpan
        </div>
      )}
      <button
        type="button"
        onClick={onUbah}
        disabled={isEditing}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          isEditing
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default"
            : "border-[#7E9631] text-[#7E9631] bg-white hover:bg-[#F2F5E9]"
        }`}
      >
        <Pencil size={13} />
        Ubah
      </button>
      <button
        type="submit"
        disabled={!isEditing || menyimpan}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
      >
        {menyimpan ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
        Simpan
      </button>
      {!isEditing && (
        <button
          type="button"
          onClick={onSelesaikan}
          disabled={!siapSelesai}
          title={siapSelesai ? undefined : alasanBelumSiap}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          <CheckCircle2 size={13} />
          Selesaikan
        </button>
      )}
    </div>
  );
}

/** Header "Skema Sertifikasi (KKNI/Okupasi/Klaster)": coret jenis yang tidak sesuai. */
export function SkemaHeader({ skema }: { skema: MapaSkema }) {
  const jenis = skema.jenis?.toLowerCase() ?? null;
  const coret = (k: string) => (jenis === k ? "text-gray-800" : "line-through text-gray-400");

  return (
    <div className="border border-gray-200">
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td rowSpan={2} className="w-56 align-middle px-4 py-3 bg-gray-50 border border-gray-200 font-semibold text-gray-700 text-sm">
              Skema Sertifikasi (<span className={coret("kkni")}>KKNI</span>/<span className={coret("okupasi")}>Okupasi</span>/
              <span className={coret("klaster")}>Klaster</span>)
            </td>
            <td className="w-24 px-4 py-3 border border-gray-200 font-semibold text-gray-600">Judul</td>
            <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="px-3 py-2 border border-gray-200">
              <input type="text" aria-label="Judul skema" value={skema.judul ?? ""} disabled readOnly className={inputClass} />
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">Nomor</td>
            <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="px-3 py-2 border border-gray-200">
              <input type="text" aria-label="Nomor skema" value={skema.nomor ?? ""} disabled readOnly className={inputClass} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Kotak tanda tangan penandatangan template (hanya tampil; diunggah admin di CMS). */
export function TtdPenandatangan({
  penilaianId,
  slug,
  baris,
  tinggi = "h-[110px]",
}: {
  penilaianId: number;
  slug: string;
  baris: MapaPenandatangan | null;
  tinggi?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [gagal, setGagal] = useState(false);
  const id = baris?.ada_ttd ? baris.id : null;

  useEffect(() => {
    if (id === null) return;
    let aktif = true;
    let objectUrl: string | null = null;
    mukDokumen
      .gambarPenandatangan(penilaianId, slug, id)
      .then((blob) => {
        if (!aktif) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => aktif && setGagal(true));
    return () => {
      aktif = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [penilaianId, slug, id]);

  return (
    <div className={`relative w-full ${tinggi} border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden`}>
      {id === null ? (
        <Plus size={22} className="stroke-[1.5] text-gray-300" />
      ) : gagal ? (
        <p className="text-xs text-gray-400">Tanda tangan tidak dapat dimuat.</p>
      ) : url ? (
        // eslint-disable-next-line @next/next/no-img-element -- object URL lokal dari endpoint ber-token
        <img src={url} alt={`Tanda tangan ${baris?.nama ?? ""}`} className="max-h-[80%] max-w-full object-contain" />
      ) : (
        <div className="h-16 w-32 rounded-lg bg-gray-100 animate-pulse" aria-label="Memuat tanda tangan" />
      )}
      {baris?.tanggal ? (
        <span className="text-[11px] text-gray-500">{formatTanggal(baris.tanggal)}</span>
      ) : (
        // Tanggal tidak diisi di CMS: otomatis = tanggal dokumen dikirim asesor.
        id !== null && <span className="text-[10px] italic text-gray-400">Tanggal terisi saat dokumen dikirim</span>
      )}
    </div>
  );
}

/**
 * State & aksi form MAPA: ubah lokal -> Simpan (PATCH) -> Selesaikan (submit, tanpa tanda tangan).
 * Setelah selesai dokumen terkunci (read-only) dan dokumen AK/IA terbuka bila kedua MAPA selesai.
 */
export function useMapaForm<I, P extends DokumenPayload & { isian: I }>({
  payload,
  setPayload,
  slug,
  nama,
}: {
  payload: P;
  setPayload: (p: P) => Promise<unknown>;
  slug: string;
  nama: string;
}) {
  const { mutate } = useSWRConfig();
  const meta = payload.dokumen;
  const penilaianId = meta.penilaian_id;
  const bisaUbah = meta.dapat_diubah;

  const [isian, setIsian] = useState<I>(payload.isian);
  const [isEditing, setIsEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [prosesSelesai, setProsesSelesai] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const ubah = (fn: (prev: I) => I, kunciError?: string) => {
    setIsian(fn);
    setDirty(true);
    if (kunciError) {
      setErrors((e) => {
        const salinan = { ...e };
        delete salinan[kunciError];
        return salinan;
      });
    }
  };

  const terima = async (res: P) => {
    const statusBerubah = res.dokumen.status !== meta.status;
    await setPayload(res);
    setIsian(res.isian);
    setDirty(false);
    if (statusBerubah) void mutate(swrKey.penilaian(penilaianId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    setMenyimpan(true);
    try {
      await terima(await mukDokumen.simpan<P, { isian: I }>(penilaianId, slug, { isian }));
      setIsEditing(false);
      setErrors({});
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(pesanError(err, "Gagal menyimpan."));
    } finally {
      setMenyimpan(false);
    }
  };

  const selesaikan = async () => {
    setProsesSelesai(true);
    try {
      const res = await mukDokumen.submit<P>(penilaianId, slug);
      setKonfirmasi(false);
      await terima(res);
      void mutate(swrKey.penilaian(penilaianId));
      toast.success(`${nama} diselesaikan.`);
    } catch (err) {
      setKonfirmasi(false);
      const fe = fieldErrors(err);
      if (statusError(err) === 422 && Object.keys(fe).length) {
        setErrors(fe);
        toast.error(fe.rencana ?? "Lengkapi isian yang ditandai sebelum menyelesaikan.");
        const pertama = Object.keys(fe)[0];
        document.querySelector(`[data-error="${pertama}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error(pesanError(err, "Gagal menyelesaikan dokumen."));
      }
    } finally {
      setProsesSelesai(false);
    }
  };

  return {
    meta,
    penilaianId,
    bisaUbah,
    isian,
    ubah,
    editable: isEditing && bisaUbah,
    isEditing,
    setIsEditing,
    dirty,
    menyimpan,
    savedSuccess,
    errors,
    konfirmasi,
    setKonfirmasi,
    prosesSelesai,
    handleSubmit,
    selesaikan,
  };
}

/** Pesan galat kecil di bawah bagian form (ditandai data-error untuk scroll). */
export function PesanError({ kunci, errors }: { kunci: string; errors: Record<string, string> }) {
  const pesan = errors[kunci];
  if (!pesan) return null;
  return (
    <p data-error={kunci} className="mt-1.5 text-xs font-semibold text-red-600">
      {pesan}
    </p>
  );
}
