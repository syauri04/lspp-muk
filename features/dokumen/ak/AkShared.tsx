"use client";

/*
 * Bagian bersama dokumen AK yang diisi asesor lalu disetujui asesi (FR.AK.07, FR.AK.01):
 * alur Ubah/Simpan -> tanda tangan asesor -> Kirim ke Asesi -> asesi tanda tangan (Setujui).
 * Asesor dapat menarik kembali selama asesi belum menyetujui. Style mengikuti mockup
 * app/dashboard/fr/ak-07 & ak-01.
 */

import { useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Plus, Save, Send, ShieldCheck, Undo2 } from "lucide-react";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { fieldErrors, pesanError, statusError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SignatureDialog } from "@/components/dokumen/SignatureDialog";
import { SignatureImage } from "@/components/dokumen/SignatureImage";
import { inputClass } from "@/features/dokumen/mapa/MapaShared";
import type { MukRole } from "@/types/auth";
import type { AkInfo, DokumenPayload, JenisTuk, Opsi } from "@/types/dokumen";

/** State & aksi form AK persetujuan. `peran` = peran user yang sedang login. */
export function useAkForm<I, P extends DokumenPayload & { isian: I }>({
  payload,
  setPayload,
  slug,
  nama,
  peran,
  keBody,
  tanpaPersetujuan = false,
}: {
  payload: P;
  setPayload: (p: P) => Promise<unknown>;
  slug: string;
  nama: string;
  peran: MukRole;
  /** Bentuk isian yang dikirim saat Simpan (default: isian apa adanya). */
  keBody?: (isian: I) => unknown;
  /** Dokumen hanya asesor (mis. AK.05/AK.06): "Selesaikan" tanpa persetujuan asesi. */
  tanpaPersetujuan?: boolean;
}) {
  const { mutate } = useSWRConfig();
  const meta = payload.dokumen;
  const penilaianId = meta.penilaian_id;
  const bisaUbah = meta.dapat_diubah;
  const bisaSetujui = !!meta.persetujuan?.bisa;

  const [isian, setIsian] = useState<I>(payload.isian);
  const [isEditing, setIsEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [versiTtd, setVersiTtd] = useState(0);
  const [dialogTtd, setDialogTtd] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState<"kirim" | "tarik" | "setujui" | null>(null);
  const [proses, setProses] = useState(false);
  // Persetujuan asesi: tanda tangan digambar dulu (pratinjau), dikirim saat konfirmasi.
  const [ttdPersetujuan, setTtdPersetujuan] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const hapusError = (kunci?: string) => {
    if (!kunci) return;
    setErrors((e) => {
      const salinan = { ...e };
      delete salinan[kunci];
      return salinan;
    });
  };

  const ubah = (fn: (prev: I) => I, kunciError?: string) => {
    setIsian(fn);
    setDirty(true);
    hapusError(kunciError);
  };

  const terima = async (res: P) => {
    const statusBerubah = res.dokumen.status !== meta.status;
    if (meta.tanda_tangan.asesor.ada && !res.dokumen.tanda_tangan.asesor.ada && peran === "asesor") {
      toast.info("Isi dokumen berubah, silakan tanda tangani ulang.");
    }
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
      await terima(await mukDokumen.simpan<P, { isian: unknown }>(penilaianId, slug, { isian: keBody ? keBody(isian) : isian }));
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

  const bukaTtdAsesor = () => {
    if (isEditing && dirty) {
      toast.error("Simpan perubahan terlebih dahulu sebelum menandatangani.");
      return;
    }
    setDialogTtd(true);
  };

  /** Dipakai SignatureDialog: asesor menyimpan ttd; asesi hanya menyiapkan pratinjau. */
  const simpanTtd = async (dataUrl: string) => {
    if (peran !== "asesor") {
      setTtdPersetujuan(dataUrl);
      return;
    }
    try {
      await terima(await mukDokumen.tandaTangan<P>(penilaianId, slug, dataUrl));
      setVersiTtd((v) => v + 1);
      toast.success("Tanda tangan tersimpan.");
    } catch (err) {
      toast.error(fieldErrors(err).tanda_tangan ?? pesanError(err, "Gagal menyimpan tanda tangan."));
      throw err;
    }
  };

  const jalankan = async () => {
    const aksi = konfirmasi;
    setProses(true);
    try {
      if (aksi === "kirim") {
        await terima(await mukDokumen.submit<P>(penilaianId, slug));
        toast.success(tanpaPersetujuan ? `${nama} diselesaikan.` : `${nama} dikirim ke asesi untuk disetujui.`);
      } else if (aksi === "tarik") {
        await terima(await mukDokumen.tarik<P>(penilaianId, slug));
        toast.success(`${nama} ditarik kembali dan dapat diubah.`);
      } else if (aksi === "setujui" && ttdPersetujuan) {
        await terima(await mukDokumen.setujui<P>(penilaianId, slug, ttdPersetujuan));
        setTtdPersetujuan(null);
        setVersiTtd((v) => v + 1);
        toast.success(`${nama} telah Anda setujui.`);
      }
      void mutate(swrKey.penilaian(penilaianId));
      setKonfirmasi(null);
    } catch (err) {
      setKonfirmasi(null);
      const fe = fieldErrors(err);
      if (statusError(err) === 422 && Object.keys(fe).length) {
        setErrors(fe);
        toast.error(fe.tanda_tangan ?? "Lengkapi isian yang ditandai.");
        const pertama = Object.keys(fe).find((k) => k !== "tanda_tangan");
        if (pertama) document.querySelector(`[data-error="${pertama}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error(pesanError(err, "Aksi gagal."));
      }
    } finally {
      setProses(false);
    }
  };

  return {
    meta,
    penilaianId,
    peran,
    bisaUbah,
    bisaSetujui,
    isian,
    ubah,
    editable: isEditing && bisaUbah,
    isEditing,
    setIsEditing,
    dirty,
    menyimpan,
    savedSuccess,
    errors,
    versiTtd,
    dialogTtd,
    setDialogTtd,
    bukaTtdAsesor,
    simpanTtd,
    ttdPersetujuan,
    konfirmasi,
    setKonfirmasi,
    proses,
    jalankan,
    handleSubmit,
    slug,
    nama,
    tanpaPersetujuan,
  };
}

/** Bagian form yang dipakai komponen bersama (tanpa isian, yang tipenya khusus per dokumen). */
export type AkForm = Omit<ReturnType<typeof useAkForm>, "isian" | "ubah">;

const tombolUtama =
  "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default";

/** Ubah / Simpan / Kirim ke Asesi (asesor), Tarik Kembali, atau Setujui (asesi). */
export function AkControls({ f }: { f: AkForm }) {
  const { meta } = f;
  const siapKirim = meta.tanda_tangan.asesor.ada && !f.dirty;

  if (f.bisaSetujui) {
    return (
      <button
        type="button"
        onClick={() => f.setKonfirmasi("setujui")}
        disabled={!f.ttdPersetujuan || f.proses}
        title={f.ttdPersetujuan ? undefined : "Tanda tangani kotak Tanda Tangan Asesi terlebih dahulu"}
        className={tombolUtama}
      >
        <ShieldCheck size={13} />
        Setujui
      </button>
    );
  }

  if (meta.dapat_ditarik) {
    return (
      <button
        type="button"
        onClick={() => f.setKonfirmasi("tarik")}
        disabled={f.proses}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-[#7E9631] text-[#7E9631] bg-white hover:bg-[#F2F5E9] transition-all cursor-pointer disabled:opacity-50"
      >
        <Undo2 size={13} />
        Tarik Kembali
      </button>
    );
  }

  if (!f.bisaUbah) return null;

  return (
    <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
      {f.savedSuccess && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2F5E9] text-[#5A7A22] text-xs font-semibold border border-[#8AA53C]/30 animate-in fade-in">
          <Check size={14} className="stroke-[2.5]" />
          Tersimpan
        </div>
      )}
      <button
        type="button"
        onClick={() => f.setIsEditing(true)}
        disabled={f.isEditing}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          f.isEditing ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default" : "border-[#7E9631] text-[#7E9631] bg-white hover:bg-[#F2F5E9]"
        }`}
      >
        <Pencil size={13} />
        Ubah
      </button>
      <button
        type="submit"
        disabled={!f.isEditing || f.menyimpan}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
      >
        {f.menyimpan ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
        Simpan
      </button>
      {!f.isEditing && (
        <button
          type="button"
          onClick={() => f.setKonfirmasi("kirim")}
          disabled={!siapKirim}
          title={siapKirim ? undefined : "Simpan isian lalu tanda tangani sebagai asesor terlebih dahulu"}
          className={tombolUtama}
        >
          <Send size={13} />
          {f.tanpaPersetujuan ? "Selesaikan" : "Kirim ke Asesi"}
        </button>
      )}
    </div>
  );
}

/** Pesan status di atas formulir (sesuai peran). */
export function AkBanner({ f }: { f: AkForm }) {
  const { meta, peran } = f;

  if (meta.status === "selesai") {
    return (
      <p className="text-sm text-[#5A7A22] font-semibold bg-[#F2F5E9] border border-[#8AA53C]/40 rounded-lg p-3">
        {f.nama} sudah {f.tanpaPersetujuan ? "diselesaikan dan ditandatangani asesor" : "ditandatangani asesor dan disetujui asesi"}.
      </p>
    );
  }
  if (meta.status === "menunggu_persetujuan") {
    return peran === "asesi" ? (
      <p className="text-sm text-[#5A7A22] bg-[#F2F5E9] border border-[#8AA53C]/40 rounded-lg p-3">
        Baca isi dokumen dari asesor. Bila setuju, klik kotak <strong>Tanda Tangan Asesi</strong>, lalu klik <strong>Setujui</strong>.
      </p>
    ) : (
      <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
        Menunggu asesi menyetujui dan menandatangani. Klik <strong>Tarik Kembali</strong> bila ada yang perlu diperbaiki.
      </p>
    );
  }
  if (f.bisaUbah) {
    return (
      <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
        Klik <strong>Ubah</strong> untuk mengisi, <strong>Simpan</strong>, tanda tangani kotak <strong>Tanda Tangan Asesor</strong>, lalu{" "}
        {f.tanpaPersetujuan ? <strong>Selesaikan</strong> : <><strong>Kirim ke Asesi</strong> untuk disetujui</>}.
      </p>
    );
  }
  return null;
}

/** Kotak tanda tangan asesor/asesi: klik untuk menandatangani bila aktif. */
export function TtdKotak({ f, pihak, tinggi = "h-[110px]" }: { f: AkForm; pihak: "asesor" | "asesi"; tinggi?: string }) {
  const ttd = f.meta.tanda_tangan[pihak];
  const aktif = pihak === "asesor" ? f.peran === "asesor" && f.bisaUbah && !f.isEditing : f.bisaSetujui;
  const pratinjau = pihak === "asesi" && f.bisaSetujui ? f.ttdPersetujuan : null;
  const buka = () => (pihak === "asesor" ? f.bukaTtdAsesor() : f.setDialogTtd(true));

  return (
    <div
      role={aktif ? "button" : undefined}
      tabIndex={aktif ? 0 : undefined}
      aria-label={aktif ? `Klik untuk tanda tangan ${pihak}` : `Tanda tangan ${pihak}`}
      onClick={aktif ? buka : undefined}
      onKeyDown={(e) => aktif && (e.key === "Enter" || e.key === " ") && buka()}
      className={`relative w-full ${tinggi} border border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
        aktif ? "border-[#7E9631]/50 bg-white cursor-pointer hover:border-[#7E9631]" : "border-gray-200 bg-gray-50"
      }`}
    >
      {pratinjau ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL lokal hasil kanvas
        <img src={pratinjau} alt="Pratinjau tanda tangan" className="max-h-[80%] max-w-full object-contain" />
      ) : ttd.ada ? (
        <>
          <SignatureImage penilaianId={f.penilaianId} slug={f.slug} pihak={pihak} versi={`${ttd.tanggal}-${f.versiTtd}`} alt={`Tanda tangan ${pihak}`} />
          {ttd.tanggal && <span className="text-[11px] text-gray-500">{formatTanggal(ttd.tanggal)}</span>}
        </>
      ) : (
        <Plus size={22} className={`stroke-[1.5] ${aktif ? "text-gray-400" : "text-gray-300"}`} />
      )}
    </div>
  );
}

/** Dialog tanda tangan & konfirmasi aksi (dipasang sekali per halaman). */
export function AkDialogs({ f }: { f: AkForm }) {
  const teks = {
    kirim: f.tanpaPersetujuan
      ? { title: `Selesaikan ${f.nama}?`, description: "Setelah diselesaikan, isian tidak dapat diubah lagi.", confirm: "Selesaikan" }
      : {
          title: `Kirim ${f.nama} ke asesi?`,
          description: "Setelah dikirim, isian tidak dapat diubah kecuali ditarik kembali sebelum asesi menyetujui.",
          confirm: "Kirim",
        },
    tarik: {
      title: `Tarik kembali ${f.nama}?`,
      description: "Dokumen kembali menjadi draft dan dapat diubah. Asesi belum dapat menyetujui sampai dikirim ulang.",
      confirm: "Tarik kembali",
    },
    setujui: {
      title: `Setujui ${f.nama}?`,
      description: "Dengan tanda tangan ini Anda menyetujui isi dokumen. Dokumen tidak dapat diubah lagi.",
      confirm: "Setujui",
    },
  };
  const k = f.konfirmasi ? teks[f.konfirmasi] : null;

  return (
    <>
      <SignatureDialog
        open={f.dialogTtd}
        onOpenChange={f.setDialogTtd}
        title={f.peran === "asesor" ? "Tanda Tangan Asesor" : "Tanda Tangan Asesi"}
        onSimpan={f.simpanTtd}
      />
      <ConfirmDialog
        open={k !== null}
        onOpenChange={(o) => !o && f.setKonfirmasi(null)}
        title={k?.title ?? ""}
        description={k?.description ?? ""}
        confirmLabel={k?.confirm}
        onConfirm={f.jalankan}
        loading={f.proses}
      />
    </>
  );
}

/** Coret pilihan yang tidak dipilih (gaya "Sewaktu/Tempat Kerja/Mandiri*"). */
export function PilihCoret({
  opsi,
  value,
  onChange,
  editable,
  aktifClass = "text-gray-800",
}: {
  opsi: Opsi[];
  value: string | null;
  onChange: (v: string) => void;
  editable: boolean;
  aktifClass?: string;
}) {
  return (
    <>
      {opsi.map((o, idx) => (
        <span key={o.value}>
          {idx > 0 && "/"}
          <button
            type="button"
            disabled={!editable}
            onClick={() => onChange(o.value)}
            className={value === null ? "text-gray-700" : value === o.value ? aktifClass : "line-through text-gray-400"}
          >
            {o.label}
          </button>
        </span>
      ))}
    </>
  );
}

/** Baris header: skema, TUK, nama asesor, nama asesi (+ baris tambahan). */
export function AkHeader({
  info,
  opsiTuk,
  tuk,
  onTuk,
  editable,
  errors,
  pengantar,
  children,
}: {
  info: AkInfo;
  opsiTuk: Opsi[];
  tuk: JenisTuk | null;
  onTuk: (v: JenisTuk) => void;
  editable: boolean;
  errors: Record<string, string>;
  pengantar?: string;
  children?: React.ReactNode;
}) {
  const jenis = info.skema.jenis?.toLowerCase() ?? null;
  const coret = (k: string) => (jenis === k ? "text-gray-800" : "line-through text-gray-400");

  return (
    <div className="border border-gray-200">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {pengantar && (
            <tr>
              <td colSpan={4} className="px-4 py-3 border border-gray-200 text-gray-700">
                {pengantar}
              </td>
            </tr>
          )}
          <tr>
            <td rowSpan={2} className="w-56 align-middle px-4 py-3 bg-gray-50 border border-gray-200 font-semibold text-gray-700 text-sm">
              Skema Sertifikasi (<span className={coret("kkni")}>KKNI</span>/<span className={coret("okupasi")}>Okupasi</span>/
              <span className={coret("klaster")}>Klaster</span>)
            </td>
            <td className="w-24 px-4 py-3 border border-gray-200 font-semibold text-gray-600">Judul</td>
            <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="px-3 py-2 border border-gray-200">
              <input type="text" aria-label="Judul skema" value={info.skema.judul ?? ""} disabled readOnly className={inputClass} />
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">Nomor</td>
            <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="px-3 py-2 border border-gray-200">
              <input type="text" aria-label="Nomor skema" value={info.skema.nomor ?? ""} disabled readOnly className={inputClass} />
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="px-4 py-3 border border-gray-200 font-semibold text-gray-700">
              TUK
            </td>
            <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="px-3 py-2 border border-gray-200 text-sm text-gray-600" data-error="isian.tuk">
              <PilihCoret opsi={opsiTuk} value={tuk} onChange={(v) => onTuk(v as JenisTuk)} editable={editable} aktifClass="text-black" />
              <span className="text-gray-400">*</span>
              {errors["isian.tuk"] && <p className="mt-1 text-xs font-semibold text-red-600">{errors["isian.tuk"]}</p>}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">
              Nama Asesor
            </td>
            <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="px-3 py-2 border border-gray-200">
              <input type="text" aria-label="Nama asesor" value={info.asesor.nama ?? ""} disabled readOnly className={inputClass} />
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">
              Nama Asesi
            </td>
            <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="px-3 py-2 border border-gray-200">
              <input type="text" aria-label="Nama asesi" value={info.asesi.nama ?? ""} disabled readOnly className={inputClass} />
            </td>
          </tr>
          {children}
        </tbody>
      </table>
    </div>
  );
}
