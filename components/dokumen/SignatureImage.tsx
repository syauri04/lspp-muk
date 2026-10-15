"use client";

import { useEffect, useState } from "react";
import { mukDokumen } from "@/lib/api/muk";
import type { PihakTtd } from "@/types/dokumen";

/**
 * Menampilkan tanda tangan tersimpan. Gambar diambil via API ber-token (bukan URL publik)
 * lalu dijadikan object URL; dibersihkan saat unmount.
 * `versi` diganti (mis. tanggal / counter) untuk memaksa muat ulang setelah tanda tangan ulang.
 */
export function SignatureImage({
  penilaianId,
  slug,
  pihak,
  versi,
  alt,
}: {
  penilaianId: number;
  slug: string;
  pihak: PihakTtd;
  versi?: string | number | null;
  alt: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let aktif = true;
    let objectUrl: string | null = null;

    mukDokumen
      .gambarTandaTangan(penilaianId, slug, pihak)
      .then((blob) => {
        if (!aktif) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setGagal(false);
      })
      .catch(() => aktif && setGagal(true));

    return () => {
      aktif = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [penilaianId, slug, pihak, versi]);

  if (gagal) return <p className="text-xs text-gray-400">Tanda tangan tidak dapat dimuat.</p>;
  if (!url) return <div className="h-24 w-48 rounded-lg bg-gray-100 animate-pulse" aria-label="Memuat tanda tangan" />;

  // eslint-disable-next-line @next/next/no-img-element -- object URL lokal, bukan aset yang bisa dioptimasi next/image
  return <img src={url} alt={alt} className="h-24 max-w-full object-contain" />;
}
