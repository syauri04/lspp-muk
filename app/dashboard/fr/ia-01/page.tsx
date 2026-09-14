"use client";

import { Fragment, useState } from "react";
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

interface KukItem {
  id: string;
  teks: string;
}

interface ElemenRow {
  id: string;
  no: number;
  nama: string;
  kukList: KukItem[];
  standarIndustri: string;
  pencapaian: "ya" | "tidak" | null;
  penilaianLanjut: string;
}

interface UnitKompetensiRow {
  id: string;
  no: number;
  kodeUnit: string;
  judulUnit: string;
  elemens: ElemenRow[];
}

const PANDUAN_ASESOR = [
  "Lengkapi nama unit kompetensi, elemen, dan kriteria unjuk kerja sesuai kolom dalam tabel.",
  "Isilah standar industri atau tempat kerja.",
  'Beri tanda (✓) pada kolom "YA" jika anda yakin asesi dapat melakukan/mendemonstrasikan tugas sesuai KAK, atau centang (✓) pada kolom "TIDAK" bila sebaliknya.',
  "Penilaian lanjut diisi bila hasil belum dapat disimpulkan, untuk itu gunakan metode lain sehingga keputusan dapat dibuat.",
  "Isilah kolom KUK sesuai dengan Unit Kompetensi/SKKNI",
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

function emptyKuk(unitIdx: number, elemenIdx: number, kukIdx: number): KukItem {
  return {
    id: `u${unitIdx}-e${elemenIdx}-k${kukIdx}`,
    teks: "",
  };
}

function emptyElemen(unitIdx: number, elemenIdx: number): ElemenRow {
  return {
    id: `u${unitIdx}-e${elemenIdx}`,
    no: elemenIdx,
    nama: "",
    kukList: [emptyKuk(unitIdx, elemenIdx, 1)],
    standarIndustri: "",
    pencapaian: null,
    penilaianLanjut: "",
  };
}

function buildInitialUnits(): UnitKompetensiRow[] {
  return RAW_UNITS.map((u, idx) => {
    const unitNo = idx + 1;
    if (unitNo === 1) {
      return {
        id: `unit-${unitNo}`,
        no: unitNo,
        kodeUnit: u.kodeUnit,
        judulUnit: u.judulUnit,
        elemens: [
          {
            id: "u1-e1",
            no: 1,
            nama: "Berkomunikasi dengan pelanggan dan kolega mengenai hal-hal yang berkaitan dengan kegiatan dasar dan sehari-hari ditempat kerja serta kegiatan pelayanan pelanggan.",
            kukList: [
              {
                id: "u1-e1-k1",
                teks: "Istilah, ungkapan, dan bahasa tubuh untuk memperjelas komunikasi secara lisan dilakukan",
              },
              {
                id: "u1-e1-k2",
                teks: "Mengerti dan Menggunakan kalimat yang sopan dan ramah serta mengetahui kapan harus memakai kalimat resmi atau tidak resmi",
              },
            ],
            standarIndustri: "",
            pencapaian: null,
            penilaianLanjut: "",
          },
          {
            id: "u1-e2",
            no: 2,
            nama: "Berbicara melalui telepon",
            kukList: [
              {
                id: "u1-e2-k1",
                teks: "Salam diberikan dengan benar termasuk menyebutkan nama perusahaan",
              },
              {
                id: "u1-e2-k2",
                teks: "Bantuan dan menentukan tujuan telepon ditawarkan",
              },
              {
                id: "u1-e2-k3",
                teks: "Bantuan dan menentukan tujuan telepon ditawarkan",
              },
              {
                id: "u1-e2-k4",
                teks: "Apabila diperlukan, meminta maaf kepada penelepon ketika orang yang dikehendaki tidak berada di tempat",
              },
              {
                id: "u1-e2-k5",
                teks: "Data penelepon di catat",
              },
            ],
            standarIndustri: "",
            pencapaian: null,
            penilaianLanjut: "",
          },
        ],
      };
    }
    return {
      id: `unit-${unitNo}`,
      no: unitNo,
      kodeUnit: u.kodeUnit,
      judulUnit: u.judulUnit,
      elemens: [emptyElemen(unitNo, 1)],
    };
  });
}

export default function Ia01Page() {
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

  const [units, setUnits] = useState<UnitKompetensiRow[]>(buildInitialUnits);

  const [umpanBalik, setUmpanBalik] = useState("");
  const [rekomendasi, setRekomendasi] = useState<
    "kompeten" | "observasi_lanjutan" | null
  >(null);
  const [kelompokPekerjaan, setKelompokPekerjaan] = useState("");
  const [unitLanjutan, setUnitLanjutan] = useState("");
  const [elemenLanjutan, setElemenLanjutan] = useState("");
  const [kukLanjutan, setKukLanjutan] = useState("");

  const [namaAsesiBawah, setNamaAsesiBawah] = useState("");
  const [ttdAsesi, setTtdAsesi] = useState<string | null>(null);

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const updateUnitField = (
    unitId: string,
    field: "kodeUnit" | "judulUnit",
    value: string,
  ) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, [field]: value } : u)),
    );
  };

  const updateElemen = (
    unitId: string,
    elemenId: string,
    patch: Partial<ElemenRow>,
  ) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        return {
          ...u,
          elemens: u.elemens.map((e) =>
            e.id === elemenId ? { ...e, ...patch } : e,
          ),
        };
      }),
    );
  };

  const updateKuk = (
    unitId: string,
    elemenId: string,
    kukId: string,
    patch: Partial<KukItem>,
  ) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        return {
          ...u,
          elemens: u.elemens.map((e) => {
            if (e.id !== elemenId) return e;
            return {
              ...e,
              kukList: e.kukList.map((k) =>
                k.id === kukId ? { ...k, ...patch } : k,
              ),
            };
          }),
        };
      }),
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

        {/* Tabel Ringkasan Unit Kompetensi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <thead>
              <tr className="text-xs font-semibold text-gray-600">
                <th className="w-52 px-3 py-2.5 border border-gray-200"></th>
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
                      {judulSkema}
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
                        updateUnitField(unit.id, "kodeUnit", e.target.value)
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
                        updateUnitField(unit.id, "judulUnit", e.target.value)
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

        {/* Uji Kompetensi per Unit */}
        {units.map((unit) => (
          <div key={unit.id} className="border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td
                    rowSpan={2}
                    className="w-56 align-middle px-4 py-3 bg-gray-50 border border-gray-200 font-semibold text-gray-700"
                  >
                    Unit Kompetensi {unit.no}
                  </td>
                  <td className="w-28 px-4 py-3 border border-gray-200 font-semibold text-gray-600">
                    Kode Unit
                  </td>
                  <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">
                    :
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={unit.kodeUnit}
                      onChange={(e) =>
                        updateUnitField(unit.id, "kodeUnit", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`${inputClass} font-mono`}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-600">
                    Judul Unit
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                    :
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={unit.judulUnit}
                      onChange={(e) =>
                        updateUnitField(unit.id, "judulUnit", e.target.value)
                      }
                      disabled={!isEditing}
                      className={inputClass}
                    />
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
                  <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                    No.
                  </th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                    Elemen
                  </th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                    Kriteria Unjuk Kerja
                  </th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                    Standar Industri atau Tempat Kerja
                  </th>
                  <th
                    colSpan={2}
                    className="px-2 py-2.5 border border-gray-200 bg-gray-50"
                  >
                    Pencapaian
                  </th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                    Penilaian Lanjut
                  </th>
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  <th
                    className="border border-gray-200 bg-gray-50"
                    colSpan={4}
                  ></th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">
                    Ya
                  </th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">
                    Tidak
                  </th>
                  <th className="border border-gray-200 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody>
                {unit.elemens.map((elemen) => (
                  <Fragment key={elemen.id}>
                    {elemen.kukList.map((kuk, kIdx) => (
                      <tr key={kuk.id} className="align-top">
                        {kIdx === 0 && (
                          <>
                            <td
                              rowSpan={elemen.kukList.length}
                              className="px-2 py-3 border border-gray-200 text-center text-gray-600"
                            >
                              {elemen.no}.
                            </td>
                            <td
                              rowSpan={elemen.kukList.length}
                              className="px-3 py-3 border border-gray-200"
                            >
                              <EditableText
                                value={elemen.nama}
                                onChange={(v) =>
                                  updateElemen(unit.id, elemen.id, {
                                    nama: v,
                                  })
                                }
                                isEditing={isEditing}
                                className="text-sm text-gray-700 wrap-break-word"
                                rows={4}
                              />
                            </td>
                          </>
                        )}
                        <td className="px-3 py-2 border border-gray-200 overflow-hidden">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="w-9 shrink-0 pt-1 text-xs font-mono text-gray-500">
                              {elemen.no}.{kIdx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <EditableText
                                value={kuk.teks}
                                onChange={(v) =>
                                  updateKuk(unit.id, elemen.id, kuk.id, {
                                    teks: v,
                                  })
                                }
                                isEditing={isEditing}
                                className="text-sm text-gray-700 wrap-break-word"
                                rows={2}
                              />
                            </div>
                          </div>
                        </td>
                        {kIdx === 0 && (
                          <>
                            <td
                              rowSpan={elemen.kukList.length}
                              className="px-3 py-3 border border-gray-200"
                            >
                              <EditableText
                                value={elemen.standarIndustri}
                                onChange={(v) =>
                                  updateElemen(unit.id, elemen.id, {
                                    standarIndustri: v,
                                  })
                                }
                                isEditing={isEditing}
                                className="text-sm text-gray-700"
                                rows={4}
                              />
                            </td>
                            <td
                              rowSpan={elemen.kukList.length}
                              className="px-2 py-3 border border-gray-200 text-center"
                            >
                              <input
                                type="checkbox"
                                checked={elemen.pencapaian === "ya"}
                                disabled={!isEditing}
                                onChange={() =>
                                  updateElemen(unit.id, elemen.id, {
                                    pencapaian:
                                      elemen.pencapaian === "ya" ? null : "ya",
                                  })
                                }
                                className={`${checkboxClass} mx-auto`}
                              />
                            </td>
                            <td
                              rowSpan={elemen.kukList.length}
                              className="px-2 py-3 border border-gray-200 text-center"
                            >
                              <input
                                type="checkbox"
                                checked={elemen.pencapaian === "tidak"}
                                disabled={!isEditing}
                                onChange={() =>
                                  updateElemen(unit.id, elemen.id, {
                                    pencapaian:
                                      elemen.pencapaian === "tidak"
                                        ? null
                                        : "tidak",
                                  })
                                }
                                className={`${checkboxClass} mx-auto`}
                              />
                            </td>
                            <td
                              rowSpan={elemen.kukList.length}
                              className="px-3 py-3 border border-gray-200"
                            >
                              <EditableText
                                value={elemen.penilaianLanjut}
                                onChange={(v) =>
                                  updateElemen(unit.id, elemen.id, {
                                    penilaianLanjut: v,
                                  })
                                }
                                isEditing={isEditing}
                                className="text-sm text-gray-700"
                                rows={4}
                              />
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Umpan Balik */}
        <div className="border border-gray-200">
          <div className="px-4 py-3">
            <p className="font-semibold text-gray-700 mb-2">
              Umpan balik untuk asesi:
            </p>
            <EditableText
              value={umpanBalik}
              onChange={setUmpanBalik}
              isEditing={isEditing}
              className="text-sm text-gray-700"
              rows={5}
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
                direkomendasikan{" "}
                <span className="font-bold">KOMPETEN</span>
              </span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="px-4 py-3 border-t md:border-t-0 border-gray-200">
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
                  Asesi belum memenuhi pencapaian seluruh kriteria unjuk
                  kerja, direkomendasikan{" "}
                  <span className="font-bold">
                    OBSERVASI LANGSUNG/ KEGIATAN TERSTRUKTUR*)
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
            <div className="border-t md:border-t-0 md:border-l border-gray-200 p-0">
              <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">
                Asesi
              </div>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="w-28 px-4 py-3 border border-gray-200 text-gray-600">
                      Nama
                    </td>
                    <td className="w-6 px-2 py-3 border border-gray-200 text-center text-gray-400">
                      :
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
                    <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                      :
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
          </div>
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
