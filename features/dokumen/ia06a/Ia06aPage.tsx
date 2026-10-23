"use client";

/*
 * FR.IA.06A - Pertanyaan Tertulis Esai (semua metode).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-06a; data & aksi disambungkan ke API.
 * Asesor menyiapkan TUK, tanggal & waktu lalu "Buka untuk Asesi"; asesi menulis jawaban lalu Kirim.
 * Soal dari Template Umum di CMS. Kunci jawaban tidak pernah dikirim ke halaman ini.
 */

import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Save, Send, Unlock } from "lucide-react";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { fieldErrors, pesanError, statusError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ia06Header, Ia06aPayload } from "@/types/dokumen";
import { EditableText, PesanError } from "@/features/dokumen/mapa/MapaShared";
import { KepalaIa06 } from "@/features/dokumen/ia06/Ia06Shared";

const SLUG = "ia-06a";

type Mode = "siapkan" | "jawab" | "lihat";

export function Ia06aPage({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia06aPayload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.06A" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.06A..." />;

  return <Ia06aForm key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

/** Kolom jawaban (sesuai mockup: textarea transparan saat tidak mengubah). */
function JawabanArea({ value, onChange, isEditing }: { value: string; onChange: (v: string) => void; isEditing: boolean }) {
  return (
    <textarea
      value={value}
      aria-label="Jawaban"
      onChange={(e) => onChange(e.target.value)}
      disabled={!isEditing}
      rows={3}
      maxLength={10000}
      placeholder="Tulis jawaban Anda disini..."
      className={`w-full mt-1 px-1.5 py-1 text-sm text-gray-700 placeholder:text-gray-400 resize-y transition-all border ${
        isEditing
          ? "border-gray-300 bg-white focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20"
          : "border-transparent bg-transparent disabled:text-gray-700"
      }`}
    />
  );
}

function Ia06aForm({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia06aPayload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia06aPayload) => Promise<unknown>;
}) {
  const { mutate } = useSWRConfig();
  const meta = payload.dokumen;
  const penilaianId = meta.penilaian_id;
  const mode: Mode = peran === "asesor" && meta.dinilai?.bisa_siapkan ? "siapkan" : peran === "asesi" && meta.dapat_diubah ? "jawab" : "lihat";

  const [header, setHeader] = useState<Ia06Header>({
    tuk: payload.persiapan.tuk,
    tanggal: payload.persiapan.tanggal,
    waktu: payload.persiapan.waktu,
  });
  const [jawaban, setJawaban] = useState<(string | null)[]>(payload.isian.jawaban);
  const [isEditing, setIsEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [konfirmasi, setKonfirmasi] = useState<"buka" | "kirim" | null>(null);
  const [proses, setProses] = useState(false);
  const editable = isEditing && mode !== "lihat";

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const tandai = (kunci: string) => {
    setDirty(true);
    setErrors((e) => {
      const salinan = { ...e };
      delete salinan[kunci];
      return salinan;
    });
  };

  const terima = async (res: Ia06aPayload) => {
    await setPayload(res);
    setHeader({ tuk: res.persiapan.tuk, tanggal: res.persiapan.tanggal, waktu: res.persiapan.waktu });
    setJawaban(res.isian.jawaban);
    setDirty(false);
    void mutate(swrKey.penilaian(penilaianId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    setMenyimpan(true);
    try {
      const res =
        mode === "siapkan"
          ? await mukDokumen.persiapan<Ia06aPayload, unknown>(penilaianId, SLUG, { persiapan: header })
          : await mukDokumen.simpan<Ia06aPayload, unknown>(penilaianId, SLUG, { isian: { jawaban } });
      await terima(res);
      setIsEditing(false);
      setErrors({});
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(pesanError(err, "Gagal menyimpan."));
    } finally {
      setMenyimpan(false);
    }
  };

  const jalankan = async () => {
    setProses(true);
    try {
      if (konfirmasi === "buka") {
        await terima(await mukDokumen.buka<Ia06aPayload>(penilaianId, SLUG));
        toast.success("FR.IA.06A dibuka untuk dijawab asesi.");
      } else {
        await terima(await mukDokumen.submit<Ia06aPayload>(penilaianId, SLUG));
        toast.success("Jawaban FR.IA.06A dikirim ke asesor.");
      }
      setKonfirmasi(null);
    } catch (err) {
      setKonfirmasi(null);
      const fe = fieldErrors(err);
      if (statusError(err) === 422 && Object.keys(fe).length) {
        setErrors(fe);
        toast.error(fe["persiapan.soal"] ?? "Lengkapi isian yang ditandai.");
        document.querySelector(`[data-error="${Object.keys(fe)[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error(pesanError(err, "Aksi gagal."));
      }
    } finally {
      setProses(false);
    }
  };

  const siap = !isEditing && !dirty;
  const aksiUtama =
    mode === "siapkan"
      ? { label: "Buka untuk Asesi", icon: <Unlock size={13} />, aksi: "buka" as const }
      : mode === "jawab"
        ? { label: "Kirim", icon: <Send size={13} />, aksi: "kirim" as const }
        : null;

  const kontrol =
    mode === "lihat" ? null : (
      <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2F5E9] text-[#5A7A22] text-xs font-semibold border border-[#8AA53C]/30 animate-in fade-in">
            <Check size={14} className="stroke-[2.5]" />
            Tersimpan
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isEditing}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isEditing ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default" : "border-[#7E9631] text-[#7E9631] bg-white hover:bg-[#F2F5E9]"
          }`}
        >
          <Pencil size={13} />
          Ubah
        </button>
        <button
          type="submit"
          disabled={!isEditing || menyimpan}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          {menyimpan ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Simpan
        </button>
        {aksiUtama && !isEditing && (
          <button
            type="button"
            onClick={() => setKonfirmasi(aksiUtama.aksi)}
            disabled={!siap || proses}
            title={siap ? undefined : "Simpan perubahan terlebih dahulu"}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            {aksiUtama.icon}
            {aksiUtama.label}
          </button>
        )}
      </div>
    );

  const kelasInfo = "text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3";
  const kelasAksi = "text-sm text-[#5A7A22] bg-[#F2F5E9] border border-[#8AA53C]/40 rounded-lg p-3";
  const banner =
    meta.status === "selesai" ? (
      <p className={`${kelasAksi} font-semibold`}>
        Jawaban sudah dikirim.{peran === "asesor" ? " Nilai jawaban asesi di FR.IA.06C." : " Menunggu penilaian asesor di FR.IA.06C."}
      </p>
    ) : mode === "siapkan" ? (
      <p className={kelasInfo}>
        Periksa TUK, tanggal & waktu, lalu klik <strong>Buka untuk Asesi</strong>. Soal diambil dari Template Umum (CMS) dan dikunci saat
        dibuka.
      </p>
    ) : mode === "jawab" ? (
      <p className={kelasAksi}>
        Klik <strong>Ubah</strong>, tuliskan jawaban setiap pertanyaan, <strong>Simpan</strong>, lalu <strong>Kirim</strong>.
      </p>
    ) : peran === "asesor" && payload.persiapan.dibuka ? (
      <p className={kelasInfo}>Menunggu asesi menjawab dan mengirim.</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>· Dikirim {formatTanggal(meta.submitted_at)}</span>}
        </div>
        {kontrol}
      </div>

      {banner}
      <PesanError kunci="persiapan.soal" errors={errors} />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        <KepalaIa06
          info={payload.info}
          opsiTuk={payload.opsi_tuk}
          header={header}
          editable={editable && mode === "siapkan"}
          onUbah={(patch, kunci) => {
            setHeader((h) => ({ ...h, ...patch }));
            tandai(kunci);
          }}
          errors={errors}
        />

        {/* Pertanyaan */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-800">Jawablah semua pertanyaan di bawah ini:</p>
          <div className="border border-gray-200 divide-y divide-gray-200">
            {payload.pertanyaan.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400 italic">Soal esai belum diisi admin di CMS (Template Umum).</p>
            )}
            {payload.pertanyaan.map((teks, i) => (
              <div key={i} className="flex gap-3 px-4 py-3" data-error={`isian.jawaban.${i}`}>
                <span className="w-6 shrink-0 text-sm text-gray-600">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <EditableText value={teks} onChange={() => {}} isEditing={false} className="text-sm text-gray-800" />
                  {mode === "siapkan" ? (
                    <p className="mt-1 text-xs italic text-gray-400">Dijawab asesi setelah dibuka.</p>
                  ) : (
                    <JawabanArea
                      value={jawaban[i] ?? ""}
                      onChange={(v) => {
                        setJawaban((j) => {
                          const salinan = [...j];
                          salinan[i] = v;
                          return salinan;
                        });
                        tandai(`isian.jawaban.${i}`);
                      }}
                      isEditing={editable && mode === "jawab"}
                    />
                  )}
                  <PesanError kunci={`isian.jawaban.${i}`} errors={errors} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">{kontrol}</div>

      <ConfirmDialog
        open={konfirmasi !== null}
        onOpenChange={(o) => !o && setKonfirmasi(null)}
        title={konfirmasi === "buka" ? "Buka FR.IA.06A untuk asesi?" : "Kirim jawaban FR.IA.06A?"}
        description={
          konfirmasi === "buka"
            ? "Asesi akan dapat melihat dan menjawab soal. Soal tidak dapat diubah lagi untuk penilaian ini."
            : "Setelah dikirim, jawaban tidak dapat diubah dan akan dinilai asesor."
        }
        confirmLabel={konfirmasi === "buka" ? "Buka" : "Kirim"}
        onConfirm={jalankan}
        loading={proses}
      />
    </form>
  );
}
