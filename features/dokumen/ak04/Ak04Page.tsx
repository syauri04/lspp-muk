"use client";

/*
 * FR.AK.04 - Banding Asesmen — diisi ASESI setelah keputusan (FR.AK.02 selesai).
 * Perilaku mengikuti FR.AK.03: Ubah -> Simpan -> Kirim, koreksi oleh super admin,
 * error server (422) ditandai di form. Hak ubah ditentukan server (meta.dapat_diubah).
 */

import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Plus, Save, Send } from "lucide-react";
import { KekuranganKirim } from "@/components/dokumen/KekuranganKirim";
import { SignatureDialog } from "@/components/dokumen/SignatureDialog";
import { SignatureImage } from "@/components/dokumen/SignatureImage";
import {
  AlasanKoreksiDialog,
  KoreksiInfo,
  KoreksiTombol,
  useKoreksiAdmin,
} from "@/components/dokumen/KoreksiAdmin";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { fieldErrors, pesanError, statusError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ak04Isian, Ak04Payload, Pencapaian } from "@/types/dokumen";
import {
  EditableText,
  PesanError,
  checkboxClass,
} from "@/features/dokumen/mapa/MapaShared";

const SLUG = "ak-04";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

// Urutan harus sama dengan isian.jawaban dari server (3 item).
const PERTANYAAN = [
  "Apakah Proses Banding telah dijelaskan kepada anda?",
  "Apakah Anda telah mendiskusikan Banding dengan Asesor?",
  'Apakah Anda mau melibatkan "orang lain" membantu Anda dalam Proses Banding?',
];

export function Ak04Page({ penilaian }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ak04Payload>(penilaian.id, SLUG),
    {
      revalidateOnFocus: false,
    },
  );

  if (error) {
    return (
      <ErrorState
        title="Gagal memuat FR.AK.04"
        description={pesanError(error)}
        onRetry={() => mutate()}
      />
    );
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.AK.04..." />;

  return (
    <Ak04Form
      key={data.dokumen.id}
      payload={data}
      setPayload={(p) => mutate(p, { revalidate: false })}
    />
  );
}

function Ak04Form({
  payload,
  setPayload,
}: {
  payload: Ak04Payload;
  setPayload: (p: Ak04Payload) => Promise<unknown>;
}) {
  const { mutate } = useSWRConfig();
  const meta = payload.dokumen;
  const bisaKoreksi = !!meta.koreksi?.bisa;
  const bisaUbah = meta.dapat_diubah || bisaKoreksi;
  const [isian, setIsian] = useState<Ak04Isian>(payload.isian);
  const [isEditing, setIsEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>(
    () => payload.dokumen.kekurangan ?? {},
  );
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [proses, setProses] = useState(false);
  const [dialogTtd, setDialogTtd] = useState(false);
  const [versiTtd, setVersiTtd] = useState(0);
  const editable = isEditing && bisaUbah;
  // Jenis skema otomatis (KKNI = Kualifikasi); yang bukan jenis skema ini dicoret.
  const jenisSkema = payload.info.skema.jenis?.toLowerCase() ?? null;
  const coret = (k: string) =>
    jenisSkema === null || jenisSkema === k
      ? "text-gray-800"
      : "line-through text-gray-400";

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const hapusError = (kunci: string) =>
    setErrors((e) => {
      const salinan = { ...e };
      delete salinan[kunci];
      return salinan;
    });

  const ubahField = <K extends keyof Ak04Isian>(
    kunci: K,
    nilai: Ak04Isian[K],
  ) => {
    setIsian((p) => ({ ...p, [kunci]: nilai }));
    setDirty(true);
    hapusError(`isian.${String(kunci)}`);
  };

  const setJawaban = (i: number, nilai: Exclude<Pencapaian, null>) => {
    setIsian((p) => ({
      ...p,
      jawaban: p.jawaban.map((j, idx) =>
        idx === i ? { ...j, hasil: j.hasil === nilai ? null : nilai } : j,
      ),
    }));
    setDirty(true);
    hapusError(`isian.jawaban.${i}`);
  };

  const terima = async (res: Ak04Payload) => {
    await setPayload(res);
    setErrors(res.dokumen.kekurangan ?? {});
    setIsian(res.isian);
    setDirty(false);
    void mutate(swrKey.penilaian(meta.penilaian_id));
  };

  const koreksi = useKoreksiAdmin<Ak04Payload>({
    meta,
    slug: SLUG,
    body: () => ({ isian }),
    terima,
    setErrors,
    onTersimpan: () => setIsEditing(false),
  });

  const batalKoreksi = () => {
    setIsian(payload.isian);
    setIsEditing(false);
    setDirty(false);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    if (bisaKoreksi) {
      if (dirty) koreksi.setDialog(true);
      else toast.info("Belum ada isian yang diubah.");
      return;
    }
    setMenyimpan(true);
    try {
      await terima(
        await mukDokumen.simpan<Ak04Payload, { isian: Ak04Isian }>(
          meta.penilaian_id,
          SLUG,
          { isian },
        ),
      );
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(pesanError(err, "Gagal menyimpan."));
    } finally {
      setMenyimpan(false);
    }
  };

  const ttdAsesi = meta.tanda_tangan.asesi;
  // Hanya asesi pengisi (bukan super admin) yang menandatangani, dan setelah isian tersimpan.
  const ttdAktif = bisaUbah && !bisaKoreksi && !isEditing;

  const bukaTtd = () => {
    if (dirty) {
      toast.error("Simpan perubahan terlebih dahulu sebelum menandatangani.");
      return;
    }
    setDialogTtd(true);
  };

  const simpanTtd = async (dataUrl: string) => {
    try {
      await terima(
        await mukDokumen.tandaTangan<Ak04Payload>(
          meta.penilaian_id,
          SLUG,
          dataUrl,
        ),
      );
      setVersiTtd((v) => v + 1);
      toast.success("Tanda tangan tersimpan.");
    } catch (err) {
      toast.error(
        fieldErrors(err).tanda_tangan ??
          pesanError(err, "Gagal menyimpan tanda tangan."),
      );
      throw err;
    }
  };

  const kirim = async () => {
    setProses(true);
    try {
      await terima(
        await mukDokumen.submit<Ak04Payload>(meta.penilaian_id, SLUG),
      );
      toast.success("Banding FR.AK.04 terkirim.");
    } catch (err) {
      const fe = fieldErrors(err);
      if (statusError(err) === 422 && Object.keys(fe).length) {
        setErrors(fe);
        toast.error(fe.tanda_tangan ?? "Lengkapi isian yang ditandai.");
        document
          .querySelector(
            `[data-error="${Object.keys(fe).find((k) => k !== "tanda_tangan") ?? ""}"]`,
          )
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error(pesanError(err, "Gagal mengirim."));
      }
    } finally {
      setKonfirmasi(false);
      setProses(false);
    }
  };

  const kontrol = bisaKoreksi ? (
    <KoreksiTombol
      isEditing={isEditing}
      onKoreksi={() => setIsEditing(true)}
      onBatal={batalKoreksi}
      proses={koreksi.proses}
    />
  ) : (
    bisaUbah && (
      <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2F5E9] text-[#5A7A22] text-xs font-semibold border border-[#8AA53C]/30 animate-in fade-in">
            <Check size={14} className="stroke-[2.5]" />
            Tersimpan
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsEditing(true)}
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
          {menyimpan ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          Simpan
        </button>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setKonfirmasi(true)}
            disabled={dirty || proses || !ttdAsesi.ada}
            title={
              ttdAsesi.ada
                ? undefined
                : "Simpan isian lalu tanda tangani terlebih dahulu"
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            <Send size={13} />
            Kirim
          </button>
        )}
      </div>
    )
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && (
            <span>· Dikirim {formatTanggal(meta.submitted_at)}</span>
          )}
        </div>
        {kontrol}
      </div>

      <KoreksiInfo meta={meta} isEditing={isEditing} />
      {bisaKoreksi && <AlasanKoreksiDialog k={koreksi} nama="FR.AK.04" />}
      {meta.dapat_diubah && !isEditing && !dirty && (
        <KekuranganKirim kekurangan={meta.kekurangan} />
      )}

      {meta.status === "selesai" ? (
        <p className="text-sm text-[#5A7A22] font-semibold bg-[#F2F5E9] border border-[#8AA53C]/40 rounded-lg p-3">
          Banding sudah dikirim.
        </p>
      ) : (
        meta.dapat_diubah && (
          <p className="text-sm text-[#5A7A22] bg-[#F2F5E9] border border-[#8AA53C]/40 rounded-lg p-3">
            Klik <strong>Ubah</strong>, jawab pertanyaan, isi alasan banding,{" "}
            <strong>Simpan</strong>, klik kotak{" "}
            <strong>Tanda Tangan Asesi</strong>, lalu <strong>Kirim</strong>.
          </p>
        )
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs">
        <div className="border border-gray-200 divide-y divide-gray-200">
          {/* Header otomatis (hanya baca) */}
          {(
            [
              ["Nama Asesi", payload.info.asesi.nama],
              ["Nama Asesor", payload.info.asesor.nama],
              [
                "Tanggal Asesmen",
                payload.info.jadwal.tanggal
                  ? formatTanggal(payload.info.jadwal.tanggal)
                  : null,
              ],
            ] as const
          ).map(([label, nilai]) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <span className="w-40 shrink-0 font-semibold text-gray-700">
                {label}
              </span>
              <span className="text-gray-400">:</span>
              <input
                type="text"
                aria-label={label}
                value={nilai ?? ""}
                disabled
                readOnly
                className={inputClass}
              />
            </div>
          ))}

          {/* Pertanyaan Ya/Tidak */}
          <div className="grid grid-cols-[1fr_80px_96px]">
            <div className="px-4 py-3 font-bold text-gray-800 border-r border-gray-200">
              Jawablah dengan Ya atau Tidak pertanyaan-pertanyaan berikut ini:
            </div>
            <div className="px-4 py-3 font-bold text-gray-800 text-center border-r border-gray-200">
              YA
            </div>
            <div className="px-4 py-3 font-bold text-gray-800 text-center">
              TIDAK
            </div>
          </div>

          {PERTANYAAN.map((teks, i) => {
            const j = isian.jawaban[i];
            return (
              <div key={i} data-error={`isian.jawaban.${i}`}>
                <div className="grid grid-cols-[1fr_80px_96px]">
                  <div className="px-4 py-3 text-gray-700 border-r border-gray-200">
                    {teks}
                    <PesanError kunci={`isian.jawaban.${i}`} errors={errors} />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-center border-r border-gray-200">
                    <input
                      type="checkbox"
                      aria-label={`Pertanyaan ${i + 1}: Ya`}
                      checked={j?.hasil === "ya"}
                      disabled={!editable}
                      onChange={() => setJawaban(i, "ya")}
                      className={checkboxClass}
                    />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-center">
                    <input
                      type="checkbox"
                      aria-label={`Pertanyaan ${i + 1}: Tidak`}
                      checked={j?.hasil === "tidak"}
                      disabled={!editable}
                      onChange={() => setJawaban(i, "tidak")}
                      className={checkboxClass}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Skema: otomatis dari info (jenis yang bukan isian dicoret) */}
          <div className="px-4 py-3 space-y-2.5">
            <p className="text-gray-700">
              Banding ini diajukan atas Keputusan Asesmen yang dibuat terhadap
              Skema Sertifikasi (
              <span className={coret("kkni")}>Kualifikasi</span>/
              <span className={coret("klaster")}>Klaster</span>/
              <span className={coret("okupasi")}>Okupasi</span>) berikut:
            </p>
            {(
              [
                ["Skema Sertifikasi", payload.info.skema.judul],
                ["No. Skema Sertifikasi", payload.info.skema.nomor],
              ] as const
            ).map(([label, nilai]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-52 shrink-0 text-gray-600">{label}</span>
                <span className="text-gray-400">:</span>
                <input
                  type="text"
                  aria-label={label}
                  value={nilai ?? ""}
                  disabled
                  readOnly
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          {/* Alasan banding */}
          <div
            className="px-4 py-3 space-y-2"
            data-error="isian.alasan_banding"
          >
            <p className="text-gray-700">
              Banding ini diajukan atas alasan sebagai berikut:
            </p>
            <EditableText
              value={isian.alasan_banding ?? ""}
              onChange={(v) => ubahField("alasan_banding", v)}
              isEditing={editable}
              ariaLabel="Alasan banding"
              className="text-sm text-gray-700"
              rows={4}
            />
            <PesanError kunci="isian.alasan_banding" errors={errors} />
          </div>

          <div className="px-4 py-3 text-sm text-gray-600 italic">
            Anda mempunyai hak mengajukan banding jika Anda menilai Proses
            Asesmen tidak sesuai SOP dan tidak memenuhi Prinsip Asesmen.
          </div>

          {/* Tanda tangan asesi (tanggal otomatis saat menandatangani) */}
          <div className="px-4 py-4 space-y-3" data-error="tanda_tangan">
            <p className="text-gray-700">Tanda Tangan Asesi dan Tanggal:</p>
            <div
              role={ttdAktif ? "button" : undefined}
              tabIndex={ttdAktif ? 0 : undefined}
              aria-label={
                ttdAktif
                  ? "Klik untuk tanda tangan asesi"
                  : "Tanda tangan asesi"
              }
              onClick={ttdAktif ? bukaTtd : undefined}
              onKeyDown={(e) =>
                ttdAktif && (e.key === "Enter" || e.key === " ") && bukaTtd()
              }
              className={`relative w-full max-w-sm h-[110px] border border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                ttdAktif
                  ? "border-[#7E9631]/50 bg-white cursor-pointer hover:border-[#7E9631]"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {ttdAsesi.ada ? (
                <>
                  <SignatureImage
                    penilaianId={meta.penilaian_id}
                    slug={SLUG}
                    pihak="asesi"
                    versi={`${ttdAsesi.tanggal}-${versiTtd}`}
                    alt="Tanda tangan asesi"
                  />
                  {ttdAsesi.tanggal && (
                    <span className="text-[11px] text-gray-500">
                      {formatTanggal(ttdAsesi.tanggal)}
                    </span>
                  )}
                </>
              ) : (
                <Plus
                  size={22}
                  className={`stroke-[1.5] ${ttdAktif ? "text-gray-400" : "text-gray-300"}`}
                />
              )}
            </div>
            <PesanError kunci="tanda_tangan" errors={errors} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">{kontrol}</div>

      <SignatureDialog
        open={dialogTtd}
        onOpenChange={setDialogTtd}
        title="Tanda Tangan Asesi"
        onSimpan={simpanTtd}
      />

      <ConfirmDialog
        open={konfirmasi}
        onOpenChange={setKonfirmasi}
        title="Kirim banding FR.AK.04?"
        description="Setelah dikirim, banding tidak dapat diubah."
        confirmLabel="Kirim"
        onConfirm={kirim}
        loading={proses}
      />
    </form>
  );
}
