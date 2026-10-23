"use client";

/*
 * FR.IA.08 - Ceklis Verifikasi Portofolio (metode VP).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-08; data & aksi disambungkan ke API.
 * Bukti portofolio terisi awal dari "Lampiran Bukti yang relevan" FR.APL.01 (asesor dapat membuka berkas/link
 * asesi sebelum menilai aturan bukti); unit kompetensi dicentang (satu centang
 * per unit) untuk diklarifikasi saat wawancara IA.09. Asesor isi + tanda tangan, asesi menyetujui.
 */

import { ExternalLink, FileText, Plus, X } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Apl01BuktiRelevan, AturanBukti, Ia08Isian, Ia08Payload, JenisLanjutan, Pencapaian } from "@/types/dokumen";

type Ia08Kuk = Ia08Payload["kuk"][number];
import { EditableText, PesanError, checkboxClass, compactInputClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, useAkForm } from "@/features/dokumen/ak/AkShared";
import { BarisTanggal } from "@/features/dokumen/ak/BarisHeader";
import { BlokTandaTangan } from "@/features/dokumen/ak/BlokTandaTangan";

const SLUG = "ia-08";

const PANDUAN_ASESOR = [
  "Verifikasi portofolio dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.",
  "Isilah bukti portofolio sesuai ketentuan bukti berkualitas dan relevan dengan standar kompetensi kerja sebagaimana yang telah disepakati pada rekaman asesmen mandiri.",
  "Lakukan verifikasi portofolio berdasarkan aturan bukti.",
  "Berikan hasil verifikasi portofolio dengan memberi centang (✓) pada kolom yang sesuai.",
  "Jika hasil verifikasi dokumen portofolio belum memenuhi aturan bukti maka asesor melanjutkan dengan metode tanya jawab pertanyaan wawancara dan/atau verifikasi pihak ketiga.",
];

const ATURAN: { id: AturanBukti; label: string }[] = [
  { id: "valid", label: "Valid" },
  { id: "asli", label: "Asli" },
  { id: "terkini", label: "Terkini" },
  { id: "memadai", label: "Memadai" },
];

/** Asesmen lanjutan bila portofolio belum memadai (BNSP): observasi langsung = TPD, kegiatan terstruktur = KT. */
const JENIS_LANJUTAN: { id: JenisLanjutan; label: string; dokumen: string }[] = [
  { id: "observasi", label: "Observasi Langsung", dokumen: "FR.IA.01, FR.IA.02, FR.IA.03 (metode TPD)" },
  { id: "kegiatan_terstruktur", label: "Kegiatan Terstruktur", dokumen: "FR.IA.04A, FR.IA.04B (metode KT)" },
];

export function Ia08Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia08Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.08" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.08..." />;

  return <Ia08Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ia08Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia08Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia08Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ia08Isian, Ia08Payload>({ payload, setPayload, slug: SLUG, nama: "FR.IA.08", peran });
  const { meta, isian, editable, errors, ubah } = f;
  const lampiran = new Map(payload.lampiran.map((l) => [l.id, l]));

  /** Buka berkas lampiran asesi (FR.APL.01) di tab baru. */
  const bukaBerkas = async (l: Apl01BuktiRelevan) => {
    // Buka tab dulu (sinkron dengan klik) agar tidak diblokir popup blocker.
    const tab = window.open("", "_blank");
    try {
      const url = URL.createObjectURL(await mukDokumen.berkasRelevanApl01(f.penilaianId, l.id));
      if (tab) tab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      toast.error(pesanError(err, "Berkas tidak dapat dibuka."));
    }
  };
  const labelClass = `flex items-start gap-2.5 text-sm text-gray-700 ${editable ? "cursor-pointer" : "cursor-default"}`;

  const ubahPortofolio = (i: number, patch: Partial<Ia08Isian["portofolio"][number]>) =>
    ubah((p) => ({ ...p, portofolio: p.portofolio.map((r, j) => (j === i ? { ...r, ...patch } : r)) }), `isian.portofolio.${i}`);

  const setAturan = (i: number, aturan: AturanBukti, nilai: Exclude<Pencapaian, null>) =>
    ubahPortofolio(i, { [aturan]: isian.portofolio[i][aturan] === nilai ? null : nilai });

  const toggleKlarifikasi = (kunci: string) =>
    ubah((p) => ({ ...p, klarifikasi: p.klarifikasi.includes(kunci) ? p.klarifikasi.filter((k) => k !== kunci) : [...p.klarifikasi, kunci] }));

  const setRekomendasi = (nilai: "kompeten" | "lanjutan") =>
    ubah((p) => ({ ...p, rekomendasi: p.rekomendasi === nilai ? null : nilai }), "isian.rekomendasi");

  // Tabel klarifikasi: per unit, hanya KUK pada "materi" (awal dari Template VP; asesor dapat tambah/hapus).
  const kuk = payload.kuk;
  const urutanKuk = new Map(kuk.map((k, i) => [k.kunci, i]));
  const daftarUnit = kuk.filter((k, i) => i === 0 || kuk[i - 1].unit_kunci !== k.unit_kunci);
  const tambahMateri = (kunci: string) =>
    ubah((p) => ({
      ...p,
      materi: [...p.materi.filter((k) => k !== kunci), kunci].sort((a, b) => (urutanKuk.get(a) ?? 0) - (urutanKuk.get(b) ?? 0)),
    }));
  const hapusMateri = (kunci: string) => ubah((p) => ({ ...p, materi: p.materi.filter((k) => k !== kunci) }));

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

        {/* Bukti Portofolio x Aturan Bukti */}
        <div className="space-y-3" data-error="isian.portofolio">
          <div className="border border-gray-200 overflow-x-auto">
            <table className="border-collapse text-sm min-w-[820px] w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-700">
                  <th rowSpan={3} className="w-64 px-4 py-2.5 border border-gray-200 align-middle bg-gray-50">
                    Bukti Portofolio
                  </th>
                  <th colSpan={8} className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                    Aturan Bukti
                  </th>
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  {ATURAN.map((a) => (
                    <th key={a.id} colSpan={2} className="px-2 py-2 border border-gray-200 bg-gray-50">
                      {a.label}
                    </th>
                  ))}
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  {ATURAN.flatMap((a) => [
                    <th key={`${a.id}-ya`} className="w-14 px-2 py-1.5 border border-gray-200 bg-gray-50">
                      Ya
                    </th>,
                    <th key={`${a.id}-tidak`} className="w-14 px-2 py-1.5 border border-gray-200 bg-gray-50">
                      Tidak
                    </th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {isian.portofolio.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-3 border border-gray-200 text-sm text-gray-400 italic">
                      Belum ada bukti portofolio. Klik Ubah lalu Tambah Bukti.
                    </td>
                  </tr>
                )}
                {isian.portofolio.map((row, i) => (
                  <tr key={i} data-error={`isian.portofolio.${i}`}>
                    <td className="px-4 py-2.5 border border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 shrink-0">{i + 1}.</span>
                        <input
                          type="text"
                          aria-label={`Bukti portofolio ${i + 1}`}
                          value={row.bukti ?? ""}
                          maxLength={500}
                          onChange={(e) => ubahPortofolio(i, { bukti: e.target.value })}
                          disabled={!editable}
                          className={compactInputClass}
                        />
                        {editable && (
                          <button
                            type="button"
                            aria-label="Hapus bukti"
                            onClick={() => ubah((p) => ({ ...p, portofolio: p.portofolio.filter((_, j) => j !== i) }))}
                            className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      {row.relevan_id != null && lampiran.has(row.relevan_id) && (
                        <TautanLampiran lampiran={lampiran.get(row.relevan_id)!} onBuka={bukaBerkas} />
                      )}
                      <PesanError kunci={`isian.portofolio.${i}`} errors={errors} />
                    </td>
                    {ATURAN.flatMap((a) =>
                      (["ya", "tidak"] as const).map((nilai) => (
                        <td key={`${a.id}-${nilai}`} className="px-2 py-2.5 border border-gray-200 text-center">
                          <input
                            type="checkbox"
                            aria-label={`${row.bukti ?? ""} ${a.label}: ${nilai}`}
                            checked={row[a.id] === nilai}
                            disabled={!editable}
                            onChange={() => setAturan(i, a.id, nilai)}
                            className={`${checkboxClass} mx-auto`}
                          />
                        </td>
                      )),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PesanError kunci="isian.portofolio" errors={errors} />
          {editable && isian.portofolio.length < payload.maks_portofolio && (
            <button
              type="button"
              onClick={() =>
                ubah((p) => ({ ...p, portofolio: [...p.portofolio, { bukti: "", valid: null, asli: null, terkini: null, memadai: null }] }))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all cursor-pointer"
            >
              <Plus size={12} />
              Tambah Bukti
            </button>
          )}
        </div>

        <p className="text-sm text-gray-700">
          Sebagai tindak lanjut dari hasil verifikasi bukti, substansi materi dibawah ini (Unit Kompetensi yang di cek list) harus diklarifikasi
          selama wawancara
        </p>

        {/* Klarifikasi Wawancara */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-14" />
              <col className="w-32" />
              <col className="w-24" />
              <col />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Cek List</th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50">No. Unit Kompetensi</th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50">No. Elemen</th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">Materi/Substansi Wawancara/KUK</th>
              </tr>
            </thead>
            <tbody>
              {daftarUnit.map((u) => {
                const semua = kuk.filter((k) => k.unit_kunci === u.unit_kunci);
                const dipilih = semua.filter((k) => isian.materi.includes(k.kunci));
                const sisa = semua.filter((k) => !isian.materi.includes(k.kunci));
                const barisTambah = editable && sisa.length > 0;
                const baris: (Ia08Kuk | null)[] = dipilih.length > 0 ? dipilih : [null];
                const total = baris.length + (barisTambah ? 1 : 0);
                // Rowspan nomor elemen untuk KUK berurutan pada elemen yang sama.
                const spanElemen = (i: number) => {
                  const k = baris[i];
                  if (!k) return 1;
                  if (i > 0 && baris[i - 1]?.elemen_no === k.elemen_no) return 0;
                  let n = 1;
                  while (i + n < baris.length && baris[i + n]?.elemen_no === k.elemen_no) n++;
                  return n;
                };
                const elemenSisa = sisa.filter((k, i) => i === 0 || sisa[i - 1].elemen_no !== k.elemen_no).map((k) => k.elemen_no);

                return [
                  ...baris.map((k, i) => (
                    <tr key={k?.kunci ?? `${u.unit_kunci}-kosong`}>
                      {/* Satu cek list per unit kompetensi (rowspan seluruh baris unit tsb). */}
                      {i === 0 && (
                        <td rowSpan={total} className="px-2 py-3 border border-gray-200 text-center align-middle">
                          <input
                            type="checkbox"
                            aria-label={`Klarifikasi unit kompetensi ${u.unit_no}`}
                            checked={isian.klarifikasi.includes(u.unit_kunci)}
                            disabled={!editable}
                            onChange={() => toggleKlarifikasi(u.unit_kunci)}
                            className={`${checkboxClass} mx-auto`}
                          />
                        </td>
                      )}
                      {i === 0 && (
                        <td rowSpan={total} className="px-3 py-3 border border-gray-200 text-center align-middle text-gray-700">
                          {u.unit_no}
                        </td>
                      )}
                      {spanElemen(i) > 0 && (
                        <td rowSpan={spanElemen(i)} className="px-3 py-3 border border-gray-200 text-center align-middle text-gray-700">
                          {k?.elemen_no ?? "-"}
                        </td>
                      )}
                      <td className="px-3 py-3 border border-gray-200 align-top">
                        {k ? (
                          <div className="flex items-start gap-2">
                            <p className="flex-1 text-sm text-gray-700 wrap-break-word">
                              {k.nomor ? `${k.nomor} ` : ""}
                              {k.deskripsi}
                            </p>
                            {editable && (
                              <button
                                type="button"
                                aria-label={`Hapus materi ${k.nomor ?? ""}`}
                                onClick={() => hapusMateri(k.kunci)}
                                className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer mt-0.5"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-gray-400">Belum ada materi/substansi untuk unit ini.</p>
                        )}
                      </td>
                    </tr>
                  )),
                  barisTambah && (
                    <tr key={`${u.unit_kunci}-tambah`}>
                      <td className="px-3 py-2 border border-gray-200" />
                      <td className="px-3 py-2 border border-gray-200">
                        <select
                          aria-label={`Tambah materi unit ${u.unit_no}`}
                          value=""
                          onChange={(e) => e.target.value && tambahMateri(e.target.value)}
                          className={`${compactInputClass} cursor-pointer`}
                        >
                          <option value="">+ Tambah materi/KUK…</option>
                          {elemenSisa.map((no) => (
                            <optgroup key={no} label={`Elemen ${no}`}>
                              {sisa
                                .filter((k) => k.elemen_no === no)
                                .map((k) => (
                                  <option key={k.kunci} value={k.kunci}>
                                    {k.nomor ? `${k.nomor} ` : ""}
                                    {k.deskripsi.length > 120 ? `${k.deskripsi.slice(0, 120)}…` : k.deskripsi}
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>

        {/* Bukti Tambahan */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800">
            Bukti tambahan diperlukan pada unit/elemen kompetensi sebagai berikut:
          </div>
          <div className="px-4 py-3">
            <EditableText
              value={isian.bukti_tambahan ?? ""}
              onChange={(v) => ubah((p) => ({ ...p, bukti_tambahan: v }))}
              isEditing={editable}
              ariaLabel="Bukti tambahan"
              className="text-sm text-gray-700"
              rows={3}
            />
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
          <div className="px-4 py-3" data-error="isian.lanjutan">
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
                <span className="font-bold">OBSERVASI LANGSUNG/KEGIATAN TERSTRUKTUR*)</span> pada:
              </span>
            </label>
            <LingkupLanjutan
              isian={isian}
              payload={payload}
              aktif={editable && isian.rekomendasi === "lanjutan"}
              errors={errors}
              onUbah={(lanjutan, kunci) => ubah((p) => ({ ...p, lanjutan: { ...p.lanjutan, ...lanjutan } }), kunci)}
              selesai={meta.status === "selesai"}
            />
          </div>
        </div>

        <BlokTandaTangan f={f} info={payload.info} errors={errors} />
      </div>

      <div className="flex justify-end">
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}

/** Tautan ke berkas/link yang diunggah asesi di FR.APL.01 (lampiran bukti yang relevan). */
function TautanLampiran({ lampiran, onBuka }: { lampiran: Apl01BuktiRelevan; onBuka: (l: Apl01BuktiRelevan) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 pl-5">
      {lampiran.file && (
        <button
          type="button"
          onClick={() => onBuka(lampiran)}
          className="inline-flex items-center gap-1 text-xs text-[#5A7A22] hover:underline cursor-pointer min-w-0"
        >
          <FileText size={12} className="shrink-0" />
          <span className="truncate max-w-48">{lampiran.file.nama ?? "Lihat dokumen"}</span>
        </button>
      )}
      {lampiran.link && (
        <a
          href={lampiran.link}
          target="_blank"
          rel="noopener noreferrer nofollow"
          title={lampiran.link}
          className="inline-flex items-center gap-1 text-xs text-[#5A7A22] hover:underline min-w-0"
        >
          <ExternalLink size={12} className="shrink-0" />
          <span className="truncate max-w-48">Buka link</span>
        </a>
      )}
    </div>
  );
}

/**
 * Rekomendasi lanjutan FR.IA.08: pilih observasi langsung (TPD) / kegiatan terstruktur (KT), kelompok pekerjaan
 * (judul skema), unit yang diases lanjut, dan KUK per unit (dropdown per elemen; kosong = seluruh KUK unit).
 * Dokumen metode terpilih dibuat otomatis saat FR.IA.08 selesai (disetujui asesi) dan hanya memuat lingkup ini.
 */
function LingkupLanjutan({
  isian,
  payload,
  aktif,
  errors,
  onUbah,
  selesai,
}: {
  isian: Ia08Isian;
  payload: Ia08Payload;
  aktif: boolean;
  errors: Record<string, string>;
  onUbah: (lanjutan: Partial<Ia08Isian["lanjutan"]>, kunci: string) => void;
  selesai: boolean;
}) {
  const l = isian.lanjutan;
  const dipakai = isian.rekomendasi === "lanjutan";
  const kelasLabel = `flex items-center gap-2 text-sm text-gray-700 ${aktif ? "cursor-pointer" : "cursor-default"}`;
  const urutanKuk = new Map(payload.kuk.map((k, i) => [k.kunci, i]));

  const toggleUnit = (kunci: string) => {
    const dipilih = l.unit.includes(kunci);
    onUbah(
      {
        unit: dipilih ? l.unit.filter((u) => u !== kunci) : [...l.unit, kunci],
        // KUK unit yang dilepas ikut dibuang.
        kuk: dipilih ? l.kuk.filter((k) => payload.kuk.find((x) => x.kunci === k)?.unit_kunci !== kunci) : l.kuk,
      },
      "isian.lanjutan.unit",
    );
  };
  const tambahKuk = (kunci: string) =>
    onUbah({ kuk: [...l.kuk, kunci].sort((a, b) => (urutanKuk.get(a) ?? 0) - (urutanKuk.get(b) ?? 0)) }, "isian.lanjutan.unit");
  const hapusKuk = (kunci: string) => onUbah({ kuk: l.kuk.filter((k) => k !== kunci) }, "isian.lanjutan.unit");

  return (
    <div className={`pl-7 mt-3 space-y-3 ${dipakai ? "" : "opacity-50"}`}>
      {/* Observasi langsung / kegiatan terstruktur (*coret yang tidak perlu) */}
      <div data-error="isian.lanjutan.jenis">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {JENIS_LANJUTAN.map((j) => (
            <label key={j.id} className={kelasLabel}>
              <input
                type="checkbox"
                checked={l.jenis === j.id}
                disabled={!aktif}
                onChange={() => onUbah({ jenis: l.jenis === j.id ? null : j.id }, "isian.lanjutan.jenis")}
                className={checkboxClass}
              />
              <span className={dipakai && l.jenis && l.jenis !== j.id ? "line-through text-gray-400" : "font-semibold"}>{j.label}</span>
            </label>
          ))}
        </div>
        {l.jenis && (
          <p className="text-xs text-gray-500 mt-1">
            Dokumen: {JENIS_LANJUTAN.find((j) => j.id === l.jenis)?.dokumen}
            {selesai && dipakai ? " — sudah dibuka untuk unit di bawah." : " — dibuka setelah FR.IA.08 disetujui asesi."}
          </p>
        )}
        <PesanError kunci="isian.lanjutan.jenis" errors={errors} />
      </div>

      <div className="flex items-center gap-3">
        <span className="w-36 shrink-0 text-sm text-gray-600">Kelompok Pekerjaan</span>
        <span className="text-gray-400">:</span>
        <input type="text" aria-label="Kelompok pekerjaan" value={payload.info.skema.judul ?? ""} disabled readOnly className={inputClass} />
      </div>

      {/* Unit, elemen & KUK */}
      <div data-error="isian.lanjutan.unit">
        <p className="text-sm text-gray-600 mb-2">Unit / Elemen / KUK yang diases lanjut:</p>
        <div className="border border-gray-200 divide-y divide-gray-200">
          {payload.unit_kompetensi.map((u, idx) => {
            const kunciUnit = `u${u.id}`;
            const dipilih = l.unit.includes(kunciUnit);
            const kukUnit = payload.kuk.filter((k) => k.unit_kunci === kunciUnit);
            const kukDipilih = kukUnit.filter((k) => l.kuk.includes(k.kunci));
            const sisa = kukUnit.filter((k) => !l.kuk.includes(k.kunci));
            const elemenSisa = sisa.filter((k, i) => i === 0 || sisa[i - 1].elemen_no !== k.elemen_no).map((k) => k.elemen_no);
            return (
              <div key={u.id} className="px-3 py-2.5">
                <label className={kelasLabel}>
                  <input
                    type="checkbox"
                    aria-label={`Unit ${idx + 1} diases lanjut`}
                    checked={dipilih}
                    disabled={!aktif}
                    onChange={() => toggleUnit(kunciUnit)}
                    className={checkboxClass}
                  />
                  <span>
                    <span className="text-gray-500">Unit {idx + 1} · </span>
                    <span className="font-mono text-xs">{u.kode_unit}</span> {u.judul_unit}
                  </span>
                </label>
                {dipilih && (
                  <div className="pl-7 mt-2 space-y-1.5">
                    {kukDipilih.length === 0 && <p className="text-xs italic text-gray-400">Seluruh elemen &amp; KUK unit ini.</p>}
                    {kukDipilih.map((k) => (
                      <div key={k.kunci} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-gray-500 shrink-0 w-20">Elemen {k.elemen_no}</span>
                        <span className="flex-1 wrap-break-word">
                          {k.nomor ? `${k.nomor} ` : ""}
                          {k.deskripsi}
                        </span>
                        {aktif && (
                          <button
                            type="button"
                            aria-label={`Hapus KUK ${k.nomor ?? ""}`}
                            onClick={() => hapusKuk(k.kunci)}
                            className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer mt-0.5"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    {aktif && sisa.length > 0 && (
                      <select
                        aria-label={`Tambah KUK unit ${idx + 1}`}
                        value=""
                        onChange={(e) => e.target.value && tambahKuk(e.target.value)}
                        className={`${compactInputClass} cursor-pointer`}
                      >
                        <option value="">+ Tambah elemen/KUK (kosong = seluruh unit)…</option>
                        {elemenSisa.map((no) => (
                          <optgroup key={no} label={`Elemen ${no}`}>
                            {sisa
                              .filter((k) => k.elemen_no === no)
                              .map((k) => (
                                <option key={k.kunci} value={k.kunci}>
                                  {k.nomor ? `${k.nomor} ` : ""}
                                  {k.deskripsi.length > 120 ? `${k.deskripsi.slice(0, 120)}…` : k.deskripsi}
                                </option>
                              ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <PesanError kunci="isian.lanjutan.unit" errors={errors} />
      </div>
    </div>
  );
}
