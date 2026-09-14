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

interface Pertanyaan {
  id: string;
  label: string;
  jawaban: "ya" | "tidak" | null;
}

const initialPertanyaan: Pertanyaan[] = [
  {
    id: "q1",
    label: "Apakah Proses Banding telah dijelaskan kepada anda?",
    jawaban: null,
  },
  {
    id: "q2",
    label: "Apakah Anda telah mendiskusikan Banding dengan Asesor?",
    jawaban: null,
  },
  {
    id: "q3",
    label:
      'Apakah Anda mau melibatkan "orang lain" membantu Anda dalam Proses Banding?',
    jawaban: null,
  },
];

export default function Ak04Page() {
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [namaAsesi, setNamaAsesi] = useState("");
  const [nomor, setNomor] = useState("");
  const [tanggalAsesmen, setTanggalAsesmen] = useState("");

  const [pertanyaanList, setPertanyaanList] =
    useState<Pertanyaan[]>(initialPertanyaan);

  const [skemaSertifikasi, setSkemaSertifikasi] = useState("");
  const [noSkemaSertifikasi, setNoSkemaSertifikasi] = useState("");
  const [alasanBanding, setAlasanBanding] = useState("");

  const [ttdAsesi, setTtdAsesi] = useState<string | null>(null);
  const [tanggalTtd, setTanggalTtd] = useState("");

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const setJawaban = (id: string, jawaban: "ya" | "tidak") => {
    setPertanyaanList((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, jawaban: q.jawaban === jawaban ? null : jawaban }
          : q,
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

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs">
        <div className="border border-gray-200 divide-y divide-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="w-40 shrink-0 font-semibold text-gray-700">
              Nama Asesi
            </span>
            <span className="text-gray-400">:</span>
            <input
              type="text"
              value={namaAsesi}
              onChange={(e) => setNamaAsesi(e.target.value)}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="w-40 shrink-0 font-semibold text-gray-700">
              Nomor
            </span>
            <span className="text-gray-400">:</span>
            <input
              type="text"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="w-40 shrink-0 font-semibold text-gray-700">
              Tanggal Asesmen
            </span>
            <span className="text-gray-400">:</span>
            <input
              type="text"
              value={tanggalAsesmen}
              onChange={(e) => setTanggalAsesmen(e.target.value)}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-[1fr_80px_96px]">
            <div className="px-4 py-3 font-bold text-gray-800 border-r border-gray-200">
              Jawablah dengan Ya atau Tidak pertanyaan-pertanyaan berikut ini:
            </div>
            <div className="px-4 py-3 font-bold text-gray-800 text-center border-r border-gray-200">
              YA
            </div>
            <div className="px-4 py-3 font-bold text-gray-800 text-center">
              TIDAK
            </div>
          </div>

          {pertanyaanList.map((q) => (
            <div key={q.id} className="grid grid-cols-[1fr_80px_96px]">
              <div className="px-4 py-3 text-gray-700 border-r border-gray-200">
                {q.label}
              </div>
              <div className="px-4 py-3 flex items-center justify-center border-r border-gray-200">
                <input
                  type="checkbox"
                  checked={q.jawaban === "ya"}
                  disabled={!isEditing}
                  onChange={() => setJawaban(q.id, "ya")}
                  className={checkboxClass}
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={q.jawaban === "tidak"}
                  disabled={!isEditing}
                  onChange={() => setJawaban(q.id, "tidak")}
                  className={checkboxClass}
                />
              </div>
            </div>
          ))}

          <div className="px-4 py-3 space-y-2.5">
            <p className="text-gray-700">
              Banding ini diajukan atas Keputusan Asesmen yang dibuat terhadap
              Skema Sertifikasi (Kualifikasi/Klaster/Okupasi) berikut:
            </p>
            <div className="flex items-center gap-3">
              <span className="w-52 shrink-0 text-gray-600">
                Skema Sertifikasi
              </span>
              <span className="text-gray-400">:</span>
              <input
                type="text"
                value={skemaSertifikasi}
                onChange={(e) => setSkemaSertifikasi(e.target.value)}
                disabled={!isEditing}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-52 shrink-0 text-gray-600">
                No. Skema Sertifikasi
              </span>
              <span className="text-gray-400">:</span>
              <input
                type="text"
                value={noSkemaSertifikasi}
                onChange={(e) => setNoSkemaSertifikasi(e.target.value)}
                disabled={!isEditing}
                className={inputClass}
              />
            </div>
          </div>

          <div className="px-4 py-3 space-y-2">
            <p className="text-gray-700">
              Banding ini diajukan atas alasan sebagai berikut:
            </p>
            <EditableText
              value={alasanBanding}
              onChange={setAlasanBanding}
              isEditing={isEditing}
              className="text-sm text-gray-700"
              rows={4}
            />
          </div>

          <div className="px-4 py-3 text-sm text-gray-600 italic">
            Anda mempunyai hak mengajukan banding jika Anda menilai Proses
            Asesmen tidak sesuai SOP dan tidak memenuhi Prinsip Asesmen.
          </div>

          <div className="grid grid-cols-2">
            <div className="px-4 py-4 space-y-3 border-r border-gray-200">
              <p className="text-gray-700">Tanda Tangan Asesi:</p>
              <SignatureBox
                value={ttdAsesi}
                onChange={setTtdAsesi}
                isEditing={isEditing}
                inputId="asesi-ttd-upload"
              />
            </div>
            <div className="px-4 py-4 space-y-3">
              <p className="text-gray-700">Tanggal:</p>
              <input
                type="text"
                value={tanggalTtd}
                onChange={(e) => setTanggalTtd(e.target.value)}
                disabled={!isEditing}
                className={inputClass}
              />
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
