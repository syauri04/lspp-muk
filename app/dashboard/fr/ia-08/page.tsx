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

const PANDUAN_ASESOR = [
  "Verifikasi portofolio dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.",
  "Isilah bukti portofolio sesuai ketentuan bukti berkualitas dan relevan dengan standar kompetensi kerja  sebagaimana yang telah disepakati pada rekaman asesmen mandiri.",
  "Lakukan verifikasi portofolio berdasarkan aturan bukti.",
  "Berikan hasil verifikasi portofolio dengan memberi centang (✓) pada kolom yang sesuai.",
  "Jika hasil verifikasi dokumen portofolio belum memenuhi aturan bukti maka asesor melanjutkan dengan metode tanya jawab pertanyaan wawancara dan/atau verifikasi pihak ketiga.",
];

const ATURAN_COLUMNS = ["valid", "asli", "terkini", "memadai"] as const;
type AturanId = (typeof ATURAN_COLUMNS)[number];

interface AturanBuktiRow {
  id: string;
  no: number;
  bukti: string;
  nilai: Record<AturanId, "ya" | "tidak" | null>;
}

function emptyNilai(): Record<AturanId, "ya" | "tidak" | null> {
  return { valid: null, asli: null, terkini: null, memadai: null };
}

const initialAturanBukti: AturanBuktiRow[] = [
  {
    id: "bukti-1",
    no: 1,
    bukti: "Surat Tugas/ Surat Penugasan",
    nilai: emptyNilai(),
  },
  {
    id: "bukti-2",
    no: 2,
    bukti: "Salinan Dokumen Registrasi Peserta",
    nilai: emptyNilai(),
  },
  { id: "bukti-3", no: 3, bukti: "", nilai: emptyNilai() },
  { id: "bukti-4", no: 4, bukti: "", nilai: emptyNilai() },
];

interface KlarifikasiRow {
  id: string;
  unitNo: string | null;
  unitRowSpan: number;
  elemenNo: string | null;
  elemenRowSpan: number;
  materi: string;
  cekList: boolean;
}

const RAW_KLARIFIKASI: {
  unitNo: string | null;
  unitRowSpan: number;
  elemenNo: string | null;
  elemenRowSpan: number;
  materi: string;
}[] = [
  {
    unitNo: "1",
    unitRowSpan: 1,
    elemenNo: "1",
    elemenRowSpan: 1,
    materi:
      "1.2 Mengerti dan menggunakan kalimat yang sopan dan ramah serta mengetahui kapan harus memakai kalimat resmi atau tidak resmi.",
  },
  {
    unitNo: "2",
    unitRowSpan: 3,
    elemenNo: "1",
    elemenRowSpan: 2,
    materi:
      "1.6 Konflik yang ada dan potensial diidentifikasi dan solusi dicari dengan bantuan dari kolega bila dibutuhkan.",
  },
  {
    unitNo: null,
    unitRowSpan: 0,
    elemenNo: null,
    elemenRowSpan: 0,
    materi: "1.2 Gunakan bahasa dan nada yang cocok",
  },
  {
    unitNo: null,
    unitRowSpan: 0,
    elemenNo: "2",
    elemenRowSpan: 1,
    materi:
      "2.1 Kebutuhan dan harapan tamu, termasuk hal-hal dengan kebutuhan tertentu, diidentifikasi secara benar yang mencakup produk dan layanan yang tepat diberikan.",
  },
  {
    unitNo: "3",
    unitRowSpan: 2,
    elemenNo: "2",
    elemenRowSpan: 1,
    materi:
      "2.3 Ketika kesulitan atau kesalah pahaman terjadi, kemungkinan perbedaan budaya harus dipertimbangkan.",
  },
  {
    unitNo: null,
    unitRowSpan: 0,
    elemenNo: "1",
    elemenRowSpan: 1,
    materi: "1.2 Komunikasi lisan dan non-lisan mempertimbangkan perbedaan budaya.",
  },
  {
    unitNo: "4",
    unitRowSpan: 1,
    elemenNo: "1",
    elemenRowSpan: 1,
    materi:
      "1.1 Sumber informasi yang ada dicari tahu sesuai dengan informasi yang akan dicari.",
  },
  {
    unitNo: "5",
    unitRowSpan: 2,
    elemenNo: "1",
    elemenRowSpan: 1,
    materi: "1.2 Profil tamu diidentifikasi sesuai kebijakan perusahaan.",
  },
  {
    unitNo: null,
    unitRowSpan: 0,
    elemenNo: "2",
    elemenRowSpan: 1,
    materi:
      "2.1 Kebutuhan dan kebiasaan tamu diidentifikasi berdasarkan kebijakan perusahaan.",
  },
  {
    unitNo: "7",
    unitRowSpan: 2,
    elemenNo: "1",
    elemenRowSpan: 1,
    materi:
      "1.1 Pendaftaran acara ditafsirkan dan diproses secara akurat sesuai dengan prosedur organisasi dan jadwal.",
  },
  {
    unitNo: null,
    unitRowSpan: 0,
    elemenNo: "3",
    elemenRowSpan: 1,
    materi:
      "3.3 Tindakan diambil untuk mengatasi masalah kehadiran sesuai dengan tanggung jawab individu dan prosedur organisasi.",
  },
  {
    unitNo: "8",
    unitRowSpan: 2,
    elemenNo: "1",
    elemenRowSpan: 1,
    materi:
      "1.2 Persiapan untuk tempat pendaftaran diperiksa sesuai acara dan sesuai dengan persetujuan.",
  },
  {
    unitNo: null,
    unitRowSpan: 0,
    elemenNo: "3",
    elemenRowSpan: 1,
    materi:
      "3.2 Hal-hal rinci diperiksa sesuai dengan prosedur pendaftaran yang ditetapkan.",
  },
  {
    unitNo: "9",
    unitRowSpan: 2,
    elemenNo: "1",
    elemenRowSpan: 1,
    materi:
      "1.1 Database sederhana dirancang dengan menggunakan aplikasi database, prinsip desain dasar, fungsi perangkat lunak, dan rumus sederhana.",
  },
  {
    unitNo: null,
    unitRowSpan: 0,
    elemenNo: "3",
    elemenRowSpan: 1,
    materi:
      "3.4 Database yang telah dinamai, disimpan sesuai dengan persyaratan organisasi dan Keamanan.",
  },
];

function buildInitialKlarifikasi(): KlarifikasiRow[] {
  return RAW_KLARIFIKASI.map((r, idx) => ({
    id: `klarifikasi-${idx + 1}`,
    unitNo: r.unitNo,
    unitRowSpan: r.unitRowSpan,
    elemenNo: r.elemenNo,
    elemenRowSpan: r.elemenRowSpan,
    materi: r.materi,
    cekList: false,
  }));
}

export default function Ia08Page() {
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

  const [aturanBuktiRows, setAturanBuktiRows] = useState<AturanBuktiRow[]>(
    initialAturanBukti,
  );

  const [klarifikasiRows, setKlarifikasiRows] = useState<KlarifikasiRow[]>(
    buildInitialKlarifikasi,
  );

  const [buktiTambahan, setBuktiTambahan] = useState("");

  const [rekomendasi, setRekomendasi] = useState<
    "kompeten" | "observasi_lanjutan" | null
  >(null);
  const [kelompokPekerjaan, setKelompokPekerjaan] = useState("");
  const [unitLanjutan, setUnitLanjutan] = useState("");
  const [elemenLanjutan, setElemenLanjutan] = useState("");
  const [kukLanjutan, setKukLanjutan] = useState("");

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

  const updateAturanBukti = (id: string, value: string) => {
    setAturanBuktiRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, bukti: value } : r)),
    );
  };

  const setAturanNilai = (
    id: string,
    field: AturanId,
    value: "ya" | "tidak",
  ) => {
    setAturanBuktiRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              nilai: {
                ...r.nilai,
                [field]: r.nilai[field] === value ? null : value,
              },
            }
          : r,
      ),
    );
  };

  const updateKlarifikasiField = (
    id: string,
    field: "unitNo" | "elemenNo" | "materi",
    value: string,
  ) => {
    setKlarifikasiRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const toggleKlarifikasiCek = (id: string) => {
    setKlarifikasiRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, cekList: !r.cekList } : r)),
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

        {/* Panduan bagi Asesor */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">
            PANDUAN BAGI ASESOR
          </div>
          <ul className="list-disc list-outside pl-8 pr-4 py-3 space-y-1.5">
            {PANDUAN_ASESOR.map((teks, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-snug">
                {teks}
              </li>
            ))}
          </ul>
        </div>

        {/* Bukti Portofolio x Aturan Bukti */}
        <div className="border border-gray-200 overflow-x-auto">
          <table className="border-collapse text-sm min-w-[820px] w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th
                  rowSpan={3}
                  className="w-64 px-4 py-2.5 border border-gray-200 align-middle bg-gray-50"
                >
                  Bukti Portofolio
                </th>
                <th
                  colSpan={8}
                  className="px-3 py-2.5 border border-gray-200 bg-gray-50"
                >
                  Aturan Bukti
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                <th colSpan={2} className="px-2 py-2 border border-gray-200 bg-gray-50">
                  Valid
                </th>
                <th colSpan={2} className="px-2 py-2 border border-gray-200 bg-gray-50">
                  Asli
                </th>
                <th colSpan={2} className="px-2 py-2 border border-gray-200 bg-gray-50">
                  Terkini
                </th>
                <th colSpan={2} className="px-2 py-2 border border-gray-200 bg-gray-50">
                  Memadai
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                {ATURAN_COLUMNS.flatMap((col) => [
                  <th
                    key={`${col}-ya`}
                    className="w-14 px-2 py-1.5 border border-gray-200 bg-gray-50"
                  >
                    Ya
                  </th>,
                  <th
                    key={`${col}-tidak`}
                    className="w-14 px-2 py-1.5 border border-gray-200 bg-gray-50"
                  >
                    Tidak
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {aturanBuktiRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5 border border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 shrink-0">
                        {row.no}.
                      </span>
                      <input
                        type="text"
                        value={row.bukti}
                        onChange={(e) =>
                          updateAturanBukti(row.id, e.target.value)
                        }
                        disabled={!isEditing}
                        className={compactInputClass}
                      />
                    </div>
                  </td>
                  {ATURAN_COLUMNS.flatMap((col) => [
                    <td
                      key={`${col}-ya`}
                      className="px-2 py-2.5 border border-gray-200 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={row.nilai[col] === "ya"}
                        disabled={!isEditing}
                        onChange={() => setAturanNilai(row.id, col, "ya")}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>,
                    <td
                      key={`${col}-tidak`}
                      className="px-2 py-2.5 border border-gray-200 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={row.nilai[col] === "tidak"}
                        disabled={!isEditing}
                        onChange={() => setAturanNilai(row.id, col, "tidak")}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>,
                  ])}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-700">
          Sebagai tindak lanjut dari hasil verifikasi bukti, substansi materi
          dibawah ini (No Elemen yang di cek list) harus diklarifikasi selama
          wawancara
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
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  Cek List
                </th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                  No. Unit Kompetensi
                </th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                  No. Elemen
                </th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                  Materi/Substansi Wawancara/KUK
                </th>
              </tr>
            </thead>
            <tbody>
              {klarifikasiRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-2 py-3 border border-gray-200 text-center align-top">
                    <input
                      type="checkbox"
                      checked={row.cekList}
                      disabled={!isEditing}
                      onChange={() => toggleKlarifikasiCek(row.id)}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  {row.unitRowSpan > 0 && (
                    <td
                      rowSpan={row.unitRowSpan}
                      className="px-3 py-3 border border-gray-200 text-center align-middle text-gray-700"
                    >
                      <input
                        type="text"
                        value={row.unitNo ?? ""}
                        onChange={(e) =>
                          updateKlarifikasiField(
                            row.id,
                            "unitNo",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center`}
                      />
                    </td>
                  )}
                  {row.elemenRowSpan > 0 && (
                    <td
                      rowSpan={row.elemenRowSpan}
                      className="px-3 py-3 border border-gray-200 text-center align-middle text-gray-700"
                    >
                      <input
                        type="text"
                        value={row.elemenNo ?? ""}
                        onChange={(e) =>
                          updateKlarifikasiField(
                            row.id,
                            "elemenNo",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center`}
                      />
                    </td>
                  )}
                  <td className="px-3 py-3 border border-gray-200 align-top">
                    <EditableText
                      value={row.materi}
                      onChange={(v) =>
                        updateKlarifikasiField(row.id, "materi", v)
                      }
                      isEditing={isEditing}
                      className="text-sm text-gray-700 wrap-break-word"
                      rows={3}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bukti Tambahan */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800">
            Bukti tambahan diperlukan pada unit/elemen kompetensi sebagai
            berikut:
          </div>
          <div className="px-4 py-3">
            <EditableText
              value={buktiTambahan}
              onChange={setBuktiTambahan}
              isEditing={isEditing}
              className="text-sm text-gray-700"
              rows={3}
            />
          </div>
        </div>

        {/* Rekomendasi Asesor */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">
            Rekomendasi Asesor
          </div>
          <div className="px-4 py-3 border-b border-gray-200">
            <label
              className={`flex items-start gap-2.5 text-sm text-gray-700 ${
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
                className={`${checkboxClass} mt-0.5`}
              />
              <span>
                Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja,
                direkomendasikan <span className="font-bold">KOMPETEN</span>
              </span>
            </label>
          </div>
          <div className="px-4 py-3">
            <label
              className={`flex items-start gap-2.5 text-sm text-gray-700 ${
                isEditing ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <input
                type="checkbox"
                checked={rekomendasi === "observasi_lanjutan"}
                disabled={!isEditing}
                onChange={() =>
                  setRekomendasi((prev) =>
                    prev === "observasi_lanjutan"
                      ? null
                      : "observasi_lanjutan",
                  )
                }
                className={`${checkboxClass} mt-0.5`}
              />
              <span>
                Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja,
                direkomendasikan{" "}
                <span className="font-bold">
                  OBSERVASI LANGSUNG/KEGIATAN TERSTRUKTUR*)
                </span>{" "}
                pada:
              </span>
            </label>
            <div className="pl-7 mt-3 space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-gray-600">
                  Kelompok Pekerjaan
                </span>
                <span className="text-gray-400">:</span>
                <input
                  type="text"
                  value={kelompokPekerjaan}
                  onChange={(e) => setKelompokPekerjaan(e.target.value)}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-gray-600">Unit</span>
                <span className="text-gray-400">:</span>
                <input
                  type="text"
                  value={unitLanjutan}
                  onChange={(e) => setUnitLanjutan(e.target.value)}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-gray-600">Elemen</span>
                <span className="text-gray-400">:</span>
                <input
                  type="text"
                  value={elemenLanjutan}
                  onChange={(e) => setElemenLanjutan(e.target.value)}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-gray-600">KUK</span>
                <span className="text-gray-400">:</span>
                <input
                  type="text"
                  value={kukLanjutan}
                  onChange={(e) => setKukLanjutan(e.target.value)}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
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
