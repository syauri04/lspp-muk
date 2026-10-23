"use client";

/* Blok "ASESI :" & "ASESOR :" (nama, no. reg, tanda tangan) sesuai mockup IA.02/IA.03/IA.08/IA.09. */

import { PesanError, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { TtdKotak, type AkForm } from "@/features/dokumen/ak/AkShared";
import type { AkInfo } from "@/types/dokumen";

export function BlokTandaTangan({ f, info, errors }: { f: AkForm; info: AkInfo; errors: Record<string, string> }) {
  return (
    <>
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
    </>
  );
}
