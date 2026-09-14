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
        isEditing
          ? "border-[#7E9631]/50 bg-white"
          : "border-gray-200 bg-gray-50"
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

const PANDUAN_ASESOR = [
  "Tentukan proyek singkat atau kegiatan terstruktur lainnya yang harus dipersiapkan dan dipresentasikan oleh asesi.",
  "Proyek singkat atau kegiatan terstruktur lainnya dibuat untuk keseluruhan unit kompetensi dalam Skema Sertifikasi atau untuk masing-masing kelompok pekerjaan.",
  "Kumpulkan hasil proyek singkat atau kegiatan terstruktur lainnya sesuai dengan hasil keluaran yang telah ditetapkan.",
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
    kodeUnit: "I.55HDR00.151.2",
    judulUnit:
      "Mengikuti Prosedur Kesehatan, Keselamatan dan Keamanan di Tempat Kerja",
  },
  {
    kodeUnit: "N.82MIC00.023.1",
    judulUnit: "Melakukan Komunikasi Melalui Elektromik",
  },
  { kodeUnit: "I.55HDR00.153.2", judulUnit: "Memperbaharui Pengetahuan Lokal" },
  {
    kodeUnit: "N.82MIC00.104.2",
    judulUnit:
      "Menetapkan dan Menerapkan Pengetahuan Industri Meeting, Incentive, Convention, & Exhibition (MICE)",
  },
  {
    kodeUnit: "N.82MIC00.100.2",
    judulUnit: "Mengoperasikan Sistem Informasi Online",
  },
  {
    kodeUnit: "N.82MIC00.107.2",
    judulUnit:
      "Mengidentifikasi Bahaya, Menilai dan Mengendalikan Risiko Keselamatan",
  },
  {
    kodeUnit: "I.55HDR00.196.2",
    judulUnit: "Menangani Kualitas Layanan Pelanggan",
  },
  {
    kodeUnit: "N.82MIC00.074.2",
    judulUnit: "Mencari dan Memberikan Informasi",
  },
  {
    kodeUnit: "N.82MIC00.020.1",
    judulUnit:
      "Mengakses Informasi dalam Kegiatan Meeting, Incentive, Convetion, and Exhibition (MICE)",
  },
  { kodeUnit: "N.82MIC00.024.1", judulUnit: "Merekrut Tenaga Kerja" },
  {
    kodeUnit: "N.82MIC00.079.2",
    judulUnit: "Membina Keterampilan Kerja Karyawan",
  },
  { kodeUnit: "N.82MIC00.043.2", judulUnit: "Memimpin dan Mengelola Personel" },
  { kodeUnit: "N.82MIC00.055.2", judulUnit: "Memantau Operasi Kerja" },
  {
    kodeUnit: "N.82MIC00.072.3",
    judulUnit: "Menangani Pekerja Perjanjian Kerja Waktu Tertentu",
  },
  {
    kodeUnit: "N.82MIC00.045.2",
    judulUnit: "Mengembangkan Program Konferensi",
  },
  {
    kodeUnit: "N.82MIC00.112.3",
    judulUnit: "Mengelola Pertunjukan Seni dan Budaya",
  },
  {
    kodeUnit: "N.82MIC00.059.2",
    judulUnit: "Mengembangkan dan Menerapkan Rencana Manajemen Kegiatan",
  },
  {
    kodeUnit: "N.82MIC00.076.2",
    judulUnit: "Mengoordinasikan Kegiatan Pemasaran",
  },
  {
    kodeUnit: "N.82MIC00.048.2",
    judulUnit: "Mendapatkan dan Mengelola Sponsorship",
  },
  { kodeUnit: "N.82MIC00.013.2", judulUnit: "Menentukan Kelayakan Kegiatan" },
  {
    kodeUnit: "N.82MIC00.033.3",
    judulUnit:
      "Mengelola Resiko dalam Bisnis Meeting, Incentive, Convetion, and Exhibition (MICE)",
  },
  {
    kodeUnit: "N.82MIC00.003.3",
    judulUnit: "Mengembangkan Proposal Penawaran (BID)",
  },
  { kodeUnit: "N.82MIC00.067.3", judulUnit: "Mengelola Proyek Kegiatan" },
  { kodeUnit: "N.82MIC00.010.2", judulUnit: "Menyusun dan Memantau Anggaran" },
  {
    kodeUnit: "N.82MIC00.053.2",
    judulUnit: "Mengelola Pendanaan untuk Proyek",
  },
  {
    kodeUnit: "N.82MIC00.025.1",
    judulUnit: "Menggunakan Teknologi dalam Proses Bisnis",
  },
  { kodeUnit: "N.82MIC00.047.2", judulUnit: "Mengelola Konflik" },
];

function buildInitialUnits(): UnitRow[] {
  return RAW_UNITS.map((u, idx) => ({
    id: `unit-${idx + 1}`,
    no: idx + 1,
    kodeUnit: u.kodeUnit,
    judulUnit: u.judulUnit,
  }));
}

const HAL_DISIAPKAN = `Anda seorang Project Manager yang mengajukan sertifikasi Skema Sertifikasi "Meeting/Conference Project Manager".

Untuk itu Anda diberi tugas Melaksanakan Kegiatan Meeting, Incentive, Convention, and Exhibition (MICE), sebagai berikut:

1. Komunikasi, pelayanan, dan hubungan kerja
2. Keselamatan kerja dan manajemen risiko
3. Pengetahuan industri mice dan sistem informasi
4. Pengelolaan sumber daya manusia
5. Perencanaan dan pengelolaan kegiatan mice
6. Pemasaran, sponsorship, dan pengembangan bisnis
7. Pengelolaan keuangan dan pendanaan kegiatan

Adapun di dalam membuat paparan terkait poin-poin di atas Anda dilengkapi dengan data dan informasi (terlampir)

Peralatan dan perlengkapan:
1. ATK
2. Komputer/Laptop
3. Printer
4. Kabel Roll
5. Kertas HVS
6. Alat Komunikasi
7. LED Projector`;

const HAL_DIDEMONSTRASIKAN = `Presentasikanlah Hasil Paparan anda terkait Meeting/Conference Project Manager.

Fokus bahasan paparan anda adalah :
1. kemampuan komunikasi profesional, pelayanan pelanggan, koordinasi tim, dan hubungan kerja dalam lingkungan MICE.
2. penerapan keselamatan kerja, identifikasi risiko, mitigasi, dan pengendalian risiko dalam kegiatan MICE.
3. Fokus pada penguasaan industri MICE, informasi kegiatan, teknologi, dan sistem online.
4. perekrutan, pengembangan, kepemimpinan, dan pengawasan personel kegiatan.
5. perencanaan, pelaksanaan, pengembangan program konferensi, dan pengelolaan proyek kegiatan.
6. promosi kegiatan, pengembangan kerja sama, sponsorship, dan penyusunan proposal BID.
7. penyusunan anggaran, monitoring biaya, dan pengelolaan pendanaan proyek kegiatan.

Selanjutnya, jawablah pertanyaan-pertanyaan yang diajukan oleh Asesor terkait Tugas Anda, dengan memperhatikan:
a. Kecermatan, ketelitian dan ketepatan dalam membuat kesepakatan dan melaksanakan kesepakatan tersebut;
b. Kecermatan dan keakuratan dalam memasang atau menginstalasi unsur dan elemen sesuai kesepakatan;
c. Keramahtamahan dalam menghadapi konsumen;
d. Ketepatan dan ketelitian dalam membuat laporan dan rekomendasi.

Penilaian Tugas Anda dibagi dalam 2 yaitu penyajian Hasil yang sesuai dan Jawaban dari pertanyaan terkait Tugas Anda

Waktu:
1. Anda diberi waktu untuk menyelesaikan Tugas tersebut selama 60 (enam puluh) menit, dan mempresentasikan
2. Tugas tersebut selama 30 (tiga puluh) menit sesi tanya jawab selama 30 (tiga puluh) menit

Total waktu penyelesaian Tugas, Pemaparan Tugas, dan Tanya Jawab selama 120 (seratus dua puluh) menit`;

const initialPenyusun: PenyusunRow[] = [
  {
    id: "p1",
    status: "Penyusun",
    no: 1,
    nama: "Munif Sofian, S.Kom.",
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

const OKUPASI = "MEETING/CONFERENCE PROJECT MANAGER";

export default function Ia04aPage() {
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

  const [pernyataanAsesi, setPernyataanAsesi] = useState(
    "Bahwa saya telah mendapatkan penjelasan terkait hak dan prosedur banding asesmen dari asesor.",
  );

  const [units, setUnits] = useState<UnitRow[]>(buildInitialUnits);

  const [halDisiapkan, setHalDisiapkan] = useState(HAL_DISIAPKAN);
  const [halDidemonstrasikan, setHalDidemonstrasikan] =
    useState(HAL_DIDEMONSTRASIKAN);
  const [umpanBalik, setUmpanBalik] = useState("");

  const [ttdAsesi, setTtdAsesi] = useState<string | null>(null);
  const [ttdAsesor, setTtdAsesor] = useState<string | null>(null);
  const [namaSupervisor, setNamaSupervisor] = useState("");
  const [ttdSupervisor, setTtdSupervisor] = useState<string | null>(null);

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
                  <td colSpan={4} className="px-4 py-3 border border-gray-200">
                    <p className="font-bold text-gray-800 mb-1">Asesi:</p>
                    <EditableText
                      value={pernyataanAsesi}
                      onChange={setPernyataanAsesi}
                      isEditing={isEditing}
                      className="text-sm text-gray-700"
                      rows={2}
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

        {/* Tabel Unit Kompetensi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <thead>
              <tr className="text-xs font-semibold text-gray-600">
                <th className="w-50 px-4 py-2.5 border border-gray-200"></th>
                <th className="w-14 px-3 py-2.5 border border-gray-200">No</th>
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

        {/* Hal yang harus disiapkan & didemonstrasikan */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-80" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Hal yang harus disiapkan atau dilakukan atau dihasilkan untuk
                  suatu proyek singkat/ kegiatan terstruktur lainnya
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={halDisiapkan}
                    onChange={setHalDisiapkan}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={20}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Hal yang perlu didemonstrasikan/ dipresentasikan:
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={halDidemonstrasikan}
                    onChange={setHalDidemonstrasikan}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={30}
                  />
                </td>
              </tr>
              <tr>
                <td
                  colSpan={2}
                  className="align-top px-4 py-3 border border-gray-200"
                >
                  <p className="font-semibold text-gray-700 mb-2">
                    Umpan Balik Untuk Asesi:
                  </p>
                  <EditableText
                    value={umpanBalik}
                    onChange={setUmpanBalik}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={6}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="space-y-2">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="w-1/3 align-top border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Tanda Tangan Asesi
                    </p>
                    <SignatureBox
                      value={ttdAsesi}
                      onChange={setTtdAsesi}
                      isEditing={isEditing}
                      inputId="asesi-ttd-upload"
                    />
                  </td>
                  <td className="w-1/3 align-top border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Tanda Tangan Asesor
                    </p>
                    <SignatureBox
                      value={ttdAsesor}
                      onChange={setTtdAsesor}
                      isEditing={isEditing}
                      inputId="asesor-ttd-upload"
                    />
                  </td>
                  <td className="w-1/3 align-top border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Nama & Tanda Tangan Supervisor (Jika ada)
                    </p>
                    <input
                      type="text"
                      value={namaSupervisor}
                      onChange={(e) => setNamaSupervisor(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Nama Supervisor"
                      className={`${inputClass} mb-2`}
                    />
                    <SignatureBox
                      value={ttdSupervisor}
                      onChange={setTtdSupervisor}
                      isEditing={isEditing}
                      inputId="supervisor-ttd-upload"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs italic text-gray-500 px-1">
            *) Apabila asesi pada Level 4 ke atas, berikan tugas proyek yang
            meliputi tentang pemecahan masalah dan Analisa
          </p>
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
