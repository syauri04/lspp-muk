"use client";

/*
 * FR.APL.02 - Asesmen Mandiri.
 * Tampilan & style mengikuti formulir asli (app/dashboard/fr/apl-02 versi mock);
 * data dan aksi disambungkan ke API MUK. Tabel rekomendasi mengikuti dokumen FR.APL.02 resmi.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Check, ClipboardCheck, Link2, Loader2, Pencil, Plus, Save, Send, Trash2, Upload, X } from "lucide-react";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { fieldErrors, pesanError, statusError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import { SignatureDialog } from "@/components/dokumen/SignatureDialog";
import { SignatureImage } from "@/components/dokumen/SignatureImage";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Apl02Patch, Apl02Payload, Kompeten } from "@/types/dokumen";

const SLUG = "apl-02";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

const buktiInputClass =
  "flex-1 min-w-0 px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-400";

const checkboxClass =
  "w-4 h-4 border-gray-300 text-[#8AA53C] focus:ring-[#8AA53C]/40 cursor-pointer disabled:cursor-default";

function inlineEditableClass(isEditing: boolean, extra = "") {
  return `w-full px-1.5 py-0.5 border transition-all ${extra} ${
    isEditing
      ? "border-gray-300 bg-white focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20"
      : "border-transparent bg-transparent"
  }`;
}

const INSTRUKSI = [
  "Baca setiap pertanyaan di kolom sebelah kiri",
  "Beri tanda centang (√) pada kotak jika Anda yakin dapat melakukan tugas yang dijelaskan.",
  "Isi kolom di sebelah kanan dengan menuliskan bukti yang relevan anda miliki untuk menunjukkan bahwa anda melakukan pekerjaan.",
];

/* Kelas tabel rekomendasi (mengikuti gaya tabel mockup). */
const rekHead = "px-5 py-2.5 border border-gray-200 bg-gray-50 font-bold text-gray-800";
const rekLabel = "w-44 px-5 py-3 border border-gray-200 text-gray-700";
const rekNilai = "px-5 py-3 border border-gray-200 text-gray-800";

/** Satu baris bukti di form: id null = baris baru yang belum tersimpan. */
interface BuktiLokal {
  key: string;
  id: number | null;
  link: string;
  file: { nama: string } | null;
}

type JawabanLokal = Record<number, { kompeten: Kompeten | null; bukti: BuktiLokal[] }>;

let kunciBaru = 0;
const barisKosong = (): BuktiLokal => ({ key: `baru-${++kunciBaru}`, id: null, link: "", file: null });

function dariPayload(p: Apl02Payload): JawabanLokal {
  const hasil: JawabanLokal = {};
  p.unit_kompetensi.forEach((u) =>
    u.elemen.forEach((e) => {
      const bukti = e.jawaban.bukti.map((b) => ({ key: `b-${b.id}`, id: b.id, link: b.link ?? "", file: b.file }));
      hasil[e.id] = { kompeten: e.jawaban.kompeten, bukti: bukti.length ? bukti : [barisKosong()] };
    }),
  );
  return hasil;
}

function keBody(jawaban: JawabanLokal): Apl02Patch {
  return {
    jawaban: Object.entries(jawaban).map(([id, j]) => ({
      elemen_id: Number(id),
      kompeten: j.kompeten,
      bukti: j.bukti.map((b) => ({ id: b.id, link: b.link.trim() || null })),
    })),
  };
}

function EditSaveControls({
  bisaUbah,
  isEditing,
  savedSuccess,
  menyimpan,
  onUbah,
  onKirim,
  siapKirim,
}: {
  bisaUbah: boolean;
  isEditing: boolean;
  savedSuccess: boolean;
  menyimpan: boolean;
  onUbah: () => void;
  onKirim: () => void;
  siapKirim: boolean;
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
          onClick={onKirim}
          disabled={!siapKirim}
          title={siapKirim ? undefined : "Jawab semua elemen dan tanda tangani terlebih dahulu"}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          <Send size={13} />
          Kirim
        </button>
      )}
    </div>
  );
}

function SignatureBox({
  penilaianId,
  pihak,
  ada,
  tanggal,
  versi,
  aktif,
  onClick,
  pratinjau,
}: {
  penilaianId: number;
  pihak: "asesi" | "asesor";
  ada: boolean;
  tanggal: string | null;
  versi?: number;
  /** Kotak bisa diklik untuk menandatangani. */
  aktif: boolean;
  onClick?: () => void;
  /** Pratinjau tanda tangan yang belum disimpan (data URL). */
  pratinjau?: string | null;
}) {
  return (
    <div
      role={aktif ? "button" : undefined}
      tabIndex={aktif ? 0 : undefined}
      aria-label={aktif ? "Klik untuk menandatangani" : undefined}
      onClick={aktif ? onClick : undefined}
      onKeyDown={(e) => aktif && (e.key === "Enter" || e.key === " ") && onClick?.()}
      className={`relative w-full h-32.5 border border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
        aktif ? "border-[#7E9631]/50 bg-white cursor-pointer hover:border-[#7E9631]" : "border-gray-200 bg-gray-50"
      }`}
    >
      {pratinjau ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL lokal hasil kanvas
        <img src={pratinjau} alt="Pratinjau tanda tangan" className="h-24 max-w-full object-contain" />
      ) : ada ? (
        <>
          <SignatureImage penilaianId={penilaianId} slug={SLUG} pihak={pihak} versi={versi} alt="Tanda tangan" />
          {tanggal && <span className="text-[11px] text-gray-500">{formatTanggal(tanggal)}</span>}
        </>
      ) : (
        <Plus size={22} className={`stroke-[1.5] ${aktif ? "text-gray-400" : "text-gray-300"}`} />
      )}
    </div>
  );
}

/** Kontrol unggah berkas pada satu baris bukti. */
function BerkasBukti({
  file,
  editable,
  proses,
  accept,
  onPilih,
  onHapus,
  onLihat,
}: {
  file: { nama: string } | null;
  editable: boolean;
  proses: boolean;
  accept: string;
  onPilih: (file: File) => void;
  onHapus: () => void;
  onLihat: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (proses) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
        <Loader2 size={12} className="animate-spin" /> Mengunggah...
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {file ? (
        <>
          <button
            type="button"
            onClick={onLihat}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#7E9631] cursor-pointer min-w-0"
          >
            <Upload size={12} className="shrink-0" />
            <span className="truncate max-w-44">{file.nama}</span>
          </button>
          {editable && (
            <button type="button" onClick={onHapus} aria-label="Hapus berkas" className="text-gray-400 hover:text-red-500 shrink-0 cursor-pointer">
              <Trash2 size={13} />
            </button>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => editable && inputRef.current?.click()}
          disabled={!editable}
          className={`inline-flex items-center gap-1.5 text-xs text-gray-400 ${editable ? "hover:text-[#7E9631] cursor-pointer" : "cursor-default"}`}
        >
          <Upload size={12} />
          Unggah Dokumen
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={!editable}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPilih(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function Apl02Page({ penilaian }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Apl02Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false }, // jangan timpa isian yang sedang diedit
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.APL.02" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.APL.02..." />;

  return <Apl02Form key={data.dokumen.id} payload={data} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Apl02Form({ payload, setPayload }: { payload: Apl02Payload; setPayload: (p: Apl02Payload) => Promise<unknown> }) {
  const { mutate } = useSWRConfig();
  const meta = payload.dokumen;
  const penilaianId = meta.penilaian_id;
  const bisaUbah = meta.dapat_diubah;
  const units = payload.unit_kompetensi;
  const skemaType = payload.skema.jenis?.toLowerCase() ?? null;
  const peninjau = payload.peninjau;
  const accept = payload.batas.mimes.map((m) => `.${m}`).join(",");

  const [jawaban, setJawaban] = useState<JawabanLokal>(() => dariPayload(payload));
  const [isEditing, setIsEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prosesBerkas, setProsesBerkas] = useState<string | null>(null); // key baris
  const [dialogTtd, setDialogTtd] = useState(false);
  const [versiTtd, setVersiTtd] = useState(0);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [prosesKirim, setProsesKirim] = useState(false);

  // Tinjauan asesor (hanya bila user = peninjau & boleh meninjau sekarang).
  const bisaReview = !!meta.review?.bisa;
  const [pilihan, setPilihan] = useState<"dapat_dilanjutkan" | "tidak_dapat_dilanjutkan" | null>(null);
  const [catatanReview, setCatatanReview] = useState("");
  const [ttdAsesor, setTtdAsesor] = useState<string | null>(null);
  const [dialogTtdAsesor, setDialogTtdAsesor] = useState(false);
  const [konfirmasiReview, setKonfirmasiReview] = useState(false);
  const [prosesReview, setProsesReview] = useState(false);

  const editable = isEditing && bisaUbah;

  // Peringatan sebelum meninggalkan halaman bila ada perubahan belum disimpan.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const terima = async (res: Apl02Payload, opsi: { reset?: boolean } = {}) => {
    const statusBerubah = res.dokumen.status !== meta.status;
    if (meta.tanda_tangan.asesi.ada && !res.dokumen.tanda_tangan.asesi.ada) {
      toast.info("Jawaban berubah, silakan tanda tangani ulang.");
    }
    await setPayload(res);
    if (opsi.reset) {
      setJawaban(dariPayload(res));
      setDirty(false);
    }
    if (statusBerubah) void mutate(swrKey.penilaian(penilaianId));
  };

  const ubahElemen = (elemenId: number, patch: Partial<JawabanLokal[number]>) => {
    setJawaban((prev) => ({ ...prev, [elemenId]: { ...prev[elemenId], ...patch } }));
    setDirty(true);
    setErrors((e) => {
      const salinan = { ...e };
      delete salinan[`jawaban.${elemenId}`];
      return salinan;
    });
  };

  const updateLink = (elemenId: number, key: string, link: string) =>
    ubahElemen(elemenId, { bukti: jawaban[elemenId].bukti.map((b) => (b.key === key ? { ...b, link } : b)) });

  const addBukti = (elemenId: number) => {
    if (jawaban[elemenId].bukti.length >= payload.batas.maks_bukti_per_elemen) return;
    ubahElemen(elemenId, { bukti: [...jawaban[elemenId].bukti, barisKosong()] });
  };

  const removeBukti = (elemenId: number, key: string) => {
    const sisa = jawaban[elemenId].bukti.filter((b) => b.key !== key);
    ubahElemen(elemenId, { bukti: sisa.length ? sisa : [barisKosong()] });
  };

  /** Simpan perubahan yang belum tersimpan (dipakai sebelum unggah/hapus berkas). */
  const simpanJawaban = async (): Promise<Apl02Payload> => {
    const res = await mukDokumen.simpan<Apl02Payload, Apl02Patch>(penilaianId, SLUG, keBody(jawaban));
    await terima(res, { reset: true });
    return res;
  };

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    setMenyimpan(true);
    try {
      await simpanJawaban();
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

  const unggah = async (elemenId: number, baris: BuktiLokal, file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!payload.batas.mimes.includes(ext)) {
      toast.error("Berkas harus berformat PDF, JPG, atau PNG.");
      return;
    }
    if (file.size > payload.batas.max_kb * 1024) {
      toast.error(`Ukuran berkas maksimal ${Math.round(payload.batas.max_kb / 1024)} MB.`);
      return;
    }

    setProsesBerkas(baris.key);
    try {
      let buktiId = baris.id;
      // Simpan dulu perubahan lain agar tidak hilang; baris baru yang sudah berisi link
      // ikut tersimpan, lalu berkas ditempelkan ke baris itu.
      if (dirty) {
        const res = await simpanJawaban();
        if (!buktiId && baris.link.trim()) {
          const elemen = res.unit_kompetensi.flatMap((u) => u.elemen).find((x) => x.id === elemenId);
          buktiId = [...(elemen?.jawaban.bukti ?? [])].reverse().find((b) => b.link === baris.link.trim())?.id ?? null;
        }
      }
      await terima(await mukDokumen.unggahBuktiApl02<Apl02Payload>(penilaianId, elemenId, file, buktiId), { reset: true });
      toast.success("Berkas diunggah.");
    } catch (err) {
      toast.error(fieldErrors(err).file ?? pesanError(err, "Gagal mengunggah berkas."));
    } finally {
      setProsesBerkas(null);
    }
  };

  const hapusBerkas = async (baris: BuktiLokal) => {
    if (!baris.id) return;
    setProsesBerkas(baris.key);
    try {
      if (dirty) await simpanJawaban();
      await terima(await mukDokumen.hapusBerkasApl02<Apl02Payload>(penilaianId, baris.id), { reset: true });
    } catch (err) {
      toast.error(pesanError(err, "Gagal menghapus berkas."));
    } finally {
      setProsesBerkas(null);
    }
  };

  const lihatBerkas = async (baris: BuktiLokal) => {
    if (!baris.id) return;
    // Buka tab dulu (sinkron dengan klik) agar tidak diblokir popup blocker.
    const tab = window.open("", "_blank");
    try {
      const blob = await mukDokumen.berkasBuktiApl02(penilaianId, baris.id);
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      toast.error(pesanError(err, "Berkas tidak dapat dibuka."));
    }
  };

  const bukaTandaTangan = () => {
    if (isEditing && dirty) {
      toast.error("Simpan perubahan terlebih dahulu sebelum menandatangani.");
      return;
    }
    setDialogTtd(true);
  };

  const simpanTandaTangan = async (dataUrl: string) => {
    try {
      await terima(await mukDokumen.tandaTangan<Apl02Payload>(penilaianId, SLUG, dataUrl));
      setVersiTtd((v) => v + 1);
      toast.success("Tanda tangan tersimpan.");
    } catch (err) {
      toast.error(fieldErrors(err).tanda_tangan ?? pesanError(err, "Gagal menyimpan tanda tangan."));
      throw err;
    }
  };

  const kirim = async () => {
    setProsesKirim(true);
    try {
      const res = await mukDokumen.submit<Apl02Payload>(penilaianId, SLUG);
      setKonfirmasi(false);
      await terima(res, { reset: true });
      toast.success("FR.APL.02 berhasil dikirim ke asesor.");
    } catch (err) {
      setKonfirmasi(false);
      const fe = fieldErrors(err);
      if (statusError(err) === 422 && Object.keys(fe).length) {
        setErrors(fe);
        toast.error(fe.jawaban ?? fe.tanda_tangan ?? "Lengkapi jawaban yang ditandai sebelum mengirim.");
        const pertama = Object.keys(fe).find((k) => /^jawaban\.\d+$/.test(k));
        if (pertama) document.querySelector(`[data-elemen="${pertama.split(".")[1]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error(pesanError(err, "Gagal mengirim dokumen."));
      }
    } finally {
      setProsesKirim(false);
    }
  };

  const siapKirim = meta.tanda_tangan.asesi.ada && payload.progres.terisi === payload.progres.total && !dirty;
  const rekomendasi = bisaReview ? pilihan : peninjau.rekomendasi;
  const siapReview =
    pilihan === "dapat_dilanjutkan" ? !!ttdAsesor : pilihan === "tidak_dapat_dilanjutkan" ? catatanReview.trim() !== "" : false;

  const simpanReview = async () => {
    if (!pilihan) return;
    setProsesReview(true);
    try {
      const res = await mukDokumen.review<Apl02Payload>(penilaianId, SLUG, {
        hasil: pilihan,
        catatan: catatanReview.trim() || null,
        tanda_tangan: pilihan === "dapat_dilanjutkan" ? ttdAsesor : null,
      });
      setKonfirmasiReview(false);
      await terima(res, { reset: true });
      void mutate(swrKey.penilaian(penilaianId));
      toast.success(
        pilihan === "dapat_dilanjutkan"
          ? "Tinjauan disimpan. Lanjutkan dengan menentukan metode asesmen."
          : "FR.APL.02 dikembalikan ke asesi untuk direvisi.",
      );
    } catch (err) {
      setKonfirmasiReview(false);
      const fe = fieldErrors(err);
      toast.error(fe.tanda_tangan ?? fe.catatan ?? fe.hasil ?? pesanError(err, "Gagal menyimpan tinjauan."));
    } finally {
      setProsesReview(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          <span>
            {payload.progres.terisi} dari {payload.progres.total} elemen terisi
          </span>
          {meta.submitted_at && <span>· Dikirim {formatTanggal(meta.submitted_at)}</span>}
        </div>
        <EditSaveControls
          bisaUbah={bisaUbah}
          isEditing={isEditing}
          savedSuccess={savedSuccess}
          menyimpan={menyimpan}
          onUbah={handleUbah}
          onKirim={() => setKonfirmasi(true)}
          siapKirim={siapKirim}
        />
      </div>

      {meta.review && bisaReview && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#8AA53C]/40 bg-[#F2F5E9] px-4 py-3">
          <p className="text-sm text-[#5A7A22]">
            Tinjau jawaban asesi, lalu isi bagian <strong>Rekomendasi Untuk Asesi</strong> dan tanda tangan di{" "}
            <strong>Ditinjau Oleh Asesor</strong>.
          </p>
          <button
            type="button"
            onClick={() => setKonfirmasiReview(true)}
            disabled={!siapReview || prosesReview}
            title={siapReview ? undefined : "Pilih rekomendasi; isi tanda tangan (dapat) atau catatan (tidak dapat)"}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            <ClipboardCheck size={13} />
            Simpan Tinjauan
          </button>
        </div>
      )}
      {meta.review && !bisaReview && meta.status === "menunggu_review" && meta.review.alasan && (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">{meta.review.alasan}</p>
      )}
      {meta.review && meta.status === "selesai" && meta.hasil_rekomendasi_asesor === "dapat_dilanjutkan" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#8AA53C]/40 bg-[#F2F5E9] px-4 py-3">
          <p className="text-sm text-[#5A7A22] font-semibold">FR.APL.02 sudah ditinjau: asesmen dapat dilanjutkan.</p>
          <Link href={`/dashboard/penilaian/${penilaianId}/metode`} className="text-sm font-bold text-[#5A7A22] hover:underline">
            Tentukan Metode →
          </Link>
        </div>
      )}
      {bisaUbah && meta.hasil_rekomendasi_asesor === "tidak_dapat_dilanjutkan" && (
        <p className="text-sm font-semibold text-red-600">
          Dikembalikan asesor untuk revisi. Perbaiki jawaban sesuai catatan, tanda tangani ulang, lalu kirim kembali.
        </p>
      )}

      {peninjau.catatan && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <strong>Catatan asesor:</strong> {peninjau.catatan}
        </p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-10">
        {/* Ringkasan Skema Sertifikasi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td rowSpan={2} className="w-56 align-middle px-4 py-3 bg-gray-50 border border-gray-200 font-semibold text-gray-700 text-sm">
                  Skema Sertifikasi (
                  <span className={skemaType === "kkni" ? "text-gray-800" : "line-through text-gray-400"}>KKNI</span>/
                  <span className={skemaType === "okupasi" ? "text-gray-800" : "line-through text-gray-400"}>Okupasi</span>/
                  <span className={skemaType === "klaster" ? "text-gray-800" : "line-through text-gray-400"}>Klaster</span>)
                </td>
                <td className="w-24 px-4 py-3 border border-gray-200 font-semibold text-gray-600">Judul</td>
                <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="Judul skema" value={payload.skema.judul ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">Nomor</td>
                <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="Nomor skema" value={payload.skema.nomor ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-dashed border-gray-200" />

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500">Panduan Asesmen Mandiri</p>
          <h2 className="text-2xl font-bold text-gray-800">Instruksi</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            {INSTRUKSI.map((teks, idx) => (
              <li key={idx}>{teks}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-gray-800">Skema Sertifikasi (KKNI/Okupasi/Klaster)</h3>
          <p className="text-sm text-gray-600">
            Tuliskan Judul dan Nomor Skema Sertifikasi yang anda ajukan berikut
            Daftar Unit Kompetensi sesuai kemasan pada Skema Sertifikasi untuk
            mendapatkan pengakuan sesuai dengan latar belakang pendidikan,
            pelatihan, serta pengalaman kerja yang anda miliki.
          </p>
        </div>

        {units.map((unit, uIdx) => (
          <div key={unit.id}>
            <div className="border-t border-dashed border-gray-200 mb-8" />
            {/* Kode Unit / Judul Unit + Elemen table, merged into a single bordered block */}
            <div className="border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td rowSpan={2} className="w-40 align-middle px-4 py-3 bg-gray-50 border border-gray-200 font-bold text-gray-800">
                      Unit Kompetensi {uIdx + 1}
                    </td>
                    <td className="w-28 px-4 py-3 border border-gray-200 font-semibold text-gray-600">Kode Unit</td>
                    <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label={`Kode unit ${uIdx + 1}`} value={unit.kode_unit} disabled readOnly className={`${inputClass} font-mono`} />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">Judul Unit</td>
                    <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label={`Judul unit ${uIdx + 1}`} value={unit.judul_unit} disabled readOnly className={inputClass} />
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full border-collapse text-sm table-fixed">
                <thead>
                  <tr className="text-xs font-semibold text-gray-600">
                    <th className="text-left px-4 py-2.5 border border-gray-200">Dapatkah saya ...............?</th>
                    <th className="w-12 px-2 py-2.5 border border-gray-200">K</th>
                    <th className="w-12 px-2 py-2.5 border border-gray-200">BK</th>
                    <th className="w-80 text-left px-4 py-2.5 border border-gray-200">Bukti yang relevan</th>
                  </tr>
                </thead>
                <tbody>
                  {unit.elemen.map((elemen) => {
                    const j = jawaban[elemen.id];
                    const error = errors[`jawaban.${elemen.id}`];
                    return (
                      <tr key={elemen.id} className={`align-top ${error ? "bg-red-50/40" : ""}`} data-elemen={elemen.id}>
                        <td className="px-4 py-4 border border-gray-200 align-top">
                          <div className="flex items-start gap-1.5 mb-2">
                            <span className="text-sm font-semibold text-gray-800 shrink-0">{elemen.nomor}. Elemen:</span>
                            <input
                              type="text"
                              aria-label={`Elemen ${elemen.nomor}`}
                              value={elemen.nama}
                              disabled
                              readOnly
                              className={inlineEditableClass(false, "text-sm font-semibold text-gray-800")}
                            />
                          </div>
                          <p className="text-xs italic text-gray-500 mb-1.5">* Kriteria Unjuk Kerja:</p>
                          <ol className="space-y-1.5">
                            {elemen.kuk.map((kuk) => (
                              <li key={kuk.id} className="flex gap-2 text-xs text-gray-600">
                                <span className="shrink-0 text-gray-400 pt-0.5">{kuk.nomor}</span>
                                <input
                                  type="text"
                                  aria-label={`KUK ${kuk.nomor}`}
                                  value={kuk.deskripsi}
                                  disabled
                                  readOnly
                                  title={kuk.deskripsi}
                                  className={inlineEditableClass(false, "text-xs text-gray-600")}
                                />
                              </li>
                            ))}
                          </ol>
                          {error && (
                            <p className="text-xs text-red-600 mt-2" role="alert">
                              {error}
                            </p>
                          )}
                        </td>
                        <td className="px-2 py-4 border border-gray-200 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Elemen ${elemen.nomor}: Kompeten`}
                            checked={j.kompeten === "K"}
                            disabled={!editable}
                            onChange={(e) => ubahElemen(elemen.id, { kompeten: e.target.checked ? "K" : null })}
                            className={checkboxClass}
                          />
                        </td>
                        <td className="px-2 py-4 border border-gray-200 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Elemen ${elemen.nomor}: Belum kompeten`}
                            checked={j.kompeten === "BK"}
                            disabled={!editable}
                            onChange={(e) => ubahElemen(elemen.id, { kompeten: e.target.checked ? "BK" : null })}
                            className={checkboxClass}
                          />
                        </td>
                        <td className="px-4 py-4 border border-gray-200">
                          <ol className="space-y-3">
                            {j.bukti.map((bukti, bIdx) => {
                              // Error server berbasis indeks body PATCH (urutan sama dengan keBody).
                              const idxJawaban = Object.keys(jawaban).indexOf(String(elemen.id));
                              const linkError = errors[`jawaban.${idxJawaban}.bukti.${bIdx}.link`];
                              return (
                                <li key={bukti.key} className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 shrink-0">{bIdx + 1}</span>
                                    <Link2 size={12} className="text-gray-400 shrink-0" aria-hidden />
                                    {editable ? (
                                      <input
                                        type="url"
                                        aria-label={`Elemen ${elemen.nomor}: link bukti ${bIdx + 1}`}
                                        value={bukti.link}
                                        onChange={(e) => updateLink(elemen.id, bukti.key, e.target.value)}
                                        maxLength={2048}
                                        placeholder="Sisipkan link bukti (https://...)"
                                        className={buktiInputClass}
                                      />
                                    ) : bukti.link ? (
                                      <a
                                        href={bukti.link}
                                        target="_blank"
                                        rel="noopener noreferrer nofollow"
                                        className="flex-1 min-w-0 truncate text-xs text-[#5A7A22] underline"
                                        title={bukti.link}
                                      >
                                        {bukti.link}
                                      </a>
                                    ) : (
                                      <span className="flex-1 text-xs text-gray-400">Tidak ada link</span>
                                    )}
                                    {editable && (j.bukti.length > 1 || bukti.id || bukti.link) && (
                                      <button
                                        type="button"
                                        aria-label="Hapus baris bukti"
                                        onClick={() => removeBukti(elemen.id, bukti.key)}
                                        className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer"
                                      >
                                        <X size={13} />
                                      </button>
                                    )}
                                  </div>
                                  <div className="pl-7">
                                    <BerkasBukti
                                      file={bukti.file}
                                      editable={editable}
                                      proses={prosesBerkas === bukti.key}
                                      accept={accept}
                                      onPilih={(f) => unggah(elemen.id, bukti, f)}
                                      onHapus={() => hapusBerkas(bukti)}
                                      onLihat={() => lihatBerkas(bukti)}
                                    />
                                  </div>
                                  {linkError && <p className="pl-7 text-xs text-red-600">Link harus diawali http:// atau https://</p>}
                                </li>
                              );
                            })}
                          </ol>
                          {editable && j.bukti.length < payload.batas.maks_bukti_per_elemen && (
                            <button
                              type="button"
                              onClick={() => addBukti(elemen.id)}
                              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#7E9631] hover:text-[#6C8229] cursor-pointer"
                            >
                              <Plus size={12} />
                              Tambah Bukti
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Rekomendasi (mengikuti dokumen FR.APL.02 resmi) */}
        <div>
          <div className="border-t border-dashed border-gray-200 mb-8" />
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td className={`${rekHead} w-1/2`}>Rekomendasi Untuk Asesi:</td>
                  <td colSpan={2} className={rekHead}>Asesi:</td>
                </tr>
                <tr>
                  <td rowSpan={6} className="align-top p-5 border border-gray-200 text-gray-800">
                    {bisaReview ? (
                      <div className="space-y-4">
                        <p>
                          Asesmen{" "}
                          <button
                            type="button"
                            onClick={() => setPilihan("dapat_dilanjutkan")}
                            aria-pressed={pilihan === "dapat_dilanjutkan"}
                            className={`cursor-pointer rounded px-0.5 ${
                              pilihan === "tidak_dapat_dilanjutkan"
                                ? "line-through text-gray-400"
                                : pilihan === "dapat_dilanjutkan"
                                  ? "font-bold text-[#5A7A22]"
                                  : "underline decoration-dotted"
                            }`}
                          >
                            dapat
                          </button>
                          /
                          <button
                            type="button"
                            onClick={() => setPilihan("tidak_dapat_dilanjutkan")}
                            aria-pressed={pilihan === "tidak_dapat_dilanjutkan"}
                            className={`cursor-pointer rounded px-0.5 ${
                              pilihan === "dapat_dilanjutkan"
                                ? "line-through text-gray-400"
                                : pilihan === "tidak_dapat_dilanjutkan"
                                  ? "font-bold text-red-600"
                                  : "underline decoration-dotted"
                            }`}
                          >
                            tidak dapat
                          </button>{" "}
                          dilanjutkan
                        </p>
                        <p className="text-xs italic text-gray-400">*klik pilihan yang sesuai; pilihan lain akan dicoret</p>
                        <div className="space-y-1.5">
                          <label htmlFor="catatan-review" className="text-xs font-semibold text-gray-600">
                            Catatan untuk asesi {pilihan === "tidak_dapat_dilanjutkan" && <span className="text-red-500">*</span>}
                          </label>
                          <textarea
                            id="catatan-review"
                            value={catatanReview}
                            onChange={(e) => setCatatanReview(e.target.value)}
                            maxLength={2000}
                            rows={5}
                            placeholder={pilihan === "tidak_dapat_dilanjutkan" ? "Wajib: jelaskan bagian yang perlu direvisi asesi" : "Opsional"}
                            className="w-full p-3 text-sm text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 resize-none transition-all"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        Asesmen{" "}
                        <span className={rekomendasi === "tidak_dapat_dilanjutkan" ? "line-through text-gray-400" : ""}>dapat</span>/
                        <span className={rekomendasi === "dapat_dilanjutkan" ? "line-through text-gray-400" : ""}>tidak dapat</span>{" "}
                        dilanjutkan
                      </>
                    )}
                  </td>
                  <td className={rekLabel}>Nama</td>
                  <td className={rekNilai}>{payload.asesi.nama ?? ""}</td>
                </tr>
                <tr>
                  <td className={rekLabel}>Tanda Tangan/Tanggal</td>
                  <td className="p-2 border border-gray-200">
                    <SignatureBox
                      penilaianId={penilaianId}
                      pihak="asesi"
                      ada={meta.tanda_tangan.asesi.ada}
                      tanggal={meta.tanda_tangan.asesi.tanggal}
                      versi={versiTtd}
                      aktif={bisaUbah}
                      onClick={bukaTandaTangan}
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className={rekHead}>Ditinjau Oleh Asesor:</td>
                </tr>
                <tr>
                  <td className={rekLabel}>Nama</td>
                  <td className={rekNilai}>{peninjau.nama ?? ""}</td>
                </tr>
                <tr>
                  <td className={rekLabel}>No. Reg</td>
                  <td className={rekNilai}>{peninjau.nomor_registrasi ?? ""}</td>
                </tr>
                <tr>
                  <td className={rekLabel}>Tanda Tangan/Tanggal</td>
                  <td className="p-2 border border-gray-200">
                    <SignatureBox
                      penilaianId={penilaianId}
                      pihak="asesor"
                      ada={meta.tanda_tangan.asesor.ada}
                      tanggal={meta.tanda_tangan.asesor.tanggal}
                      aktif={bisaReview && pilihan === "dapat_dilanjutkan"}
                      onClick={() => setDialogTtdAsesor(true)}
                      pratinjau={bisaReview ? ttdAsesor : null}
                    />
                    {bisaReview && pilihan !== "dapat_dilanjutkan" && (
                      <p className="mt-1 text-[11px] text-gray-400">Tanda tangan diperlukan bila asesmen dapat dilanjutkan.</p>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <EditSaveControls
          bisaUbah={bisaUbah}
          isEditing={isEditing}
          savedSuccess={savedSuccess}
          menyimpan={menyimpan}
          onUbah={handleUbah}
          onKirim={() => setKonfirmasi(true)}
          siapKirim={siapKirim}
        />
      </div>

      <SignatureDialog
        open={dialogTtd}
        onOpenChange={setDialogTtd}
        title="Tanda Tangan Asesi"
        keterangan="Dengan menandatangani, saya menyatakan asesmen mandiri ini benar. Mengubah jawaban atau bukti setelah menandatangani akan menghapus tanda tangan."
        onSimpan={simpanTandaTangan}
      />

      <SignatureDialog
        open={dialogTtdAsesor}
        onOpenChange={setDialogTtdAsesor}
        title="Tanda Tangan Asesor"
        keterangan="Tanda tangan disimpan bersama tinjauan saat Anda menekan Simpan Tinjauan."
        onSimpan={async (dataUrl) => setTtdAsesor(dataUrl)}
      />

      <ConfirmDialog
        open={konfirmasiReview}
        onOpenChange={setKonfirmasiReview}
        title={pilihan === "dapat_dilanjutkan" ? "Asesmen dapat dilanjutkan?" : "Kembalikan FR.APL.02 ke asesi?"}
        description={
          pilihan === "dapat_dilanjutkan" ? (
            <p>FR.APL.02 akan ditandatangani dan dikunci. Setelah ini Anda dapat menentukan metode asesmen.</p>
          ) : (
            <p>FR.APL.02 dikembalikan ke asesi untuk direvisi beserta catatan Anda. Tanda tangan asesi akan dihapus.</p>
          )
        }
        confirmLabel={pilihan === "dapat_dilanjutkan" ? "Ya, tandatangani" : "Ya, kembalikan"}
        onConfirm={simpanReview}
        loading={prosesReview}
      />

      <ConfirmDialog
        open={konfirmasi}
        onOpenChange={setKonfirmasi}
        title="Kirim FR.APL.02?"
        description={
          <>
            <p>Setelah dikirim, jawaban tidak dapat diubah dan akan ditinjau oleh asesor.</p>
            <p>Pastikan seluruh elemen sudah dijawab dengan benar.</p>
          </>
        }
        confirmLabel="Kirim sekarang"
        onConfirm={kirim}
        loading={prosesKirim}
      />
    </form>
  );
}
