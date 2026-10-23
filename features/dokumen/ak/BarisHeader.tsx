"use client";

/* Baris tambahan header dokumen AK/IA (di dalam AkHeader): tanggal tunggal & rentang Mulai/Selesai. */

import { PesanError, inputClass } from "@/features/dokumen/mapa/MapaShared";

export function BarisTanggal({
  tanggal,
  onUbah,
  editable,
  errors,
  kunciError = "isian.tanggal",
}: {
  tanggal: string | null;
  onUbah?: (v: string | null) => void;
  editable: boolean;
  errors: Record<string, string>;
  kunciError?: string;
}) {
  return (
    <tr>
      <td colSpan={2} className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">
        Tanggal
      </td>
      <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
      <td className="px-3 py-2 border border-gray-200" data-error={kunciError}>
        <input
          type="date"
          aria-label="Tanggal"
          value={tanggal ?? ""}
          onChange={(e) => onUbah?.(e.target.value || null)}
          disabled={!editable}
          className={inputClass}
        />
        <PesanError kunci={kunciError} errors={errors} />
      </td>
    </tr>
  );
}

/** "Tanggal" dengan Mulai/Selesai (sesuai mockup AK.02 & AK.03). */
export function BarisRentangTanggal({
  mulai,
  selesai,
  onUbah,
  editable,
  errors,
}: {
  mulai: string | null;
  selesai: string | null;
  onUbah?: (patch: { tanggal_mulai?: string | null; tanggal_selesai?: string | null }) => void;
  editable: boolean;
  errors: Record<string, string>;
}) {
  const baris = [
    { label: "Mulai", nilai: mulai, kunci: "tanggal_mulai" as const },
    { label: "Selesai", nilai: selesai, kunci: "tanggal_selesai" as const },
  ];
  return (
    <tr>
      <td colSpan={3} className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-600">
        Tanggal
      </td>
      <td className="p-0 border border-gray-200" data-error="isian.tanggal_mulai">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {baris.map((b) => (
              <tr key={b.kunci}>
                <td className="w-24 px-4 py-3 border border-gray-200 text-gray-600">{b.label}</td>
                <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input
                    type="date"
                    aria-label={`Tanggal ${b.label.toLowerCase()}`}
                    value={b.nilai ?? ""}
                    onChange={(e) => onUbah?.({ [b.kunci]: e.target.value || null })}
                    disabled={!editable}
                    className={inputClass}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-3 pb-2">
          <PesanError kunci="isian.tanggal_mulai" errors={errors} />
        </div>
      </td>
    </tr>
  );
}
