"use client";

import Link from "next/link";
import { ChevronRight, Lock, MessageSquareText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { pesanError } from "@/lib/api/axios";
import { dokumenHref } from "@/lib/navigation";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import { PenilaianHeader } from "@/components/penilaian/PenilaianHeader";
import { usePenilaianFromRoute } from "@/components/penilaian/usePenilaianFromRoute";

export default function PenilaianPage() {
  const { role } = useAuth();
  const { data: p, error, isLoading, mutate, notFound } = usePenilaianFromRoute();

  if (notFound) {
    return (
      <ErrorState
        title="Penilaian tidak ditemukan"
        description="Penilaian ini tidak ada atau bukan milik akun Anda. Pastikan Anda masuk dengan akun yang benar."
      />
    );
  }
  if (error) return <ErrorState title="Gagal memuat penilaian" description={pesanError(error)} onRetry={() => mutate()} />;
  if (isLoading || !p) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PenilaianHeader penilaian={p} role={role} />

      <section className="space-y-3" aria-labelledby="judul-dokumen">
        <h3 id="judul-dokumen" className="text-base font-bold text-gray-800">
          Dokumen Sertifikasi
        </h3>

        <div className="grid gap-3">
          {p.dokumen.map((d) => {
            const isi = (
              <>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-800">{d.kode}</span>
                    <DokumenStatusBadge status={d.status} />
                  </div>
                  <p className="text-sm text-gray-600">{d.nama}</p>
                  {d.submitted_at && <p className="text-xs text-gray-400">Dikirim {formatTanggal(d.submitted_at)}</p>}
                  {d.terkunci && (
                    <p className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <Lock size={12} /> {d.alasan_terkunci}
                    </p>
                  )}
                  {d.catatan_asesor && (
                    <p className="flex gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                      <MessageSquareText size={13} className="shrink-0 mt-0.5" />
                      <span>
                        <strong>Catatan asesor:</strong> {d.catatan_asesor}
                      </span>
                    </p>
                  )}
                </div>
                {!d.terkunci && <ChevronRight size={18} className="text-gray-300 group-hover:text-[#5A7A22] shrink-0" />}
              </>
            );

            return d.terkunci ? (
              <div key={d.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-4 opacity-75" aria-disabled>
                {isi}
              </div>
            ) : (
              <Link
                key={d.id}
                href={dokumenHref(p.id, d.slug)}
                className="group bg-white rounded-xl border border-gray-200 hover:border-[#8AA53C] p-4 flex items-center gap-4 transition-colors"
              >
                {isi}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
