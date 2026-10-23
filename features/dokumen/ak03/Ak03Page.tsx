"use client";

/*
 * FR.AK.03 - Umpan Balik dan Catatan Asesmen — diisi ASESI setelah keputusan (FR.AK.02 selesai).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ak-03; data & aksi disambungkan ke API.
 * Asesi memilih Ya/Tidak + catatan per komponen, Simpan, lalu Kirim (tanpa tanda tangan).
 */

import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Save, Send } from "lucide-react";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { fieldErrors, pesanError, statusError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ak03Isian, Ak03Payload, Pencapaian } from "@/types/dokumen";
import { EditableText, PesanError, checkboxClass } from "@/features/dokumen/mapa/MapaShared";
import { AkHeader } from "@/features/dokumen/ak/AkShared";
import { BarisRentangTanggal } from "@/features/dokumen/ak/BarisHeader";

const SLUG = "ak-03";

export function Ak03Page({ penilaian }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ak03Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.AK.03" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.AK.03..." />;

  return <Ak03Form key={data.dokumen.id} payload={data} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ak03Form({ payload, setPayload }: { payload: Ak03Payload; setPayload: (p: Ak03Payload) => Promise<unknown> }) {
  const { mutate } = useSWRConfig();
  const meta = payload.dokumen;
  const bisaUbah = meta.dapat_diubah;
  const [isian, setIsian] = useState<Ak03Isian>(payload.isian);
  const [isEditing, setIsEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [proses, setProses] = useState(false);
  const editable = isEditing && bisaUbah;

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const ubahKomponen = (i: number, patch: Partial<Ak03Isian["komponen"][number]>) => {
    setIsian((p) => ({ ...p, komponen: p.komponen.map((k, j) => (j === i ? { ...k, ...patch } : k)) }));
    setDirty(true);
    setErrors((e) => {
      const salinan = { ...e };
      delete salinan[`isian.komponen.${i}`];
      return salinan;
    });
  };

  const setHasil = (i: number, nilai: Exclude<Pencapaian, null>) => ubahKomponen(i, { hasil: isian.komponen[i].hasil === nilai ? null : nilai });

  const terima = async (res: Ak03Payload) => {
    await setPayload(res);
    setIsian(res.isian);
    setDirty(false);
    void mutate(swrKey.penilaian(meta.penilaian_id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    setMenyimpan(true);
    try {
      await terima(await mukDokumen.simpan<Ak03Payload, { isian: Ak03Isian }>(meta.penilaian_id, SLUG, { isian }));
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

  const kirim = async () => {
    setProses(true);
    try {
      await terima(await mukDokumen.submit<Ak03Payload>(meta.penilaian_id, SLUG));
      toast.success("Umpan balik FR.AK.03 terkirim. Terima kasih.");
    } catch (err) {
      const fe = fieldErrors(err);
      if (statusError(err) === 422 && Object.keys(fe).length) {
        setErrors(fe);
        toast.error("Lengkapi isian yang ditandai.");
        document.querySelector(`[data-error="${Object.keys(fe)[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error(pesanError(err, "Gagal mengirim."));
      }
    } finally {
      setKonfirmasi(false);
      setProses(false);
    }
  };

  const kontrol = bisaUbah && (
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
          isEditing ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default" : "border-[#7E9631] text-[#7E9631] bg-white hover:bg-[#F2F5E9]"
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
          onClick={() => setKonfirmasi(true)}
          disabled={dirty || proses}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          <Send size={13} />
          Kirim
        </button>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>· Dikirim {formatTanggal(meta.submitted_at)}</span>}
        </div>
        {kontrol}
      </div>

      {meta.status === "selesai" ? (
        <p className="text-sm text-[#5A7A22] font-semibold bg-[#F2F5E9] border border-[#8AA53C]/40 rounded-lg p-3">Umpan balik asesi sudah dikirim.</p>
      ) : (
        bisaUbah && (
          <p className="text-sm text-[#5A7A22] bg-[#F2F5E9] border border-[#8AA53C]/40 rounded-lg p-3">
            Klik <strong>Ubah</strong>, pilih Ya/Tidak untuk setiap komponen (tambahkan catatan bila perlu), <strong>Simpan</strong>, lalu{" "}
            <strong>Kirim</strong>.
          </p>
        )
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <AkHeader info={payload.info} opsiTuk={payload.opsi_tuk} tuk={payload.header.tuk} onTuk={() => {}} editable={false} errors={{}}>
            <BarisRentangTanggal mulai={payload.header.tanggal_mulai} selesai={payload.header.tanggal_selesai} editable={false} errors={{}} />
          </AkHeader>
          <p className="text-xs italic text-gray-500 px-1">*coret yang tidak perlu</p>
        </div>

        <p className="text-sm font-semibold text-gray-700">Umpan balik dari Asesi (diisi oleh Asesi setelah pengambilan keputusan):</p>

        {/* Tabel Komponen */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col />
              <col className="w-30" />
              <col className="w-30" />
              <col className="w-80" />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th rowSpan={2} className="px-4 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  Komponen
                </th>
                <th colSpan={2} className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  Hasil
                </th>
                <th rowSpan={2} className="px-4 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  Catatan/Komentar Asesi
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Ya</th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Tidak</th>
              </tr>
            </thead>
            <tbody>
              {payload.komponen.map((teks, i) => {
                const k = isian.komponen[i];
                return (
                  <tr key={i} className="align-top" data-error={`isian.komponen.${i}`}>
                    <td className="px-4 py-3 border border-gray-200">
                      <p className="text-sm text-gray-700">{teks}</p>
                      <PesanError kunci={`isian.komponen.${i}`} errors={errors} />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Komponen ${i + 1}: Ya`}
                        checked={k.hasil === "ya"}
                        disabled={!editable}
                        onChange={() => setHasil(i, "ya")}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Komponen ${i + 1}: Tidak`}
                        checked={k.hasil === "tidak"}
                        disabled={!editable}
                        onChange={() => setHasil(i, "tidak")}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <EditableText
                        value={k.catatan ?? ""}
                        onChange={(v) => ubahKomponen(i, { catatan: v })}
                        isEditing={editable}
                        ariaLabel={`Catatan komponen ${i + 1}`}
                        className="text-sm text-gray-700"
                        rows={3}
                      />
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={4} className="align-top px-4 py-3 border border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">Catatan/komentar lainnya (apabila ada) :</p>
                  <EditableText
                    value={isian.catatan_lainnya ?? ""}
                    onChange={(v) => {
                      setIsian((p) => ({ ...p, catatan_lainnya: v }));
                      setDirty(true);
                    }}
                    isEditing={editable}
                    ariaLabel="Catatan lainnya"
                    className="text-sm text-gray-700"
                    rows={6}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">{kontrol}</div>

      <ConfirmDialog
        open={konfirmasi}
        onOpenChange={setKonfirmasi}
        title="Kirim umpan balik FR.AK.03?"
        description="Setelah dikirim, umpan balik tidak dapat diubah."
        confirmLabel="Kirim"
        onConfirm={kirim}
        loading={proses}
      />
    </form>
  );
}
