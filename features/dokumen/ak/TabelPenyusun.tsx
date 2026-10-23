"use client";

/* Tabel "PENYUSUN DAN VALIDATOR" (template CMS) sesuai mockup IA.02/IA.04A/IA.04B/IA.09. */

import { TtdPenandatangan, compactInputClass } from "@/features/dokumen/mapa/MapaShared";
import type { MapaPenandatangan } from "@/types/dokumen";

export function TabelPenyusun({
  penyusun,
  penilaianId,
  slug,
  kosong,
}: {
  penyusun: MapaPenandatangan[];
  penilaianId: number;
  slug: string;
  /** Pesan bila belum diisi admin. */
  kosong: string;
}) {
  const grup = [
    { status: "Penyusun", baris: penyusun.filter((p) => p.peran === "penyusun") },
    { status: "Validator", baris: penyusun.filter((p) => p.peran === "validator") },
  ].filter((g) => g.baris.length > 0);

  return (
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
          {grup.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-3 border border-gray-200 text-sm text-gray-400 italic">
                {kosong}
              </td>
            </tr>
          )}
          {grup.flatMap((g) =>
            g.baris.map((row, idx) => (
              <tr key={row.id}>
                {idx === 0 && (
                  <td rowSpan={g.baris.length} className="align-middle px-3 py-3 border border-gray-200 text-center font-semibold text-gray-700 bg-gray-50">
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
                  <TtdPenandatangan penilaianId={penilaianId} slug={slug} baris={row} />
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Tabel ringkas unit kompetensi (kolom kiri = judul skema) sesuai mockup IA. */
export function TabelUnit({ judulSkema, units }: { judulSkema: string | null; units: { id: number; kode_unit: string | null; judul_unit: string }[] }) {
  return (
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
                <td rowSpan={units.length} className="align-middle px-3 py-3 border border-gray-200 text-center font-bold text-gray-800 bg-gray-50">
                  {judulSkema}
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
  );
}
