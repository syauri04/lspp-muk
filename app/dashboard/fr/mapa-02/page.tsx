"use client";

import { useState } from "react";
import { Check, Pencil, Save, Plus, X } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

const compactInputClass =
  "w-full px-2 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

const checkboxClass =
  "w-4 h-4 border-gray-300 text-[#8AA53C] focus:ring-[#8AA53C]/40 cursor-pointer disabled:cursor-default shrink-0";

interface UnitRow {
  id: string;
  no: number;
  kodeUnit: string;
  judulUnit: string;
}

interface InstrumenRow {
  id: string;
  no: number;
  kode: string;
  label: string;
  potensi: boolean[];
}

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

const RAW_UNITS: { kodeUnit: string; judulUnit: string }[] = [
  {
    kodeUnit: "M.74YOP01.012.1",
    judulUnit: "Mengurus Rencana Pengembangan Kepribadian",
  },
  {
    kodeUnit: "M.74YOP01.013.2",
    judulUnit:
      "Mengelola Proses Jasa Konsultasi Perencanaan Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.014.1",
    judulUnit:
      "Mengevaluasi Layanan Jasa Konsultasi Perencanaan Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.016.1",
    judulUnit:
      "Mengelola Arsip Sumber Daya Manusia Perencanaan Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.030.1",
    judulUnit:
      "Menyusun Kebijakan Pengembangan Sumber Daya Manusia Perencanaan Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.007.1",
    judulUnit: "Melaksanakan Autonomi Kebijakan Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.001.1",
    judulUnit:
      "Menetapkan Teknologi Informasi dalam Perencanaan Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.004.1",
    judulUnit:
      "Mengumpulkan Data dari Informasi Perencanaan Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.004.1",
    judulUnit: "Melakukan Analisis Kebijakan Perencanaan Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.008.1",
    judulUnit:
      "Merumuskan Isu Strategis Kepariwisataan di Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.008.1",
    judulUnit: "Mengevaluasi Kebijakan Destinasi Pariwisata",
  },
  {
    kodeUnit: "M.74YOP01.009.1",
    judulUnit: "Mengevaluasi Dampak Destinasi Pariwisata",
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

const RAW_INSTRUMEN: { kode: string; label: string }[] = [
  {
    kode: "FR.IA.01. CL",
    label:
      "Ceklis Observasi Aktivitas Di Tempat Kerja atau Tempat Kerja Simulasi",
  },
  { kode: "FR.IA.02. TPD", label: "Tugas Praktik Demonstrasi" },
  { kode: "FR.IA.03. PMO", label: "Pertanyaan Mendukung Observasi" },
  {
    kode: "FR.IA.04. DIT",
    label:
      "Daftar Instruksi Terstruktur (Penugasan Simulasi/Praktek Kerja/Bagian Pekerjaan/Kegiatan Lainnya)",
  },
  { kode: "FR.IA.04B. DIT", label: "Daftar Pertanyaan Tertulis Pilihan Ganda" },
  { kode: "FR.IA.06. DPT", label: "Daftar Pertanyaan Tertulis Pilihan Esai" },
  { kode: "FR.IA.07. DPL", label: "Daftar Pertanyaan Lisan" },
  { kode: "FR.IA.08. CVP", label: "Ceklis Verifikasi Portofolio" },
  { kode: "FR.IA.09. PW", label: "Pertanyaan Wawancara" },
  { kode: "Pertanyaan Wawancara", label: "Verifikasi Pihak Ketiga" },
  { kode: "FR.IA.11. CRP", label: "Ceklis Reviu Produk" },
];

function buildInitialInstrumen(): InstrumenRow[] {
  return RAW_INSTRUMEN.map((it, idx) => ({
    id: `instrumen-${idx + 1}`,
    no: idx + 1,
    kode: it.kode,
    label: it.label,
    potensi: [false, false, false, false, false],
  }));
}

const KETERANGAN_LIST = [
  "Hasil pelatihan dan/atau pendidikan, dimana kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi.",
  "Hasil pelatihan dan/atau pendidikan, dimana kurikulum belum berbasis kompetensi.",
  "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi.",
  "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya belum berbasis standar kompetensi.",
  "Pelatihan/belajar mandiri atau otodidak.",
];

export default function Mapa02Page() {
  const [judulSkema, setJudulSkema] = useState(
    "MEETING/CONFERENCE PROJECT MANAGER",
  );
  const [nomorSkema, setNomorSkema] = useState("005/LSPP306/V/2026");
  const [skemaType, setSkemaType] = useState<"kkni" | "okupasi" | "klaster">(
    "okupasi",
  );
  const okupasi = "AHLI MADYA PERENCANA DESTINASI PARIWISATA";

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [units, setUnits] = useState<UnitRow[]>(buildInitialUnits);
  const [instrumenRows, setInstrumenRows] = useState<InstrumenRow[]>(
    buildInitialInstrumen,
  );

  const [namaPenyusun, setNamaPenyusun] = useState("Munif Sofian, S.Sos.");
  const [noRegPenyusun, setNoRegPenyusun] = useState("MET.000.006317.2025");
  const [ttdPenyusun, setTtdPenyusun] = useState<string | null>(null);

  const [namaValidator, setNamaValidator] = useState(
    "Alma Cempaka Adzil, M.Si.",
  );
  const [noRegValidator, setNoRegValidator] = useState("MET.000.005839.2023");
  const [ttdValidator, setTtdValidator] = useState<string | null>(null);

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

  const updateInstrumen = (
    id: string,
    field: "kode" | "label",
    value: string,
  ) => {
    setInstrumenRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const toggleInstrumenPotensi = (id: string, idx: number) => {
    setInstrumenRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              potensi: r.potensi.map((v, i) => (i === idx ? !v : v)),
            }
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

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-8">
        {/* Header: Skema Sertifikasi */}
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
            </tbody>
          </table>
        </div>

        {/* Tabel Unit Kompetensi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <thead>
              <tr className="text-xs font-semibold text-gray-600">
                <th className="w-45 px-3 py-2.5 border border-gray-200"></th>
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
                      {okupasi}
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

        {/* Tabel Instrumen Asesmen */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-12" />
              <col className="w-50" />
              <col className="w-12" />
              <col className="w-12" />
              <col className="w-12" />
              <col className="w-12" />
              <col className="w-12" />
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
                  Instrumen Asesmen**
                </th>
                <th
                  colSpan={5}
                  className="px-3 py-2.5 border border-gray-200 bg-gray-50"
                >
                  Potensi Asesi*
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                {[1, 2, 3, 4, 5].map((n) => (
                  <th
                    key={n}
                    className="px-2 py-2.5 border border-gray-200 bg-gray-50"
                  >
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {instrumenRows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-3 py-3 border border-gray-200 text-center text-gray-600">
                    {row.no}
                  </td>
                  <td className="px-3 py-3 border border-gray-200 overflow-hidden">
                    <div className="min-w-0 space-y-1">
                      <EditableText
                        value={row.kode}
                        onChange={(v) => updateInstrumen(row.id, "kode", v)}
                        isEditing={isEditing}
                        className="text-xs font-semibold text-gray-700 font-mono wrap-break-word"
                        rows={1}
                      />
                      <EditableText
                        value={row.label}
                        onChange={(v) => updateInstrumen(row.id, "label", v)}
                        isEditing={isEditing}
                        className="text-sm text-gray-700 wrap-break-word"
                        rows={2}
                      />
                    </div>
                  </td>
                  {row.potensi.map((checked, idx) => (
                    <td
                      key={idx}
                      className="px-2 py-3 border border-gray-200 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!isEditing}
                        onChange={() => toggleInstrumenPotensi(row.id, idx)}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <div className="text-xs text-gray-500 italic space-y-1">
          <p>
            * diisi berdasarkan hasil penentuan pendekatan asesmen dan
            perencanaan asesmen
          </p>
        </div>

        {/* Penyusun dan Validator */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 text-sm bg-gray-50">
            Penyusun dan Validator
          </div>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-1/2 align-top border border-gray-200 p-0">
                  <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200 font-bold text-gray-800">
                    Penyusun
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        Nama Penyusun
                      </label>
                      <input
                        type="text"
                        value={namaPenyusun}
                        onChange={(e) => setNamaPenyusun(e.target.value)}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        No. Reg
                      </label>
                      <input
                        type="text"
                        value={noRegPenyusun}
                        onChange={(e) => setNoRegPenyusun(e.target.value)}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        Tanda Tangan dan Tanggal
                      </label>
                      <SignatureBox
                        value={ttdPenyusun}
                        onChange={setTtdPenyusun}
                        isEditing={isEditing}
                        inputId="penyusun-ttd-upload"
                      />
                    </div>
                  </div>
                </td>
                <td className="w-1/2 align-top border border-gray-200 p-0">
                  <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200 font-bold text-gray-800">
                    Validator
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        Nama Validator
                      </label>
                      <input
                        type="text"
                        value={namaValidator}
                        onChange={(e) => setNamaValidator(e.target.value)}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        No. Reg
                      </label>
                      <input
                        type="text"
                        value={noRegValidator}
                        onChange={(e) => setNoRegValidator(e.target.value)}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        Tanda Tangan dan Tanggal
                      </label>
                      <SignatureBox
                        value={ttdValidator}
                        onChange={setTtdValidator}
                        isEditing={isEditing}
                        inputId="validator-ttd-upload"
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Keterangan */}
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-gray-800">Keterangan:</p>
          <ol className="list-decimal list-inside space-y-1">
            {KETERANGAN_LIST.map((teks, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-snug">
                {teks}
              </li>
            ))}
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
