"use client";

/*
 * FR.AK.05 - Laporan Asesmen — hanya asesor, setelah FR.AK.02 selesai.
 * Tampilan & style mengikuti mockup app/dashboard/fr/ak-05; data & aksi disambungkan ke API.
 * Rekomendasi K/BK mengikuti keputusan FR.AK.02 (tidak dapat diubah di sini).
 */

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ak05Isian, Ak05Payload } from "@/types/dokumen";
import { EditableText, PesanError, checkboxClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";
import { BarisTanggal } from "@/features/dokumen/ak/BarisHeader";

const SLUG = "ak-05";

const ASPEK: { key: "aspek" | "penolakan" | "saran"; label: string }[] = [
  { key: "aspek", label: "Aspek Negatif dan Positif dalam Asesemen" },
  { key: "penolakan", label: "Pencatatan Penolakan Hasil Asesmen" },
  { key: "saran", label: "Saran Perbaikan: (Asesor/Personil Terkait)" },
];

export function Ak05Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ak05Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.AK.05" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.AK.05..." />;

  return <Ak05Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ak05Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ak05Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ak05Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ak05Isian, Ak05Payload>({ payload, setPayload, slug: SLUG, nama: "FR.AK.05", peran, tanpaPersetujuan: true });
  const { meta, isian, editable, errors, ubah } = f;
  const info = payload.info;
  const ubahTeks = (key: keyof Ak05Isian, v: string) => ubah((p) => ({ ...p, [key]: v }), `isian.${key}`);

  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>· Diselesaikan {formatTanggal(meta.submitted_at)}</span>}
        </div>
        <AkControls f={f} />
      </div>

      <AkBanner f={f} />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        {/* Header (tanpa nama asesi: laporan per kelompok asesi) */}
        <div className="space-y-2">
          <AkHeader
            info={info}
            opsiTuk={payload.opsi_tuk}
            tuk={isian.tuk}
            onTuk={(tuk) => ubah((p) => ({ ...p, tuk }), "isian.tuk")}
            editable={editable}
            errors={errors}
          >
            <BarisTanggal tanggal={isian.tanggal} onUbah={(v) => ubah((p) => ({ ...p, tanggal: v }), "isian.tanggal")} editable={editable} errors={errors} />
          </AkHeader>
          <p className="text-xs italic text-gray-500 px-1">*coret yang tidak perlu</p>
        </div>

        {/* Tabel Rekomendasi Asesi */}
        <div className="border border-gray-200" data-error="isian.keterangan">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-14" />
              <col className="w-64" />
              <col className="w-14" />
              <col className="w-14" />
              <col />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th rowSpan={2} className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  No.
                </th>
                <th rowSpan={2} className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  Nama Asesi
                </th>
                <th colSpan={2} className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  Rekomendasi
                </th>
                <th rowSpan={2} className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  Keterangan**
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">K</th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">BK</th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                <td className="px-3 py-3 border border-gray-200 text-center text-gray-600">1.</td>
                <td className="px-3 py-3 border border-gray-200 text-sm text-gray-700">{info.asesi.nama}</td>
                <td className="px-2 py-3 border border-gray-200 text-center">
                  <input type="checkbox" aria-label="Kompeten" checked={payload.rekomendasi === "kompeten"} disabled readOnly className={`${checkboxClass} mx-auto`} />
                </td>
                <td className="px-2 py-3 border border-gray-200 text-center">
                  <input
                    type="checkbox"
                    aria-label="Belum kompeten"
                    checked={payload.rekomendasi === "belum_kompeten"}
                    disabled
                    readOnly
                    className={`${checkboxClass} mx-auto`}
                  />
                </td>
                <td className="px-3 py-3 border border-gray-200">
                  <EditableText
                    value={isian.keterangan ?? ""}
                    onChange={(v) => ubahTeks("keterangan", v)}
                    isEditing={editable}
                    ariaLabel="Keterangan"
                    className="text-sm text-gray-700"
                    rows={2}
                  />
                  <PesanError kunci="isian.keterangan" errors={errors} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 px-1 -mt-4">
          ** tuliskan Kode dan Judul Unit Kompetensi yang dinyatakan BK bila mengases satu skema. Rekomendasi mengikuti keputusan FR.AK.02.
        </p>

        {/* Aspek/Pencatatan/Saran */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {ASPEK.map((a) => (
                <tr key={a.key}>
                  <td className="w-64 px-4 py-3 border border-gray-200 text-gray-700">{a.label}</td>
                  <td className="px-4 py-3 border border-gray-200">
                    <EditableText
                      value={isian[a.key] ?? ""}
                      onChange={(v) => ubahTeks(a.key, v)}
                      isEditing={editable}
                      ariaLabel={a.label}
                      className="text-sm text-gray-700"
                      rows={2}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Catatan & Asesor */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-1/2 align-top px-4 py-3 border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-2">Catatan:</p>
                  <EditableText
                    value={isian.catatan ?? ""}
                    onChange={(v) => ubahTeks("catatan", v)}
                    isEditing={editable}
                    ariaLabel="Catatan"
                    className="text-sm text-gray-700"
                    rows={8}
                  />
                </td>
                <td className="w-1/2 align-top p-0 border border-gray-200">
                  <table className="w-full h-full border-collapse text-sm">
                    <tbody>
                      <tr>
                        <td colSpan={2} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50">
                          Asesor:
                        </td>
                      </tr>
                      <tr>
                        <td className="w-24 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="text" aria-label="Nama asesor" value={info.asesor.nama ?? ""} disabled readOnly className={inputClass} />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border border-gray-200 text-gray-600">No. Reg</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="text" aria-label="No. Reg asesor" value={info.asesor.nomor_registrasi ?? ""} disabled readOnly className={inputClass} />
                        </td>
                      </tr>
                      <tr>
                        <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda Tangan/ Tanggal</td>
                        <td className="px-3 py-3 border border-gray-200">
                          <TtdKotak f={f} pihak="asesor" />
                          <PesanError kunci="tanda_tangan" errors={errors} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
