"use client";

/*
 * FR.IA.02 - Tugas Praktik Demonstrasi (metode TPD).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-02; data & aksi disambungkan ke API.
 * Skenario, waktu, penyusun & validator dari Template TPD di CMS (tidak dapat diubah asesor).
 * Asesor mengisi TUK & tanggal, menandatangani, lalu asesi menyetujui dengan tanda tangan.
 */

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ia02Isian, Ia02Payload, MapaPenandatangan } from "@/types/dokumen";
import { PesanError, TtdPenandatangan, compactInputClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";

const SLUG = "ia-02";

const PETUNJUK = [
  "Baca dan pelajari setiap instruksi kerja di bawah ini dengan cermat sebelum melaksanakan praktik",
  "Klarifikasi kepada asesor kompetensi apabila ada hal-hal yang belum jelas",
  "Laksanakan pekerjaan sesuai dengan urutan proses yang sudah ditetapkan",
  "Seluruh proses kerja mengacu kepada SOP/WI yang dipersyaratkan (Jika Ada)",
];

export function Ia02Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia02Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.02" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.02..." />;

  return <Ia02Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ia02Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia02Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia02Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ia02Isian, Ia02Payload>({ payload, setPayload, slug: SLUG, nama: "FR.IA.02", peran });
  const { meta, isian, editable, errors, ubah } = f;
  const info = payload.info;
  const units = payload.unit_kompetensi;
  const penyusunGrup = [
    { status: "Penyusun", baris: payload.penyusun.filter((p) => p.peran === "penyusun") },
    { status: "Validator", baris: payload.penyusun.filter((p) => p.peran === "validator") },
  ].filter((g) => g.baris.length > 0);

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
      {!payload.instrumen.skenario && (
        <p data-error="instrumen" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {errors.instrumen ?? "Skenario FR.IA.02 untuk skema ini belum diisi di CMS (Template TPD). Hubungi admin LSP; dokumen belum dapat dikirim."}
        </p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <AkHeader
            info={info}
            opsiTuk={payload.opsi_tuk}
            tuk={isian.tuk}
            onTuk={(tuk) => ubah((p) => ({ ...p, tuk }), "isian.tuk")}
            editable={editable}
            errors={errors}
          >
            <tr>
              <td colSpan={2} className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">
                Tanggal
              </td>
              <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
              <td className="px-3 py-2 border border-gray-200" data-error="isian.tanggal">
                <input
                  type="date"
                  aria-label="Tanggal"
                  value={isian.tanggal ?? ""}
                  onChange={(e) => ubah((p) => ({ ...p, tanggal: e.target.value || null }), "isian.tanggal")}
                  disabled={!editable}
                  className={inputClass}
                />
                <PesanError kunci="isian.tanggal" errors={errors} />
              </td>
            </tr>
          </AkHeader>
          <p className="text-xs italic text-gray-500 px-1">*coret yang tidak perlu</p>
        </div>

        {/* A. Petunjuk */}
        <div>
          <p className="font-bold text-gray-800 mb-2">A. Petunjuk</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            {PETUNJUK.map((teks, idx) => (
              <li key={idx} className="text-sm text-gray-700 leading-snug">
                {teks}
              </li>
            ))}
          </ol>
        </div>

        {/* B. Skenario Tugas Praktik Demonstrasi */}
        <div className="space-y-2">
          <p className="font-bold text-gray-800">B. Skenario Tugas Praktik Demonstrasi</p>
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm table-fixed">
              <thead>
                <tr className="text-xs font-semibold text-gray-600">
                  <th className="w-40 px-3 py-2.5 border border-gray-200"></th>
                  <th className="w-14 px-3 py-2.5 border border-gray-200">No.</th>
                  <th className="w-52 px-3 py-2.5 border border-gray-200 text-left">Kode Unit</th>
                  <th className="px-3 py-2.5 border border-gray-200 text-left">Judul Unit</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit, idx) => (
                  <tr key={unit.id}>
                    {idx === 0 && (
                      <td
                        rowSpan={units.length}
                        className="align-middle px-3 py-3 border border-gray-200 text-center font-bold text-gray-800 bg-gray-50"
                      >
                        {info.skema.judul}
                      </td>
                    )}
                    <td className="px-3 py-2 border border-gray-200 text-center text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label="Kode unit" value={unit.kode_unit ?? ""} disabled readOnly className={`${compactInputClass} font-mono`} />
                    </td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label="Judul unit" value={unit.judul_unit} disabled readOnly className={compactInputClass} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Skenario Tugas Praktik Demonstrasi (deskripsi) */}
        <div>
          <p className="font-bold text-gray-800 mb-2">Skenario Tugas Praktik Demonstrasi:</p>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{payload.instrumen.skenario ?? "-"}</p>
        </div>

        {/* Waktu */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">Waktu :</span>
          <input type="text" aria-label="Waktu" value={payload.instrumen.waktu ?? ""} disabled readOnly className={`${inputClass} max-w-[160px]`} />
        </div>

        {/* ASESI */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">ASESI :</div>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-40 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="Nama asesi" value={info.asesi.nama ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda tangan dan Tanggal</td>
                <td className="px-3 py-3 border border-gray-200">
                  <TtdKotak f={f} pihak="asesi" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ASESOR */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">ASESOR :</div>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-40 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
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
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda tangan dan Tanggal</td>
                <td className="px-3 py-3 border border-gray-200">
                  <TtdKotak f={f} pihak="asesor" />
                  <PesanError kunci="tanda_tangan" errors={errors} />
                </td>
              </tr>
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
                    Penyusun dan validator FR.IA.02 belum diisi admin di CMS.
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
                      <TtdPenandatangan penilaianId={f.penilaianId} slug={SLUG} baris={row} />
                    </td>
                  </tr>
                )),
              )}
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
