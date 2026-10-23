"use client";

/*
 * FR.IA.06C - Lembar Jawaban Pertanyaan Tertulis Esai (semua metode).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-06c; data & aksi disambungkan ke API.
 * Jawaban asesi dari FR.IA.06A; asesor menilai Ya/Tidak + umpan balik, tanda tangan, Kirim ke
 * Asesi; asesi menyetujui dengan tanda tangan. Kunci jawaban tidak tampil di sini.
 */

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ia06cIsian, Ia06cPayload, Pencapaian } from "@/types/dokumen";
import { EditableText, PesanError, checkboxClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";
import { KepalaIa06 } from "@/features/dokumen/ia06/Ia06Shared";

const SLUG = "ia-06c";

export function Ia06cPage({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia06cPayload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.06C" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.06C..." />;

  return <Ia06cForm key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ia06cForm({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia06cPayload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia06cPayload) => Promise<unknown>;
}) {
  const f = useAkForm<Ia06cIsian, Ia06cPayload>({ payload, setPayload, slug: SLUG, nama: "FR.IA.06C", peran });
  const { meta, isian, editable, errors, ubah } = f;
  const info = payload.info;

  const setPencapaian = (i: number, nilai: Exclude<Pencapaian, null>) =>
    ubah((p) => {
      const pencapaian = [...p.pencapaian];
      pencapaian[i] = pencapaian[i] === nilai ? null : nilai;
      return { ...p, pencapaian };
    }, `isian.pencapaian.${i}`);

  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>· Dikirim {formatTanggal(meta.submitted_at)}</span>}
        </div>
        <AkControls f={f} />
      </div>

      <AkBanner f={f} />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        <KepalaIa06 info={info} opsiTuk={payload.opsi_tuk} header={payload.header} />

        {/* Jawaban + Pencapaian */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-12" />
              <col />
              <col className="w-40" />
              <col className="w-40" />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th colSpan={2} rowSpan={2} className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  Jawaban
                </th>
                <th colSpan={2} className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                  Pencapaian
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Ya</th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Tidak</th>
              </tr>
            </thead>
            <tbody>
              {payload.jawaban_asesi.map((j, i) => (
                <tr key={i} data-error={`isian.pencapaian.${i}`}>
                  <td className="px-3 py-3 border border-gray-200 text-center text-gray-600 align-top">{i + 1}.</td>
                  <td className="px-3 py-3 border border-gray-200">
                    <p className="text-xs text-gray-400 mb-1">{j.pertanyaan}</p>
                    <p className="whitespace-pre-wrap text-sm text-gray-700">{j.jawaban ?? "-"}</p>
                    <PesanError kunci={`isian.pencapaian.${i}`} errors={errors} />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      aria-label={`Jawaban ${i + 1}: Ya`}
                      checked={isian.pencapaian[i] === "ya"}
                      disabled={!editable}
                      onChange={() => setPencapaian(i, "ya")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      aria-label={`Jawaban ${i + 1}: Tidak`}
                      checked={isian.pencapaian[i] === "tidak"}
                      disabled={!editable}
                      onChange={() => setPencapaian(i, "tidak")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Umpan Balik + Tanda Tangan */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr data-error="isian.umpan_balik">
                <td className="w-48 align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Umpan balik untuk asesi</td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={isian.umpan_balik ?? ""}
                    onChange={(v) => ubah((p) => ({ ...p, umpan_balik: v }), "isian.umpan_balik")}
                    isEditing={editable}
                    ariaLabel="Umpan balik untuk asesi"
                    className="text-sm text-gray-700"
                    rows={5}
                  />
                  <PesanError kunci="isian.umpan_balik" errors={errors} />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50">
                  Asesi:
                </td>
              </tr>
              <tr>
                <td className="w-48 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="Nama asesi" value={info.asesi.nama ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda Tangan/Tanggal</td>
                <td className="px-3 py-3 border border-gray-200">
                  <TtdKotak f={f} pihak="asesi" />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50">
                  Asesor:
                </td>
              </tr>
              <tr>
                <td className="w-48 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="Nama asesor" value={info.asesor.nama ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda Tangan/Tanggal</td>
                <td className="px-3 py-3 border border-gray-200">
                  <TtdKotak f={f} pihak="asesor" />
                  <PesanError kunci="tanda_tangan" errors={errors} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
