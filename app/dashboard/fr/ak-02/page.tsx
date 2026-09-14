"use client";

import { useState } from "react";
import { Check, Pencil, Save, Plus, X } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

const compactInputClass =
  "w-full px-2 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

const checkboxClass =
  "w-4 h-4 border-gray-300 text-[#8AA53C] focus:ring-[#8AA53C]/40 cursor-pointer disabled:cursor-default shrink-0";

function EditableText({
  value,
  onChange,
  isEditing,
  className = "",
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  isEditing: boolean;
  className?: string;
  rows?: number;
}) {
  if (!isEditing) {
    return <p className={`whitespace-pre-wrap ${className}`}>{value}</p>;
  }
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`w-full px-1.5 py-1 border border-gray-300 bg-white focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 resize-y transition-all ${className}`}
    />
  );
}

function SignatureBox({
  value,
  onChange,
  isEditing,
  inputId,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  isEditing: boolean;
  inputId: string;
}) {
  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`relative w-full h-[110px] border border-dashed flex items-center justify-center overflow-hidden transition-all ${
        isEditing ? "border-[#7E9631]/50 bg-white" : "border-gray-200 bg-gray-50"
      }`}
    >
      {value ? (
        <>
          <img
            src={value}
            alt="Tanda tangan"
            className="max-h-full max-w-full object-contain"
          />
          {isEditing && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </>
      ) : isEditing ? (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#7E9631] cursor-pointer w-full h-full"
        >
          <Plus size={22} className="stroke-[1.5]" />
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      ) : (
        <Plus size={22} className="stroke-[1.5] text-gray-300" />
      )}
    </div>
  );
}

function EditSaveControls({
  isEditing,
  savedSuccess,
  onUbah,
}: {
  isEditing: boolean;
  savedSuccess: boolean;
  onUbah: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      {savedSuccess && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2F5E9] text-[#5A7A22] text-xs font-semibold border border-[#8AA53C]/30 animate-in fade-in">
          <Check size={14} className="stroke-[2.5]" />
          Tersimpan
        </div>
      )}
      <button
        type="button"
        onClick={onUbah}
        disabled={isEditing}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          isEditing
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default"
            : "border-[#7E9631] text-[#7E9631] bg-white hover:bg-[#F2F5E9]"
        }`}
      >
        <Pencil size={13} />
        Ubah
      </button>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all shadow-xs cursor-pointer"
      >
        <Save size={13} />
        Simpan
      </button>
    </div>
  );
}

const EVIDENCE_COLUMNS = [
  { id: "observasi", label: "Observasi Demonstrasi" },
  { id: "portofolio", label: "Portofolio" },
  { id: "pihak_ketiga", label: "Pernyataan Pihak Ketiga" },
  { id: "wawancara", label: "Pertanyaan Wawancara" },
  { id: "lisan", label: "Pertanyaan Lisan" },
  { id: "tertulis", label: "Pertanyaan Tertulis" },
  { id: "proyek_kerja", label: "Proyek Kerja" },
  { id: "lainnya", label: "Lainnya" },
] as const;

type EvidenceId = (typeof EVIDENCE_COLUMNS)[number]["id"];

interface UnitChecklistRow {
  id: string;
  judulUnit: string;
  bukti: Record<EvidenceId, boolean>;
}

const RAW_UNITS: string[] = [
  "Berkomunikasi Secara Lisan Dalam Bahasa Inggris pada Tingkat Operasional Dasar",
  "Melakukan Kerjasama dengan Kolega dan Pelanggan",
  "Melakukan Kerja dalam Lingkungan Sosial yang Beragam",
  "Mengikuti Prosedur Kesehatan, Keselamatan dan Keamanan di Tempat Kerja",
  "Melakukan Komunikasi Melalui Elektromik",
  "Memperbaharui Pengetahuan Lokal",
  "Menetapkan dan Menerapkan Pengetahuan Industri Meeting, Incentive, Convention, & Exhibition (MICE)",
  "Mengoperasikan Sistem Informasi Online",
  "Mengidentifikasi Bahaya, Menilai dan Mengendalikan Risiko Keselamatan",
  "Menangani Kualitas Layanan Pelanggan",
  "Mencari dan Memberikan Informasi",
  "Mengakses Informasi dalam Kegiatan Meeting, Incentive, Convetion, and Exhibition (MICE)",
  "Merekrut Tenaga Kerja",
  "Membina Keterampilan Kerja Karyawan",
  "Memimpin dan Mengelola Personel",
  "Memantau Operasi Kerja",
  "Menangani Pekerja Perjanjian Kerja Waktu Tertentu",
  "Mengembangkan Program Konferensi",
  "Mengelola Pertunjukan Seni dan Budaya",
  "Mengembangkan dan Menerapkan Rencana Manajemen Kegiatan",
  "Mengoordinasikan Kegiatan Pemasaran",
  "Mendapatkan dan Mengelola Sponsorship",
  "Menentukan Kelayakan Kegiatan",
  "Mengelola Resiko dalam Bisnis Meeting, Incentive, Convetion, and Exhibition (MICE)",
  "Mengembangkan Proposal Penawaran (BID)",
  "Mengelola Proyek Kegiatan",
  "Menyusun dan Memantau Anggaran",
  "Mengelola Pendanaan untuk Proyek",
  "Menggunakan Teknologi dalam Proses Bisnis",
  "Mengelola Konflik",
];

function emptyBukti(): Record<EvidenceId, boolean> {
  return EVIDENCE_COLUMNS.reduce(
    (acc, col) => ({ ...acc, [col.id]: false }),
    {} as Record<EvidenceId, boolean>,
  );
}

function buildInitialUnits(): UnitChecklistRow[] {
  return RAW_UNITS.map((judulUnit, idx) => ({
    id: `unit-${idx + 1}`,
    judulUnit,
    bukti: emptyBukti(),
  }));
}

export default function Ak02Page() {
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [judulSkema, setJudulSkema] = useState(
    "MEETING/CONFERENCE REGISTRATION STAFF",
  );
  const [nomorSkema, setNomorSkema] = useState("005/LSPP306/V/2026");
  const [skemaType, setSkemaType] = useState<"kkni" | "okupasi" | "klaster">(
    "okupasi",
  );
  const [tukType, setTukType] = useState<
    "sewaktu" | "tempat_kerja" | "mandiri"
  >("sewaktu");
  const [namaAsesor, setNamaAsesor] = useState("");
  const [namaAsesi, setNamaAsesi] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [units, setUnits] = useState<UnitChecklistRow[]>(buildInitialUnits);

  const [rekomendasi, setRekomendasi] = useState<
    "kompeten" | "belum_kompeten" | null
  >(null);
  const [tindakLanjut, setTindakLanjut] = useState("");
  const [komentarAsesor, setKomentarAsesor] = useState("");

  const [namaAsesiBawah, setNamaAsesiBawah] = useState("");
  const [ttdAsesi, setTtdAsesi] = useState<string | null>(null);
  const [namaAsesorBawah, setNamaAsesorBawah] = useState("");
  const [noRegAsesor, setNoRegAsesor] = useState("");
  const [ttdAsesor, setTtdAsesor] = useState<string | null>(null);

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const updateJudulUnit = (id: string, value: string) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, judulUnit: value } : u)),
    );
  };

  const toggleBukti = (id: string, evidenceId: EvidenceId) => {
    setUnits((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              bukti: { ...u.bukti, [evidenceId]: !u.bukti[evidenceId] },
            }
          : u,
      ),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-end">
        <EditSaveControls
          isEditing={isEditing}
          savedSuccess={savedSuccess}
          onUbah={handleUbah}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td
                    rowSpan={2}
                    className="w-56 align-middle px-4 py-3 bg-gray-50 border border-gray-200 font-semibold text-gray-700 text-sm"
                  >
                    Skema Sertifikasi (
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => setSkemaType("kkni")}
                      className={
                        skemaType === "kkni"
                          ? "text-gray-800"
                          : "line-through text-gray-400"
                      }
                    >
                      KKNI
                    </button>
                    /
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => setSkemaType("okupasi")}
                      className={
                        skemaType === "okupasi"
                          ? "text-gray-800"
                          : "line-through text-gray-400"
                      }
                    >
                      Okupasi
                    </button>
                    /
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => setSkemaType("klaster")}
                      className={
                        skemaType === "klaster"
                          ? "text-gray-800"
                          : "line-through text-gray-400"
                      }
                    >
                      Klaster
                    </button>
                    )
                  </td>
                  <td className="w-24 px-4 py-3 border border-gray-200 font-semibold text-gray-600">
                    Judul
                  </td>
                  <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">
                    :
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={judulSkema}
                      onChange={(e) => setJudulSkema(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">
                    Nomor
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                    :
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={nomorSkema}
                      onChange={(e) => setNomorSkema(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 border border-gray-200 font-semibold text-gray-600"
                  >
                    TUK
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                    :
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-sm">
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => setTukType("sewaktu")}
                      className={
                        tukType === "sewaktu"
                          ? "text-gray-800"
                          : "line-through text-gray-400"
                      }
                    >
                      Sewaktu
                    </button>
                    /
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => setTukType("tempat_kerja")}
                      className={
                        tukType === "tempat_kerja"
                          ? "text-gray-800"
                          : "line-through text-gray-400"
                      }
                    >
                      Tempat Kerja
                    </button>
                    /
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => setTukType("mandiri")}
                      className={
                        tukType === "mandiri"
                          ? "text-gray-800"
                          : "line-through text-gray-400"
                      }
                    >
                      Mandiri
                    </button>
                    <span className="text-gray-400">*</span>
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 border border-gray-200 font-semibold text-gray-600"
                  >
                    Nama Asesor
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                    :
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={namaAsesor}
                      onChange={(e) => setNamaAsesor(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 border border-gray-200 font-semibold text-gray-600"
                  >
                    Nama Asesi
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                    :
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={namaAsesi}
                      onChange={(e) => setNamaAsesi(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={3}
                    className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-600"
                  >
                    Tanggal
                  </td>
                  <td className="p-0 border border-gray-200">
                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        <tr>
                          <td className="w-24 px-4 py-3 border border-gray-200 text-gray-600">
                            Mulai
                          </td>
                          <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">
                            :
                          </td>
                          <td className="px-3 py-2 border border-gray-200">
                            <input
                              type="text"
                              value={tanggalMulai}
                              onChange={(e) =>
                                setTanggalMulai(e.target.value)
                              }
                              disabled={!isEditing}
                              className={inputClass}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 border border-gray-200 text-gray-600">
                            Selesai
                          </td>
                          <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                            :
                          </td>
                          <td className="px-3 py-2 border border-gray-200">
                            <input
                              type="text"
                              value={tanggalSelesai}
                              onChange={(e) =>
                                setTanggalSelesai(e.target.value)
                              }
                              disabled={!isEditing}
                              className={inputClass}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs italic text-gray-500 px-1">
            *coret yang tidak perlu
          </p>
        </div>

        <p className="text-sm italic text-gray-600">
          Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan
          bukti yang sesuai untuk setiap Unit Kompetensi.
        </p>

        {/* Tabel Unit Kompetensi x Bukti */}
        <div className="border border-gray-200 overflow-x-auto">
          <table className="border-collapse text-sm min-w-[1400px] w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="w-72 px-4 py-3 border border-gray-200 bg-gray-50 text-left align-middle">
                  Unit Kompetensi
                </th>
                {EVIDENCE_COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    className="px-2 py-3 border border-gray-200 bg-gray-50 align-middle"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td className="px-4 py-3 border border-gray-200">
                    <EditableText
                      value={unit.judulUnit}
                      onChange={(v) => updateJudulUnit(unit.id, v)}
                      isEditing={isEditing}
                      className="text-sm text-gray-700"
                      rows={2}
                    />
                  </td>
                  {EVIDENCE_COLUMNS.map((col) => (
                    <td
                      key={col.id}
                      className="px-2 py-3 border border-gray-200 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={unit.bukti[col.id]}
                        disabled={!isEditing}
                        onChange={() => toggleBukti(unit.id, col.id)}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rekomendasi & Tindak Lanjut */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-56 align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Rekomendasi hasil Asesmen
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <div className="flex flex-wrap gap-x-10 gap-y-2">
                    <label
                      className={`flex items-center gap-2.5 text-sm text-gray-700 ${
                        isEditing ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={rekomendasi === "kompeten"}
                        disabled={!isEditing}
                        onChange={() =>
                          setRekomendasi((prev) =>
                            prev === "kompeten" ? null : "kompeten",
                          )
                        }
                        className={checkboxClass}
                      />
                      Kompeten
                    </label>
                    <label
                      className={`flex items-center gap-2.5 text-sm text-gray-700 ${
                        isEditing ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={rekomendasi === "belum_kompeten"}
                        disabled={!isEditing}
                        onChange={() =>
                          setRekomendasi((prev) =>
                            prev === "belum_kompeten"
                              ? null
                              : "belum_kompeten",
                          )
                        }
                        className={checkboxClass}
                      />
                      Belum Kompeten
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Tindak lanjut yang dibutuhkan
                  <p className="mt-1 text-xs italic font-normal text-gray-500">
                    (Masukkan pekerjaan tambahan dan asesmen yang diperlukan
                    untuk mencapai kompetensi)
                  </p>
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={tindakLanjut}
                    onChange={setTindakLanjut}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={3}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Komentar/ Observasi oleh asesor
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={komentarAsesor}
                    onChange={setKomentarAsesor}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={3}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50"
                >
                  Asesi:
                </td>
              </tr>
              <tr>
                <td className="w-48 px-4 py-3 border border-gray-200 text-gray-600">
                  Nama
                </td>
                <td className="px-3 py-2 border border-gray-200">
                  <input
                    type="text"
                    value={namaAsesiBawah}
                    onChange={(e) => setNamaAsesiBawah(e.target.value)}
                    disabled={!isEditing}
                    className={inputClass}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">
                  Tanda Tangan/Tanggal
                </td>
                <td className="px-3 py-3 border border-gray-200">
                  <SignatureBox
                    value={ttdAsesi}
                    onChange={setTtdAsesi}
                    isEditing={isEditing}
                    inputId="asesi-ttd-upload"
                  />
                </td>
              </tr>
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50"
                >
                  Asesor:
                </td>
              </tr>
              <tr>
                <td className="w-48 px-4 py-3 border border-gray-200 text-gray-600">
                  Nama
                </td>
                <td className="px-3 py-2 border border-gray-200">
                  <input
                    type="text"
                    value={namaAsesorBawah}
                    onChange={(e) => setNamaAsesorBawah(e.target.value)}
                    disabled={!isEditing}
                    className={inputClass}
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border border-gray-200 text-gray-600">
                  No. Reg
                </td>
                <td className="px-3 py-2 border border-gray-200">
                  <input
                    type="text"
                    value={noRegAsesor}
                    onChange={(e) => setNoRegAsesor(e.target.value)}
                    disabled={!isEditing}
                    className={inputClass}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">
                  Tanda Tangan/Tanggal
                </td>
                <td className="px-3 py-3 border border-gray-200">
                  <SignatureBox
                    value={ttdAsesor}
                    onChange={setTtdAsesor}
                    isEditing={isEditing}
                    inputId="asesor-ttd-upload"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Lampiran Dokumen */}
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-gray-800">
            LAMPIRAN DOKUMEN:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li className="text-sm text-gray-700">Dokumen APL 01 peserta</li>
            <li className="text-sm text-gray-700">Dokumen APL 02 peserta</li>
            <li className="text-sm text-gray-700">
              Bukti-bukti berkualitas peserta
            </li>
            <li className="text-sm text-gray-700">Tinjauan proses asesmen</li>
          </ol>
        </div>
      </div>

      <div className="flex justify-end">
        <EditSaveControls
          isEditing={isEditing}
          savedSuccess={savedSuccess}
          onUbah={handleUbah}
        />
      </div>
    </form>
  );
}
