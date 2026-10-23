"use client";

/*
 * FR.IA.01 - Ceklis Observasi Aktivitas di Tempat Kerja / Tempat Kerja Simulasi (metode TPD).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-01; data & aksi disambungkan ke API.
 * Unit/elemen/KUK dari skema; asesor mengisi pencapaian per elemen, umpan balik & rekomendasi,
 * menandatangani, lalu asesi menyetujui dengan tanda tangan.
 */

import { Fragment } from "react";
import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ia01Isian, Ia01Payload, Pencapaian } from "@/types/dokumen";
import { EditableText, PesanError, checkboxClass, compactInputClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";

const SLUG = "ia-01";

const PANDUAN_ASESOR = [
  "Lengkapi nama unit kompetensi, elemen, dan kriteria unjuk kerja sesuai kolom dalam tabel.",
  "Isilah standar industri atau tempat kerja.",
  'Beri tanda (✓) pada kolom "YA" jika anda yakin asesi dapat melakukan/mendemonstrasikan tugas sesuai KAK, atau centang (✓) pada kolom "TIDAK" bila sebaliknya.',
  "Penilaian lanjut diisi bila hasil belum dapat disimpulkan, untuk itu gunakan metode lain sehingga keputusan dapat dibuat.",
  "Isilah kolom KUK sesuai dengan Unit Kompetensi/SKKNI",
];

const LANJUTAN: { key: keyof Ia01Isian["lanjutan"]; label: string }[] = [
  { key: "kelompok", label: "Kelompok Pekerjaan" },
  { key: "unit", label: "Unit" },
  { key: "elemen", label: "Elemen" },
  { key: "kuk", label: "KUK" },
];

export function Ia01Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia01Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.01" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.01..." />;

  return <Ia01Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ia01Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia01Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia01Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ia01Isian, Ia01Payload>({ payload, setPayload, slug: SLUG, nama: "FR.IA.01", peran });
  const { meta, isian, editable, errors, ubah } = f;
  const info = payload.info;
  const struktur = payload.struktur;

  const ubahElemen = (kunci: string, patch: Partial<Ia01Isian["elemen"][string]>) =>
    ubah((p) => ({ ...p, elemen: { ...p.elemen, [kunci]: { ...p.elemen[kunci], ...patch } } }), `isian.elemen.${kunci}`);

  const setPencapaian = (kunci: string, nilai: Exclude<Pencapaian, null>) =>
    ubahElemen(kunci, { pencapaian: isian.elemen[kunci]?.pencapaian === nilai ? null : nilai });

  const setRekomendasi = (nilai: "kompeten" | "lanjutan") =>
    ubah((p) => ({ ...p, rekomendasi: p.rekomendasi === nilai ? null : nilai }), "isian.rekomendasi");

  const labelClass = `flex items-start gap-2.5 text-sm text-gray-700 ${editable ? "cursor-pointer" : "cursor-default"}`;

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

        {/* Tabel Ringkasan Unit Kompetensi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <thead>
              <tr className="text-xs font-semibold text-gray-600">
                <th className="w-52 px-3 py-2.5 border border-gray-200"></th>
                <th className="w-14 px-3 py-2.5 border border-gray-200">No</th>
                <th className="w-52 px-3 py-2.5 border border-gray-200 text-left">Kode Unit</th>
                <th className="px-3 py-2.5 border border-gray-200 text-left">Judul Unit</th>
              </tr>
            </thead>
            <tbody>
              {struktur.map((unit, idx) => (
                <tr key={unit.id}>
                  {idx === 0 && (
                    <td
                      rowSpan={struktur.length}
                      className="align-middle px-3 py-3 border border-gray-200 text-center font-bold text-gray-800 bg-gray-50"
                    >
                      {info.skema.judul}
                    </td>
                  )}
                  <td className="px-3 py-2 border border-gray-200 text-center text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input type="text" aria-label="Kode unit" value={unit.kode_unit ?? ""} disabled readOnly className={`${compactInputClass} font-mono`} />
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input type="text" aria-label="Judul unit" value={unit.judul_unit} disabled readOnly className={compactInputClass} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Uji Kompetensi per Unit */}
        {struktur.map((unit, uIdx) => (
          <div key={unit.id} className="border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td rowSpan={2} className="w-56 align-middle px-4 py-3 bg-gray-50 border border-gray-200 font-semibold text-gray-700">
                    Unit Kompetensi {uIdx + 1}
                  </td>
                  <td className="w-28 px-4 py-3 border border-gray-200 font-semibold text-gray-600">Kode Unit</td>
                  <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input type="text" aria-label="Kode unit" value={unit.kode_unit ?? ""} disabled readOnly className={`${inputClass} font-mono`} />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">Judul Unit</td>
                  <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input type="text" aria-label="Judul unit" value={unit.judul_unit} disabled readOnly className={inputClass} />
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse text-sm table-fixed">
              <colgroup>
                <col className="w-12" />
                <col className="w-56" />
                <col />
                <col className="w-40" />
                <col className="w-14" />
                <col className="w-14" />
                <col className="w-40" />
              </colgroup>
              <thead>
                <tr className="text-xs font-semibold text-gray-700">
                  <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">No.</th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">Elemen</th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">Kriteria Unjuk Kerja</th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">Standar Industri atau Tempat Kerja</th>
                  <th colSpan={2} className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                    Pencapaian
                  </th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">Penilaian Lanjut</th>
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  <th className="border border-gray-200 bg-gray-50" colSpan={4}></th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">Ya</th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">Tidak</th>
                  <th className="border border-gray-200 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody>
                {unit.elemen.map((elemen) => {
                  const nilai = isian.elemen[elemen.kunci];
                  const kuk = elemen.kuk.length ? elemen.kuk : [{ nomor: null, deskripsi: "" }];
                  const baris = kuk.length;
                  return (
                    <Fragment key={elemen.kunci}>
                      {kuk.map((k, kIdx) => (
                        <tr key={kIdx} className="align-top" data-error={kIdx === 0 ? `isian.elemen.${elemen.kunci}` : undefined}>
                          {kIdx === 0 && (
                            <>
                              <td rowSpan={baris} className="px-2 py-3 border border-gray-200 text-center text-gray-600">
                                {elemen.nomor}.
                              </td>
                              <td rowSpan={baris} className="px-3 py-3 border border-gray-200">
                                <p className="whitespace-pre-wrap text-sm text-gray-700 wrap-break-word">{elemen.nama}</p>
                                <PesanError kunci={`isian.elemen.${elemen.kunci}`} errors={errors} />
                              </td>
                            </>
                          )}
                          <td className="px-3 py-2 border border-gray-200 overflow-hidden">
                            <div className="flex items-start gap-2 min-w-0">
                              <span className="w-9 shrink-0 pt-1 text-xs font-mono text-gray-500">{k.nomor ?? `${elemen.nomor}.${kIdx + 1}`}</span>
                              <p className="flex-1 min-w-0 whitespace-pre-wrap text-sm text-gray-700 wrap-break-word">{k.deskripsi}</p>
                            </div>
                          </td>
                          {kIdx === 0 && (
                            <>
                              <td rowSpan={baris} className="px-3 py-3 border border-gray-200">
                                <EditableText
                                  value={nilai?.standar ?? ""}
                                  onChange={(v) => ubahElemen(elemen.kunci, { standar: v })}
                                  isEditing={editable}
                                  ariaLabel="Standar industri atau tempat kerja"
                                  className="text-sm text-gray-700"
                                  rows={4}
                                />
                              </td>
                              <td rowSpan={baris} className="px-2 py-3 border border-gray-200 text-center">
                                <input
                                  type="checkbox"
                                  aria-label={`Elemen ${elemen.nomor}: Ya`}
                                  checked={nilai?.pencapaian === "ya"}
                                  disabled={!editable}
                                  onChange={() => setPencapaian(elemen.kunci, "ya")}
                                  className={`${checkboxClass} mx-auto`}
                                />
                              </td>
                              <td rowSpan={baris} className="px-2 py-3 border border-gray-200 text-center">
                                <input
                                  type="checkbox"
                                  aria-label={`Elemen ${elemen.nomor}: Tidak`}
                                  checked={nilai?.pencapaian === "tidak"}
                                  disabled={!editable}
                                  onChange={() => setPencapaian(elemen.kunci, "tidak")}
                                  className={`${checkboxClass} mx-auto`}
                                />
                              </td>
                              <td rowSpan={baris} className="px-3 py-3 border border-gray-200">
                                <EditableText
                                  value={nilai?.lanjut ?? ""}
                                  onChange={(v) => ubahElemen(elemen.kunci, { lanjut: v })}
                                  isEditing={editable}
                                  ariaLabel="Penilaian lanjut"
                                  className="text-sm text-gray-700"
                                  rows={4}
                                />
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
        <PesanError kunci="isian.elemen" errors={errors} />

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

        {/* Rekomendasi Asesor */}
        <div className="border border-gray-200" data-error="isian.rekomendasi">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">Rekomendasi Asesor</div>
          <div className="px-4 py-3 border-b border-gray-200">
            <label className={labelClass}>
              <input
                type="checkbox"
                checked={isian.rekomendasi === "kompeten"}
                disabled={!editable}
                onChange={() => setRekomendasi("kompeten")}
                className={`${checkboxClass} mt-0.5`}
              />
              <span>
                Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <span className="font-bold">KOMPETEN</span>
              </span>
            </label>
            <PesanError kunci="isian.rekomendasi" errors={errors} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="px-4 py-3 border-t md:border-t-0 border-gray-200" data-error="isian.lanjutan">
              <label className={labelClass}>
                <input
                  type="checkbox"
                  checked={isian.rekomendasi === "lanjutan"}
                  disabled={!editable}
                  onChange={() => setRekomendasi("lanjutan")}
                  className={`${checkboxClass} mt-0.5`}
                />
                <span>
                  Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan{" "}
                  <span className="font-bold">OBSERVASI LANGSUNG/ KEGIATAN TERSTRUKTUR*)</span> pada:
                </span>
              </label>
              <div className="pl-7 mt-3 space-y-2.5">
                {LANJUTAN.map((l) => (
                  <div key={l.key} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-gray-600">{l.label}</span>
                    <span className="text-gray-400">:</span>
                    <input
                      type="text"
                      aria-label={l.label}
                      value={isian.lanjutan[l.key] ?? ""}
                      maxLength={1000}
                      onChange={(e) => ubah((p) => ({ ...p, lanjutan: { ...p.lanjutan, [l.key]: e.target.value } }), "isian.lanjutan")}
                      disabled={!editable || isian.rekomendasi !== "lanjutan"}
                      className={inputClass}
                    />
                  </div>
                ))}
                <PesanError kunci="isian.lanjutan" errors={errors} />
              </div>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-gray-200 p-0">
              <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">Asesi</div>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="w-28 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                    <td className="w-6 px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label="Nama asesi" value={info.asesi.nama ?? ""} disabled readOnly className={inputClass} />
                    </td>
                  </tr>
                  <tr>
                    <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda Tangan/Tanggal</td>
                    <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-3 border border-gray-200">
                      <TtdKotak f={f} pihak="asesi" />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="px-4 py-2.5 border-y border-gray-200 font-bold text-gray-800 bg-gray-50">Asesor</div>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="w-28 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                    <td className="w-6 px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label="Nama asesor" value={info.asesor.nama ?? ""} disabled readOnly className={inputClass} />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">No. Reg</td>
                    <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" aria-label="No. Reg asesor" value={info.asesor.nomor_registrasi ?? ""} disabled readOnly className={inputClass} />
                    </td>
                  </tr>
                  <tr>
                    <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda Tangan/Tanggal</td>
                    <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-3 border border-gray-200">
                      <TtdKotak f={f} pihak="asesor" />
                      <PesanError kunci="tanda_tangan" errors={errors} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
