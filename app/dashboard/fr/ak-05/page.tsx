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

interface AsesiRow {
  id: string;
  no: number;
  namaAsesi: string;
  rekomendasi: "k" | "bk" | null;
  keterangan: string;
}

function buildInitialAsesi(): AsesiRow[] {
  return Array.from({ length: 4 }, (_, idx) => ({
    id: `asesi-${idx + 1}`,
    no: idx + 1,
    namaAsesi: "",
    rekomendasi: null,
    keterangan: "",
  }));
}

export default function Ak05Page() {
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

  const [asesiRows, setAsesiRows] = useState<AsesiRow[]>(buildInitialAsesi);

  const [aspekNegatifPositif, setAspekNegatifPositif] = useState("");
  const [penolakanHasil, setPenolakanHasil] = useState("");
  const [saranPerbaikan, setSaranPerbaikan] = useState("");

  const [catatan, setCatatan] = useState("");
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

  const updateNamaAsesi = (id: string, value: string) => {
    setAsesiRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, namaAsesi: value } : r)),
    );
  };

  const setRekomendasi = (id: string, value: "k" | "bk") => {
    setAsesiRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, rekomendasi: r.rekomendasi === value ? null : value }
          : r,
      ),
    );
  };

  const updateKeterangan = (id: string, value: string) => {
    setAsesiRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, keterangan: value } : r)),
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

        {/* Tabel Rekomendasi Asesi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-14" />
              <col className="w-64" />
              <col className="w-14" />
              <col className="w-14" />
              <col />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th
                  rowSpan={2}
                  className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50"
                >
                  No.
                </th>
                <th
                  rowSpan={2}
                  className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50"
                >
                  Nama Asesi
                </th>
                <th
                  colSpan={2}
                  className="px-2 py-2.5 border border-gray-200 bg-gray-50"
                >
                  Rekomendasi
                </th>
                <th
                  rowSpan={2}
                  className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50"
                >
                  Keterangan**
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  K
                </th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                  BK
                </th>
              </tr>
            </thead>
            <tbody>
              {asesiRows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-3 py-3 border border-gray-200 text-center text-gray-600">
                    {row.no}.
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <EditableText
                      value={row.namaAsesi}
                      onChange={(v) => updateNamaAsesi(row.id, v)}
                      isEditing={isEditing}
                      className="text-sm text-gray-700"
                      rows={1}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.rekomendasi === "k"}
                      disabled={!isEditing}
                      onChange={() => setRekomendasi(row.id, "k")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.rekomendasi === "bk"}
                      disabled={!isEditing}
                      onChange={() => setRekomendasi(row.id, "bk")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <EditableText
                      value={row.keterangan}
                      onChange={(v) => updateKeterangan(row.id, v)}
                      isEditing={isEditing}
                      className="text-sm text-gray-700"
                      rows={2}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 px-1 -mt-4">
          ** tuliskan Kode dan Judul Unit Kompetensi yang dinyatakan BK bila
          mengases satu skema
        </p>

        {/* Aspek/Pencatatan/Saran */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-64 px-4 py-3 border border-gray-200 text-gray-700">
                  Aspek Negatif dan Positif dalam Asesemen
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={aspekNegatifPositif}
                    onChange={setAspekNegatifPositif}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={1}
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border border-gray-200 text-gray-700">
                  Pencatatan Penolakan Hasil Asesmen
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={penolakanHasil}
                    onChange={setPenolakanHasil}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={1}
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border border-gray-200 text-gray-700">
                  Saran Perbaikan: (Asesor/Personil Terkait)
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={saranPerbaikan}
                    onChange={setSaranPerbaikan}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={1}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Catatan & Asesor */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-1/2 align-top px-4 py-3 border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-2">
                    Catatan:
                  </p>
                  <EditableText
                    value={catatan}
                    onChange={setCatatan}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={8}
                  />
                </td>
                <td className="w-1/2 align-top p-0 border border-gray-200">
                  <table className="w-full h-full border-collapse text-sm">
                    <tbody>
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50"
                        >
                          Asesor:
                        </td>
                      </tr>
                      <tr>
                        <td className="w-24 px-4 py-3 border border-gray-200 text-gray-600">
                          Nama
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input
                            type="text"
                            value={namaAsesorBawah}
                            onChange={(e) =>
                              setNamaAsesorBawah(e.target.value)
                            }
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
