"use client";

import useSWR from "swr";
import { mukPenilaian, swrKey, type PenilaianQuery } from "@/lib/api/muk";

export function usePenilaianList(query: PenilaianQuery = {}) {
  return useSWR(swrKey.penilaianList(query), ([, q]) => mukPenilaian.list(q), {
    keepPreviousData: true,
  });
}

/**
 * Detail penilaian. Dipakai sidebar & halaman sekaligus; SWR men-dedupe request
 * dengan kunci yang sama, jadi hanya satu fetch.
 */
export function usePenilaianDetail(id: string | number | null | undefined) {
  const valid = id !== null && id !== undefined && /^\d+$/.test(String(id));
  return useSWR(valid ? swrKey.penilaian(id!) : null, () => mukPenilaian.detail(id!));
}
