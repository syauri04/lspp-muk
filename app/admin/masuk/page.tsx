"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { pesanError } from "@/lib/api/axios";
import { penilaianHref } from "@/lib/navigation";
import { FullScreenLoader } from "@/components/ui/PageLoader";

/**
 * Masuk Admin LSP dari CMS: CMS mengarahkan ke /admin/masuk#kode=... (kode sekali pakai, ~60 detik).
 * Kode dibaca dari fragment (tidak terkirim ke server/log/Referer), segera dihapus dari address bar,
 * lalu ditukar SEKALI menjadi sesi baca-saja untuk satu penilaian.
 */
export default function MasukAdminPage() {
  const { loginAdmin } = useAuth();
  const router = useRouter();
  const [galat, setGalat] = useState<string | null>(null);
  // React StrictMode (dev) menjalankan effect dua kali; kode hanya boleh ditukar sekali.
  const sudah = useRef(false);

  useEffect(() => {
    if (sudah.current) return;
    sudah.current = true;

    const kode = new URLSearchParams(window.location.hash.slice(1)).get("kode") ?? "";
    window.history.replaceState(null, "", window.location.pathname);

    if (!/^[A-Za-z0-9]{64}$/.test(kode)) {
      queueMicrotask(() => setGalat("Tautan akses tidak valid. Buka kembali dari CMS."));
      return;
    }

    loginAdmin(kode)
      .then((penilaianId) => router.replace(penilaianHref(penilaianId)))
      .catch((err) => setGalat(pesanError(err, "Tautan akses tidak valid atau sudah kedaluwarsa. Buka kembali dari CMS.")));
  }, [loginAdmin, router]);

  if (!galat) return <FullScreenLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-3">
        <ShieldAlert className="mx-auto text-red-500" size={40} />
        <h1 className="text-lg font-bold text-gray-800">Akses Admin LSP gagal</h1>
        <p className="text-sm text-gray-600">{galat}</p>
        <p className="text-xs text-gray-400">Tautan dari CMS hanya berlaku sekali dan selama 1 menit.</p>
      </div>
    </div>
  );
}
