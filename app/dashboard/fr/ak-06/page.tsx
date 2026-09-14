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

const PENJELASAN = [
  "Peninjauan dapat dilakukan oleh lead asesor atau asesor yang melaksanakan asesmen.",
  "Peninjauan dapat dilakukan secara terpadu dalam skema sertifikasi dan/atau peserta kelompok yang homogen.",
  "Isilah pemenuhan dimensi kompetensi dengan menuliskan  jenis bukti dan instrumen yang digunakan pada saat asesmen sebagai  bukti terpenuhinya  dimensi kompetensi.",
];

const PRINSIP_COLUMNS = [
  { id: "validitas", label: "Validitas" },
  { id: "reliable", label: "Reliable" },
  { id: "fleksibel", label: "Fleksibel" },
  { id: "adil", label: "Adil" },
] as const;

type PrinsipId = (typeof PRINSIP_COLUMNS)[number]["id"];

interface PrinsipRow {
  id: string;
  label: string;
  disabled: PrinsipId[];
  checked: Record<PrinsipId, boolean>;
}

const RAW_PRINSIP: { label: string; disabled: PrinsipId[] }[] = [
  { label: "Rencana asesmen", disabled: [] },
  { label: "Persiapan asesmen", disabled: [] },
  { label: "Implementasi asesmen", disabled: [] },
  { label: "Keputusan asesmen", disabled: ["fleksibel"] },
  { label: "Umpan balik asesmen", disabled: ["fleksibel"] },
];

function buildInitialPrinsip(): PrinsipRow[] {
  return RAW_PRINSIP.map((r, idx) => ({
    id: `prinsip-${idx + 1}`,
    label: r.label,
    disabled: r.disabled,
    checked: {
      validitas: false,
      reliable: false,
      fleksibel: false,
      adil: false,
    },
  }));
}

const DIMENSI_COLUMNS = [
  { id: "task_skills", label: "Task Skills" },
  { id: "task_management", label: "Task Management Skills" },
  { id: "contingency_management", label: "Contingency Management Skills" },
  { id: "job_role_environment", label: "Job Role/ Environment Skills" },
  { id: "transfer_skills", label: "Transfer Skills" },
] as const;

type DimensiId = (typeof DIMENSI_COLUMNS)[number]["id"];

export default function Ak06Page() {
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
  const [tanggal, setTanggal] = useState("");

  const [prinsipRows, setPrinsipRows] = useState<PrinsipRow[]>(
    buildInitialPrinsip,
  );
  const [rekomendasiPrinsip, setRekomendasiPrinsip] = useState("");

  const [dimensiValues, setDimensiValues] = useState<Record<DimensiId, string>>({
    task_skills: "",
    task_management: "",
    contingency_management: "",
    job_role_environment: "",
    transfer_skills: "",
  });
  const [rekomendasiDimensi, setRekomendasiDimensi] = useState("");

  const [namaLeadAsesor, setNamaLeadAsesor] = useState("");
  const [ttdTanggal, setTtdTanggal] = useState<string | null>(null);
  const [komentar, setKomentar] = useState("");

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const togglePrinsip = (rowId: string, colId: PrinsipId) => {
    setPrinsipRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, checked: { ...r.checked, [colId]: !r.checked[colId] } }
          : r,
      ),
    );
  };

  const updateDimensi = (colId: DimensiId, value: string) => {
    setDimensiValues((prev) => ({ ...prev, [colId]: value }));
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

        {/* Penjelasan */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">
            Penjelasan
          </div>
          <ol className="list-decimal list-inside pl-4 pr-4 py-3 space-y-1.5">
            {PENJELASAN.map((teks, idx) => (
              <li key={idx} className="text-sm text-gray-700 leading-snug">
                {teks}
              </li>
            ))}
          </ol>
        </div>

        {/* Kesesuaian dengan Prinsip Asesmen */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-64" />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th
                  rowSpan={2}
                  className="px-4 py-2.5 border border-gray-200 align-middle bg-gray-50"
                >
                  Aspek yang ditinjau
                </th>
                <th
                  colSpan={4}
                  className="px-3 py-2.5 border border-gray-200 bg-gray-50"
                >
                  Kesesuaian dengan prinsip asesmen
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                {PRINSIP_COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    className="px-2 py-2.5 border border-gray-200 bg-gray-50"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-2.5 border border-gray-200 font-semibold text-gray-700"
                >
                  Prosedur asesmen:
                </td>
              </tr>
              {prinsipRows.map((row) => (
                <tr key={row.id}>
                  <td className="pl-8 pr-4 py-3 border border-gray-200 text-gray-700">
                    {row.label}
                  </td>
                  {PRINSIP_COLUMNS.map((col) =>
                    row.disabled.includes(col.id) ? (
                      <td
                        key={col.id}
                        className="border border-gray-200 bg-black"
                      />
                    ) : (
                      <td
                        key={col.id}
                        className="px-2 py-3 border border-gray-200 text-center"
                      >
                        <input
                          type="checkbox"
                          checked={row.checked[col.id]}
                          disabled={!isEditing}
                          onChange={() => togglePrinsip(row.id, col.id)}
                          className={`${checkboxClass} mx-auto`}
                        />
                      </td>
                    ),
                  )}
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="align-top px-4 py-3 border border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">
                    Rekomendasi untuk peningkatan
                  </p>
                  <EditableText
                    value={rekomendasiPrinsip}
                    onChange={setRekomendasiPrinsip}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={4}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pemenuhan Dimensi Kompetensi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-52" />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th
                  rowSpan={2}
                  className="px-4 py-2.5 border border-gray-200 align-middle bg-gray-50"
                >
                  Aspek yang ditinjau
                </th>
                <th
                  colSpan={5}
                  className="px-3 py-2.5 border border-gray-200 bg-gray-50"
                >
                  Pemenuhan dimensi kompetensi
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                {DIMENSI_COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    className="px-2 py-2.5 border border-gray-200 bg-gray-50"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200">
                  <p className="font-semibold text-gray-700">
                    Konsistensi keputusan asesmen
                  </p>
                  <p className="mt-1 text-xs text-gray-500 leading-snug">
                    Bukti dari berbagai asesmen diperiksa untuk konsistensi
                    dimensi kompetensi
                  </p>
                </td>
                {DIMENSI_COLUMNS.map((col) => (
                  <td key={col.id} className="px-2 py-3 border border-gray-200">
                    <EditableText
                      value={dimensiValues[col.id]}
                      onChange={(v) => updateDimensi(col.id, v)}
                      isEditing={isEditing}
                      className="text-xs text-gray-700"
                      rows={3}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  colSpan={6}
                  className="align-top px-4 py-3 border border-gray-200"
                >
                  <p className="text-sm text-gray-700 mb-2">
                    Rekomendasi untuk peningkatan
                  </p>
                  <EditableText
                    value={rekomendasiDimensi}
                    onChange={setRekomendasiDimensi}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={4}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Nama / Tanggal Tanda Tangan / Komentar */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-1/3" />
              <col className="w-1/3" />
              <col className="w-1/3" />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50 text-left">
                  Nama
                  <br />
                  Lead Asesor/Asesor
                </th>
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50 text-left">
                  Tanggal dan Tanda Tangan
                </th>
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50 text-left">
                  Komentar
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="align-top px-3 py-3 border border-gray-200">
                  <EditableText
                    value={namaLeadAsesor}
                    onChange={setNamaLeadAsesor}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={4}
                  />
                </td>
                <td className="align-top px-3 py-3 border border-gray-200">
                  <SignatureBox
                    value={ttdTanggal}
                    onChange={setTtdTanggal}
                    isEditing={isEditing}
                    inputId="lead-asesor-ttd-upload"
                  />
                </td>
                <td className="align-top px-3 py-3 border border-gray-200">
                  <EditableText
                    value={komentar}
                    onChange={setKomentar}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={4}
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
