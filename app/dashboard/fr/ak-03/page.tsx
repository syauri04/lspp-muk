"use client";

import { useState } from "react";
import { Check, Pencil, Save } from "lucide-react";

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

interface KomponenRow {
  id: string;
  komponen: string;
  hasil: "ya" | "tidak" | null;
  catatan: string;
}

const RAW_KOMPONEN: string[] = [
  "Saya mendapatkan penjelasan yang cukup memadai mengenai  proses asesmen/uji kompetensi",
  "Saya diberikan kesempatan untuk mempelajari standar kompetensi yang akan diujikan dan menilai diri sendiri terhadap pencapaiannya",
  "Asesor memberikan kesempatan untuk mendiskusikan/menegosiasikan metoda, instrumen dan sumber  asesmen serta jadwal asesmen",
  "Asesor berusaha menggali seluruh bukti pendukung yang sesuai  dengan latar belakang pelatihan dan pengalaman yang saya miliki",
  "Saya sepenuhnya diberikan kesempatan untuk mendemonstrasikan kompetensi yang saya miliki selama asesmen",
  "Saya mendapatkan penjelasan yang memadai mengenai keputusan asesmen",
  "Asesor memberikan umpan balik yang mendukung setelah asesmen serta tindak lanjutnya",
  "Asesor bersama saya mempelajari semua dokumen asesmen  serta menandatanganinya",
  "Asesor menggunakan keterampilan komunikasi yang efektif selama asesmen",
];

function buildInitialKomponen(): KomponenRow[] {
  return RAW_KOMPONEN.map((komponen, idx) => ({
    id: `komponen-${idx + 1}`,
    komponen,
    hasil: null,
    catatan: "",
  }));
}

export default function Ak03Page() {
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
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [komponenRows, setKomponenRows] =
    useState<KomponenRow[]>(buildInitialKomponen);

  const [catatanLainnya, setCatatanLainnya] = useState("");

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const setHasil = (id: string, value: "ya" | "tidak") => {
    setKomponenRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, hasil: r.hasil === value ? null : value } : r,
      ),
    );
  };

  const updateCatatan = (id: string, value: string) => {
    setKomponenRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, catatan: value } : r)),
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
                    colSpan={3}
                    className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-600"
                  >
                    Tanggal
                  </td>
                  <td className="p-0 border border-gray-200">
                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        <tr>
                          <td className="w-24 px-4 py-3 border border-gray-200 text-gray-600">
                            Mulai
                          </td>
                          <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">
                            :
                          </td>
                          <td className="px-3 py-2 border border-gray-200">
                            <input
                              type="text"
                              value={tanggalMulai}
                              onChange={(e) => setTanggalMulai(e.target.value)}
                              disabled={!isEditing}
                              className={inputClass}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 border border-gray-200 text-gray-600">
                            Selesai
                          </td>
                          <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                            :
                          </td>
                          <td className="px-3 py-2 border border-gray-200">
                            <input
                              type="text"
                              value={tanggalSelesai}
                              onChange={(e) =>
                                setTanggalSelesai(e.target.value)
                              }
                              disabled={!isEditing}
                              className={inputClass}
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
          <p className="text-xs italic text-gray-500 px-1">
            *coret yang tidak perlu
          </p>
        </div>

        <p className="text-sm italic text-gray-600">
          Umpan balik dari Asesi (diisi oleh Asesi setelah pengambilan
          keputusan):
        </p>

        {/* Tabel Komponen */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col />
              <col className="w-30" />
              <col className="w-30" />
              <col className="w-80" />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th
                  rowSpan={2}
                  className="px-4 py-2.5 border border-gray-200 align-middle bg-gray-50"
                >
                  Komponen
                </th>
                <th
                  colSpan={2}
                  className="px-2 py-2.5 border border-gray-200 bg-gray-50"
                >
                  Hasil
                </th>
                <th
                  rowSpan={2}
                  className="px-4 py-2.5 border border-gray-200 align-middle bg-gray-50"
                >
                  Catatan/Komentar Asesi
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
              {komponenRows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-3 border border-gray-200">
                    <EditableText
                      value={row.komponen}
                      onChange={(v) =>
                        setKomponenRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id ? { ...r, komponen: v } : r,
                          ),
                        )
                      }
                      isEditing={isEditing}
                      className="text-sm text-gray-700"
                      rows={3}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.hasil === "ya"}
                      disabled={!isEditing}
                      onChange={() => setHasil(row.id, "ya")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.hasil === "tidak"}
                      disabled={!isEditing}
                      onChange={() => setHasil(row.id, "tidak")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-200">
                    <EditableText
                      value={row.catatan}
                      onChange={(v) => updateCatatan(row.id, v)}
                      isEditing={isEditing}
                      className="text-sm text-gray-700"
                      rows={3}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={4}
                  className="align-top px-4 py-3 border border-gray-200"
                >
                  <p className="text-sm text-gray-700 mb-2">
                    Catatan/komentar lainnya (apabila ada) :
                  </p>
                  <EditableText
                    value={catatanLainnya}
                    onChange={setCatatanLainnya}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={6}
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
