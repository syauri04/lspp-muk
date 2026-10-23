"use client";

/*
 * FR.IA.04B - Penilaian Proyek Singkat atau Kegiatan Terstruktur Lainnya (metode KT).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-04b; data & aksi disambungkan ke API.
 * Aspek penilaian dari Template KT (CMS) + pertanyaan tambahan asesor. Asesor mencatat tanggapan,
 * Ya/Tidak & rekomendasi K/BK, tanda tangan; asesi menyetujui.
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
import type { Ia04bAspek, Ia04bIsian, Ia04bPayload, Pencapaian } from "@/types/dokumen";
import { EditableText, PesanError, checkboxClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";
import { BarisTanggal } from "@/features/dokumen/ak/BarisHeader";
import { TabelPenyusun, TabelUnit } from "@/features/dokumen/ak/TabelPenyusun";

const SLUG = "ia-04b";

const PANDUAN_ASESOR = [
  "Lakukan penilaian pencapaian hasil proyek singkat atau kegiatan terstruktur lainnya melalui presentasi.",
  "Penilaian dilakukan sesuai dengan FR IA 04A. DIT. Daftar Instruksi Terstruktur (Penjelasan Proyek Singkat/Kegiatan Terstruktur Lainnya).",
  "Pertanyaan disampaikan oleh asesor setelah asesi melakukan presentasi proyek singkat/kegiatan terstruktur lainnya.",
  "Pertanyaan dapat dikembangkan oleh asesor berdasarkan dokumen presentasi dan atau hasil presentasi.",
  "Pertanyaan yang disampaikan untuk pemenuhan pencapaian 5 dimensi kompetensi.",
  "Isilah kolom lingkup penyajian proyek atau kegiatan terstruktur lainnya sesuai sektor/sub-sektor/profesi.",
  "Berikan keputusan pencapaian berdasarkan kesimpulan jawaban asesi.",
];

/** Body PATCH: aspek template tidak dikirim (ditolak API). */
const keBody = (isian: Ia04bIsian) => ({
  tuk: isian.tuk,
  tanggal: isian.tanggal,
  jawaban: isian.jawaban,
  tambahan: isian.tambahan,
  rekomendasi_teks: isian.rekomendasi_teks,
  rekomendasi: isian.rekomendasi,
});

export function Ia04bPage({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia04bPayload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.04B" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.04B..." />;

  return <Ia04bForm key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

interface Baris extends Ia04bAspek {
  jenis: "jawaban" | "tambahan";
  idx: number;
  tanggapan: string | null;
  pencapaian: Pencapaian;
}

function Ia04bForm({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia04bPayload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia04bPayload) => Promise<unknown>;
}) {
  const f = useAkForm<Ia04bIsian, Ia04bPayload>({ payload, setPayload, slug: SLUG, nama: "FR.IA.04B", peran, keBody });
  const { meta, isian, editable, errors, ubah } = f;
  const labelClass = `flex items-center gap-2.5 text-sm text-gray-700 ${editable ? "cursor-pointer" : "cursor-default"}`;

  const baris: Baris[] = [
    ...isian.aspek.map((a, i) => ({ ...a, jenis: "jawaban" as const, idx: i, ...isian.jawaban[i] })),
    ...isian.tambahan.map((t, i) => ({ ...t, jenis: "tambahan" as const, idx: i })),
  ];

  const ubahBaris = (b: Baris, patch: Partial<Ia04bAspek & { tanggapan: string; pencapaian: Pencapaian }>) =>
    ubah((p) => {
      if (b.jenis === "jawaban") {
        return { ...p, jawaban: p.jawaban.map((j, i) => (i === b.idx ? { ...j, ...patch } : j)) };
      }
      return { ...p, tambahan: p.tambahan.map((t, i) => (i === b.idx ? { ...t, ...patch } : t)) };
    }, `isian.${b.jenis}.${b.idx}`);

  const setRekomendasi = (nilai: "kompeten" | "belum_kompeten") =>
    ubah((p) => ({ ...p, rekomendasi: p.rekomendasi === nilai ? null : nilai }), "isian.rekomendasi");

  // Lingkup & pertanyaan aspek tambahan dapat diubah asesor; aspek template hanya tampil. Kesesuaian selalu dapat diubah.
  const selTeks = (b: Baris, kunci: keyof Ia04bAspek, kelas: string, rows: number) =>
    b.jenis === "tambahan" ? (
      <EditableText
        value={b[kunci] ?? ""}
        onChange={(v) => ubahBaris(b, { [kunci]: v })}
        isEditing={editable}
        ariaLabel={kunci}
        className={kelas}
        rows={rows}
      />
    ) : (
      <p className={`whitespace-pre-wrap ${kelas}`}>{b[kunci]}</p>
    );

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

        {/* Tabel Aspek Penilaian */}
        <div className="space-y-3" data-error="isian.jawaban">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm table-fixed">
              <colgroup>
                <col className="w-12" />
                <col className="w-40" />
                <col />
                <col className="w-40" />
                <col className="w-20" />
                <col className="w-20" />
              </colgroup>
              <thead>
                <tr className="text-xs font-semibold text-gray-700">
                  <th colSpan={4} className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                    Aspek Penilaian
                  </th>
                  <th colSpan={2} className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                    Pencapaian
                  </th>
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">No</th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">Lingkup Penyajian proyek atau kegiatan terstruktur lainnya</th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">Daftar Pertanyaan</th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">Kesesuaian dengan standar kompetensi kerja (unit/elemen/ KUK)</th>
                  <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Ya</th>
                  <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Tidak</th>
                </tr>
              </thead>
              <tbody>
                {baris.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 border border-gray-200 text-sm text-gray-400 italic">
                      Belum ada aspek penilaian di Template KT (CMS). Asesor dapat menambahkan pertanyaan sendiri.
                    </td>
                  </tr>
                )}
                {baris.map((b, n) => (
                  <tr key={`${b.jenis}-${b.idx}`} className="align-top" data-error={`isian.${b.jenis}.${b.idx}`}>
                    <td className="px-2 py-3 border border-gray-200 text-center text-gray-600">
                      {n + 1}
                      {editable && b.jenis === "tambahan" && (
                        <button
                          type="button"
                          aria-label="Hapus pertanyaan"
                          onClick={() => ubah((p) => ({ ...p, tambahan: p.tambahan.filter((_, i) => i !== b.idx) }))}
                          className="block mx-auto mt-2 text-gray-300 hover:text-red-500 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 border border-gray-200">{selTeks(b, "lingkup", "text-sm font-semibold text-gray-700", 3)}</td>
                    <td className="px-3 py-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Pertanyaan:</p>
                      {selTeks(b, "pertanyaan", "text-sm text-gray-700", 5)}
                      <p className="text-xs font-semibold text-gray-500 mt-3 mb-1">Tanggapan:</p>
                      <EditableText
                        value={b.tanggapan ?? ""}
                        onChange={(v) => ubahBaris(b, { tanggapan: v })}
                        isEditing={editable}
                        ariaLabel="Tanggapan"
                        className="text-sm text-gray-700 min-h-[24px]"
                        rows={3}
                      />
                      <PesanError kunci={`isian.${b.jenis}.${b.idx}`} errors={errors} />
                    </td>
                    <td className="px-3 py-3 border border-gray-200">
                      <EditableText
                        value={b.kesesuaian ?? ""}
                        onChange={(v) => ubahBaris(b, { kesesuaian: v })}
                        isEditing={editable}
                        ariaLabel={`Kesesuaian aspek ${n + 1}`}
                        className="text-sm text-gray-700 font-mono"
                        rows={2}
                      />
                    </td>
                    {(["ya", "tidak"] as const).map((nilai) => (
                      <td key={nilai} className="px-2 py-3 border border-gray-200 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Aspek ${n + 1}: ${nilai}`}
                          checked={b.pencapaian === nilai}
                          disabled={!editable}
                          onChange={() => ubahBaris(b, { pencapaian: b.pencapaian === nilai ? null : nilai })}
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
              onClick={() =>
                ubah(
                  (p) => ({
                    ...p,
                    tambahan: [...p.tambahan, { lingkup: "", pertanyaan: "", kesesuaian: "", tanggapan: null, pencapaian: null }],
                  }),
                  "isian.jawaban",
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all cursor-pointer"
            >
              <Plus size={12} />
              Tambah Pertanyaan
            </button>
          )}
        </div>

        {/* Rekomendasi Asesor */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr data-error="isian.rekomendasi">
                <td className="w-40 align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Rekomendasi Asesor:</td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={isian.rekomendasi_teks ?? ""}
                    onChange={(v) => ubah((p) => ({ ...p, rekomendasi_teks: v }))}
                    isEditing={editable}
                    ariaLabel="Rekomendasi asesor"
                    className="text-sm text-gray-700 mb-3"
                    rows={2}
                  />
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <label className={labelClass}>
                      <input
                        type="checkbox"
                        checked={isian.rekomendasi === "kompeten"}
                        disabled={!editable}
                        onChange={() => setRekomendasi("kompeten")}
                        className={checkboxClass}
                      />
                      Kompeten
                    </label>
                    <label className={labelClass}>
                      <input
                        type="checkbox"
                        checked={isian.rekomendasi === "belum_kompeten"}
                        disabled={!editable}
                        onChange={() => setRekomendasi("belum_kompeten")}
                        className={checkboxClass}
                      />
                      Belum Kompeten
                    </label>
                  </div>
                  <PesanError kunci="isian.rekomendasi" errors={errors} />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50">
                  Asesi:
                </td>
              </tr>
              <tr>
                <td className="w-40 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="Nama asesi" value={payload.info.asesi.nama ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda Tangan/ Tanggal</td>
                <td className="px-3 py-3 border border-gray-200">
                  <TtdKotak f={f} pihak="asesi" />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50">
                  Asesor:
                </td>
              </tr>
              <tr>
                <td className="w-40 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="Nama asesor" value={payload.info.asesor.nama ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda Tangan/ Tanggal</td>
                <td className="px-3 py-3 border border-gray-200">
                  <TtdKotak f={f} pihak="asesor" />
                  <PesanError kunci="tanda_tangan" errors={errors} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TabelPenyusun
          penyusun={payload.penyusun}
          penilaianId={f.penilaianId}
          slug={SLUG}
          kosong="Penyusun dan validator FR.IA.04B belum diisi admin di CMS (Template KT)."
        />
      </div>

      <div className="flex justify-end">
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
