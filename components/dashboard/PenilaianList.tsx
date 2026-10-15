"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronRightCircle, ClipboardCheck, MapPin, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePenilaianList } from "@/lib/hooks/usePenilaian";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal, formatWaktuJadwal } from "@/lib/format";
import { penilaianHref } from "@/lib/navigation";
import { DokumenStatusBadge, PenilaianStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { KelompokPenilaian, Penilaian } from "@/types/penilaian";

const FILTER: { value: KelompokPenilaian | null; label: string }[] = [
  { value: null, label: "Semua" },
  { value: "perlu_tindakan", label: "Perlu tindakan" },
  { value: "berlangsung", label: "Berlangsung" },
  { value: "selesai", label: "Selesai" },
];

const PER_PAGE = 10;

export function PenilaianList() {
  const { role } = useAuth();
  const isAsesor = role === "asesor";
  const [kelompok, setKelompok] = useState<KelompokPenilaian | null>(isAsesor ? "perlu_tindakan" : null);
  const [page, setPage] = useState(1);

  const { data, error, isLoading, mutate } = usePenilaianList({
    ...(kelompok ? { kelompok } : {}),
    page,
    per_page: PER_PAGE,
  });

  const pilihFilter = (k: KelompokPenilaian | null) => {
    setKelompok(k);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{isAsesor ? "Daftar Asesmen" : "Sertifikasi Saya"}</h2>
          <p className="text-sm text-gray-500">
            {isAsesor
              ? "Asesmen yang ditugaskan kepada Anda."
              : "Pilih sertifikasi untuk mengisi dokumen FR.APL.01 dan FR.APL.02."}
          </p>
        </div>

        <div role="tablist" aria-label="Filter asesmen" className="flex flex-wrap gap-1 p-1 bg-white border border-gray-200 rounded-xl self-start">
          {FILTER.map((f) => (
            <button
              key={f.label}
              type="button"
              role="tab"
              aria-selected={kelompok === f.value}
              onClick={() => pilihFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                kelompok === f.value ? "bg-[#5C723D] text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && !data ? (
        <PageLoader label="Memuat daftar asesmen..." />
      ) : error ? (
        <ErrorState title="Gagal memuat daftar asesmen" description={pesanError(error)} onRetry={() => mutate()} backHref={null} />
      ) : !data || data.data.length === 0 ? (
        <KosongState difilter={kelompok !== null} />
      ) : (
        <>
          <div className="grid gap-3">
            {data.data.map((p) => (
              <PenilaianCard key={p.id} penilaian={p} isAsesor={isAsesor} />
            ))}
          </div>

          {data.meta.last_page > 1 && (
            <nav className="flex items-center justify-between text-sm text-gray-500" aria-label="Paginasi">
              <span>
                {data.meta.from}–{data.meta.to} dari {data.meta.total}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 cursor-pointer disabled:cursor-default"
                >
                  <ChevronLeft size={14} /> Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={page >= data.meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 cursor-pointer disabled:cursor-default"
                >
                  Berikutnya <ChevronRight size={14} />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function KosongState({ difilter }: { difilter: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-2">
      <ClipboardCheck className="mx-auto text-gray-300" size={36} />
      <h3 className="text-base font-bold text-gray-700">
        {difilter ? "Tidak ada asesmen pada filter ini" : "Belum ada asesmen terjadwal"}
      </h3>
      {!difilter && (
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Asesmen akan muncul di sini setelah admin LSPP menentukan jadwal, asesor, dan TUK untuk pendaftaran Anda.
        </p>
      )}
    </div>
  );
}

function PenilaianCard({ penilaian: p, isAsesor }: { penilaian: Penilaian; isAsesor: boolean }) {
  return (
    <Link
      href={penilaianHref(p.id)}
      className="group bg-white rounded-2xl border border-gray-200 hover:border-[#8AA53C] p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4 transition-colors shadow-xs"
    >
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <PenilaianStatusBadge status={p.status} />
          {p.perlu_tindakan && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
              Perlu tindakan
            </span>
          )}
          {p.skema.nomor && <span className="text-xs text-gray-400">{p.skema.nomor}</span>}
        </div>

        <h3 className="font-bold text-gray-800 group-hover:text-[#5A7A22] leading-snug">{p.skema.judul ?? "-"}</h3>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} />
            {formatTanggal(p.jadwal?.tanggal)} · {formatWaktuJadwal(p.jadwal?.waktu_mulai, p.jadwal?.waktu_selesai)}
          </span>
          {p.jadwal?.tuk && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} />
              {p.jadwal.tuk.nama}, {p.jadwal.tuk.kota}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <UserRound size={13} />
            {isAsesor ? `Asesi: ${p.asesi.nama}` : `Asesor: ${p.asesor?.nama ?? "-"}`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap md:flex-col md:items-end gap-1.5 shrink-0">
        {p.dokumen.slice(0, 4).map((d) => (
          <span key={d.id} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-semibold">{d.kode}</span>
            <DokumenStatusBadge status={d.status} />
          </span>
        ))}
        {p.dokumen.length > 4 && <span className="text-xs text-gray-400">+{p.dokumen.length - 4} dokumen lainnya</span>}
      </div>

      <ChevronRightCircle size={20} className="hidden md:block text-gray-300 group-hover:text-[#5A7A22] shrink-0" />
    </Link>
  );
}
