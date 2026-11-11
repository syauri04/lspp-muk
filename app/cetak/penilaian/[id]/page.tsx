"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { FullScreenLoader } from "@/components/ui/PageLoader";
import { mukDokumen, mukPenilaian, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { penilaianHref } from "@/lib/navigation";
import { FORMAT_CETAK } from "@/features/cetak/registry";
import { GayaCetak, PelacakProvider, usePelacakGambar } from "@/features/cetak/CetakShared";
import type { DokumenPayload } from "@/types/dokumen";

/**
 * Cetak dokumen MUK (Admin LSP / super admin): hanya dokumen yang sudah dikirim atau selesai
 * (dijaga juga oleh API). Disimpan sebagai PDF lewat dialog cetak browser (A4 potret).
 * ?dok=apl-01,apl-02 membatasi dokumen yang dipilih di awal.
 */
export default function CetakPenilaianPage() {
  return (
    <AuthGuard roles={["admin"]}>
      <Suspense fallback={<FullScreenLoader />}>
        <HalamanCetak />
      </Suspense>
    </AuthGuard>
  );
}

function HalamanCetak() {
  const { id } = useParams<{ id: string }>();
  const pilihanAwal = useSearchParams().get("dok");
  const { data: penilaian, error } = useSWR(swrKey.penilaian(id), () => mukPenilaian.detail(id), { revalidateOnFocus: false });
  const [pelacak, gambarTertunda] = usePelacakGambar();
  const [dimuat, setDimuat] = useState<Record<string, boolean>>({});
  const tandaiDimuat = useCallback((slug: string) => setDimuat((m) => (m[slug] ? m : { ...m, [slug]: true })), []);

  // Dokumen yang dapat dicetak: punya format cetak & tidak terkunci (sudah dikirim/selesai).
  const tersedia = useMemo(
    () => (penilaian?.dokumen ?? []).filter((d) => FORMAT_CETAK[d.slug] && !d.terkunci),
    [penilaian],
  );
  const belumAdaFormat = (penilaian?.dokumen ?? []).filter((d) => !FORMAT_CETAK[d.slug] && !d.terkunci);

  const [dipilihManual, setDipilih] = useState<string[] | null>(null);
  // Awal: hanya satu dokumen (FR.APL.01, atau dokumen pertama yang tersedia) agar halaman ringan;
  // dokumen lain ditambahkan lewat centang / "Pilih semua".
  const dipilih = dipilihManual ?? (pilihanAwal ? pilihanAwal.split(",") : tersedia.slice(0, 1).map((d) => (tersedia.some((x) => x.slug === "apl-01") ? "apl-01" : d.slug)));
  const semuaDipilih = tersedia.length > 0 && tersedia.every((d) => dipilih.includes(d.slug));
  const tampil = tersedia.filter((d) => dipilih.includes(d.slug));
  const siap = tampil.length > 0 && tampil.every((d) => dimuat[d.slug]) && gambarTertunda === 0;

  const ubahPilihan = (slug: string) =>
    setDipilih((prev) => {
      const sekarang = prev ?? dipilih;
      return sekarang.includes(slug) ? sekarang.filter((s) => s !== slug) : [...sekarang, slug];
    });

  if (error) return <p className="p-8 text-sm text-red-600">{pesanError(error, "Penilaian tidak dapat dimuat.")}</p>;
  if (!penilaian) return <FullScreenLoader />;

  return (
    <div className="cetak min-h-screen bg-gray-100">
      <GayaCetak />

      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[210mm] mx-auto px-4 py-3 space-y-2" style={{ fontFamily: "inherit" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href={penilaianHref(penilaian.id)} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft size={16} /> Kembali
            </Link>
            <span className="text-sm font-semibold text-gray-800">
              Cetak Dokumen · {penilaian.asesi.nama} · {penilaian.skema.judul}
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!siap}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >
              {siap ? <Printer size={16} /> : <Loader2 size={16} className="animate-spin" />}
              {siap ? "Cetak / Simpan PDF" : tampil.length ? "Memuat..." : "Pilih dokumen"}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-700">
            {tersedia.length === 0 && <span className="text-gray-500">Belum ada dokumen yang dapat dicetak.</span>}
            {tersedia.map((d) => (
              <label key={d.slug} className="inline-flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={dipilih.includes(d.slug)} onChange={() => ubahPilihan(d.slug)} />
                {d.kode}
              </label>
            ))}
            {tersedia.length > 1 && (
              <button
                type="button"
                onClick={() => setDipilih(semuaDipilih ? [] : tersedia.map((d) => d.slug))}
                className="text-[#5A7A22] font-semibold hover:underline cursor-pointer"
              >
                {semuaDipilih ? "Kosongkan" : "Pilih semua"}
              </button>
            )}
          </div>
          {belumAdaFormat.length > 0 && (
            <p className="text-xs text-gray-500">
              Format cetak belum tersedia: {belumAdaFormat.map((d) => d.kode).join(", ")}. Dokumen yang belum dikirim tidak dapat dicetak.
            </p>
          )}
          <p className="text-xs text-gray-500">Tip: di dialog cetak pilih ukuran A4, matikan &quot;Header and footers&quot;, dan aktifkan &quot;Background graphics&quot;.</p>
        </div>
      </div>

      <PelacakProvider value={pelacak}>
        <div className="py-6">
          {tampil.map((d) => (
            <DokumenCetak key={d.slug} penilaianId={penilaian.id} slug={d.slug} onDimuat={tandaiDimuat} />
          ))}
        </div>
      </PelacakProvider>
    </div>
  );
}

function DokumenCetak({ penilaianId, slug, onDimuat }: { penilaianId: number; slug: string; onDimuat: (slug: string) => void }) {
  const { data, error } = useSWR(swrKey.dokumen(penilaianId, slug), () => mukDokumen.get<DokumenPayload>(penilaianId, slug), {
    revalidateOnFocus: false,
  });
  // Juga saat data berasal dari cache SWR (onSuccess tidak terpanggil).
  useEffect(() => {
    if (data) onDimuat(slug);
  }, [data, onDimuat, slug]);
  const Format = FORMAT_CETAK[slug];

  if (error) {
    return (
      <section className="halaman">
        <p style={{ color: "#b91c1c" }}>{pesanError(error, `Dokumen ${slug} tidak dapat dimuat.`)}</p>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="halaman no-print">
        <p style={{ color: "#6b7280" }}>Memuat dokumen...</p>
      </section>
    );
  }
  return (
    <section className="halaman">
      <Format p={data} />
    </section>
  );
}
