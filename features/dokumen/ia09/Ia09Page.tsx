"use client";

/*
 * FR.IA.09 - Pertanyaan Wawancara (metode VP).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-09; data & aksi disambungkan ke API.
 * Bukti portofolio dari "Lampiran Bukti yang relevan" FR.APL.01; pertanyaan dari Template VP (CMS) + tambahan asesor
 * (isi awal mengikuti format "Sesuai dengan bukti No. … yang anda ajukan, ceritakan pengalaman anda …").
 * Asesor menulis kesimpulan jawaban & pencapaian, tanda tangan; asesi menyetujui.
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
import type { Ia09Isian, Ia09Payload, MapaPenandatangan, Pencapaian } from "@/types/dokumen";
import { EditableText, PesanError, TtdPenandatangan, checkboxClass, compactInputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, useAkForm } from "@/features/dokumen/ak/AkShared";
import { BarisTanggal } from "@/features/dokumen/ak/BarisHeader";
import { BlokTandaTangan } from "@/features/dokumen/ak/BlokTandaTangan";

const SLUG = "ia-09";

/** Isi awal pertanyaan tambahan asesor (format FR.IA.09); titik-titik dilengkapi asesor. */
const TEMPLATE_PERTANYAAN = "Sesuai dengan bukti No. ……. Yang anda ajukan, ceritakan pengalaman anda\n………………………….";

const PANDUAN_ASESOR = [
  "Pertanyaan wawancara dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.",
  "Isilah bukti portofolio sesuai dengan bukti yang diminta pada skema sertifikasi sebagaimana yang telah dibuat pada FR-IA.08.",
  "Ajukan pertanyaan verifikasi portofolio untuk semua unit/elemen kompetensi yang di checklist pada FR-IA.08.",
  "Ajukan pertanyaan kepada asesi sebagai tindak lanjut hasil verifikasi portofolio.",
  "Jika hasil verifikasi potofolio telah memenuhi aturan bukti maka pertanyaan wawancara tidak perlu dilakukan terhadap bukti tersebut.",
  'Tuliskan pencapaian atas setiap kesimpulan pertanyaan wawancara dengan cara mencentang (✓) "Ya" atau "Tidak".',
];

/** Body PATCH: pertanyaan template tidak dikirim (ditolak API). */
const keBody = (isian: Ia09Isian) => ({
  tuk: isian.tuk,
  tanggal: isian.tanggal,
  bukti: isian.bukti,
  jawaban: isian.jawaban,
  tambahan: isian.tambahan,
});

export function Ia09Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia09Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.09" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.09..." />;

  return <Ia09Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

interface Baris {
  jenis: "jawaban" | "tambahan";
  idx: number;
  teks: string;
  kesimpulan: string | null;
  pencapaian: Pencapaian;
}

function Ia09Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia09Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia09Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ia09Isian, Ia09Payload>({ payload, setPayload, slug: SLUG, nama: "FR.IA.09", peran, keBody });
  const { meta, isian, editable, errors, ubah } = f;

  const baris: Baris[] = [
    ...isian.pertanyaan.map((teks, i) => ({ jenis: "jawaban" as const, idx: i, teks, ...isian.jawaban[i] })),
    ...isian.tambahan.map((t, i) => ({ jenis: "tambahan" as const, idx: i, ...t, teks: t.teks ?? "" })),
  ];

  const ubahBaris = (b: Baris, patch: Partial<{ teks: string; kesimpulan: string; pencapaian: Pencapaian }>) =>
    ubah((p) => {
      if (b.jenis === "jawaban") {
        return { ...p, jawaban: p.jawaban.map((j, i) => (i === b.idx ? { ...j, ...patch } : j)) };
      }
      return { ...p, tambahan: p.tambahan.map((t, i) => (i === b.idx ? { ...t, ...patch } : t)) };
    }, `isian.${b.jenis}.${b.idx}`);

  const setPencapaian = (b: Baris, nilai: Exclude<Pencapaian, null>) => ubahBaris(b, { pencapaian: b.pencapaian === nilai ? null : nilai });

  const penyusunGrup = [
    { status: "Penyusun", baris: payload.penyusun.filter((p) => p.peran === "penyusun") },
    { status: "Validator", baris: payload.penyusun.filter((p) => p.peran === "validator") },
  ].filter((g) => g.baris.length > 0);

  const tombolTambah = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all cursor-pointer";

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

        {/* Bukti Portofolio */}
        <div className="space-y-3">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm table-fixed">
              <colgroup>
                <col className="w-14" />
                <col />
              </colgroup>
              <thead>
                <tr className="text-xs font-semibold text-gray-700">
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50">No.</th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">Bukti Portofolio</th>
                </tr>
              </thead>
              <tbody>
                {isian.bukti.map((b, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2.5 border border-gray-200 text-center text-gray-600">{i + 1}.</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          aria-label={`Bukti portofolio ${i + 1}`}
                          value={b}
                          maxLength={500}
                          onChange={(e) => ubah((p) => ({ ...p, bukti: p.bukti.map((x, j) => (j === i ? e.target.value : x)) }))}
                          disabled={!editable}
                          className={compactInputClass}
                        />
                        {editable && (
                          <button
                            type="button"
                            aria-label="Hapus bukti"
                            onClick={() => ubah((p) => ({ ...p, bukti: p.bukti.filter((_, j) => j !== i) }))}
                            className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editable && (
            <button type="button" onClick={() => ubah((p) => ({ ...p, bukti: [...p.bukti, ""] }))} className={tombolTambah}>
              <Plus size={12} />
              Tambah Bukti
            </button>
          )}
        </div>

        {/* Daftar Pertanyaan Wawancara */}
        <div className="space-y-3" data-error="isian.jawaban">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm table-fixed">
              <colgroup>
                <col className="w-8" />
                <col />
                <col className="w-56" />
                <col className="w-16" />
                <col className="w-16" />
              </colgroup>
              <thead>
                <tr className="text-xs font-semibold text-gray-700">
                  <th colSpan={2} className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                    Daftar Pertanyaan Wawancara
                  </th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50">Kesimpulan Jawaban Asesi</th>
                  <th colSpan={2} className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                    Pencapaian
                  </th>
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  <th className="border border-gray-200 bg-gray-50" colSpan={2}></th>
                  <th className="border border-gray-200 bg-gray-50"></th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">Ya</th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">Tidak</th>
                </tr>
              </thead>
              <tbody>
                {baris.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 border border-gray-200 text-sm text-gray-400 italic">
                      Belum ada pertanyaan di Template VP (CMS). Asesor dapat menambahkan pertanyaan sendiri.
                    </td>
                  </tr>
                )}
                {baris.map((b, n) => (
                  <tr key={`${b.jenis}-${b.idx}`} data-error={`isian.${b.jenis}.${b.idx}`}>
                    <td className="align-top px-2 py-3 border border-gray-200 text-center text-gray-600">{n + 1}.</td>
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
                              rows={4}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap text-sm text-gray-700 wrap-break-word">{b.teks}</p>
                          )}
                        </div>
                        {editable && b.jenis === "tambahan" && (
                          <button
                            type="button"
                            aria-label="Hapus pertanyaan"
                            onClick={() => ubah((p) => ({ ...p, tambahan: p.tambahan.filter((_, i) => i !== b.idx) }))}
                            className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <PesanError kunci={`isian.${b.jenis}.${b.idx}`} errors={errors} />
                    </td>
                    <td className="align-top px-3 py-3 border border-gray-200">
                      <EditableText
                        value={b.kesimpulan ?? ""}
                        onChange={(v) => ubahBaris(b, { kesimpulan: v })}
                        isEditing={editable}
                        ariaLabel="Kesimpulan jawaban asesi"
                        className="text-sm text-gray-700 wrap-break-word min-h-[24px]"
                        rows={5}
                      />
                    </td>
                    {(["ya", "tidak"] as const).map((nilai) => (
                      <td key={nilai} className="align-middle px-2 py-3 border border-gray-200 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Pertanyaan ${n + 1}: ${nilai}`}
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
              onClick={() => ubah((p) => ({ ...p, tambahan: [...p.tambahan, { teks: TEMPLATE_PERTANYAAN, kesimpulan: null, pencapaian: null }] }), "isian.jawaban")}
              className={tombolTambah}
            >
              <Plus size={12} />
              Tambah Pertanyaan
            </button>
          )}
        </div>

        <BlokTandaTangan f={f} info={payload.info} errors={errors} />

        {/* Penyusun dan Validator */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">PENYUSUN DAN VALIDATOR</div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="w-32 px-3 py-2.5 border border-gray-200 bg-gray-50">STATUS</th>
                <th className="w-14 px-3 py-2.5 border border-gray-200 bg-gray-50">NO</th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">NAMA</th>
                <th className="w-44 px-3 py-2.5 border border-gray-200 bg-gray-50">NOMOR MET</th>
                <th className="w-56 px-3 py-2.5 border border-gray-200 bg-gray-50">TANDA TANGAN DAN TANGGAL</th>
              </tr>
            </thead>
            <tbody>
              {penyusunGrup.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 border border-gray-200 text-sm text-gray-400 italic">
                    Penyusun dan validator FR.IA.09 belum diisi admin di CMS (Template VP).
                  </td>
                </tr>
              )}
              {penyusunGrup.flatMap((g) =>
                g.baris.map((row: MapaPenandatangan, idx) => (
                  <tr key={row.id}>
                    {idx === 0 && (
                      <td
                        rowSpan={g.baris.length}
                        className="align-middle px-3 py-3 border border-gray-200 text-center font-semibold text-gray-700 bg-gray-50"
                      >
                        {g.status}
                      </td>
                    )}
                    <td className="px-3 py-2 border border-gray-200 text-center text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label={`Nama ${g.status}`} value={row.nama ?? ""} disabled readOnly className={compactInputClass} />
                    </td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label="Nomor MET" value={row.no_reg ?? ""} disabled readOnly className={`${compactInputClass} font-mono`} />
                    </td>
                    <td className="px-2 py-2 border border-gray-200">
                      <TtdPenandatangan penilaianId={f.penilaianId} slug={SLUG} baris={row} />
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
