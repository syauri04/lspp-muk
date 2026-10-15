"use client";

import { useParams } from "next/navigation";
import { usePenilaianDetail } from "@/lib/hooks/usePenilaian";
import { statusError } from "@/lib/api/axios";

/** Detail penilaian berdasarkan [id] di URL. 404 dari API = bukan milik user / tidak ada. */
export function usePenilaianFromRoute() {
  const params = useParams<{ id: string; kode?: string }>();
  const swr = usePenilaianDetail(params.id);
  return {
    ...swr,
    id: params.id,
    kode: params.kode,
    notFound: statusError(swr.error) === 404 || !/^\d+$/.test(params.id ?? ""),
  };
}
