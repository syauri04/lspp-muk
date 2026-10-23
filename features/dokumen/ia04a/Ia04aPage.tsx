"use client";

/*
 * FR.IA.04A DIT - Penjelasan Proyek Singkat/Kegiatan Terstruktur Lainnya (metode KT).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-04a; data & aksi disambungkan ke API.
 * Instruksi & penyusun/validator dari Template KT di CMS (tidak dapat diubah asesor).
 * Asesor mengisi TUK, umpan balik & nama supervisor, tanda tangan; asesi menyetujui.
 */

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ia04aIsian, Ia04aPayload } from "@/types/dokumen";
import { EditableText, PesanError, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";
import { TabelPenyusun, TabelUnit } from "@/features/dokumen/ak/TabelPenyusun";

const SLUG = "ia-04a";

const PANDUAN_ASESOR = [
  "Tentukan proyek singkat atau kegiatan terstruktur lainnya yang harus dipersiapkan dan dipresentasikan oleh asesi.",
  "Proyek singkat atau kegiatan terstruktur lainnya dibuat untuk keseluruhan unit kompetensi dalam Skema Sertifikasi atau untuk masing-masing kelompok pekerjaan.",
  "Kumpulkan hasil proyek singkat atau kegiatan terstruktur lainnya sesuai dengan hasil keluaran yang telah ditetapkan.",
];

export function Ia04aPage({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia04aPayload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.04A" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.04A..." />;

  return <Ia04aForm key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ia04aForm({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia04aPayload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia04aPayload) => Promise<unknown>;
}) {
  const f = useAkForm<Ia04aIsian, Ia04aPayload>({ payload, setPayload, slug: SLUG, nama: "FR.IA.04A", peran });
  const { meta, isian, editable, errors, ubah } = f;
  const instrumen = payload.instrumen;
  const waktu = [instrumen.waktu_pengerjaan, instrumen.waktu_tanya_jawab].filter((t): t is string => !!t);

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
      {(!instrumen.hal_disiapkan || !instrumen.hal_didemonstrasikan) && (
        <p data-error="instrumen" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {errors.instrumen ?? "Instruksi FR.IA.04A untuk skema ini belum diisi di CMS (Template KT). Hubungi admin LSP; dokumen belum dapat dikirim."}
        </p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <AkHeader
            info={payload.info}
            opsiTuk={payload.opsi_tuk}
            tuk={isian.tuk}
            onTuk={(tuk) => ubah((p) => ({ ...p, tuk }), "isian.tuk")}
            editable={editable}
            errors={errors}
          />
          <p className="text-xs italic text-gray-500 px-1">*coret yang tidak perlu</p>
        </div>

        {/* Panduan bagi Asesor */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">PANDUAN BAGI ASESOR</div>
          <ul className="list-disc list-outside pl-8 pr-4 py-3 space-y-1.5">
            {PANDUAN_ASESOR.map((teks, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-snug">
                {teks}
              </li>
            ))}
          </ul>
        </div>

        <TabelUnit judulSkema={payload.info.skema.judul} units={payload.unit_kompetensi} />

        {/* Hal yang harus disiapkan & didemonstrasikan */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-80" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Hal yang harus disiapkan atau dilakukan atau dihasilkan untuk suatu proyek singkat/ kegiatan terstruktur lainnya
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{instrumen.hal_disiapkan ?? "-"}</p>
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Hal yang perlu didemonstrasikan/ dipresentasikan:</td>
                <td className="p-0 border border-gray-200">
                  <p className="whitespace-pre-wrap text-sm text-gray-700 px-4 py-3">{instrumen.hal_didemonstrasikan ?? "-"}</p>
                  {(waktu.length > 0 || instrumen.total_waktu) && (
                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        {waktu.map((teks, idx) => (
                          <tr key={idx}>
                            {idx === 0 && (
                              <td rowSpan={waktu.length} className="w-20 align-top px-3 py-2 border-t border-r border-gray-200 text-gray-700">
                                Waktu
                              </td>
                            )}
                            <td className="w-8 align-top py-2 pl-3 border-t border-gray-200 text-gray-700">{idx + 1}.</td>
                            <td className="align-top py-2 pr-3 border-t border-gray-200 whitespace-pre-wrap text-gray-700">{teks}</td>
                          </tr>
                        ))}
                        {instrumen.total_waktu && (
                          <tr>
                            <td colSpan={3} className="px-3 py-2 border-t border-gray-200 whitespace-pre-wrap text-gray-700">
                              {instrumen.total_waktu}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="align-top px-4 py-3 border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-2">Umpan Balik Untuk Asesi:</p>
                  <EditableText
                    value={isian.umpan_balik ?? ""}
                    onChange={(v) => ubah((p) => ({ ...p, umpan_balik: v }))}
                    isEditing={editable}
                    ariaLabel="Umpan balik untuk asesi"
                    className="text-sm text-gray-700"
                    rows={6}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="space-y-2">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="w-1/3 align-top border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Tanda Tangan Asesi</p>
                    <TtdKotak f={f} pihak="asesi" />
                  </td>
                  <td className="w-1/3 align-top border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Tanda Tangan Asesor</p>
                    <TtdKotak f={f} pihak="asesor" />
                    <PesanError kunci="tanda_tangan" errors={errors} />
                  </td>
                  <td className="w-1/3 align-top border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Nama Supervisor (Jika ada)</p>
                    <input
                      type="text"
                      aria-label="Nama supervisor"
                      value={isian.supervisor ?? ""}
                      maxLength={255}
                      onChange={(e) => ubah((p) => ({ ...p, supervisor: e.target.value }))}
                      disabled={!editable}
                      placeholder="Nama Supervisor"
                      className={inputClass}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs italic text-gray-500 px-1">
            *) Apabila asesi pada Level 4 ke atas, berikan tugas proyek yang meliputi tentang pemecahan masalah dan Analisa
          </p>
        </div>

        <TabelPenyusun
          penyusun={payload.penyusun}
          penilaianId={f.penilaianId}
          slug={SLUG}
          kosong="Penyusun dan validator FR.IA.04A belum diisi admin di CMS (Template KT)."
        />
      </div>

      <div className="flex justify-end">
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
