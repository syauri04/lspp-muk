"use client";

/*
 * FR.MAPA.01 - Merencanakan Aktivitas dan Proses Asesmen (diisi asesor).
 * Tampilan & style mengikuti mockup app/dashboard/fr/mapa-01; data & aksi disambungkan ke API.
 * Asesor mengisi §1 & §3. Skema, unit, standar kompetensi, §2 rencana asesmen, konfirmasi
 * orang relevan, serta penyusun & validator berasal dari skema + template CMS (hanya tampil).
 */

import { Frown, Meh, Smile } from "lucide-react";
import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type {
  AdaCatatan,
  Emoji,
  Mapa01Grup,
  Mapa01Hubungan,
  Mapa01Isian,
  Mapa01Modifikasi,
  Mapa01Payload,
  MapaPenandatangan,
  Opsi,
} from "@/types/dokumen";
import {
  EditableText,
  MapaControls,
  PesanError,
  SkemaHeader,
  TtdPenandatangan,
  checkboxClass,
  compactInputClass,
  inputClass,
  useMapaForm,
} from "@/features/dokumen/mapa/MapaShared";

const SLUG = "mapa-01";

const METODE_LABEL: Record<string, string> = {
  kt: "Kegiatan Terstruktur",
  tpd: "Tugas Praktik Demonstrasi",
  vp: "Verifikasi Portofolio",
};

/** Kolom "Metode dan Perangkat Asesmen" (urutan sesuai formulir). */
const KOLOM_METODE: { key: keyof Mapa01Payload["rencana"][number]; judul: string; ket: string; lebar: string }[] = [
  { key: "observasi_langsung", judul: "Observasi Langsung", lebar: "w-48", ket: "kerja nyata/aktivitas waktu nyata di tempat kerja di lingkungan tempat kerja yang disimulasikan" },
  { key: "kegiatan_terstruktur", judul: "Kegiatan Terstruktur", lebar: "w-48", ket: "latihan simulasi dan bermain peran, proyek, presentasi, lembar kegiatan" },
  { key: "tanya_jawab", judul: "Tanya Jawab", lebar: "w-48", ket: "pertanyaan tertulis, wawancara, asesmen diri, tanya jawab lisan, angket, ujian lisan atau tertulis" },
  {
    key: "verifikasi_portofolio",
    judul: "Verifikasi Portofolio",
    lebar: "w-52",
    ket: "sampel pekerjaan yang disusun oleh Asesi, produk dengan dokumentasi pendukung, bukti sejarah, jurnal atau buku catatan, informasi tentang pengalaman hidup",
  },
  { key: "reviu_produk", judul: "Reviu Produk", lebar: "w-40", ket: "Produk hasil proyek, contoh hasil kerja/produk" },
  {
    key: "verifikasi_pihak_ketiga",
    judul: "Verifikasi Pihak Ketiga",
    lebar: "w-48",
    ket: "testimoni dan laporan dari atasan, bukti pelatihan, otentikasi pencapaian sebelumnya, wawancara dengan atasan atau rekan kerja",
  },
];

/** §3 Persyaratan modifikasi & kontekstualisasi. */
const MODIFIKASI: { key: Mapa01Modifikasi; nomor?: string; huruf?: string; label: string; suffix: string; rows: number }[] = [
  { key: "karakteristik", nomor: "3.1", huruf: "a.", label: "Karakteristik Kandidat:", suffix: "karakteristik khusus kandidat", rows: 2 },
  { key: "kontekstualisasi", huruf: "b.", label: "Kebutuhan kontekstualisasi terkait tempat kerja:", suffix: "kebutuhan kontekstualisasi", rows: 2 },
  { key: "saran", nomor: "3.2", label: "Saran yang diberikan oleh paket pelatihan atau pengembang pelatihan", suffix: "saran Jika ada, tuliskan:", rows: 2 },
  {
    key: "penyesuaian",
    nomor: "3.3",
    label: "Penyesuaian perangkat asesmen terkait kebutuhan kontekstualisasi",
    suffix: "penyesuaian Jika ada, tuliskan:",
    rows: 2,
  },
  {
    key: "peluang_terintegrasi",
    nomor: "3.4",
    label: "Peluang untuk kegiatan asesmen terintegrasi dan mencatat setiap perubahan yang diperlukan untuk alat asesmen",
    suffix: "peluang Jika Ada, tuliskan:",
    rows: 10,
  },
];

export function Mapa01Page({ penilaian }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Mapa01Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.MAPA.01" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.MAPA.01..." />;

  return <Mapa01Form key={data.dokumen.id} payload={data} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function CheckboxLine({
  checked,
  onToggle,
  label,
  isEditing,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  isEditing: boolean;
}) {
  return (
    <label className={`flex items-start gap-2.5 min-w-0 ${isEditing ? "cursor-pointer" : ""}`}>
      <input type="checkbox" checked={checked} disabled={!isEditing} onChange={onToggle} className={`${checkboxClass} mt-1`} />
      <span className="text-sm text-gray-700 leading-snug min-w-0">{label}</span>
    </label>
  );
}

function EmojiPicker({ value, onChange, isEditing }: { value: Emoji | null; onChange: (e: Emoji) => void; isEditing: boolean }) {
  const options: { key: Emoji; Icon: typeof Smile }[] = [
    { key: "senang", Icon: Smile },
    { key: "netral", Icon: Meh },
    { key: "sedih", Icon: Frown },
  ];
  return (
    <div className="flex items-center gap-1 shrink-0 flex-none">
      {options.map(({ key, Icon }) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            disabled={!isEditing}
            onClick={() => onChange(key)}
            aria-label={key}
            aria-pressed={selected}
            className={`flex items-center justify-center rounded-full p-0.5 transition-all ${
              isEditing ? "cursor-pointer hover:bg-gray-100" : "cursor-default"
            }`}
          >
            <Icon size={22} strokeWidth={2} className="text-gray-900" fill={selected ? "#F5C542" : "none"} />
          </button>
        );
      })}
    </div>
  );
}

function AdaTidakAdaToggle({
  ada,
  onChange,
  isEditing,
  suffix,
}: {
  ada: boolean | null;
  onChange: (v: boolean) => void;
  isEditing: boolean;
  suffix: string;
}) {
  return (
    <p className="text-sm text-gray-700">
      <button
        type="button"
        disabled={!isEditing}
        onClick={() => onChange(true)}
        className={ada === true ? "font-bold text-gray-800" : ada === false ? "line-through text-gray-400" : "text-gray-700"}
      >
        Ada
      </button>
      /
      <button
        type="button"
        disabled={!isEditing}
        onClick={() => onChange(false)}
        className={ada === false ? "font-bold text-gray-800" : ada === true ? "line-through text-gray-400" : "text-gray-700"}
      >
        tidak ada
      </button>
      <span className="text-gray-400">*</span> {suffix}
    </p>
  );
}

function Mapa01Form({ payload, setPayload }: { payload: Mapa01Payload; setPayload: (p: Mapa01Payload) => Promise<unknown> }) {
  const f = useMapaForm<Mapa01Isian, Mapa01Payload>({ payload, setPayload, slug: SLUG, nama: "FR.MAPA.01" });
  const { meta, isian, editable, errors } = f;
  const units = payload.unit_kompetensi;
  const opsi = payload.opsi;

  const toggle = (grup: Mapa01Grup, value: string) =>
    f.ubah(
      (prev) => ({
        ...prev,
        [grup]: prev[grup].includes(value) ? prev[grup].filter((v) => v !== value) : [...prev[grup], value],
      }),
      `isian.${grup}`,
    );

  const ubahHubungan = (key: Mapa01Hubungan, patch: Partial<Mapa01Isian["hubungan"][Mapa01Hubungan]>) =>
    f.ubah((prev) => ({ ...prev, hubungan: { ...prev.hubungan, [key]: { ...prev.hubungan[key], ...patch } } }), `isian.hubungan.${key}`);

  const ubahModifikasi = (key: Mapa01Modifikasi, patch: Partial<AdaCatatan>) =>
    f.ubah((prev) => ({ ...prev, modifikasi: { ...prev.modifikasi, [key]: { ...prev.modifikasi[key], ...patch } } }), `isian.modifikasi.${key}`);

  const daftarCheckbox = (grup: Mapa01Grup, items: Opsi[], className = "space-y-2") => (
    <div className={className} data-error={`isian.${grup}`}>
      {items.map((o) => (
        <CheckboxLine key={o.value} checked={isian[grup].includes(o.value)} onToggle={() => toggle(grup, o.value)} label={o.label} isEditing={editable} />
      ))}
      <PesanError kunci={`isian.${grup}`} errors={errors} />
    </div>
  );

  const siapSelesai = payload.template_lengkap && !f.dirty;
  const kontrol = (
    <MapaControls
      bisaUbah={f.bisaUbah}
      isEditing={f.isEditing}
      savedSuccess={f.savedSuccess}
      menyimpan={f.menyimpan}
      onUbah={() => f.setIsEditing(true)}
      onSelesaikan={() => f.setKonfirmasi(true)}
      siapSelesai={siapSelesai}
      alasanBelumSiap={payload.template_lengkap ? "Simpan perubahan terlebih dahulu" : "Template MAPA belum lengkap di CMS"}
    />
  );

  const penyusunGrup = [
    { status: "Penyusun", baris: payload.penyusun.filter((p) => p.peran === "penyusun") },
    { status: "Validator", baris: payload.penyusun.filter((p) => p.peran === "validator") },
  ].filter((g) => g.baris.length > 0);

  const standarKompetensi = opsi.standar.find((o) => o.value === "kompetensi");
  const standarLainnya = opsi.standar.filter((o) => o.value !== "kompetensi");

  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {payload.metode && <span>Metode: {METODE_LABEL[payload.metode] ?? payload.metode}</span>}
          {meta.submitted_at && <span>· Diselesaikan {formatTanggal(meta.submitted_at)}</span>}
        </div>
        {kontrol}
      </div>

      {f.bisaUbah && payload.prefill && (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
          Sebagian isian sudah terisi otomatis (tujuan asesmen dari FR.APL.01, LSP, manajer sertifikasi, standar kompetensi, dan peluang
          asesmen terintegrasi). Klik <strong>Ubah</strong> untuk melengkapi, lalu <strong>Simpan</strong>.
        </p>
      )}
      {!payload.template_lengkap && (
        <p data-error="rencana" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {errors.rencana ??
            "Rencana asesmen (bagian 2) untuk skema & metode ini belum lengkap di CMS. Hubungi admin LSP; dokumen belum dapat diselesaikan."}
        </p>
      )}
      {meta.status === "selesai" && (
        <p className="text-sm text-[#5A7A22] font-semibold bg-[#F2F5E9] border border-[#8AA53C]/40 rounded-lg p-3">FR.MAPA.01 sudah diselesaikan.</p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-8">
        <SkemaHeader skema={payload.skema} />

        {/* ============================================================ */}
        {/* SECTION 1 — Menentukan Pendekatan Asesmen                     */}
        {/* ============================================================ */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-10" />
              <col className="w-48" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td colSpan={3} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800">
                  1. Menentukan Pendekatan Asesmen
                </td>
              </tr>

              {/* 1.1 Asesi */}
              <tr>
                <td rowSpan={4} className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  1.1
                </td>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Asesi</td>
                <td className="px-4 py-3 border border-gray-200">{daftarCheckbox("asesi", opsi.asesi, "space-y-2.5")}</td>
              </tr>

              {/* Tujuan Asesmen */}
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Tujuan Asesmen</td>
                <td className="px-4 py-3 border border-gray-200">{daftarCheckbox("tujuan", opsi.tujuan)}</td>
              </tr>

              {/* Konteks Asesmen */}
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Konteks Asesmen</td>
                <td className="p-0 border border-gray-200">
                  <table className="w-full border-collapse text-sm table-fixed">
                    <tbody>
                      <tr>
                        <td className="w-56 align-middle px-4 py-3 border border-gray-200 text-gray-700">Lingkungan</td>
                        <td className="px-4 py-3 border border-gray-200">
                          {daftarCheckbox("lingkungan", opsi.lingkungan, "flex flex-wrap gap-x-8 gap-y-2")}
                        </td>
                      </tr>
                      <tr>
                        <td className="align-middle px-4 py-3 border border-gray-200 text-gray-700">
                          Peluang untuk mengumpulkan bukti dalam sejumlah situasi
                        </td>
                        <td className="px-4 py-3 border border-gray-200">
                          {daftarCheckbox("peluang", opsi.peluang, "flex flex-wrap gap-x-8 gap-y-2")}
                        </td>
                      </tr>
                      {opsi.hubungan.map((o, idx) => {
                        const key = o.value as Mapa01Hubungan;
                        const h = isian.hubungan[key];
                        return (
                          <tr key={key}>
                            {idx === 0 && (
                              <td rowSpan={opsi.hubungan.length} className="align-middle px-4 py-3 border border-gray-200 text-gray-700">
                                Hubungan antara standar kompetensi dan:
                              </td>
                            )}
                            <td className="px-4 py-2.5 border border-gray-200" data-error={`isian.hubungan.${key}`}>
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <div className="min-w-0 flex-1">
                                  <CheckboxLine
                                    checked={h.checked}
                                    onToggle={() => ubahHubungan(key, { checked: !h.checked, emoji: h.checked ? null : h.emoji })}
                                    label={o.label}
                                    isEditing={editable}
                                  />
                                </div>
                                <EmojiPicker
                                  value={h.emoji}
                                  onChange={(emoji) => ubahHubungan(key, { emoji, checked: true })}
                                  isEditing={editable}
                                />
                              </div>
                              <PesanError kunci={`isian.hubungan.${key}`} errors={errors} />
                            </td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td className="align-middle px-4 py-3 border border-gray-200 text-gray-700">Siapa yang melakukan asesmen/RPL</td>
                        <td className="px-4 py-3 border border-gray-200">{daftarCheckbox("siapa", opsi.siapa)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Konfirmasi dengan orang yang relevan */}
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Konfirmasi dengan orang yang relevan</td>
                <td className="px-4 py-3 border border-gray-200">{daftarCheckbox("konfirmasi", opsi.konfirmasi)}</td>
              </tr>

              {/* 1.2 Standar Industri atau Tempat Kerja */}
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">1.2</td>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Standar Industri atau Tempat Kerja</td>
                <td className="px-4 py-3 border border-gray-200">
                  <div className="space-y-3.5">
                    {standarKompetensi && (
                      <div>
                        <label className={`flex items-start gap-2.5 ${editable ? "cursor-pointer" : ""}`}>
                          <input
                            type="checkbox"
                            checked={isian.standar.includes("kompetensi")}
                            disabled={!editable}
                            onChange={() => toggle("standar", "kompetensi")}
                            className={`${checkboxClass} mt-1`}
                          />
                          <span className="text-sm text-gray-700 font-medium">{standarKompetensi.label}</span>
                        </label>
                        <div className="pl-7 mt-2 space-y-2">
                          {payload.standar_kompetensi.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Standar kompetensi belum diisi pada data skema.</p>
                          ) : (
                            payload.standar_kompetensi.map((teks, idx) => (
                              <div key={idx} className="flex gap-2 text-xs text-gray-600">
                                <span className="shrink-0 text-gray-400 pt-0.5">{idx + 1}.</span>
                                <p className="whitespace-pre-wrap text-xs text-gray-600">{teks}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    {standarLainnya.map((o) => (
                      <CheckboxLine
                        key={o.value}
                        checked={isian.standar.includes(o.value)}
                        onToggle={() => toggle("standar", o.value)}
                        label={o.label}
                        isEditing={editable}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2 — Mempersiapkan Rencana Asesmen                     */}
        {/* ============================================================ */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800">
                  2. Mempersiapkan Rencana Asesmen
                </td>
              </tr>
              <tr className="text-xs font-semibold text-gray-600">
                <th className="w-40 px-4 py-2.5 border border-gray-200"></th>
                <th className="w-14 px-3 py-2.5 border border-gray-200">No</th>
                <th className="w-52 px-3 py-2.5 border border-gray-200 text-left">Kode Unit</th>
                <th className="px-3 py-2.5 border border-gray-200 text-left">Judul Unit</th>
              </tr>
              {units.map((unit, idx) => (
                <tr key={unit.id}>
                  {idx === 0 && (
                    <td
                      rowSpan={units.length}
                      className="align-middle px-4 py-3 border border-gray-200 text-center font-bold text-gray-800 bg-gray-50"
                    >
                      {payload.skema.judul}
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

          {/* Tabel Bukti-Bukti & Metode/Perangkat Asesmen — satu tabel panjang untuk seluruh unit */}
          <div className="px-4 py-2.5 border-t border-gray-200 font-bold text-gray-800 text-sm">
            Bukti-Bukti dan Metode/Perangkat Asesmen per Unit Kompetensi
          </div>
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="border-collapse text-sm min-w-[1700px]">
              <thead>
                <tr className="text-xs font-semibold text-gray-700">
                  <th rowSpan={2} className="w-52 px-4 py-3 border border-gray-200 align-middle bg-gray-50">
                    Unit Kompetensi
                  </th>
                  <th rowSpan={2} className="w-64 px-4 py-3 border border-gray-200 align-middle bg-gray-50">
                    Bukti-Bukti (Kinerja, Produk, Portofolio, dan/atau Pengetahuan) diidentifikasi berdasarkan Kriteria Unjuk Kerja dan
                    Pendekatan Asesmen
                  </th>
                  <th colSpan={3} className="px-4 py-2.5 border border-gray-200 bg-gray-50">
                    Jenis Bukti
                  </th>
                  <th colSpan={6} className="px-4 py-2.5 border border-gray-200 bg-gray-50">
                    <div>Metode dan Perangkat Asesmen</div>
                    <div className="mt-1 text-[10px] font-normal italic text-gray-500 leading-snug">
                      CL (Ceklis Observasi), DIT (Daftar Instruksi Terstruktur), DPL (Daftar Pertanyaan Lisan), DPT (Daftar Pertanyaan
                      Tertulis), VPK (Verifikasi Pihak Ketiga), CVP (Ceklis Verfikasi Portofolio), CRP (Ceklis Reviu Produk), PW (Pertanyaan
                      Wawancara)
                    </div>
                  </th>
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  {["L", "TL", "T"].map((j) => (
                    <th key={j} className="w-12 px-2 py-2.5 border border-gray-200 bg-gray-50">
                      {j}
                    </th>
                  ))}
                  {KOLOM_METODE.map((k) => (
                    <th key={k.key} className={`${k.lebar} px-3 py-2.5 border border-gray-200 bg-gray-50 align-top`}>
                      <div>{k.judul}</div>
                      <div className="mt-1 text-[10px] font-normal italic text-gray-500 leading-snug">{k.ket}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payload.rencana.map((row, idx) => (
                  <tr key={row.unit_id} className="align-top">
                    <td className="px-3 py-3 border border-gray-200">
                      <div className="flex gap-1.5 text-sm text-gray-700">
                        <span className="shrink-0 text-gray-500">{idx + 1}.</span>
                        <p className="whitespace-pre-wrap text-sm text-gray-700">{row.judul_unit}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 border border-gray-200">
                      {row.bukti ? (
                        <p className="whitespace-pre-wrap text-xs text-gray-600">{row.bukti}</p>
                      ) : (
                        <p className="text-xs italic text-amber-700">Belum diisi admin</p>
                      )}
                    </td>
                    {(
                      [
                        ["L", row.jenis_l],
                        ["TL", row.jenis_tl],
                        ["T", row.jenis_t],
                      ] as const
                    ).map(([j, aktif]) => (
                      <td key={j} className="px-1.5 py-3 border border-gray-200 text-center">
                        <input
                          type="text"
                          aria-label={`Jenis bukti ${j}`}
                          value={aktif ? j : ""}
                          disabled
                          readOnly
                          className={`${compactInputClass} text-center`}
                        />
                      </td>
                    ))}
                    {KOLOM_METODE.map((k) => (
                      <td key={k.key} className="px-2 py-3 border border-gray-200 text-center">
                        <input
                          type="text"
                          aria-label={k.judul}
                          value={String(row[k.key] ?? "")}
                          disabled
                          readOnly
                          className={`${compactInputClass} text-center font-semibold`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3 — Mengidentifikasi Persyaratan Modifikasi           */}
        {/* ============================================================ */}
        <div className="space-y-2">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm table-fixed">
              <colgroup>
                <col className="w-14" />
                <col className="w-72" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800">
                    3. Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi:
                  </td>
                </tr>
                {MODIFIKASI.map((m) => {
                  const nilai = isian.modifikasi[m.key];
                  return (
                    <tr key={m.key}>
                      {m.key === "karakteristik" ? (
                        <td rowSpan={2} className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                          {m.nomor}
                        </td>
                      ) : m.nomor ? (
                        <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">{m.nomor}</td>
                      ) : null}
                      <td className="align-top px-4 py-3 border border-gray-200 text-gray-700">
                        {m.huruf && <span className="font-semibold">{m.huruf}</span>} {m.label}
                      </td>
                      <td className="px-4 py-3 border border-gray-200" data-error={`isian.modifikasi.${m.key}`}>
                        <AdaTidakAdaToggle
                          ada={nilai.ada}
                          onChange={(v) => ubahModifikasi(m.key, { ada: v })}
                          isEditing={editable}
                          suffix={m.suffix}
                        />
                        {m.huruf && <p className="text-sm text-gray-700 mt-1">Jika ada, tuliskan:</p>}
                        <EditableText
                          value={nilai.catatan ?? ""}
                          onChange={(v) => ubahModifikasi(m.key, { catatan: v })}
                          isEditing={editable}
                          ariaLabel={`Keterangan ${m.label}`}
                          className="text-sm text-gray-700 mt-1"
                          rows={m.rows}
                        />
                        <PesanError kunci={`isian.modifikasi.${m.key}`} errors={errors} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs italic text-gray-500 px-1">*Coret yang tidak perlu</p>
        </div>

        {/* ============================================================ */}
        {/* Konfirmasi dengan orang yang relevan                          */}
        {/* ============================================================ */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800">Konfirmasi dengan orang yang relevan</div>
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-72" />
              <col />
              <col className="w-56" />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50">Orang yang relevan</th>
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50">Nama</th>
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50">Tanda Tangan dan Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {payload.konfirmasi_orang.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 border border-gray-200 text-sm text-gray-400 italic">
                    Belum diisi admin di CMS.
                  </td>
                </tr>
              )}
              {payload.konfirmasi_orang.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 border border-gray-200 text-gray-700">{row.peran}</td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input type="text" aria-label={`Nama ${row.peran}`} value={row.nama ?? ""} disabled readOnly className={inputClass} />
                  </td>
                  <td className="px-2 py-2 border border-gray-200">
                    <TtdPenandatangan penilaianId={f.penilaianId} slug={SLUG} baris={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ============================================================ */}
        {/* PENYUSUN DAN VALIDATOR                                        */}
        {/* ============================================================ */}
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
                    Penyusun dan validator belum diisi admin di CMS.
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

      <div className="flex justify-end">{kontrol}</div>

      <ConfirmDialog
        open={f.konfirmasi}
        onOpenChange={f.setKonfirmasi}
        title="Selesaikan FR.MAPA.01?"
        description={
          <>
            <p>Setelah diselesaikan, isian tidak dapat diubah lagi dan rencana asesmen dibekukan sesuai template saat ini.</p>
            <p>Dokumen asesmen (AK/IA) terbuka setelah FR.MAPA.01 dan FR.MAPA.02 selesai.</p>
          </>
        }
        confirmLabel="Selesaikan"
        onConfirm={f.selesaikan}
        loading={f.prosesSelesai}
      />
    </form>
  );
}
