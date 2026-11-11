"use client";

import { AlertCircle } from "lucide-react";

const MAKS_TAMPIL = 8;

/**
 * Ringkasan merah "belum dapat dikirim" di atas form. Isinya `meta.kekurangan` dari server
 * (aturan yang sama dengan saat Kirim), hanya ada pada draft milik pengisi. Klik butir untuk
 * menggulir ke isian yang ditandai (`[data-error="<key>"]`, atau `cari` khusus per dokumen).
 */
export function KekuranganKirim({
  kekurangan,
  label,
  cari,
}: {
  kekurangan?: Record<string, string>;
  /** Nama bagian untuk key tertentu (mis. "Elemen 1.2"); undefined = tampilkan pesan saja. */
  label?: (key: string) => string | undefined;
  /** Elemen tujuan gulir untuk key tertentu (default `[data-error="<key>"]`). */
  cari?: (key: string) => Element | null;
}) {
  const butir = Object.entries(kekurangan ?? {});
  if (butir.length === 0) return null;

  const tampil = butir.slice(0, MAKS_TAMPIL);
  const sisa = butir.length - tampil.length;

  const gulir = (key: string) => {
    const el = cari?.(key) ?? document.querySelector(`[data-error="${CSS.escape(key)}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <p className="flex items-center gap-1.5 font-semibold">
        <AlertCircle size={15} className="shrink-0" aria-hidden />
        Belum dapat dikirim. Lengkapi {butir.length} bagian berikut:
      </p>
      <ul className="mt-1.5 ml-6 list-disc space-y-0.5 text-xs">
        {tampil.map(([key, pesan]) => {
          const nama = label?.(key);
          return (
            <li key={key}>
              <button type="button" onClick={() => gulir(key)} className="text-left hover:underline cursor-pointer">
                {nama && <strong>{nama}: </strong>}
                {pesan}
              </button>
            </li>
          );
        })}
        {sisa > 0 && <li className="list-none -ml-4 text-red-600/80">dan {sisa} lainnya (ditandai merah di form).</li>}
      </ul>
    </div>
  );
}
