"use client";

import { useState } from "react";
import { Check, Pencil, Save, Plus, X } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

const compactInputClass =
  "w-full px-2 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

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

interface UnitRow {
  id: string;
  no: number;
  kodeUnit: string;
  judulUnit: string;
}

interface PenyusunRow {
  id: string;
  status: "Penyusun" | "Validator";
  no: number;
  nama: string;
  nomorMet: string;
  ttd: string | null;
}

const PETUNJUK = [
  "Baca dan pelajari setiap instruksi kerja di bawah ini dengan cermat sebelum melaksanakan praktik",
  "Klarifikasi kepada asesor kompetensi apabila ada hal-hal yang belum jelas",
  "Laksanakan pekerjaan sesuai dengan urutan proses yang sudah ditetapkan",
  "Seluruh proses kerja mengacu kepada SOP/WI yang dipersyaratkan (Jika Ada)",
];

const RAW_UNITS: { kodeUnit: string; judulUnit: string }[] = [
  {
    kodeUnit: "I.55HDR00.217.2",
    judulUnit:
      "Berkomunikasi Secara Lisan Dalam Bahasa Inggris pada Tingkat Operasional Dasar",
  },
  {
    kodeUnit: "I.55HDR00.149.2",
    judulUnit: "Melakukan Kerjasama dengan Kolega dan Pelanggan",
  },
  {
    kodeUnit: "I.55HDR00.150.2",
    judulUnit: "Melakukan Kerja dalam Lingkungan Sosial yang Beragam",
  },
  {
    kodeUnit: "N.82MIC00.074.2",
    judulUnit: "Mencari dan Memberikan Informasi",
  },
  {
    kodeUnit: "N.82MIC00.087.3",
    judulUnit: "Mengikuti Aturan Keprotokolan",
  },
  {
    kodeUnit: "I.55HDR00.224.2",
    judulUnit:
      "Menulis Dalam Bahasa Inggris pada Tingkat Penyeliaan dan Operasional Menengah",
  },
  {
    kodeUnit: "N.82MIC00.062.2",
    judulUnit: "Memproses dan Memantau Pendaftaran Kegiatan",
  },
  {
    kodeUnit: "N.82MIC00.086.3",
    judulUnit: "Mengatur Pendaftaran Tamu dalam Suatu Acara",
  },
  {
    kodeUnit: "N.82MIC00.027.1",
    judulUnit: "Mengelola Database",
  },
];

function buildInitialUnits(): UnitRow[] {
  return RAW_UNITS.map((u, idx) => ({
    id: `unit-${idx + 1}`,
    no: idx + 1,
    kodeUnit: u.kodeUnit,
    judulUnit: u.judulUnit,
  }));
}

const SKENARIO_DESKRIPSI = `Saat ini anda akan mengikuti sertifikasi kompetensi dengan skema Meeting/Conference Registration Staff.

Untuk itu anda diminta untuk mendemonstrasikan ketrampilan dan sikap kerja anda sebagai seorang Registration Staff pada saat pelaksanaan Meeting/Conference, dengan lingkup pekerjaan:
1. Berkomunikasi Secara Lisan Dalam Bahasa Inggris pada Tingkat Operasional Dasar
2. Melakukan Kerjasama dengan Kolega dan Pelanggan
3. Melakukan Kerja dalam Lingkungan Sosial yang Beragam
4. Mencari dan Memberikan Informasi
5. Mengikuti Aturan Keprotokolan
6. Menulis Dalam Bahasa Inggris pada Tingkat Penyeliaan dan Operasional Menengah Memproses dan Memantau Pendaftaran Kegiatan
7. Mengatur Pendaftaran Tamu dalam Suatu Acara
8. Mengelola Database

Untuk melakukan hal diatas, anda akan dilengkapi dengan alat dan bahan :
1. Alat Tulis Kantor (ATK)
2. Alat pengolah data
3. Checklist
4. Keselamatan dan Kesehatan Kerja (K3)
5. Komputer
6. Jaringan internet
7. Printer
8. Ruangan
9. Furniture
10. Alat komunikasi`;

const initialPenyusun: PenyusunRow[] = [
  {
    id: "p1",
    status: "Penyusun",
    no: 1,
    nama: "Munif Sofian, S. Kom.",
    nomorMet: "000.006177 2025",
    ttd: null,
  },
  {
    id: "p2",
    status: "Penyusun",
    no: 2,
    nama: "Muhammad Rijal Rabbani, S.E.",
    nomorMet: "000.006175 2025",
    ttd: null,
  },
  {
    id: "v1",
    status: "Validator",
    no: 1,
    nama: "Alma Fanniya Idral, M.Si.",
    nomorMet: "000.009936 2023",
    ttd: null,
  },
  {
    id: "v2",
    status: "Validator",
    no: 2,
    nama: "Yulia Setiasih, S.Tr.Par., M.M.",
    nomorMet: "000.006180 2025",
    ttd: null,
  },
];

const OKUPASI = "MEETING / CONFERENCE REGISTRATION STAFF";

export default function Ia02Page() {
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [judulSkema, setJudulSkema] = useState(
    "MEETING/CONFERENCE REGISTRATION STAFF",
  );
  const [nomorSkema, setNomorSkema] = useState("001/LSPP306/V/2026");
  const [skemaType, setSkemaType] = useState<"kkni" | "okupasi" | "klaster">(
    "okupasi",
  );
  const [tukType, setTukType] = useState<
    "sewaktu" | "tempat_kerja" | "mandiri"
  >("sewaktu");
  const [namaAsesor, setNamaAsesor] = useState("");
  const [namaAsesi, setNamaAsesi] = useState("");
  const [tanggal, setTanggal] = useState("");

  const [units, setUnits] = useState<UnitRow[]>(buildInitialUnits);

  const [skenarioDeskripsi, setSkenarioDeskripsi] = useState(
    SKENARIO_DESKRIPSI,
  );
  const [waktu, setWaktu] = useState("20 Menit");

  const [namaAsesiBawah, setNamaAsesiBawah] = useState("");
  const [ttdAsesi, setTtdAsesi] = useState<string | null>(null);
  const [namaAsesorBawah, setNamaAsesorBawah] = useState("");
  const [noRegAsesor, setNoRegAsesor] = useState("");
  const [ttdAsesor, setTtdAsesor] = useState<string | null>(null);

  const [penyusunRows, setPenyusunRows] =
    useState<PenyusunRow[]>(initialPenyusun);

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const updateUnit = (
    id: string,
    field: "kodeUnit" | "judulUnit",
    value: string,
  ) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)),
    );
  };

  const updatePenyusun = (
    id: string,
    field: "nama" | "nomorMet",
    value: string,
  ) => {
    setPenyusunRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const updatePenyusunTtd = (id: string, value: string | null) => {
    setPenyusunRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ttd: value } : r)),
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
                    colSpan={2}
                    className="px-4 py-3 border border-gray-200 font-semibold text-gray-600"
                  >
                    Tanggal
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                    :
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs italic text-gray-500 px-1">
            *coret yang tidak perlu
          </p>
        </div>

        {/* A. Petunjuk */}
        <div>
          <p className="font-bold text-gray-800 mb-2">A. Petunjuk</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            {PETUNJUK.map((teks, idx) => (
              <li key={idx} className="text-sm text-gray-700 leading-snug">
                {teks}
              </li>
            ))}
          </ol>
        </div>

        {/* B. Skenario Tugas Praktik Demonstrasi */}
        <div className="space-y-2">
          <p className="font-bold text-gray-800">
            B. Skenario Tugas Praktik Demonstrasi
          </p>
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm table-fixed">
              <thead>
                <tr className="text-xs font-semibold text-gray-600">
                  <th className="w-40 px-3 py-2.5 border border-gray-200"></th>
                  <th className="w-14 px-3 py-2.5 border border-gray-200">
                    No.
                  </th>
                  <th className="w-52 px-3 py-2.5 border border-gray-200 text-left">
                    Kode Unit
                  </th>
                  <th className="px-3 py-2.5 border border-gray-200 text-left">
                    Judul Unit
                  </th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit, idx) => (
                  <tr key={unit.id}>
                    {idx === 0 && (
                      <td
                        rowSpan={units.length}
                        className="align-middle px-3 py-3 border border-gray-200 text-center font-bold text-gray-800 bg-gray-50"
                      >
                        {OKUPASI}
                      </td>
                    )}
                    <td className="px-3 py-2 border border-gray-200 text-center text-gray-600">
                      {unit.no}
                    </td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={unit.kodeUnit}
                        onChange={(e) =>
                          updateUnit(unit.id, "kodeUnit", e.target.value)
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} font-mono`}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={unit.judulUnit}
                        onChange={(e) =>
                          updateUnit(unit.id, "judulUnit", e.target.value)
                        }
                        disabled={!isEditing}
                        className={compactInputClass}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Skenario Tugas Praktik Demonstrasi (deskripsi) */}
        <div>
          <p className="font-bold text-gray-800 mb-2">
            Skenario Tugas Praktik Demonstrasi:
          </p>
          <EditableText
            value={skenarioDeskripsi}
            onChange={setSkenarioDeskripsi}
            isEditing={isEditing}
            className="text-sm text-gray-700"
            rows={22}
          />
        </div>

        {/* Waktu */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">Waktu :</span>
          <input
            type="text"
            value={waktu}
            onChange={(e) => setWaktu(e.target.value)}
            disabled={!isEditing}
            className={`${inputClass} max-w-[160px]`}
          />
        </div>

        {/* ASESI */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">
            ASESI :
          </div>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-40 px-4 py-3 border border-gray-200 text-gray-600">
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
                  Tanda tangan dan Tanggal
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
            </tbody>
          </table>
        </div>

        {/* ASESOR */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">
            ASESOR :
          </div>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-40 px-4 py-3 border border-gray-200 text-gray-600">
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
                  Tanda tangan dan Tanggal
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

        {/* Penyusun dan Validator */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">
            PENYUSUN DAN VALIDATOR
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="w-32 px-3 py-2.5 border border-gray-200 bg-gray-50">
                  STATUS
                </th>
                <th className="w-14 px-3 py-2.5 border border-gray-200 bg-gray-50">
                  NO
                </th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                  NAMA
                </th>
                <th className="w-44 px-3 py-2.5 border border-gray-200 bg-gray-50">
                  NOMOR MET
                </th>
                <th className="w-56 px-3 py-2.5 border border-gray-200 bg-gray-50">
                  TANDA TANGAN DAN TANGGAL
                </th>
              </tr>
            </thead>
            <tbody>
              {penyusunRows.map((row, idx) => (
                <tr key={row.id}>
                  {(idx === 0 || idx === 2) && (
                    <td
                      rowSpan={2}
                      className="align-middle px-3 py-3 border border-gray-200 text-center font-semibold text-gray-700 bg-gray-50"
                    >
                      {row.status}
                    </td>
                  )}
                  <td className="px-3 py-2 border border-gray-200 text-center text-gray-600">
                    {row.no}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={row.nama}
                      onChange={(e) =>
                        updatePenyusun(row.id, "nama", e.target.value)
                      }
                      disabled={!isEditing}
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={row.nomorMet}
                      onChange={(e) =>
                        updatePenyusun(row.id, "nomorMet", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`${compactInputClass} font-mono`}
                    />
                  </td>
                  <td className="px-2 py-2 border border-gray-200">
                    <SignatureBox
                      value={row.ttd}
                      onChange={(v) => updatePenyusunTtd(row.id, v)}
                      isEditing={isEditing}
                      inputId={`${row.id}-ttd-upload`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
