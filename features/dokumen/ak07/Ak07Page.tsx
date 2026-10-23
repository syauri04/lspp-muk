"use client";

/*
 * FR.AK.07 - Ceklis Penyesuaian yang Wajar dan Beralasan.
 * Tampilan & style mengikuti mockup app/dashboard/fr/ak-07; data & aksi disambungkan ke API.
 * Asesor mengisi & menandatangani, lalu asesi menyetujui dengan tanda tangan.
 * Otomatis: skema, nama asesor/asesi, tanggal (jadwal), potensi asesi (FR.MAPA.01),
 * acuan pembanding/metode/instrumen (standar skema & metode).
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
import type { Ak07Isian, Ak07Karakter, Ak07Payload } from "@/types/dokumen";
import { PesanError, checkboxClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";

const SLUG = "ak-07";

const PANDUAN_ASESOR = [
  "Formulir ini dapat digunakan (sebelum pra-asesmen, saat pelaksanaan pra-asesmen, setelah pra-asesmen) jika ada asesi yang mempunyai keterbatasan sesuai karakteristik yang dimilikinya sehingga diperlukan penyesuaian yang wajar dan beralasan, jika rencana asesmen dan perangkat asesmen tidak sesuai dengan asesi (pembanding, potensi asesi dan konteks asesi), jika asesi merasa kelelahan, sakit, serta jika kondisi alam, listrik padam, dll.",
  "Coretlah pada tanda * yang tidak sesuai.",
  "Berilah tanda (✓) pada kotak (☐) kolom potensi asesi.",
  "Berilah tanda (✓) Ya atau Tidak pada tanda ** sesuai pilihan, dan jawaban Ya selanjutnya berilah tanda keterangan berilah tanda (✓) di kotak (☐) yang tersedia, pilihan boleh lebih dari satu.",
];

const HASIL: { key: keyof Ak07Isian["hasil"]; no: string; label: string; placeholder: string }[] = [
  { key: "acuan", no: "1)", label: "Acuan Pembanding Asesmen", placeholder: "tuliskan nama acuan pembanding" },
  { key: "metode", no: "2)", label: "Metode Asesmen", placeholder: "tuliskan metode asesmen" },
  { key: "instrumen", no: "3)", label: "Instrumen Asesmen", placeholder: "tuliskan nama formulir instrumen asesmen" },
];

export function Ak07Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ak07Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.AK.07" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.AK.07..." />;

  return <Ak07Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ak07Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ak07Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ak07Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ak07Isian, Ak07Payload>({ payload, setPayload, slug: SLUG, nama: "FR.AK.07", peran });
  const { meta, isian, editable, errors, ubah } = f;
  const info = payload.info;

  const togglePotensi = (v: string) =>
    ubah((p) => ({ ...p, potensi: p.potensi.includes(v) ? p.potensi.filter((x) => x !== v) : [...p.potensi, v] }), "isian.potensi");

  const ubahKarakter = (kunci: string, fn: (k: Ak07Karakter) => Ak07Karakter) =>
    ubah((p) => ({ ...p, karakter: { ...p.karakter, [kunci]: fn(p.karakter[kunci]) } }), `isian.karakter.${kunci}`);

  // Sama seperti mockup: klik pilihan yang sama lagi = batal; "Tidak" mengosongkan keterangan.
  const setPenyesuaian = (kunci: string, nilai: "ya" | "tidak") =>
    ubahKarakter(kunci, (k) => {
      const baru = k.penyesuaian === nilai ? null : nilai;
      return baru === "ya" ? { ...k, penyesuaian: baru } : { ...k, penyesuaian: baru, pilihan: [], lainnya: k.lainnya.map((l) => ({ ...l, checked: false })) };
    });

  const togglePilihan = (kunci: string, idx: number) =>
    ubahKarakter(kunci, (k) => ({
      ...k,
      pilihan: k.pilihan.includes(idx) ? k.pilihan.filter((i) => i !== idx) : [...k.pilihan, idx].sort((a, b) => a - b),
    }));

  const ubahLainnya = (kunci: string, idx: number, patch: Partial<Ak07Karakter["lainnya"][number]>) =>
    ubahKarakter(kunci, (k) => ({ ...k, lainnya: k.lainnya.map((l, i) => (i === idx ? { ...l, ...patch } : l)) }));

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
      {meta.persetujuan && !meta.persetujuan.bisa && meta.status !== "selesai" && meta.persetujuan.alasan && (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">{meta.persetujuan.alasan}</p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        {/* Header */}
        <AkHeader
          info={info}
          opsiTuk={payload.opsi_tuk}
          tuk={isian.tuk}
          onTuk={(tuk) => ubah((p) => ({ ...p, tuk }), "isian.tuk")}
          editable={editable}
          errors={errors}
        >
          <tr>
            <td colSpan={2} className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">
              Tanggal
            </td>
            <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="px-3 py-2 border border-gray-200" data-error="isian.tanggal">
              <input
                type="date"
                aria-label="Tanggal"
                value={isian.tanggal ?? ""}
                onChange={(e) => ubah((p) => ({ ...p, tanggal: e.target.value || null }), "isian.tanggal")}
                disabled={!editable}
                className={inputClass}
              />
              <PesanError kunci="isian.tanggal" errors={errors} />
            </td>
          </tr>
        </AkHeader>
        <p className="text-xs italic text-gray-500 px-1 -mt-4">*Coret yang tidak perlu</p>

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

        {/* Potensi Asesi */}
        <div className="border border-gray-200" data-error="isian.potensi">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-32" />
              <col className="w-12" />
              <col />
            </colgroup>
            <tbody>
              {payload.opsi_potensi.map((item, idx) => (
                <tr key={item.value}>
                  {idx === 0 && (
                    <td
                      rowSpan={payload.opsi_potensi.length}
                      className="align-middle px-3 py-3 border border-gray-200 text-center font-semibold text-gray-700 bg-gray-50"
                    >
                      Potensi Asesi
                    </td>
                  )}
                  <td className="px-3 py-2.5 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      aria-label={item.label}
                      checked={isian.potensi.includes(item.value)}
                      disabled={!editable}
                      onChange={() => togglePotensi(item.value)}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-3 py-2.5 border border-gray-200 text-sm text-gray-700">{item.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PesanError kunci="isian.potensi" errors={errors} />

        {/* Tabel Karakter Asesi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-12" />
              <col className="w-64" />
              <col className="w-16" />
              <col className="w-16" />
              <col />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th rowSpan={2} className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  No
                </th>
                <th rowSpan={2} className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50 text-left">
                  Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi (Karakter Asesi):
                </th>
                <th colSpan={2} className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                  Diperlukan Penyesuaian**
                </th>
                <th rowSpan={2} className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50 text-left">
                  Keterangan
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Ya</th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Tidak</th>
              </tr>
            </thead>
            <tbody>
              {payload.karakter.map((row, idx) => {
                const k = isian.karakter[row.kunci];
                const ya = k.penyesuaian === "ya";
                const ketAktif = editable && ya;
                return (
                  <tr key={row.kunci} className="align-top" data-error={`isian.karakter.${row.kunci}`}>
                    <td className="px-3 py-3 border border-gray-200 text-center text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-3 border border-gray-200">
                      <p className="whitespace-pre-wrap text-sm text-gray-700">{row.label}</p>
                      <PesanError kunci={`isian.karakter.${row.kunci}`} errors={errors} />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Baris ${idx + 1}: Ya`}
                        checked={ya}
                        disabled={!editable}
                        onChange={() => setPenyesuaian(row.kunci, "ya")}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Baris ${idx + 1}: Tidak`}
                        checked={k.penyesuaian === "tidak"}
                        disabled={!editable}
                        onChange={() => setPenyesuaian(row.kunci, "tidak")}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>
                    <td className="px-3 py-3 border border-gray-200">
                      <div className="space-y-2">
                        {row.opsi.map((label, oIdx) => (
                          <label key={oIdx} className={`flex items-start gap-2 ${ketAktif ? "cursor-pointer" : ""}`}>
                            <input
                              type="checkbox"
                              checked={k.pilihan.includes(oIdx)}
                              disabled={!ketAktif}
                              onChange={() => togglePilihan(row.kunci, oIdx)}
                              className={`${checkboxClass} mt-0.5`}
                            />
                            <span className="flex-1 min-w-0 text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                        {k.lainnya.map((l, lIdx) => (
                          <div key={lIdx} className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              aria-label="Centang keterangan tambahan"
                              checked={l.checked}
                              disabled={!ketAktif}
                              onChange={() => ubahLainnya(row.kunci, lIdx, { checked: !l.checked })}
                              className={`${checkboxClass} mt-0.5`}
                            />
                            <div className="flex-1 min-w-0">
                              {editable ? (
                                <input
                                  type="text"
                                  aria-label="Keterangan tambahan"
                                  value={l.teks ?? ""}
                                  maxLength={255}
                                  onChange={(e) => ubahLainnya(row.kunci, lIdx, { teks: e.target.value })}
                                  className="w-full px-1.5 py-1 text-sm border border-gray-300 bg-white focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all"
                                />
                              ) : (
                                <p className="whitespace-pre-wrap text-sm text-gray-700">{l.teks}</p>
                              )}
                            </div>
                            {editable && (
                              <button
                                type="button"
                                aria-label="Hapus keterangan"
                                onClick={() => ubahKarakter(row.kunci, (x) => ({ ...x, lainnya: x.lainnya.filter((_, i) => i !== lIdx) }))}
                                className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {editable && k.lainnya.length < payload.maks_lainnya && (
                        <button
                          type="button"
                          onClick={() => ubahKarakter(row.kunci, (x) => ({ ...x, lainnya: [...x.lainnya, { teks: "", checked: x.penyesuaian === "ya" }] }))}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all cursor-pointer"
                        >
                          <Plus size={12} />
                          Tambah Lampiran
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Hasil Penyesuaian */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">
            Hasil Penyesuaian yang Wajar dan Beralasan disepakati menggunakan:
          </div>
          <div className="px-4 py-3 space-y-3">
            {HASIL.map((h) => (
              <div key={h.key} data-error={`isian.hasil.${h.key}`}>
                <div className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-gray-500">{h.no}</span>
                  <span className="w-44 shrink-0 text-gray-700">{h.label}</span>
                  <span className="text-gray-400">:</span>
                  <input
                    type="text"
                    aria-label={h.label}
                    value={isian.hasil[h.key] ?? ""}
                    maxLength={2000}
                    onChange={(e) => ubah((p) => ({ ...p, hasil: { ...p.hasil, [h.key]: e.target.value } }), `isian.hasil.${h.key}`)}
                    disabled={!editable}
                    placeholder={h.placeholder}
                    className={inputClass}
                  />
                </div>
                <PesanError kunci={`isian.hasil.${h.key}`} errors={errors} />
              </div>
            ))}
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-1/2 align-top border border-gray-200 p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Nama Asesor</label>
                    <input type="text" aria-label="Nama asesor" value={info.asesor.nama ?? ""} disabled readOnly className={inputClass} />
                  </div>
                </td>
                <td className="w-1/2 align-top border border-gray-200 p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Tanda Tangan Asesor dan Tanggal</label>
                    <TtdKotak f={f} pihak="asesor" />
                    <PesanError kunci="tanda_tangan" errors={errors} />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="align-top border border-gray-200 p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Nama Asesi</label>
                    <input type="text" aria-label="Nama asesi" value={info.asesi.nama ?? ""} disabled readOnly className={inputClass} />
                  </div>
                </td>
                <td className="align-top border border-gray-200 p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Tanda Tangan Asesi dan Tanggal</label>
                    <TtdKotak f={f} pihak="asesi" />
                  </div>
                </td>
              </tr>
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
