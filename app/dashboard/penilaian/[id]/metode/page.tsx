"use client";

/*
 * Tentukan Metode Asesmen (asesor).
 * Gaya mengikuti formulir FR.APL.01/02: kartu putih, tabel ringkasan bergaris, tombol hijau.
 */

import { useState } from "react";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { CheckCircle2, ClipboardCheck, FileStack, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mukPenilaian, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { dokumenHref, penilaianHref } from "@/lib/navigation";
import { formatTanggal, formatWaktuJadwal } from "@/lib/format";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import { usePenilaianFromRoute } from "@/components/penilaian/usePenilaianFromRoute";
import type { MetodeAsesmen } from "@/types/penilaian";

/** Daftar metode. Jumlah dokumen per metode sesuai paket MUK (termasuk APL & MAPA). */
const METODE: { kode: MetodeAsesmen; label: string; nama: string; jumlahDokumen: number }[] = [
  { kode: "kt", label: "KT", nama: "Kegiatan Terstruktur", jumlahDokumen: 16 },
  { kode: "tpd", label: "TPD", nama: "Tugas Praktik Demonstrasi", jumlahDokumen: 17 },
  { kode: "vp", label: "VP", nama: "Verifikasi Portofolio", jumlahDokumen: 17 },
];

const tdLabel = "w-48 px-4 py-3 border border-gray-200 font-semibold text-gray-600 bg-gray-50";
const tdNilai = "px-4 py-3 border border-gray-200 text-gray-800";

export default function TentukanMetodePage() {
  const { role } = useAuth();
  const { mutate } = useSWRConfig();
  const { data: p, error, isLoading, mutate: mutatePenilaian, notFound } = usePenilaianFromRoute();

  const [pilihan, setPilihan] = useState<MetodeAsesmen | null>(null);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [proses, setProses] = useState(false);

  if (role && role !== "asesor") {
    return <ErrorState title="Halaman ini khusus asesor" description="Metode asesmen ditentukan oleh asesor." />;
  }
  if (notFound) return <ErrorState title="Penilaian tidak ditemukan" />;
  if (error) return <ErrorState title="Gagal memuat penilaian" description={pesanError(error)} onRetry={() => mutatePenilaian()} />;
  if (isLoading || !p) return <PageLoader />;

  const apl02 = p.dokumen.find((d) => d.slug === "apl-02");
  const bisa = !!p.aksi_metode?.bisa;
  const terpilih = pilihan ?? p.metode_asesmen;
  // Penilaian lama (metode ditetapkan sebelum dokumen turunan dibuat) boleh menetapkan ulang metode yang sama.
  const belumAdaDokumen = p.dokumen.length <= 2;
  const berubah = (pilihan !== null && pilihan !== p.metode_asesmen) || (belumAdaDokumen && !!terpilih);

  const tetapkan = async () => {
    const metode = pilihan ?? p.metode_asesmen;
    if (!metode) return;
    setProses(true);
    try {
      const hasil = await mukPenilaian.tetapkanMetode(p.id, metode);
      setKonfirmasi(false);
      setPilihan(null);
      await mutatePenilaian(hasil, { revalidate: false });
      void mutate(swrKey.penilaianList());
      toast.success(`Metode ${metode.toUpperCase()} ditetapkan.`);
    } catch (err) {
      setKonfirmasi(false);
      toast.error(pesanError(err, "Gagal menetapkan metode."));
    } finally {
      setProses(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-10">
        {/* Ringkasan */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500">Pra-Asesmen</p>
          <h2 className="text-2xl font-bold text-gray-800">Tentukan Metode Asesmen</h2>
          <p className="text-sm text-gray-600 max-w-3xl">
            Berdasarkan hasil peninjauan FR.APL.02, tentukan metode asesmen yang akan digunakan untuk asesi berikut.
            Setelah metode ditetapkan, dokumen asesmen sesuai metode dibuat dan Anda wajib mengisi FR.MAPA.01 dan FR.MAPA.02 terlebih dahulu.
          </p>
        </div>

        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className={tdLabel}>Skema Sertifikasi</td>
                <td className={tdNilai}>
                  {p.skema.judul ?? "-"}
                  {p.skema.nomor && <span className="text-gray-400"> · {p.skema.nomor}</span>}
                </td>
              </tr>
              <tr>
                <td className={tdLabel}>Asesi</td>
                <td className={tdNilai}>{p.asesi.nama}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Jadwal / TUK</td>
                <td className={tdNilai}>
                  {formatTanggal(p.jadwal?.tanggal)} · {formatWaktuJadwal(p.jadwal?.waktu_mulai, p.jadwal?.waktu_selesai)}
                  {p.jadwal?.tuk && <span className="text-gray-500"> · {p.jadwal.tuk.nama}</span>}
                </td>
              </tr>
              <tr>
                <td className={tdLabel}>Rekomendasi FR.APL.02</td>
                <td className={tdNilai}>
                  {apl02?.status === "selesai" ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#5A7A22]">
                      <CheckCircle2 size={15} /> Asesmen dapat dilanjutkan
                    </span>
                  ) : (
                    <span className="text-gray-500">Belum ditinjau</span>
                  )}
                  {apl02 && (
                    <Link href={dokumenHref(p.id, "apl-02")} className="ml-3 text-xs font-semibold text-[#7E9631] hover:underline">
                      Lihat FR.APL.02
                    </Link>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-dashed border-gray-200" />

        {/* Pilihan metode */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-800">Metode Asesmen</h3>
              <p className="text-sm text-gray-500">Pilih satu metode.</p>
            </div>
            {p.metode_asesmen && (
              <p className="text-xs text-gray-500">
                Ditetapkan: <strong className="text-gray-800">{p.metode_asesmen.toUpperCase()}</strong>
                {p.metode_ditentukan_at && ` · ${formatTanggal(p.metode_ditentukan_at)}`}
              </p>
            )}
          </div>

          {!bisa && !p.metode_asesmen && (
            <p className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <Lock size={14} className="shrink-0" /> {p.aksi_metode?.alasan ?? "Metode belum dapat ditentukan."}
            </p>
          )}
          {!bisa && p.metode_asesmen && p.aksi_metode?.alasan && (
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <Lock size={12} className="shrink-0" /> {p.aksi_metode.alasan}
            </p>
          )}

          <div role="radiogroup" aria-label="Metode asesmen" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {METODE.map((m) => {
              const aktif = terpilih === m.kode;
              return (
                <button
                  key={m.kode}
                  type="button"
                  role="radio"
                  aria-checked={aktif}
                  disabled={!bisa}
                  onClick={() => setPilihan(m.kode)}
                  className={`relative text-left border p-5 transition-all ${
                    aktif ? "border-[#7E9631] bg-[#F2F5E9] ring-2 ring-[#7E9631]/20" : "border-gray-200 bg-white"
                  } ${bisa ? "cursor-pointer hover:border-[#7E9631]" : "cursor-default opacity-70"}`}
                >
                  <span
                    className={`absolute top-4 right-4 w-4 h-4 rounded-full border flex items-center justify-center ${
                      aktif ? "border-[#7E9631]" : "border-gray-300"
                    }`}
                  >
                    {aktif && <span className="w-2 h-2 rounded-full bg-[#7E9631]" />}
                  </span>
                  <p className="text-2xl font-bold text-gray-800 tracking-tight">{m.label}</p>
                  <p className="mt-1 text-sm text-gray-600">{m.nama}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <FileStack size={13} /> {m.jumlahDokumen} dokumen asesmen
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={penilaianHref(p.id)} className="text-xs font-semibold text-[#5A7A22] hover:underline">
          ← Kembali ke ringkasan penilaian
        </Link>
        {bisa && (
          <button
            type="button"
            onClick={() => setKonfirmasi(true)}
            disabled={!berubah || proses}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            <ClipboardCheck size={13} />
            {p.metode_asesmen ? "Ubah Metode" : "Tetapkan Metode"}
          </button>
        )}
      </div>

      <ConfirmDialog
        open={konfirmasi}
        onOpenChange={setKonfirmasi}
        title={`Tetapkan metode ${terpilih?.toUpperCase() ?? ""}?`}
        description={
          <>
            <p>Penilaian akan berstatus <strong>Berlangsung</strong> dengan metode {terpilih?.toUpperCase()}.</p>
            <p>Dokumen asesmen sesuai metode (FR.MAPA, FR.AK, FR.IA) akan dibuat. Metode masih dapat diganti selama belum ada dokumen yang diisi.</p>
          </>
        }
        confirmLabel="Ya, tetapkan"
        onConfirm={tetapkan}
        loading={proses}
      />
    </div>
  );
}
