"use client";

import { useState } from "react";
import { Check, Pencil, Save, Plus, X } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

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

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

interface KeteranganItem {
  id: string;
  label: string;
  checked: boolean;
}

interface KarakterRow {
  id: string;
  no: number;
  karakter: string;
  penyesuaian: "ya" | "tidak" | null;
  keterangan: KeteranganItem[];
}

function toggleById<T extends { id: string }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  id: string,
  patch: Partial<T>,
) {
  setter((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
}

const initialPotensiAsesi: CheckItem[] = [
  {
    id: "potensi-1",
    checked: false,
    label:
      "Hasil pelatihan dan/atau pendidikan, dimana kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi.",
  },
  {
    id: "potensi-2",
    checked: false,
    label:
      "Hasil pelatihan dan/atau pendidikan, dimana kurikulum belum berbasis kompetensi.",
  },
  {
    id: "potensi-3",
    checked: false,
    label:
      "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi.",
  },
  {
    id: "potensi-4",
    checked: false,
    label:
      "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya belum berbasis kompetensi.",
  },
  {
    id: "potensi-5",
    checked: false,
    label: "Pelatihan/belajar mandiri atau otodidak.",
  },
];

const PANDUAN_ASESOR = [
  "Formulir ini dapat digunakan (sebelum pra-asesmen, saat pelaksanaan pra-asesmen, setelah pra-asesmen) jika ada asesi yang mempunyai keterbatasan sesuai karakteristik yang dimilikinya sehingga diperlukan penyesuaian yang wajar dan beralasan, jika rencana asesmen dan perangkat asesmen tidak sesuai dengan asesi (pembanding, potensi asesi dan konteks asesi), jika asesi merasa kelelahan, sakit, serta jika kondisi alam, listrik padam, dll.",
  "Coretlah pada tanda * yang tidak sesuai.",
  "Berilah tanda (✓) pada kotak (☐) kolom potensi asesi.",
  "Berilah tanda (✓) Ya atau Tidak pada tanda ** sesuai pilihan, dan jawaban Ya selanjutnya berilah tanda keterangan berilah tanda (✓) di kotak (☐) yang tersedia, pilihan boleh lebih dari satu.",
];

const RAW_KARAKTER: {
  karakter: string;
  keterangan: string[];
}[] = [
  {
    karakter:
      "Keterbatasan Asesi terhadap persyaratan bahasa, literasi, numerasi",
    keterangan: [
      "Memerlukan dukungan pembaca, penerjemah, pelayan, penulis, untuk menjawab jawaban Asesi.",
      "Melakukan Asesmen verbal (gunakan pertanyaan lisan/pertanyaan wawancara) dengan dilengkapi gambar diagram dan bentuk-bentuk visual.",
      "Menggunakan hasil produksi.",
      "Menggunakan ceklis observasi/demonstrasi.",
      "Menggunakan daftar instruksi terstruktur.",
    ],
  },
  {
    karakter: "Penyediaan dukungan pembaca, penerjemah, pelayan, penulis.",
    keterangan: [
      "Menggunakan pertanyaan lisan dengan dilengkapi gambar diagram dan bentuk-bentuk visual.",
      "Menggunakan pertanyaan wawancara dengan dilengkapi gambar diagram dan bentuk-bentuk visual.",
    ],
  },
  {
    karakter:
      "Penggunaan teknologi adaptif atau peralatan khusus. (tidak dapat menggunakan teknologi adaptif (misal: mengoperasikan komputer dan printer, peralatan digital dsb).",
    keterangan: [
      "Ceklis observasi/demonstrasi.",
      "Pertanyaan lisan.",
      "Pertanyaan tertulis.",
      "Pertanyaan wawancara.",
      "Daftar instruksi terstruktur.",
      "Ceklis verifikasi portofolio.",
      "Menggunakan dukungan operator komputer.",
    ],
  },
  {
    karakter:
      "Pelaksanaan asesmen secara fleksibel karena alasan keletihan atau keperluan pengobatan.",
    keterangan: [
      "Menggunakan juru tulis.",
      "Menggunakan kamera/merekam video/audio.",
      "Memperbolehkan periode waktu yang lebih panjang untuk menyelesaikan tugas pekerjaan dalam asesmen.",
      "Melakukan tugas pekerjaan dalam asesmen dengan waktu lebih pendek.",
      "Menggunakan instruksi-instruksi spesifik pada proyek yang dapat dilakukan pada berbagai tingkatan.",
    ],
  },
  {
    karakter: "Penyediaan peralatan asesmen berupa braille, audio/video-tape.",
    keterangan: [
      "Menggunakan pertanyaan lisan.",
      "Menggunakan pertanyaan wawancara.",
    ],
  },
  {
    karakter: "Penyesuaian tempat fisik/lingkungan asesmen.",
    keterangan: [
      "Pertanyaan lisan.",
      "Pertanyaan tertulis.",
      "Pertanyaan wawancara.",
      "Ceklis Verifikasi Portofolio.",
      "Ceklis reviu produk.",
      "Daftar instruksi terstruktur.",
    ],
  },
  {
    karakter:
      "Pertimbangan umur/usia lanjut/gender asesi. (adanya perbedaan usia dengan asesor yang lebih muda).",
    keterangan: [
      "Menggunakan studi kasus/daftar instruksi terstruktur.",
      "Menggunakan instrumen asesmen dengan huruf normal jangan terlalu kecil.",
      "Menggunakan asesor dengan jenis kelamin yang sama dengan asesi.",
      "Menggunakan instrumen asesmen yang sama walaupun berbeda jenis kelamin (tidak boleh memberi tanda tambahan pada instrumen asesmen yang digunakan dengan tujuan untuk membedakan jenis kelamin).",
    ],
  },
  {
    karakter: "Pertimbangan budaya/tradisi/agama.",
    keterangan: [
      "Menggunakan studi kasus daftar instruksi terstruktur.",
      "Menggunakan asesor tanpa pertimbangan budaya/tradisi/agama.",
      "Menggunakan instrumen asesmen yang sama walaupun berbeda budaya/tradisi/agama.",
    ],
  },
];

function buildInitialKarakterRows(): KarakterRow[] {
  return RAW_KARAKTER.map((r, idx) => ({
    id: `karakter-${idx + 1}`,
    no: idx + 1,
    karakter: r.karakter,
    penyesuaian: null,
    keterangan: r.keterangan.map((label, kIdx) => ({
      id: `karakter-${idx + 1}-ket-${kIdx + 1}`,
      label,
      checked: false,
    })),
  }));
}

export default function Ak07Page() {
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
  >("tempat_kerja");
  const [namaAsesor, setNamaAsesor] = useState("");
  const [namaAsesi, setNamaAsesi] = useState("");
  const [tanggal, setTanggal] = useState("");

  const [potensiAsesi, setPotensiAsesi] =
    useState<CheckItem[]>(initialPotensiAsesi);

  const [karakterRows, setKarakterRows] = useState<KarakterRow[]>(
    buildInitialKarakterRows,
  );

  const [acuanPembanding, setAcuanPembanding] = useState("");
  const [metodeAsesmen, setMetodeAsesmen] = useState("");
  const [instrumenAsesmen, setInstrumenAsesmen] = useState("");

  const [namaAsesorBawah, setNamaAsesorBawah] = useState("");
  const [ttdAsesor, setTtdAsesor] = useState<string | null>(null);
  const [namaAsesiBawah, setNamaAsesiBawah] = useState("");
  const [ttdAsesi, setTtdAsesi] = useState<string | null>(null);

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const setPenyesuaian = (rowId: string, value: "ya" | "tidak") => {
    setKarakterRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, penyesuaian: r.penyesuaian === value ? null : value }
          : r,
      ),
    );
  };

  const updateKarakter = (rowId: string, value: string) => {
    setKarakterRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, karakter: value } : r)),
    );
  };

  const toggleKeteranganChecked = (rowId: string, ketId: string) => {
    setKarakterRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              keterangan: r.keterangan.map((k) =>
                k.id === ketId ? { ...k, checked: !k.checked } : k,
              ),
            }
          : r,
      ),
    );
  };

  const updateKeteranganLabel = (
    rowId: string,
    ketId: string,
    value: string,
  ) => {
    setKarakterRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              keterangan: r.keterangan.map((k) =>
                k.id === ketId ? { ...k, label: value } : k,
              ),
            }
          : r,
      ),
    );
  };

  const addKeterangan = (rowId: string) => {
    setKarakterRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              keterangan: [
                ...r.keterangan,
                {
                  id: `${rowId}-ket-${Date.now()}`,
                  label: "",
                  checked: false,
                },
              ],
            }
          : r,
      ),
    );
  };

  const removeKeterangan = (rowId: string, ketId: string) => {
    setKarakterRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, keterangan: r.keterangan.filter((k) => k.id !== ketId) }
          : r,
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
                  className="px-4 py-3 border border-gray-200 font-semibold text-gray-700"
                >
                  TUK
                </td>
                <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                  :
                </td>
                <td className="px-3 py-2 border border-gray-200 text-sm text-gray-600">
                  (
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => setTukType("sewaktu")}
                    className={
                      tukType === "sewaktu"
                        ? "text-black"
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
                        ? "text-black"
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
                        ? "text-black"
                        : "line-through text-gray-400"
                    }
                  >
                    Mandiri
                  </button>
                  )
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

        {/* Potensi Asesi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-32" />
              <col className="w-12" />
              <col />
            </colgroup>
            <tbody>
              {potensiAsesi.map((item, idx) => (
                <tr key={item.id}>
                  {idx === 0 && (
                    <td
                      rowSpan={potensiAsesi.length}
                      className="align-middle px-3 py-3 border border-gray-200 text-center font-semibold text-gray-700 bg-gray-50"
                    >
                      Potensi Asesi
                    </td>
                  )}
                  <td className="px-3 py-2.5 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      disabled={!isEditing}
                      onChange={() =>
                        toggleById(setPotensiAsesi, item.id, {
                          checked: !item.checked,
                        })
                      }
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-3 py-2.5 border border-gray-200 text-sm text-gray-700">
                    {item.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                <th
                  rowSpan={2}
                  className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50"
                >
                  No
                </th>
                <th
                  rowSpan={2}
                  className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50 text-left"
                >
                  Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi
                  (Karakter Asesi):
                </th>
                <th
                  colSpan={2}
                  className="px-3 py-2.5 border border-gray-200 bg-gray-50"
                >
                  Diperlukan Penyesuaian**
                </th>
                <th
                  rowSpan={2}
                  className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50 text-left"
                >
                  Keterangan
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  Ya
                </th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  Tidak
                </th>
              </tr>
            </thead>
            <tbody>
              {karakterRows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-3 py-3 border border-gray-200 text-center text-gray-600">
                    {row.no}
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <EditableText
                      value={row.karakter}
                      onChange={(v) => updateKarakter(row.id, v)}
                      isEditing={isEditing}
                      className="text-sm text-gray-700"
                      rows={4}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.penyesuaian === "ya"}
                      disabled={!isEditing}
                      onChange={() => setPenyesuaian(row.id, "ya")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.penyesuaian === "tidak"}
                      disabled={!isEditing}
                      onChange={() => setPenyesuaian(row.id, "tidak")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <div className="space-y-2">
                      {row.keterangan.map((k) => (
                        <div key={k.id} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={k.checked}
                            disabled={!isEditing}
                            onChange={() =>
                              toggleKeteranganChecked(row.id, k.id)
                            }
                            className={`${checkboxClass} mt-0.5`}
                          />
                          <div className="flex-1 min-w-0">
                            <EditableText
                              value={k.label}
                              onChange={(v) =>
                                updateKeteranganLabel(row.id, k.id, v)
                              }
                              isEditing={isEditing}
                              className="text-sm text-gray-700"
                              rows={k.label.length > 80 ? 2 : 1}
                            />
                          </div>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeKeterangan(row.id, k.id)}
                              className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => addKeterangan(row.id)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all cursor-pointer"
                      >
                        <Plus size={12} />
                        Tambah Lampiran
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hasil Penyesuaian */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">
            Hasil Penyesuaian yang Wajar dan Beralasan disepakati menggunakan:
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-gray-500">1)</span>
              <span className="w-44 shrink-0 text-gray-700">
                Acuan Pembanding Asesmen
              </span>
              <span className="text-gray-400">:</span>
              <input
                type="text"
                value={acuanPembanding}
                onChange={(e) => setAcuanPembanding(e.target.value)}
                disabled={!isEditing}
                placeholder="tuliskan nama acuan pembanding"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-gray-500">2)</span>
              <span className="w-44 shrink-0 text-gray-700">
                Metode Asesmen
              </span>
              <span className="text-gray-400">:</span>
              <input
                type="text"
                value={metodeAsesmen}
                onChange={(e) => setMetodeAsesmen(e.target.value)}
                disabled={!isEditing}
                placeholder="tuliskan nama acuan pembanding"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-gray-500">3)</span>
              <span className="w-44 shrink-0 text-gray-700">
                Instrumen Asesmen
              </span>
              <span className="text-gray-400">:</span>
              <input
                type="text"
                value={instrumenAsesmen}
                onChange={(e) => setInstrumenAsesmen(e.target.value)}
                disabled={!isEditing}
                placeholder="tuliskan nama acuan pembanding"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-1/2 align-top border border-gray-200 p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      Nama Asesor
                    </label>
                    <input
                      type="text"
                      value={namaAsesorBawah}
                      onChange={(e) => setNamaAsesorBawah(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </div>
                </td>
                <td className="w-1/2 align-top border border-gray-200 p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      Tanda Tangan Asesor dan Tanggal
                    </label>
                    <SignatureBox
                      value={ttdAsesor}
                      onChange={setTtdAsesor}
                      isEditing={isEditing}
                      inputId="asesor-ttd-upload"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="align-top border border-gray-200 p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      Nama Asesi
                    </label>
                    <input
                      type="text"
                      value={namaAsesiBawah}
                      onChange={(e) => setNamaAsesiBawah(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </div>
                </td>
                <td className="align-top border border-gray-200 p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      Tanda Tangan Asesi dan Tanggal
                    </label>
                    <SignatureBox
                      value={ttdAsesi}
                      onChange={setTtdAsesi}
                      isEditing={isEditing}
                      inputId="asesi-ttd-upload"
                    />
                  </div>
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
