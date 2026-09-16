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

interface PertanyaanRow {
  id: string;
  pertanyaan: string;
  jawaban: "ya" | "tidak" | null;
}

const PANDUAN_ASESOR = [
  "Verifikasi pihak ketiga dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.",
  "Tentukan pihak ketiga yang akan dimintai verifikasi.",
  "Ajukan pertanyaan kepada pihak ketiga.",
  "Berikan penilaian kepada asesi berdasarkan verifikasi pihak ketiga.",
  "Pertanyaan/pernyataan dapat dikembangkan sesuai dengan konteks pekerjaan dan relasi.",
];

const RAW_PERTANYAAN: string[] = [
  "Apakah asesi bekerja dengan mempertimbangkan Kesehatan, Keamanan dan Keselamatan Kerja?",
  "Apakah asesi berinteraksi dengan harmonis didalam kelompoknya?",
  "Apakah asesi dapat mengelola tugas-tugas secara bersamaan?",
  "Apakah asesi dapat dengan cepat beradaptasi dengan peralatan dan lingkungan yang baru?",
  "Apakah asesi dapat merespon dengan cepat masalah-masalah yang ada di tempat kerjanya?",
  "Apakah Anda bersedia dihubungi jika verifikasi lebih lanjut dari pernyataan ini diperlukan?",
];

function buildInitialPertanyaan(): PertanyaanRow[] {
  return RAW_PERTANYAAN.map((teks, idx) => ({
    id: `pertanyaan-${idx + 1}`,
    pertanyaan: teks,
    jawaban: null,
  }));
}

const CITATION =
  "Diadopsi dari tempat yang disediakan di Depratemen Pendidikan dan Pelatihan, Australia. Merancang alat asesmen untuk hasil yang berkualitas di VET.2008";

export default function Ia10Page() {
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

  const [namaPengawas, setNamaPengawas] = useState("");
  const [tempatKerja, setTempatKerja] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telepon, setTelepon] = useState("");

  const [pertanyaanRows, setPertanyaanRows] = useState<PertanyaanRow[]>(
    buildInitialPertanyaan,
  );

  const [hubunganAsesi, setHubunganAsesi] = useState("");
  const [lamaBekerja, setLamaBekerja] = useState("");
  const [kedekatanArea, setKedekatanArea] = useState("");
  const [pengalamanTeknis, setPengalamanTeknis] = useState("");

  const [keyakinanStandar, setKeyakinanStandar] = useState("");
  const [kebutuhanPelatihan, setKebutuhanPelatihan] = useState("");
  const [komentarLain, setKomentarLain] = useState("");

  const [ttdAsesorAkhir, setTtdAsesorAkhir] = useState<string | null>(null);
  const [tanggalTtdAkhir, setTanggalTtdAkhir] = useState("");

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const setJawaban = (id: string, value: "ya" | "tidak") => {
    setPertanyaanRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, jawaban: r.jawaban === value ? null : value }
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

        <p className="text-sm italic text-gray-700 text-right">
          Informasi Rahasia
        </p>

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

        {/* Nama Pengawas */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-3 border border-gray-200 font-semibold text-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">
                      Nama Pengawas/Penyelia/Atasan/Orang lain di Perusahaan:
                    </span>
                    <input
                      type="text"
                      value={namaPengawas}
                      onChange={(e) => setNamaPengawas(e.target.value)}
                      disabled={!isEditing}
                      className={`${inputClass} font-normal`}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="w-48 px-4 py-3 border border-gray-200 text-gray-600">
                  Tempat Kerja
                </td>
                <td className="px-3 py-2 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">:</span>
                    <input
                      type="text"
                      value={tempatKerja}
                      onChange={(e) => setTempatKerja(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border border-gray-200 text-gray-600">
                  Alamat
                </td>
                <td className="px-3 py-2 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">:</span>
                    <input
                      type="text"
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border border-gray-200 text-gray-600">
                  Telepon
                </td>
                <td className="px-3 py-2 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">:</span>
                    <input
                      type="text"
                      value={telepon}
                      onChange={(e) => setTelepon(e.target.value)}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pertanyaan Ya/Tidak */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col />
              <col className="w-20" />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50">
                  Pertanyaan
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
              {pertanyaanRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5 border border-gray-200">
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="shrink-0">&#8226;</span>
                      <span>{row.pertanyaan}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.jawaban === "ya"}
                      disabled={!isEditing}
                      onChange={() => setJawaban(row.id, "ya")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                  <td className="px-2 py-2.5 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.jawaban === "tidak"}
                      disabled={!isEditing}
                      onChange={() => setJawaban(row.id, "tidak")}
                      className={`${checkboxClass} mx-auto`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pertanyaan hubungan dengan asesi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-96" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Apa hubungan Anda dengan asesi?
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={hubunganAsesi}
                    onChange={setHubunganAsesi}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={1}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Berapa lama Anda bekerja dengan asesi?
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={lamaBekerja}
                    onChange={setLamaBekerja}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={1}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Seberapa dekat Anda bekerja dengan asesi di area yang
                  dinilai?
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={kedekatanArea}
                    onChange={setKedekatanArea}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={1}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Apa pengalaman teknis dan/atau kualifikasi Anda di bidang
                  yang dinilai? (termasuk asesmen atau kualifikasi pelatihan)
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={pengalamanTeknis}
                    onChange={setPengalamanTeknis}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={2}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Keyakinan standar & rekomendasi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-96" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Secara keseluruhan, apakah Anda yakin asesi melakukan sesuai
                  standar yang diminta oleh unit kompetensi secara konsisten?
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={keyakinanStandar}
                    onChange={setKeyakinanStandar}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={2}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Identifikasi kebutuhan pelatihan lebih lanjut untuk asesi:
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={kebutuhanPelatihan}
                    onChange={setKebutuhanPelatihan}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={2}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Ada komentar lain:
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={komentarLain}
                    onChange={setKomentarLain}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={2}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-1/2 align-top px-4 py-3 border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-2">
                    Tanda Tangan Asesor:
                  </p>
                  <SignatureBox
                    value={ttdAsesorAkhir}
                    onChange={setTtdAsesorAkhir}
                    isEditing={isEditing}
                    inputId="asesor-ttd-upload"
                  />
                </td>
                <td className="w-1/2 align-top px-4 py-3 border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-2">
                    Tanggal:
                  </p>
                  <input
                    type="text"
                    value={tanggalTtdAkhir}
                    onChange={(e) => setTanggalTtdAkhir(e.target.value)}
                    disabled={!isEditing}
                    className={inputClass}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs italic text-gray-500">{CITATION}</p>
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
