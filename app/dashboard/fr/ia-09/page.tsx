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

interface BuktiRow {
  id: string;
  no: number;
  bukti: string;
}

interface PertanyaanRow {
  id: string;
  no: number;
  pertanyaan: string;
  kesimpulan: string;
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
  "Pertanyaan wawancara dapat dilakukan untuk keseluruhan unit kompetensi dalam skema  sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.",
  "Isilah bukti portofolio sesuai dengan bukti yang diminta pada skema sertifikasi sebagaimana yang telah dibuat pada FR-IA.08.",
  "Ajukan pertanyaan verifikasi portofolio untuk semua unit/elemen kompetensi yang di checklist pada FR-IA.08.",
  "Ajukan pertanyaan kepada asesi sebagai tindak lanjut hasil verifikasi portofolio.",
  "Jika hasil verifikasi potofolio telah memenuhi aturan bukti maka pertanyaan wawancara tidak  perlu dilakukan terhadap bukti tersebut.",
  'Tuliskan pencapaian atas setiap kesimpulan pertanyaan wawancara dengan cara mencentang (✓)  "Ya" atau "Tidak".',
];

const initialBukti: BuktiRow[] = [
  { id: "bukti-1", no: 1, bukti: "Surat Tugas/ Surat Penugasan" },
  { id: "bukti-2", no: 2, bukti: "Salinan Dokumen Registrasi Peserta" },
  { id: "bukti-3", no: 3, bukti: "" },
  { id: "bukti-4", no: 4, bukti: "" },
];

const RAW_PERTANYAAN: string[] = [
  "Sesuai dengan bukti No. 1 dan 2 Yang anda ajukan, ceritakan pengalaman anda ketika anda mendapati tamu undangan datang bersama teman-temannya dan melebihi jumlah yang ditetapkan dalam undangan tersebut. Sementara tamu undangan tersebut merupakan teman dekat dari atasan anda.",
  "Sesuai dengan bukti No. 1 dan 2 Yang anda ajukan, ceritakan pengalaman anda saat anda mendapati goodie bag yang diberikan telah habis, sementara tamu masih berdatangan.",
  "Sesuai dengan bukti No. 1 dan 2 Yang anda ajukan, ceritakan pengalaman anda saat tamu memilih-milih isi atau jenis goodie bag, sementara antrian tamu di belakang cukup Panjang, dan acara sudah akan dimulai.",
  "",
];

function buildInitialPertanyaan(): PertanyaanRow[] {
  return RAW_PERTANYAAN.map((teks, idx) => ({
    id: `pertanyaan-${idx + 1}`,
    no: idx + 1,
    pertanyaan: teks,
    kesimpulan: "",
    pencapaian: null,
  }));
}

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

export default function Ia09Page() {
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

  const [buktiRows, setBuktiRows] = useState<BuktiRow[]>(initialBukti);

  const [pertanyaanRows, setPertanyaanRows] = useState<PertanyaanRow[]>(
    buildInitialPertanyaan,
  );

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

  const updateBukti = (id: string, value: string) => {
    setBuktiRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, bukti: value } : r)),
    );
  };

  const updatePertanyaan = (
    id: string,
    field: "pertanyaan" | "kesimpulan",
    value: string,
  ) => {
    setPertanyaanRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const setPencapaian = (id: string, value: "ya" | "tidak") => {
    setPertanyaanRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, pencapaian: r.pencapaian === value ? null : value }
          : r,
      ),
    );
  };

  const addPertanyaan = () => {
    setPertanyaanRows((prev) => [
      ...prev,
      {
        id: `pertanyaan-${Date.now()}`,
        no: prev.length + 1,
        pertanyaan: "",
        kesimpulan: "",
        pencapaian: null,
      },
    ]);
  };

  const removePertanyaan = (id: string) => {
    setPertanyaanRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev
        .filter((r) => r.id !== id)
        .map((r, idx) => ({ ...r, no: idx + 1 }));
    });
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

        {/* Bukti Portofolio */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-14" />
              <col />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                  No.
                </th>
                <th className="px-3 py-2.5 border border-gray-200 bg-gray-50 text-left">
                  Bukti Portofolio
                </th>
              </tr>
            </thead>
            <tbody>
              {buktiRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2.5 border border-gray-200 text-center text-gray-600">
                    {row.no}.
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={row.bukti}
                      onChange={(e) => updateBukti(row.id, e.target.value)}
                      disabled={!isEditing}
                      className={compactInputClass}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Daftar Pertanyaan Wawancara */}
        <div className="space-y-3">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm table-fixed">
              <colgroup>
                <col className="w-8" />
                <col />
                <col className="w-56" />
                <col className="w-16" />
                <col className="w-16" />
              </colgroup>
              <thead>
                <tr className="text-xs font-semibold text-gray-700">
                  <th
                    colSpan={2}
                    className="px-3 py-2.5 border border-gray-200 bg-gray-50"
                  >
                    Daftar Pertanyaan Wawancara
                  </th>
                  <th className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                    Kesimpulan Jawaban Asesi
                  </th>
                  <th
                    colSpan={2}
                    className="px-2 py-2.5 border border-gray-200 bg-gray-50"
                  >
                    Pencapaian
                  </th>
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  <th className="border border-gray-200 bg-gray-50" colSpan={2}></th>
                  <th className="border border-gray-200 bg-gray-50"></th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">
                    Ya
                  </th>
                  <th className="px-2 py-1.5 border border-gray-200 bg-gray-50">
                    Tidak
                  </th>
                </tr>
              </thead>
              <tbody>
                {pertanyaanRows.map((row) => (
                  <tr key={row.id}>
                    <td className="align-top px-2 py-3 border border-gray-200 text-center text-gray-600">
                      {row.no}.
                    </td>
                    <td className="align-top px-3 py-3 border border-gray-200">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <EditableText
                            value={row.pertanyaan}
                            onChange={(v) =>
                              updatePertanyaan(row.id, "pertanyaan", v)
                            }
                            isEditing={isEditing}
                            className="text-sm text-gray-700 wrap-break-word"
                            rows={5}
                          />
                        </div>
                        {isEditing && pertanyaanRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePertanyaan(row.id)}
                            className="text-gray-300 hover:text-red-500 shrink-0 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="align-top px-3 py-3 border border-gray-200">
                      <EditableText
                        value={row.kesimpulan}
                        onChange={(v) =>
                          updatePertanyaan(row.id, "kesimpulan", v)
                        }
                        isEditing={isEditing}
                        className="text-sm text-gray-700 wrap-break-word min-h-[24px]"
                        rows={5}
                      />
                    </td>
                    <td className="align-middle px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        checked={row.pencapaian === "ya"}
                        disabled={!isEditing}
                        onChange={() => setPencapaian(row.id, "ya")}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>
                    <td className="align-middle px-2 py-3 border border-gray-200 text-center">
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

          {isEditing && (
            <button
              type="button"
              onClick={addPertanyaan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all cursor-pointer"
            >
              <Plus size={12} />
              Tambah Pertanyaan
            </button>
          )}
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
