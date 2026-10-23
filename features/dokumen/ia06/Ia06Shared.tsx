"use client";

/*
 * Bagian bersama FR.IA.06A/B/C: header (skema, TUK, nama asesor/asesi, tanggal, waktu)
 * sesuai mockup app/dashboard/fr/ia-06a|b|c.
 */

import { AkHeader } from "@/features/dokumen/ak/AkShared";
import { PesanError, inputClass } from "@/features/dokumen/mapa/MapaShared";
import type { AkInfo, Ia06Header, JenisTuk, Opsi } from "@/types/dokumen";

export function KepalaIa06({
  info,
  opsiTuk,
  header,
  editable = false,
  onUbah,
  errors = {},
}: {
  info: AkInfo;
  opsiTuk: Opsi[];
  header: Ia06Header;
  /** Hanya FR.IA.06A saat asesor menyiapkan. */
  editable?: boolean;
  onUbah?: (patch: Partial<Ia06Header>, kunciError: string) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="space-y-2">
      <AkHeader
        info={info}
        opsiTuk={opsiTuk}
        tuk={header.tuk}
        onTuk={(tuk: JenisTuk) => onUbah?.({ tuk }, "persiapan.tuk")}
        editable={editable}
        errors={{ "isian.tuk": errors["persiapan.tuk"] }}
      >
        <tr>
          <td colSpan={2} className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">
            Tanggal
          </td>
          <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
          <td className="px-3 py-2 border border-gray-200" data-error="persiapan.tanggal">
            <input
              type="date"
              aria-label="Tanggal"
              value={header.tanggal ?? ""}
              onChange={(e) => onUbah?.({ tanggal: e.target.value || null }, "persiapan.tanggal")}
              disabled={!editable}
              className={inputClass}
            />
            <PesanError kunci="persiapan.tanggal" errors={errors} />
          </td>
        </tr>
        <tr>
          <td colSpan={2} className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">
            Waktu
          </td>
          <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
          <td className="px-3 py-2 border border-gray-200">
            <input
              type="text"
              aria-label="Waktu"
              value={header.waktu ?? ""}
              maxLength={100}
              placeholder="mis. 30 Menit"
              onChange={(e) => onUbah?.({ waktu: e.target.value }, "persiapan.waktu")}
              disabled={!editable}
              className={inputClass}
            />
          </td>
        </tr>
      </AkHeader>
      <p className="text-xs italic text-gray-500 px-1">*coret yang tidak perlu</p>
    </div>
  );
}
