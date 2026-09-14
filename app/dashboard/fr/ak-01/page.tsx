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

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

function toggleById<T extends { id: string }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  id: string,
  patch: Partial<T>,
) {
  setter((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
}

const initialBukti: CheckItem[] = [
  { id: "portofolio", checked: false, label: "Hasil Verifikasi Portofolio" },
  { id: "observasi", checked: false, label: "Hasil Observasi Langsung" },
  { id: "tanya-lisan", checked: false, label: "Hasil Pertanyaan Lisan" },
  { id: "lainnya", checked: false, label: "Lainnya" },
  { id: "reviu-produk", checked: false, label: "Hasil Reviu Produk" },
  { id: "kegiatan-terstruktur", checked: false, label: "Hasil Kegiatan Terstruktur" },
  { id: "tanya-tertulis", checked: false, label: "Hasil Pertanyaan Tertulis" },
  { id: "wawancara", checked: false, label: "Hasil Pertanyaan Wawancara" },
];

export default function Ak01Page() {
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

  const [buktiItems, setBuktiItems] = useState<CheckItem[]>(initialBukti);
  const [lainnyaTeks, setLainnyaTeks] = useState("");

  const [hariTanggal, setHariTanggal] = useState("");
  const [waktu, setWaktu] = useState("");
  const [tukPelaksanaan, setTukPelaksanaan] = useState("");

  const [pernyataanAsesi1, setPernyataanAsesi1] = useState(
    "Bahwa saya telah mendapatkan penjelasan terkait hak dan prosedur banding asesmen dari asesor.",
  );
  const [pernyataanAsesor, setPernyataanAsesor] = useState(
    "Menyatakan tidak akan membuka hasil pekerjaan yang saya peroleh karena penugasan saya sebagai Asesor dalam pekerjaan Asesmen kepada siapapun atau organisasi apapun selain kepada pihak yang berwenang sehubungan dengan kewajiban saya sebagai Asesor yang ditugaskan oleh LSP.",
  );
  const [pernyataanAsesi2, setPernyataanAsesi2] = useState(
    "Saya setuju mengikuti asesmen dengan pemahaman bahwa informasi yang dikumpulkan hanya digunakan  untuk pengembangan profesional dan hanya dapat diakses oleh orang tertentu saja.",
  );

  const [ttdAsesor, setTtdAsesor] = useState<string | null>(null);
  const [tanggalAsesor, setTanggalAsesor] = useState("");
  const [ttdAsesi, setTtdAsesi] = useState<string | null>(null);
  const [tanggalAsesi, setTanggalAsesi] = useState("");

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-2">
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-3 border border-gray-200 text-gray-700"
                >
                  Persetujuan Asesmen ini untuk menjamin bahwa Asesi telah
                  diberi arahan secara rinci tentang perencanaan dan proses
                  asesmen
                </td>
              </tr>
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
                  className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-600"
                >
                  Bukti yang akan dikumpulkan
                </td>
                <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                  :
                </td>
                <td className="px-3 py-3 border border-gray-200">
                  <div className="grid grid-cols-2 grid-rows-4 grid-flow-col gap-x-8 gap-y-2">
                    {buktiItems.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 text-sm text-gray-700 ${
                          isEditing ? "cursor-pointer" : "cursor-default"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          disabled={!isEditing}
                          onChange={() =>
                            toggleById(setBuktiItems, item.id, {
                              checked: !item.checked,
                            })
                          }
                          className={checkboxClass}
                        />
                        {item.label}
                        {item.id === "lainnya" && (
                          <input
                            type="text"
                            value={lainnyaTeks}
                            onChange={(e) => setLainnyaTeks(e.target.value)}
                            disabled={!isEditing}
                            placeholder="......"
                            className="flex-1 min-w-0 px-2 py-1 text-xs text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={2}
                  className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-600"
                >
                  Pelaksanaan asesmen disepakati pada
                </td>
                <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                  :
                </td>
                <td className="p-0 border border-gray-200">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      <tr>
                        <td className="w-32 px-4 py-3 border border-gray-200 text-gray-600">
                          Hari/Tanggal
                        </td>
                        <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">
                          :
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input
                            type="text"
                            value={hariTanggal}
                            onChange={(e) => setHariTanggal(e.target.value)}
                            disabled={!isEditing}
                            className={inputClass}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border border-gray-200 text-gray-600">
                          Waktu
                        </td>
                        <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                          :
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input
                            type="text"
                            value={waktu}
                            onChange={(e) => setWaktu(e.target.value)}
                            disabled={!isEditing}
                            className={inputClass}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border border-gray-200 text-gray-600">
                          TUK
                        </td>
                        <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">
                          :
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input
                            type="text"
                            value={tukPelaksanaan}
                            onChange={(e) => setTukPelaksanaan(e.target.value)}
                            disabled={!isEditing}
                            className={inputClass}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-3 border border-gray-200">
                  <p className="font-bold text-gray-800 mb-1">Asesi:</p>
                  <EditableText
                    value={pernyataanAsesi1}
                    onChange={setPernyataanAsesi1}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={2}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-3 border border-gray-200">
                  <p className="font-bold text-gray-800 mb-1">Asesor:</p>
                  <EditableText
                    value={pernyataanAsesor}
                    onChange={setPernyataanAsesor}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={3}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-3 border border-gray-200">
                  <p className="font-bold text-gray-800 mb-1">Asesi:</p>
                  <EditableText
                    value={pernyataanAsesi2}
                    onChange={setPernyataanAsesi2}
                    isEditing={isEditing}
                    className="text-sm text-gray-700"
                    rows={3}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="align-top px-4 py-3 border border-gray-200">
                  <p className="text-gray-700 mb-2">Tanda tangan Asesor :</p>
                  <SignatureBox
                    value={ttdAsesor}
                    onChange={setTtdAsesor}
                    isEditing={isEditing}
                    inputId="asesor-ttd-upload"
                  />
                </td>
                <td colSpan={2} className="align-top px-4 py-3 border border-gray-200">
                  <p className="text-gray-700 mb-2">Tanggal :</p>
                  <input
                    type="text"
                    value={tanggalAsesor}
                    onChange={(e) => setTanggalAsesor(e.target.value)}
                    disabled={!isEditing}
                    className={inputClass}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="align-top px-4 py-3 border border-gray-200">
                  <p className="text-gray-700 mb-2">Tanda tangan Asesi :</p>
                  <SignatureBox
                    value={ttdAsesi}
                    onChange={setTtdAsesi}
                    isEditing={isEditing}
                    inputId="asesi-ttd-upload"
                  />
                </td>
                <td colSpan={2} className="align-top px-4 py-3 border border-gray-200">
                  <p className="text-gray-700 mb-2">Tanggal :</p>
                  <input
                    type="text"
                    value={tanggalAsesi}
                    onChange={(e) => setTanggalAsesi(e.target.value)}
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
