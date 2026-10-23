"use client";

/*
 * FR.IA.03 - Pertanyaan untuk Mendukung Observasi (metode TPD).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-03; data & aksi disambungkan ke API.
 * Asesor menyampaikan pertanyaan lisan, MENCATAT tanggapan asesi, menilai Ya/Tidak, menulis umpan balik,
 * tanda tangan & Kirim ke Asesi; asesi menyetujui. Pertanyaan template dari Template TPD di CMS
 * (disalin saat pertama disimpan) + pertanyaan tambahan asesor.
 */

import { Plus, X } from "lucide-react";
import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ia03Isian, Ia03Payload, Pencapaian } from "@/types/dokumen";
import { EditableText, PesanError, checkboxClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, useAkForm } from "@/features/dokumen/ak/AkShared";
import { BarisTanggal } from "@/features/dokumen/ak/BarisHeader";
import { BlokTandaTangan } from "@/features/dokumen/ak/BlokTandaTangan";
import { TabelUnit } from "@/features/dokumen/ak/TabelPenyusun";

const SLUG = "ia-03";

const PANDUAN_ASESOR = [
  "Formulir ini di isi oleh asesor kompetensi dapat sebelum, pada saat atau setelah melakukan asesmen dengan metode observasi demonstrasi.",
  "Pertanyaan dibuat dengan tujuan untuk menggali, dapat berisi pertanyaan yang berkaitan dengan dimensi kompetensi, batasan variabel dan aspek kritis yang relevan dengan skenario tugas dan praktik demonstrasi.",
  "Jika pertanyaan disampaikan sebelum melakukan praktik demonstrasi, maka pertanyaan dibuat berkaitan dengan aspek K3L, SOP, penggunaan peralatan dan perlengkapan.",
  "Jika setelah asesi melakukan praktik demonstrasi terdapat item pertanyaan pendukung observasi telah terpenuhi, maka pertanyaan tersebut tidak perlu ditanyakan lagi dan cukup memberi catatan bahwa sudah terpenuhi pada saat tugas praktek demonstrasi pada kolom tanggapan.",
  "Jika pada saat observasi ada hal yang perlu dikonfirmasi sedangkan di instrumen daftar pertanyaan pendukung observasi tidak ada, maka asesor dapat memberikan pertanyaan dengan syarat pertanyaan harus berkaitan dengan tugas praktek demonstrasi. Jika dilakukan, asesor harus mencatat dalam instrumen pertanyaan pendukung observasi.",
  "Tanggapan asesi ditulis pada kolom tanggapan.",
];

const CITATION =
  "Diadaptasi dari template yang disediakan di Departemen Pendidikan dan Pelatihan, Australia. Merancang instrumen asesmen untuk hasil yang berkualitas di VET, 2008 di VET, 2008";

/** Body PATCH: pertanyaan template tidak dikirim (ditolak API). */
const keBody = (isian: Ia03Isian) => ({
  tuk: isian.tuk,
  tanggal: isian.tanggal,
  jawaban: isian.jawaban,
  tambahan: isian.tambahan,
  umpan_balik: isian.umpan_balik,
});

export function Ia03Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia03Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.03" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.03..." />;

  return <Ia03Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

interface Baris {
  jenis: "jawaban" | "tambahan";
  idx: number;
  teks: string;
  tanggapan: string | null;
  pencapaian: Pencapaian;
}

function Ia03Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia03Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia03Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ia03Isian, Ia03Payload>({ payload, setPayload, slug: SLUG, nama: "FR.IA.03", peran, keBody });
  const { meta, isian, editable, errors, ubah } = f;

  const baris: Baris[] = [
    ...isian.pertanyaan.map((teks, i) => ({ jenis: "jawaban" as const, idx: i, teks, ...isian.jawaban[i] })),
    ...isian.tambahan.map((t, i) => ({ jenis: "tambahan" as const, idx: i, ...t, teks: t.teks ?? "" })),
  ];

  const ubahBaris = (b: Baris, patch: Partial<{ teks: string; tanggapan: string; pencapaian: Pencapaian }>) =>
    ubah((p) => {
      if (b.jenis === "jawaban") {
        return { ...p, jawaban: p.jawaban.map((j, i) => (i === b.idx ? { ...j, ...patch } : j)) };
      }
      return { ...p, tambahan: p.tambahan.map((t, i) => (i === b.idx ? { ...t, ...patch } : t)) };
    }, `isian.${b.jenis}.${b.idx}`);

  const setPencapaian = (b: Baris, nilai: Exclude<Pencapaian, null>) => ubahBaris(b, { pencapaian: b.pencapaian === nilai ? null : nilai });

  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>· Dikirim {formatTanggal(meta.submitted_at)}</span>}
        </div>
        <AkControls f={f} />
      </div>

      <AkBanner f={f} />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <AkHeader
            info={payload.info}
            opsiTuk={payload.opsi_tuk}
            tuk={isian.tuk}
            onTuk={(tuk) => ubah((p) => ({ ...p, tuk }), "isian.tuk")}
            editable={editable}
            errors={errors}
          >
            <BarisTanggal tanggal={isian.tanggal} onUbah={(v) => ubah((p) => ({ ...p, tanggal: v }), "isian.tanggal")} editable={editable} errors={errors} />
          </AkHeader>
          <p className="text-xs italic text-gray-500 px-1">*coret yang tidak perlu</p>
        </div>

        {/* Panduan bagi Asesor */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">PANDUAN BAGI ASESOR</div>
          <ul className="list-disc list-outside pl-8 pr-4 py-3 space-y-1.5">
            {PANDUAN_ASESOR.map((teks, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-snug">
                {teks}
              </li>
            ))}
          </ul>
        </div>

        <TabelUnit judulSkema={payload.info.skema.judul} units={payload.unit_kompetensi} />

        {/* Pertanyaan, Tanggapan & Pencapaian */}
        <div className="space-y-3" data-error="isian.jawaban">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm table-fixed">
              <colgroup>
                <col className="w-8" />
                <col />
                <col className="w-16" />
                <col className="w-16" />
              </colgroup>
              <thead>
                <tr className="text-xs font-semibold text-gray-700">
                  <th colSpan={2} className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                    Pertanyaan
                  </th>
                  <th colSpan={2} className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                    Pencapaian
                  </th>
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  <th className="border border-gray-200 bg-gray-50" colSpan={2}></th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">Ya</th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">Tidak</th>
                </tr>
              </thead>
              <tbody>
                {baris.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 border border-gray-200 text-sm text-gray-400 italic">
                      Belum ada pertanyaan di Template TPD (CMS). Klik Ubah lalu Tambah Pertanyaan.
                    </td>
                  </tr>
                )}
                {baris.map((b, i) => (
                  <tr key={`${b.jenis}-${b.idx}`} className="align-middle" data-error={`isian.${b.jenis}.${b.idx}`}>
                    <td className="align-top px-2 py-3 border border-gray-200 text-center text-gray-600">{i + 1}.</td>
                    <td className="align-top px-3 py-3 border border-gray-200">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          {b.jenis === "tambahan" ? (
                            <EditableText
                              value={b.teks}
                              onChange={(v) => ubahBaris(b, { teks: v })}
                              isEditing={editable}
                              ariaLabel="Pertanyaan tambahan"
                              className="text-sm text-gray-700 wrap-break-word"
                              rows={2}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap text-sm text-gray-700 wrap-break-word">{b.teks}</p>
                          )}
                        </div>
                        {editable && b.jenis === "tambahan" && (
                          <button
                            type="button"
                            aria-label="Hapus pertanyaan"
                            onClick={() => ubah((p) => ({ ...p, tambahan: p.tambahan.filter((_, j) => j !== b.idx) }))}
                            className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <p className="font-bold text-gray-800 mt-3 mb-1">Tanggapan</p>
                      <EditableText
                        value={b.tanggapan ?? ""}
                        onChange={(v) => ubahBaris(b, { tanggapan: v })}
                        isEditing={editable}
                        ariaLabel={`Tanggapan asesi pertanyaan ${i + 1}`}
                        className="text-sm text-gray-700 wrap-break-word min-h-6"
                        rows={3}
                      />
                      <PesanError kunci={`isian.${b.jenis}.${b.idx}`} errors={errors} />
                    </td>
                    {(["ya", "tidak"] as const).map((nilai) => (
                      <td key={nilai} className="px-2 py-3 border border-gray-200 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Pertanyaan ${i + 1}: ${nilai === "ya" ? "Ya" : "Tidak"}`}
                          checked={b.pencapaian === nilai}
                          disabled={!editable}
                          onChange={() => setPencapaian(b, nilai)}
                          className={`${checkboxClass} mx-auto`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PesanError kunci="isian.jawaban" errors={errors} />

          {editable && isian.tambahan.length < payload.maks_tambahan && (
            <button
              type="button"
              onClick={() => ubah((p) => ({ ...p, tambahan: [...p.tambahan, { teks: "", tanggapan: null, pencapaian: null }] }), "isian.jawaban")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all cursor-pointer"
            >
              <Plus size={12} />
              Tambah Pertanyaan
            </button>
          )}
        </div>

        {/* Umpan Balik */}
        <div className="border border-gray-200" data-error="isian.umpan_balik">
          <div className="px-4 py-3">
            <p className="font-semibold text-gray-700 mb-2">Umpan balik untuk asesi:</p>
            <EditableText
              value={isian.umpan_balik ?? ""}
              onChange={(v) => ubah((p) => ({ ...p, umpan_balik: v }), "isian.umpan_balik")}
              isEditing={editable}
              ariaLabel="Umpan balik untuk asesi"
              className="text-sm text-gray-700"
              rows={5}
            />
            <PesanError kunci="isian.umpan_balik" errors={errors} />
          </div>
        </div>

        <BlokTandaTangan f={f} info={payload.info} errors={errors} />

        <p className="text-xs text-gray-500">{CITATION}</p>
      </div>

      <div className="flex justify-end">
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
