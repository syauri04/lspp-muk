"use client";

import Link from "next/link";
import { ArrowLeft, FileClock, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { pesanError } from "@/lib/api/axios";
import { penilaianHref } from "@/lib/navigation";
import { DOKUMEN_REGISTRY } from "@/features/dokumen/registry";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import { usePenilaianFromRoute } from "@/components/penilaian/usePenilaianFromRoute";

export default function DokumenPage() {
  const { role } = useAuth();
  const { data: p, error, isLoading, mutate, notFound, kode } = usePenilaianFromRoute();

  if (notFound) return <ErrorState title="Penilaian tidak ditemukan" />;
  if (error) return <ErrorState title="Gagal memuat dokumen" description={pesanError(error)} onRetry={() => mutate()} />;
  if (isLoading || !p || !role) return <PageLoader />;

  const dokumen = p.dokumen.find((d) => d.slug === kode);
  const kembali = (
    <Link href={penilaianHref(p.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A7A22] hover:underline">
      <ArrowLeft size={14} /> Kembali ke ringkasan penilaian
    </Link>
  );

  if (!dokumen) {
    return <ErrorState title="Dokumen tidak ditemukan" description="Dokumen ini tidak termasuk dalam penilaian Anda." backHref={penilaianHref(p.id)} />;
  }

  if (dokumen.terkunci) {
    return (
      <div className="space-y-4">
        {kembali}
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-2">
          <Lock className="mx-auto text-gray-300" size={32} />
          <h2 className="text-base font-bold text-gray-800">{dokumen.kode} masih terkunci</h2>
          <p className="text-sm text-gray-500">{dokumen.alasan_terkunci}</p>
        </div>
      </div>
    );
  }

  const Halaman = DOKUMEN_REGISTRY[dokumen.slug];

  if (!Halaman) {
    return (
      <div className="space-y-4">
        {kembali}
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-2">
          <FileClock className="mx-auto text-gray-300" size={32} />
          <h2 className="text-base font-bold text-gray-800">
            {dokumen.kode} – {dokumen.nama}
          </h2>
          <p className="text-sm text-gray-500">Formulir ini belum tersedia di aplikasi.</p>
        </div>
      </div>
    );
  }

  return <Halaman penilaian={p} dokumen={dokumen} role={role} />;
}
