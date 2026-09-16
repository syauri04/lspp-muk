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

interface PenilaianRow {
  id: string;
  no: number;
  lingkup: string;
  pertanyaan: string;
  kesesuaian: string;
  tanggapan: string;
  pencapaian: "ya" | "tidak" | null;
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
  "Lakukan penilaian pencapaian hasil proyek singkat atau kegiatan terstruktur lainnya melalui presentasi.",
  "Penilaian dilakukan sesuai dengan FR IA 04A. DIT. Daftar Instruksi Terstruktur (Penjelasan Proyek Singkat/Kegiatan Terstruktur Lainnya).",
  "Pertanyaan disampaikan oleh asesor setelah asesi melakukan presentasi proyek singkat/kegiatan terstruktur lainnya.",
  "Pertanyaan dapat dikembangkan oleh asesor berdasarkan dokumen presentasi dan atau hasil presentasi.",
  "Pertanyaan yang disampaikan untuk pemenuhan pencapaian 5 dimensi kompetensi.",
  "Isilah kolom lingkup penyajian proyek atau kegiatan terstruktur lainnya sesuai sektor/sub-sektor/profesi.",
  "Berikan keputusan pencapaian berdasarkan kesimpulan jawaban asesi.",
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

const RAW_PENILAIAN: {
  lingkup: string;
  pertanyaan: string;
  kesesuaian: string;
}[] = [
  {
    lingkup: "Komunikasi, pelayanan, dan hubungan kerja",
    pertanyaan:
      "Sebagai Meeting/Conference Project Manager, Anda harus berkoordinasi dengan klien, vendor, panitia, dan tim internal dalam penyelenggaraan sebuah konferensi. Jelaskan bagaimana Anda mengelola komunikasi agar seluruh kegiatan dapat berjalan lancar, serta bagaimana Anda mengatasi hambatan komunikasi/pelaksanaan acara.",
    kesesuaian: "(TLCM5)",
  },
  {
    lingkup: "Keselamatan kerja dan manajemen risiko",
    pertanyaan:
      "Sebagai Meeting/Conference Project Manager, jelaskan bagaimana Anda menyusun, mengendalikan pelaksanaan kegiatan agar seluruh kegiatan konferensi agar sesuai dengan prosedur keselamatan yang telah ditetapkan.",
    kesesuaian: "(TMS)",
  },
  {
    lingkup: "Pengetahuan industri mice dan sistem informasi",
    pertanyaan:
      "Sebagai Meeting/Conference Project Manager, jelaskan bagaimana Anda memanfaatkan perkembangan tren industri MICE dan teknologi informasi untuk meningkatkan efektivitas kegiatan meeting atau konferensi di berbagai jenis lingkungan kerja.",
    kesesuaian: "(RES,TRS)",
  },
  {
    lingkup: "Pengelolaan sumber daya manusia",
    pertanyaan:
      "Setelah kegiatan selesai dilaksanakan, jelaskan bagaimana Anda melakukan evaluasi terhadap kinerja tim dalam kegiatan tersebut dan bagaimana hasil evaluasi tersebut meningkatkan kualitas penyelenggaraan kegiatan berikutnya.",
    kesesuaian: "(TI)",
  },
  {
    lingkup: "Perencanaan dan pengelolaan kegiatan mice",
    pertanyaan:
      "Dalam pelaksanaan kegiatan meeting berskala nasional, jumlah peserta yang hadir melebihi kapasitas yang direncanakan, jelaskan bagaimana Anda mengelola situasi tersebut agar seluruh layanan dan kebutuhan peserta tetap terjaga.",
    kesesuaian: "(CVS)",
  },
  {
    lingkup: "Pemasaran, sponsorship, dan pengembangan bisnis",
    pertanyaan:
      "Dalam proses pencarian sponsor, salah satu calon sponsor utama membatalkan partisipasinya secara mendadak, jelaskan bagaimana Anda mengatasi situasi tersebut agar pelaksanaan kegiatan tetap terlaksana sesuai kebutuhan yang telah ditetapkan.",
    kesesuaian: "(TLCM,TRS)",
  },
  {
    lingkup: "Pengelolaan keuangan dan pendanaan kegiatan",
    pertanyaan:
      "Jelaskan bagaimana Anda melakukan koordinasi dengan bagian keuangan, sponsor, vendor, dan pihak terkait lainnya untuk memastikan seluruh kebutuhan pendanaan kegiatan dapat terpenuhi tepat waktu.",
    kesesuaian: "(TMS,RES)",
  },
];

function buildInitialPenilaian(): PenilaianRow[] {
  return RAW_PENILAIAN.map((p, idx) => ({
    id: `penilaian-${idx + 1}`,
    no: idx + 1,
    lingkup: p.lingkup,
    pertanyaan: p.pertanyaan,
    kesesuaian: p.kesesuaian,
    tanggapan: "",
    pencapaian: null,
  }));
}

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

export default function Ia04bPage() {
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
  const [tanggal, setTanggal] = useState("");

  const [units, setUnits] = useState<UnitRow[]>(buildInitialUnits);

  const [penilaianRows, setPenilaianRows] = useState<PenilaianRow[]>(
    buildInitialPenilaian,
  );

  const [rekomendasiTeks, setRekomendasiTeks] = useState(
    "Asesi telah memenuhi/belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan:",
  );
  const [rekomendasiPilihan, setRekomendasiPilihan] = useState<
    "kompeten" | "belum_kompeten" | null
  >(null);

  const [namaAsesiBawah, setNamaAsesiBawah] = useState("");
  const [ttdAsesi, setTtdAsesi] = useState<string | null>(null);
  const [namaAsesorBawah, setNamaAsesorBawah] = useState("");
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

  const updatePenilaian = (
    id: string,
    field: "pertanyaan" | "kesesuaian" | "tanggapan",
    value: string,
  ) => {
    setPenilaianRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const setPencapaian = (id: string, value: "ya" | "tidak") => {
    setPenilaianRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, pencapaian: r.pencapaian === value ? null : value }
          : r,
      ),
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

        {/* Tabel Aspek Penilaian */}
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
                <th
                  colSpan={4}
                  className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left"
                >
                  Aspek Penilaian
                </th>
                <th
                  colSpan={2}
                  className="px-2 py-2.5 border border-gray-200 bg-gray-50"
                >
                  Pencapaian
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  No
                </th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                  Lingkup Penyajian proyek atau kegiatan terstruktur lainnya
                </th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                  Daftar Pertanyaan
                </th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                  Kesesuaian dengan standar kompetensi kerja (unit/elemen/ KUK)
                </th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  Ya
                </th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  Tidak
                </th>
              </tr>
            </thead>
            <tbody>
              {penilaianRows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-2 py-3 border border-gray-200 text-center text-gray-600">
                    {row.no}
                  </td>
                  <td className="px-3 py-3 border border-gray-200 font-semibold text-gray-700">
                    {row.lingkup}
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      Pertanyaan:
                    </p>
                    <EditableText
                      value={row.pertanyaan}
                      onChange={(v) => updatePenilaian(row.id, "pertanyaan", v)}
                      isEditing={isEditing}
                      className="text-sm text-gray-700"
                      rows={6}
                    />
                    <p className="text-xs font-semibold text-gray-500 mt-3 mb-1">
                      Tanggapan:
                    </p>
                    <EditableText
                      value={row.tanggapan}
                      onChange={(v) => updatePenilaian(row.id, "tanggapan", v)}
                      isEditing={isEditing}
                      className="text-sm text-gray-700 min-h-[24px]"
                      rows={2}
                    />
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <EditableText
                      value={row.kesesuaian}
                      onChange={(v) => updatePenilaian(row.id, "kesesuaian", v)}
                      isEditing={isEditing}
                      className="text-sm text-gray-700 font-mono"
                      rows={2}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.pencapaian === "ya"}
                      disabled={!isEditing}
                      onChange={() => setPencapaian(row.id, "ya")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.pencapaian === "tidak"}
                      disabled={!isEditing}
                      onChange={() => setPencapaian(row.id, "tidak")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rekomendasi Asesor */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-40 align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Rekomendasi Asesor:
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={rekomendasiTeks}
                    onChange={setRekomendasiTeks}
                    isEditing={isEditing}
                    className="text-sm text-gray-700 mb-3"
                    rows={2}
                  />
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <label
                      className={`flex items-center gap-2.5 text-sm text-gray-700 ${
                        isEditing ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={rekomendasiPilihan === "kompeten"}
                        disabled={!isEditing}
                        onChange={() =>
                          setRekomendasiPilihan((prev) =>
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
                        checked={rekomendasiPilihan === "belum_kompeten"}
                        disabled={!isEditing}
                        onChange={() =>
                          setRekomendasiPilihan((prev) =>
                            prev === "belum_kompeten" ? null : "belum_kompeten",
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
                <td
                  colSpan={2}
                  className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50"
                >
                  Asesi:
                </td>
              </tr>
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
                  Tanda Tangan/ Tanggal
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
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">
                  Tanda Tangan/ Tanggal
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
