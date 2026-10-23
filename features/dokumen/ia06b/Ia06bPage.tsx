"use client";

/*
 * FR.IA.06B - Lembar Kunci Jawaban Pertanyaan Tertulis Esai (semua metode) — HANYA ASESOR.
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-06b; data dari Template Umum (CMS)
 * dan soal FR.IA.06A. Asesor meninjau lalu "Selesaikan" (isi & ttd penyusun dibekukan).
 */

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { fieldErrors, pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ia06bPayload, MapaPenandatangan } from "@/types/dokumen";
import { TtdPenandatangan, compactInputClass } from "@/features/dokumen/mapa/MapaShared";
import { KepalaIa06 } from "@/features/dokumen/ia06/Ia06Shared";

const SLUG = "ia-06b";

export function Ia06bPage({ penilaian }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia06bPayload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.06B" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.06B..." />;

  return <Ia06bIsi payload={data} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ia06bIsi({ payload, setPayload }: { payload: Ia06bPayload; setPayload: (p: Ia06bPayload) => Promise<unknown> }) {
  const { mutate } = useSWRConfig();
  const meta = payload.dokumen;
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [proses, setProses] = useState(false);

  const penyusunGrup = [
    { status: "Penyusun", baris: payload.penyusun.filter((p) => p.peran === "penyusun") },
    { status: "Validator", baris: payload.penyusun.filter((p) => p.peran === "validator") },
  ].filter((g) => g.baris.length > 0);

  const selesaikan = async () => {
    setProses(true);
    try {
      await setPayload(await mukDokumen.submit<Ia06bPayload>(meta.penilaian_id, SLUG));
      void mutate(swrKey.penilaian(meta.penilaian_id));
      toast.success("FR.IA.06B diselesaikan.");
    } catch (err) {
      toast.error(fieldErrors(err).soal ?? pesanError(err, "Gagal menyelesaikan dokumen."));
    } finally {
      setKonfirmasi(false);
      setProses(false);
    }
  };

  const tombol = meta.dapat_diubah && (
    <button
      type="button"
      onClick={() => setKonfirmasi(true)}
      disabled={payload.soal.length === 0 || proses}
      title={payload.soal.length === 0 ? "Soal & kunci jawaban belum diisi di CMS" : undefined}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
    >
      <CheckCircle2 size={13} />
      Selesaikan
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>· Diselesaikan {formatTanggal(meta.submitted_at)}</span>}
        </div>
        {tombol}
      </div>

      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
        Dokumen ini <strong>rahasia</strong> dan hanya dapat dibuka asesor. Jangan tunjukkan kunci jawaban kepada asesi.
      </p>
      {payload.soal.length === 0 && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Soal & kunci jawaban FR.IA.06 untuk skema ini belum diisi di CMS (Template Umum). Hubungi admin LSP.
        </p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        <KepalaIa06 info={payload.info} opsiTuk={payload.opsi_tuk} header={payload.header} />

        {/* Jawaban */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-12" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td colSpan={2} className="px-4 py-2.5 border border-gray-200 text-center font-bold text-gray-800 bg-gray-50">
                  Jawaban
                </td>
              </tr>
              {payload.soal.map((s, i) => (
                <tr key={i}>
                  <td className="align-top px-3 py-3 border border-gray-200 text-center text-gray-600">{i + 1}.</td>
                  <td className="align-top px-4 py-3 border border-gray-200">
                    <p className="text-xs text-gray-400 mb-1">{s.pertanyaan}</p>
                    <p className="whitespace-pre-wrap text-sm text-gray-700">{s.kunci ?? "-"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Penyusun dan Validator */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">PENYUSUN DAN VALIDATOR</div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="w-32 px-3 py-2.5 border border-gray-200 bg-gray-50">STATUS</th>
                <th className="w-14 px-3 py-2.5 border border-gray-200 bg-gray-50">NO</th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">NAMA</th>
                <th className="w-44 px-3 py-2.5 border border-gray-200 bg-gray-50">NOMOR MET</th>
                <th className="w-56 px-3 py-2.5 border border-gray-200 bg-gray-50">TANDA TANGAN DAN TANGGAL</th>
              </tr>
            </thead>
            <tbody>
              {penyusunGrup.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 border border-gray-200 text-sm text-gray-400 italic">
                    Penyusun dan validator FR.IA.06B belum diisi admin di CMS.
                  </td>
                </tr>
              )}
              {penyusunGrup.flatMap((g) =>
                g.baris.map((row: MapaPenandatangan, idx) => (
                  <tr key={row.id}>
                    {idx === 0 && (
                      <td
                        rowSpan={g.baris.length}
                        className="align-middle px-3 py-3 border border-gray-200 text-center font-semibold text-gray-700 bg-gray-50"
                      >
                        {g.status}
                      </td>
                    )}
                    <td className="px-3 py-2 border border-gray-200 text-center text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label={`Nama ${g.status}`} value={row.nama ?? ""} disabled readOnly className={compactInputClass} />
                    </td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label="Nomor MET" value={row.no_reg ?? ""} disabled readOnly className={`${compactInputClass} font-mono`} />
                    </td>
                    <td className="px-2 py-2 border border-gray-200">
                      <TtdPenandatangan penilaianId={meta.penilaian_id} slug={SLUG} baris={row} />
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">{tombol}</div>

      <ConfirmDialog
        open={konfirmasi}
        onOpenChange={setKonfirmasi}
        title="Selesaikan FR.IA.06B?"
        description="Kunci jawaban serta penyusun & validator dibekukan untuk penilaian ini."
        confirmLabel="Selesaikan"
        onConfirm={selesaikan}
        loading={proses}
      />
    </div>
  );
}
