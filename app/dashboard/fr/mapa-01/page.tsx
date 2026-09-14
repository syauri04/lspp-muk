"use client";

import { useState } from "react";
import { Check, Pencil, Save, Smile, Meh, Frown, Plus, X } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

const compactInputClass =
  "w-full px-2 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400";

const checkboxClass =
  "w-4 h-4 border-gray-300 text-[#8AA53C] focus:ring-[#8AA53C]/40 cursor-pointer disabled:cursor-default shrink-0";

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

type Emoji = "senang" | "netral" | "sedih";

interface HubunganItem {
  id: string;
  label: string;
  checked: boolean;
  emoji: Emoji | null;
}

interface StandarItem {
  id: string;
  marker: string;
  teks: string;
}

interface UnitRow {
  id: string;
  no: number;
  kodeUnit: string;
  judulUnit: string;
}

interface KonfirmasiOrangRow {
  id: string;
  orang: string;
  nama: string;
  ttd: string | null;
}

interface PenyusunRow {
  id: string;
  status: "Penyusun" | "Validator";
  no: number;
  nama: string;
  nomorMet: string;
  ttd: string | null;
}

interface AssessmentRow {
  id: string;
  no: number;
  unitKompetensi: string;
  buktiBukti: string;
  jenisBukti: { l: string; tl: string; t: string };
  observasiLangsung: string;
  kegiatanTerstruktur: string;
  tanyaJawab: string;
  verifikasiPortofolio: string;
  reviuProduk: string;
  verifikasiPihakKetiga: string;
}

function toggleById<T extends { id: string }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  id: string,
  patch: Partial<T>,
) {
  setter((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
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

function CheckboxLine({
  checked,
  onToggle,
  label,
  onLabelChange,
  isEditing,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  onLabelChange: (v: string) => void;
  isEditing: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <input
        type="checkbox"
        checked={checked}
        disabled={!isEditing}
        onChange={onToggle}
        className={`${checkboxClass} mt-1`}
      />
      <EditableText
        value={label}
        onChange={onLabelChange}
        isEditing={isEditing}
        className="text-sm text-gray-700 leading-snug min-w-0"
        rows={label.length > 90 ? 2 : 1}
      />
    </div>
  );
}

function EmojiPicker({
  value,
  onChange,
  isEditing,
}: {
  value: Emoji | null;
  onChange: (e: Emoji) => void;
  isEditing: boolean;
}) {
  const options: { key: Emoji; Icon: typeof Smile }[] = [
    { key: "senang", Icon: Smile },
    { key: "netral", Icon: Meh },
    { key: "sedih", Icon: Frown },
  ];
  return (
    <div className="flex items-center gap-1 shrink-0 flex-none">
      {options.map(({ key, Icon }) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            disabled={!isEditing}
            onClick={() => onChange(key)}
            aria-label={key}
            className={`flex items-center justify-center rounded-full p-0.5 transition-all ${
              isEditing ? "cursor-pointer hover:bg-gray-100" : "cursor-default"
            }`}
          >
            <Icon
              size={22}
              strokeWidth={2}
              className="text-gray-900"
              fill={selected ? "#F5C542" : "none"}
            />
          </button>
        );
      })}
    </div>
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

function AdaTidakAdaToggle({
  ada,
  onChange,
  isEditing,
  suffix,
}: {
  ada: boolean | null;
  onChange: (v: boolean) => void;
  isEditing: boolean;
  suffix: string;
}) {
  return (
    <p className="text-sm text-gray-700">
      <button
        type="button"
        disabled={!isEditing}
        onClick={() => onChange(true)}
        className={
          ada === true
            ? "font-bold text-gray-800"
            : ada === false
              ? "line-through text-gray-400"
              : "text-gray-700"
        }
      >
        Ada
      </button>
      /
      <button
        type="button"
        disabled={!isEditing}
        onClick={() => onChange(false)}
        className={
          ada === false
            ? "font-bold text-gray-800"
            : ada === true
              ? "line-through text-gray-400"
              : "text-gray-700"
        }
      >
        tidak ada
      </button>
      <span className="text-gray-400">*</span> {suffix}
    </p>
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

const initialAsesi: CheckItem[] = [
  {
    id: "asesi-1",
    checked: false,
    label:
      "Hasil pelatihan dan/atau pendidikan, dimana kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi.",
  },
  {
    id: "asesi-2",
    checked: false,
    label:
      "Hasil pelatihan dan/atau pendidikan, dimana kurikulum belum berbasis kompetensi.",
  },
  {
    id: "asesi-3",
    checked: false,
    label:
      "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi.",
  },
  {
    id: "asesi-4",
    checked: false,
    label:
      "Pekerja berpengalaman, dimana beraasal dari industri/tempat kerja yang dalam operasionalnya belum berbasis kompetensi.",
  },
  {
    id: "asesi-5",
    checked: false,
    label: "Pelatihan/belajar mandiri atau otodidak.",
  },
];

const initialTujuan: CheckItem[] = [
  { id: "tujuan-1", checked: false, label: "Sertifikasi" },
  { id: "tujuan-2", checked: false, label: "Sertifikasi Ulang" },
  {
    id: "tujuan-3",
    checked: false,
    label: "Pengakuan Kompetensi Terkini (PKT)",
  },
  {
    id: "tujuan-4",
    checked: false,
    label: "Rekognisi Pembelajaran Lampau (RPL)",
  },
  { id: "tujuan-5", checked: false, label: "Lainnya" },
];

const initialHubungan: HubunganItem[] = [
  {
    id: "hub-1",
    checked: false,
    emoji: null,
    label: "Bukti untuk mendukung asesmen:",
  },
  {
    id: "hub-2",
    checked: false,
    emoji: null,
    label: "Aktivitas kerja di tempat kerja asesi:",
  },
  { id: "hub-3", checked: false, emoji: null, label: "Kegiatan pembelajaran:" },
];

const initialSiapa: CheckItem[] = [
  {
    id: "siapa-1",
    checked: false,
    label: "Lembaga Sertifikasi Profesi Pariwisata Tiga Puluh Juni",
  },
  { id: "siapa-2", checked: false, label: "Organisasi Pelatihan" },
  { id: "siapa-3", checked: false, label: "Asesor Perusahaan" },
];

const initialKonfirmasi: CheckItem[] = [
  {
    id: "konfirmasi-1",
    checked: false,
    label: "Manajer Sertifikasi LSP Pariwisata Tiga Puluh Juni",
  },
  {
    id: "konfirmasi-2",
    checked: false,
    label: "Master Asesor/Master Trainer/Lead Asesor Kompetensi",
  },
  {
    id: "konfirmasi-3",
    checked: false,
    label:
      "Manajer Pelatihan Lembaga Training terakreditasi/Lembaga Training terdaftar",
  },
  {
    id: "konfirmasi-4",
    checked: false,
    label: "Manajer atau Supervisor di tempat kerja",
  },
];

const initialStandarKompetensi: StandarItem[] = [
  {
    id: "standar-a",
    marker: "1.",
    teks: "Keputusan Menteri Ketenagakerjaan Republik Indonesia Nomor 145 Tahun 2018 tentang Penetapan Standar Kompetensi Kerja Nasional Indonesia Kategori Penyediaan Akomodasi Dan Penyediaan Makan Minum Golongan Pokok Penyediaan Akomodasi Bidang Hotel dan Restoran.",
  },
  {
    id: "standar-1",
    marker: "2.",
    teks: "Keputusan Menteri Ketenagakerjaan Republik Indonesia Nomor 123 Tahun 2024 tentang Penetapan Standar Kompetensi Kerja Nasional Indonesia Kategori Aktivitas Penyewaan dan Sewa Guna Usaha Tanpa Hak Opsi, Ketenagakerjaan, Agen Perjalanan dan Penunjang Usaha Lainnya Golongan Pokok Aktivitas Administrasi Kantor, Aktivitas Penunjang Kantor, Aktivitas Penunjang Usaha Lainnya Bidang Meeting, Incentive, Convention, and Exhibition (MICE).",
  },
];

const initialStandarLainnya: CheckItem[] = [
  {
    id: "standar-lain-1",
    checked: false,
    label: "Kriteria Asesmen dari kurikulum pelatihan",
  },
  {
    id: "standar-lain-2",
    checked: false,
    label: "Spesifikasi kinerja suatu perusahaan atau industri",
  },
  { id: "standar-lain-3", checked: false, label: "Spesifikasi produk" },
  { id: "standar-lain-4", checked: false, label: "Pedoman khusus" },
];

const RAW_UNITS_SECTION2: { kodeUnit: string; judulUnit: string }[] = [
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
    kodeUnit: "I.55HDR00.151.2",
    judulUnit:
      "Mengikuti Prosedur Kesehatan, Keselamatan dan Keamanan di Tempat Kerja",
  },
  {
    kodeUnit: "N.82MIC00.023.1",
    judulUnit: "Melakukan Komunikasi Melalui Elektromik",
  },
  { kodeUnit: "I.55HDR00.153.2", judulUnit: "Memperbaharui Pengetahuan Lokal" },
  {
    kodeUnit: "N.82MIC00.104.2",
    judulUnit:
      "Menetapkan dan Menerapkan Pengetahuan Industri Meeting, Incentive, Convention, & Exhibition (MICE)",
  },
  {
    kodeUnit: "N.82MIC00.100.2",
    judulUnit: "Mengoperasikan Sistem Informasi Online",
  },
  {
    kodeUnit: "N.82MIC00.107.2",
    judulUnit:
      "Mengidentifikasi Bahaya, Menilai dan Mengendalikan Risiko Keselamatan",
  },
  {
    kodeUnit: "I.55HDR00.196.2",
    judulUnit: "Menangani Kualitas Layanan Pelanggan",
  },
  {
    kodeUnit: "N.82MIC00.074.2",
    judulUnit: "Mencari dan Memberikan Informasi",
  },
  {
    kodeUnit: "N.82MIC00.020.1",
    judulUnit:
      "Mengakses Informasi dalam Kegiatan Meeting, Incentive, Convetion, and Exhibition (MICE)",
  },
  { kodeUnit: "N.82MIC00.024.1", judulUnit: "Merekrut Tenaga Kerja" },
  {
    kodeUnit: "N.82MIC00.079.2",
    judulUnit: "Membina Keterampilan Kerja Karyawan",
  },
  { kodeUnit: "N.82MIC00.043.2", judulUnit: "Memimpin dan Mengelola Personel" },
  { kodeUnit: "N.82MIC00.055.2", judulUnit: "Memantau Operasi Kerja" },
  {
    kodeUnit: "N.82MIC00.072.3",
    judulUnit: "Menangani Pekerja Perjanjian Kerja Waktu Tertentu",
  },
  {
    kodeUnit: "N.82MIC00.045.2",
    judulUnit: "Mengembangkan Program Konferensi",
  },
  {
    kodeUnit: "N.82MIC00.112.3",
    judulUnit: "Mengelola Pertunjukan Seni dan Budaya",
  },
  {
    kodeUnit: "N.82MIC00.059.2",
    judulUnit: "Mengembangkan dan Menerapkan Rencana Manajemen Kegiatan",
  },
  {
    kodeUnit: "N.82MIC00.076.2",
    judulUnit: "Mengoordinasikan Kegiatan Pemasaran",
  },
  {
    kodeUnit: "N.82MIC00.048.2",
    judulUnit: "Mendapatkan dan Mengelola Sponsorship",
  },
  { kodeUnit: "N.82MIC00.013.2", judulUnit: "Menentukan Kelayakan Kegiatan" },
  {
    kodeUnit: "N.82MIC00.033.3",
    judulUnit:
      "Mengelola Resiko dalam Bisnis Meeting, Incentive, Convetion, and Exhibition (MICE)",
  },
  {
    kodeUnit: "N.82MIC00.003.3",
    judulUnit: "Mengembangkan Proposal Penawaran (BID)",
  },
  { kodeUnit: "N.82MIC00.067.3", judulUnit: "Mengelola Proyek Kegiatan" },
  { kodeUnit: "N.82MIC00.010.2", judulUnit: "Menyusun dan Memantau Anggaran" },
  {
    kodeUnit: "N.82MIC00.053.2",
    judulUnit: "Mengelola Pendanaan untuk Proyek",
  },
  {
    kodeUnit: "N.82MIC00.025.1",
    judulUnit: "Menggunakan Teknologi dalam Proses Bisnis",
  },
  { kodeUnit: "N.82MIC00.047.2", judulUnit: "Mengelola Konflik" },
];

function buildInitialUnits(): UnitRow[] {
  return RAW_UNITS_SECTION2.map((u, idx) => ({
    id: `unit2-${idx + 1}`,
    no: idx + 1,
    kodeUnit: u.kodeUnit,
    judulUnit: u.judulUnit,
  }));
}

function buildInitialAssessmentRows(): AssessmentRow[] {
  return RAW_UNITS_SECTION2.map((u, idx) => ({
    id: `assessment-${idx + 1}`,
    no: idx + 1,
    unitKompetensi: u.judulUnit,
    buktiBukti: `Hasil Kegiatan Terstruktur dan Tanya Jawab Tentang ${u.judulUnit}`,
    jenisBukti: { l: "L", tl: "", t: "T" },
    observasiLangsung: "",
    kegiatanTerstruktur: "DIT",
    tanyaJawab: "DPT",
    verifikasiPortofolio: "",
    reviuProduk: "",
    verifikasiPihakKetiga: "",
  }));
}

const initialKonfirmasiOrang: KonfirmasiOrangRow[] = [
  {
    id: "konfirmasi-orang-1",
    orang: "Manajer sertifikasi LSP",
    nama: "Dr. Ricardo Indra, M.Si.",
    ttd: null,
  },
  {
    id: "konfirmasi-orang-2",
    orang: "Master Asesor/Master Trainer/Lead Asesor Kompetensi",
    nama: "",
    ttd: null,
  },
  {
    id: "konfirmasi-orang-3",
    orang:
      "Manajer pelatihan Lembaga Training terakreditasi/Lembaga Training terdaftar",
    nama: "",
    ttd: null,
  },
  {
    id: "konfirmasi-orang-4",
    orang: "Manajer atau supervisor ditempat kerja",
    nama: "",
    ttd: null,
  },
];

const initialPenyusunValidator: PenyusunRow[] = [
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

export default function APL02Page() {
  const [judulSkema, setJudulSkema] = useState(
    "MEETING/CONFERENCE PROJECT MANAGER",
  );
  const [nomorSkema, setNomorSkema] = useState("005/LSPP306/V/2026");
  const [skemaType, setSkemaType] = useState<"kkni" | "okupasi" | "klaster">(
    "okupasi",
  );

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [asesiItems, setAsesiItems] = useState<CheckItem[]>(initialAsesi);
  const [tujuanItems, setTujuanItems] = useState<CheckItem[]>(initialTujuan);

  const [lingkungan, setLingkungan] = useState({
    nyata: false,
    simulasi: false,
  });
  const [peluang, setPeluang] = useState({ tersedia: false, terbatas: false });
  const [hubunganItems, setHubunganItems] =
    useState<HubunganItem[]>(initialHubungan);
  const [siapaItems, setSiapaItems] = useState<CheckItem[]>(initialSiapa);

  const [konfirmasiItems, setKonfirmasiItems] =
    useState<CheckItem[]>(initialKonfirmasi);

  // Section 1.2
  const [standarKompetensiChecked, setStandarKompetensiChecked] =
    useState(false);
  const [standarKompetensiList, setStandarKompetensiList] = useState<
    StandarItem[]
  >(initialStandarKompetensi);
  const [standarLainnya, setStandarLainnya] = useState<CheckItem[]>(
    initialStandarLainnya,
  );

  // Section 2
  const [units2, setUnits2] = useState<UnitRow[]>(buildInitialUnits);
  const [assessmentRows, setAssessmentRows] = useState<AssessmentRow[]>(
    buildInitialAssessmentRows,
  );

  // Section 3
  const [karakteristikKandidat, setKarakteristikKandidat] = useState<{
    ada: boolean | null;
    catatan: string;
  }>({ ada: null, catatan: "" });
  const [kebutuhanKontekstualisasi, setKebutuhanKontekstualisasi] = useState<{
    ada: boolean | null;
    catatan: string;
  }>({ ada: null, catatan: "" });
  const [saranPelatihan, setSaranPelatihan] = useState<{
    ada: boolean | null;
    catatan: string;
  }>({ ada: null, catatan: "" });
  const [peluangTerintegrasi, setPeluangTerintegrasi] = useState<{
    ada: boolean | null;
    catatan: string;
  }>({
    ada: true,
    catatan:
      "Pada Skema Meeting/Conference Registration Staff, dengan Unit Kompetensi :\n1. Berkomunikasi Secara Lisan Dalam Bahasa Inggris pada Tingkat Operasional Dasar\n2. Melakukan Kerjasama dengan Kolega dan Pelanggan\n3. Melakukan Kerja dalam Lingkungan Sosial yang Beragam\n4. Mencari dan Memberikan Informasi\n5. Mengikuti Aturan Keprotokolan\n6. Menulis Dalam Bahasa Inggris pada Tingkat Penyeliaan dan Operasional Menengah\n7. Memproses dan Memantau Pendaftaran Kegiatan\n8. Mengatur Pendaftaran Tamu dalam Suatu Acara\n9. Mengelola Database",
  });

  // Konfirmasi dengan orang yang relevan
  const [konfirmasiOrangRows, setKonfirmasiOrangRows] = useState<
    KonfirmasiOrangRow[]
  >(initialKonfirmasiOrang);

  // Penyusun dan Validator
  const [penyusunRows, setPenyusunRows] = useState<PenyusunRow[]>(
    initialPenyusunValidator,
  );

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const updateStandarKompetensiTeks = (id: string, teks: string) => {
    setStandarKompetensiList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, teks } : it)),
    );
  };

  const updateUnit2 = (
    id: string,
    field: "kodeUnit" | "judulUnit",
    value: string,
  ) => {
    setUnits2((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)),
    );
  };

  const updateAssessmentField = (
    id: string,
    field:
      | "unitKompetensi"
      | "buktiBukti"
      | "observasiLangsung"
      | "kegiatanTerstruktur"
      | "tanyaJawab"
      | "verifikasiPortofolio"
      | "reviuProduk"
      | "verifikasiPihakKetiga",
    value: string,
  ) => {
    setAssessmentRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const updateAssessmentJenisBukti = (
    id: string,
    field: "l" | "tl" | "t",
    value: string,
  ) => {
    setAssessmentRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, jenisBukti: { ...r.jenisBukti, [field]: value } }
          : r,
      ),
    );
  };

  const updateKonfirmasiOrang = (id: string, nama: string) => {
    setKonfirmasiOrangRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, nama } : r)),
    );
  };

  const updateKonfirmasiOrangTtd = (id: string, ttd: string | null) => {
    setKonfirmasiOrangRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ttd } : r)),
    );
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

  const updatePenyusunTtd = (id: string, ttd: string | null) => {
    setPenyusunRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ttd } : r)),
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

        {/* ============================================================ */}
        {/* SECTION 1 — Menentukan Pendekatan Asesmen                     */}
        {/* ============================================================ */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-10" />
              <col className="w-48" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800"
                >
                  1. Menentukan Pendekatan Asesmen
                </td>
              </tr>

              {/* 1.1 Asesi */}
              <tr>
                <td
                  rowSpan={4}
                  className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700"
                >
                  1.1
                </td>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Asesi
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <div className="space-y-2.5">
                    {asesiItems.map((item) => (
                      <CheckboxLine
                        key={item.id}
                        checked={item.checked}
                        onToggle={() =>
                          toggleById(setAsesiItems, item.id, {
                            checked: !item.checked,
                          })
                        }
                        label={item.label}
                        onLabelChange={(v) =>
                          toggleById(setAsesiItems, item.id, { label: v })
                        }
                        isEditing={isEditing}
                      />
                    ))}
                  </div>
                </td>
              </tr>

              {/* Tujuan Asesmen */}
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Tujuan Asesmen
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <div className="space-y-2">
                    {tujuanItems.map((item) => (
                      <CheckboxLine
                        key={item.id}
                        checked={item.checked}
                        onToggle={() =>
                          toggleById(setTujuanItems, item.id, {
                            checked: !item.checked,
                          })
                        }
                        label={item.label}
                        onLabelChange={(v) =>
                          toggleById(setTujuanItems, item.id, { label: v })
                        }
                        isEditing={isEditing}
                      />
                    ))}
                  </div>
                </td>
              </tr>

              {/* Konteks Asesmen */}
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Konteks Asesmen
                </td>
                <td className="p-0 border border-gray-200">
                  <table className="w-full border-collapse text-sm table-fixed">
                    <tbody>
                      <tr>
                        <td className="w-56 align-middle px-4 py-3 border border-gray-200 text-gray-700">
                          Lingkungan
                        </td>
                        <td className="px-4 py-3 border border-gray-200">
                          <div className="flex flex-wrap gap-x-8 gap-y-2">
                            <CheckboxLine
                              checked={lingkungan.nyata}
                              onToggle={() =>
                                setLingkungan((p) => ({
                                  ...p,
                                  nyata: !p.nyata,
                                }))
                              }
                              label="Tempat kerja nyata"
                              onLabelChange={() => {}}
                              isEditing={isEditing}
                            />
                            <CheckboxLine
                              checked={lingkungan.simulasi}
                              onToggle={() =>
                                setLingkungan((p) => ({
                                  ...p,
                                  simulasi: !p.simulasi,
                                }))
                              }
                              label="Tempat kerja simulasi"
                              onLabelChange={() => {}}
                              isEditing={isEditing}
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="align-middle px-4 py-3 border border-gray-200 text-gray-700">
                          Peluang untuk mengumpulkan bukti dalam sejumlah
                          situasi
                        </td>
                        <td className="px-4 py-3 border border-gray-200">
                          <div className="flex flex-wrap gap-x-8 gap-y-2">
                            <CheckboxLine
                              checked={peluang.tersedia}
                              onToggle={() =>
                                setPeluang((p) => ({
                                  ...p,
                                  tersedia: !p.tersedia,
                                }))
                              }
                              label="Tersedia"
                              onLabelChange={() => {}}
                              isEditing={isEditing}
                            />
                            <CheckboxLine
                              checked={peluang.terbatas}
                              onToggle={() =>
                                setPeluang((p) => ({
                                  ...p,
                                  terbatas: !p.terbatas,
                                }))
                              }
                              label="Terbatas"
                              onLabelChange={() => {}}
                              isEditing={isEditing}
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td
                          rowSpan={hubunganItems.length}
                          className="align-middle px-4 py-3 border border-gray-200 text-gray-700"
                        >
                          Hubungan antara standar kompetensi dan:
                        </td>
                        <td className="px-4 py-2.5 border border-gray-200">
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="min-w-0 flex-1">
                              <CheckboxLine
                                checked={hubunganItems[0].checked}
                                onToggle={() =>
                                  toggleById(
                                    setHubunganItems,
                                    hubunganItems[0].id,
                                    {
                                      checked: !hubunganItems[0].checked,
                                    },
                                  )
                                }
                                label={hubunganItems[0].label}
                                onLabelChange={(v) =>
                                  toggleById(
                                    setHubunganItems,
                                    hubunganItems[0].id,
                                    { label: v },
                                  )
                                }
                                isEditing={isEditing}
                              />
                            </div>
                            <EmojiPicker
                              value={hubunganItems[0].emoji}
                              onChange={(emoji) =>
                                toggleById(
                                  setHubunganItems,
                                  hubunganItems[0].id,
                                  { emoji },
                                )
                              }
                              isEditing={isEditing}
                            />
                          </div>
                        </td>
                      </tr>
                      {hubunganItems.slice(1).map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2.5 border border-gray-200">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="min-w-0 flex-1">
                                <CheckboxLine
                                  checked={item.checked}
                                  onToggle={() =>
                                    toggleById(setHubunganItems, item.id, {
                                      checked: !item.checked,
                                    })
                                  }
                                  label={item.label}
                                  onLabelChange={(v) =>
                                    toggleById(setHubunganItems, item.id, {
                                      label: v,
                                    })
                                  }
                                  isEditing={isEditing}
                                />
                              </div>
                              <EmojiPicker
                                value={item.emoji}
                                onChange={(emoji) =>
                                  toggleById(setHubunganItems, item.id, {
                                    emoji,
                                  })
                                }
                                isEditing={isEditing}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="align-middle px-4 py-3 border border-gray-200 text-gray-700">
                          Siapa yang melakukan asesmen/RPL
                        </td>
                        <td className="px-4 py-3 border border-gray-200">
                          <div className="space-y-2">
                            {siapaItems.map((item) => (
                              <CheckboxLine
                                key={item.id}
                                checked={item.checked}
                                onToggle={() =>
                                  toggleById(setSiapaItems, item.id, {
                                    checked: !item.checked,
                                  })
                                }
                                label={item.label}
                                onLabelChange={(v) =>
                                  toggleById(setSiapaItems, item.id, {
                                    label: v,
                                  })
                                }
                                isEditing={isEditing}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Konfirmasi dengan orang yang relevan */}
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Konfirmasi dengan orang yang relevan
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <div className="space-y-2">
                    {konfirmasiItems.map((item) => (
                      <CheckboxLine
                        key={item.id}
                        checked={item.checked}
                        onToggle={() =>
                          toggleById(setKonfirmasiItems, item.id, {
                            checked: !item.checked,
                          })
                        }
                        label={item.label}
                        onLabelChange={(v) =>
                          toggleById(setKonfirmasiItems, item.id, { label: v })
                        }
                        isEditing={isEditing}
                      />
                    ))}
                  </div>
                </td>
              </tr>

              {/* 1.2 Standar Industri atau Tempat Kerja */}
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  1.2
                </td>
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Standar Industri atau Tempat Kerja
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={standarKompetensiChecked}
                          disabled={!isEditing}
                          onChange={() =>
                            setStandarKompetensiChecked((v) => !v)
                          }
                          className={`${checkboxClass} mt-1`}
                        />
                        <span className="text-sm text-gray-700 font-medium">
                          Standar Kompetensi:
                        </span>
                      </div>
                      <div className="pl-7 mt-2 space-y-2">
                        {standarKompetensiList.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-2 text-xs text-gray-600"
                          >
                            <span className="shrink-0 text-gray-400 pt-0.5">
                              {item.marker}
                            </span>
                            <EditableText
                              value={item.teks}
                              onChange={(v) =>
                                updateStandarKompetensiTeks(item.id, v)
                              }
                              isEditing={isEditing}
                              className="text-xs text-gray-600"
                              rows={3}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    {standarLainnya.map((item) => (
                      <CheckboxLine
                        key={item.id}
                        checked={item.checked}
                        onToggle={() =>
                          toggleById(setStandarLainnya, item.id, {
                            checked: !item.checked,
                          })
                        }
                        label={item.label}
                        onLabelChange={(v) =>
                          toggleById(setStandarLainnya, item.id, { label: v })
                        }
                        isEditing={isEditing}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2 — Mempersiapkan Rencana Asesmen                     */}
        {/* ============================================================ */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800"
                >
                  2. Mempersiapkan Rencana Asesmen
                </td>
              </tr>
              <tr className="text-xs font-semibold text-gray-600">
                <th className="w-40 px-4 py-2.5 border border-gray-200"></th>
                <th className="w-14 px-3 py-2.5 border border-gray-200">No</th>
                <th className="w-52 px-3 py-2.5 border border-gray-200 text-left">
                  Kode Unit
                </th>
                <th className="px-3 py-2.5 border border-gray-200 text-left">
                  Judul Unit
                </th>
              </tr>
              {units2.map((unit, idx) => (
                <tr key={unit.id}>
                  {idx === 0 && (
                    <td
                      rowSpan={units2.length}
                      className="align-middle px-4 py-3 border border-gray-200 text-center font-bold text-gray-800 bg-gray-50"
                    >
                      <EditableText
                        value={judulSkema}
                        onChange={setJudulSkema}
                        isEditing={isEditing}
                        className="text-center font-bold text-gray-800"
                        rows={3}
                      />
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
                        updateUnit2(unit.id, "kodeUnit", e.target.value)
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
                        updateUnit2(unit.id, "judulUnit", e.target.value)
                      }
                      disabled={!isEditing}
                      className={compactInputClass}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabel Bukti-Bukti & Metode/Perangkat Asesmen — satu tabel panjang untuk seluruh unit */}
          <div className="px-4 py-2.5 border-t border-gray-200 font-bold text-gray-800 text-sm">
            Bukti-Bukti dan Metode/Perangkat Asesmen per Unit Kompetensi
          </div>
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="border-collapse text-sm min-w-[1700px]">
              <thead>
                <tr className="text-xs font-semibold text-gray-700">
                  <th
                    rowSpan={2}
                    className="w-52 px-4 py-3 border border-gray-200 align-middle bg-gray-50"
                  >
                    Unit Kompetensi
                  </th>
                  <th
                    rowSpan={2}
                    className="w-64 px-4 py-3 border border-gray-200 align-middle bg-gray-50"
                  >
                    Bukti-Bukti (Kinerja, Produk, Portofolio, dan/atau
                    Pengetahuan) diidentifikasi berdasarkan Kriteria Unjuk Kerja
                    dan Pendekatan Asesmen
                  </th>
                  <th
                    colSpan={3}
                    className="px-4 py-2.5 border border-gray-200 bg-gray-50"
                  >
                    Jenis Bukti
                  </th>
                  <th
                    colSpan={6}
                    className="px-4 py-2.5 border border-gray-200 bg-gray-50"
                  >
                    <div>Metode dan Perangkat Asesmen</div>
                    <div className="mt-1 text-[10px] font-normal italic text-gray-500 leading-snug">
                      CL (Ceklis Observasi), DIT (Daftar Instruksi Terstruktur),
                      DPL (Daftar Pertanyaan Lisan), DPT (Daftar Pertanyaan
                      Tertulis), VPK (Verifikasi Pihak Ketiga), CVP (Ceklis
                      Verfikasi Portofolio), CRP (Ceklis Reviu Produk), PW
                      (Pertanyaan Wawancara)
                    </div>
                  </th>
                </tr>
                <tr className="text-xs font-semibold text-gray-700">
                  <th className="w-12 px-2 py-2.5 border border-gray-200 bg-gray-50">
                    L
                  </th>
                  <th className="w-12 px-2 py-2.5 border border-gray-200 bg-gray-50">
                    TL
                  </th>
                  <th className="w-12 px-2 py-2.5 border border-gray-200 bg-gray-50">
                    T
                  </th>
                  <th className="w-48 px-3 py-2.5 border border-gray-200 bg-gray-50 align-top">
                    <div>Observasi Langsung</div>
                    <div className="mt-1 text-[10px] font-normal italic text-gray-500 leading-snug">
                      kerja nyata/aktivitas waktu nyata di tempat kerja di
                      lingkungan tempat kerja yang disimulasikan
                    </div>
                  </th>
                  <th className="w-48 px-3 py-2.5 border border-gray-200 bg-gray-50 align-top">
                    <div>Kegiatan Terstruktur</div>
                    <div className="mt-1 text-[10px] font-normal italic text-gray-500 leading-snug">
                      latihan simulasi dan bermain peran, proyek, presentasi,
                      lembar kegiatan
                    </div>
                  </th>
                  <th className="w-48 px-3 py-2.5 border border-gray-200 bg-gray-50 align-top">
                    <div>Tanya Jawab</div>
                    <div className="mt-1 text-[10px] font-normal italic text-gray-500 leading-snug">
                      pertanyaan tertulis, wawancara, asesmen diri, tanya jawab
                      lisan, angket, ujian lisan atau tertulis
                    </div>
                  </th>
                  <th className="w-52 px-3 py-2.5 border border-gray-200 bg-gray-50 align-top">
                    <div>Verifikasi Portofolio</div>
                    <div className="mt-1 text-[10px] font-normal italic text-gray-500 leading-snug">
                      sampel pekerjaan yang disusun oleh Asesi, produk dengan
                      dokumentasi pendukung, bukti sejarah, jurnal atau buku
                      catatan, informasi tentang pengalaman hidup
                    </div>
                  </th>
                  <th className="w-40 px-3 py-2.5 border border-gray-200 bg-gray-50 align-top">
                    <div>Reviu Produk</div>
                    <div className="mt-1 text-[10px] font-normal italic text-gray-500 leading-snug">
                      Produk hasil proyek, contoh hasil kerja/produk
                    </div>
                  </th>
                  <th className="w-48 px-3 py-2.5 border border-gray-200 bg-gray-50 align-top">
                    <div>Verifikasi Pihak Ketiga</div>
                    <div className="mt-1 text-[10px] font-normal italic text-gray-500 leading-snug">
                      testimoni dan laporan dari atasan, bukti pelatihan,
                      otentikasi pencapaian sebelumnya, wawancara dengan atasan
                      atau rekan kerja
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {assessmentRows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-3 py-3 border border-gray-200">
                      <div className="flex gap-1.5 text-sm text-gray-700">
                        <span className="shrink-0 text-gray-500">
                          {row.no}.
                        </span>
                        <EditableText
                          value={row.unitKompetensi}
                          onChange={(v) =>
                            updateAssessmentField(row.id, "unitKompetensi", v)
                          }
                          isEditing={isEditing}
                          className="text-sm text-gray-700"
                          rows={3}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 border border-gray-200">
                      <EditableText
                        value={row.buktiBukti}
                        onChange={(v) =>
                          updateAssessmentField(row.id, "buktiBukti", v)
                        }
                        isEditing={isEditing}
                        className="text-xs text-gray-600"
                        rows={3}
                      />
                    </td>
                    <td className="px-1.5 py-3 border border-gray-200 text-center">
                      <input
                        type="text"
                        value={row.jenisBukti.l}
                        onChange={(e) =>
                          updateAssessmentJenisBukti(
                            row.id,
                            "l",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center`}
                      />
                    </td>
                    <td className="px-1.5 py-3 border border-gray-200 text-center">
                      <input
                        type="text"
                        value={row.jenisBukti.tl}
                        onChange={(e) =>
                          updateAssessmentJenisBukti(
                            row.id,
                            "tl",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center`}
                      />
                    </td>
                    <td className="px-1.5 py-3 border border-gray-200 text-center">
                      <input
                        type="text"
                        value={row.jenisBukti.t}
                        onChange={(e) =>
                          updateAssessmentJenisBukti(
                            row.id,
                            "t",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center`}
                      />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="text"
                        value={row.observasiLangsung}
                        onChange={(e) =>
                          updateAssessmentField(
                            row.id,
                            "observasiLangsung",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center`}
                      />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="text"
                        value={row.kegiatanTerstruktur}
                        onChange={(e) =>
                          updateAssessmentField(
                            row.id,
                            "kegiatanTerstruktur",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center font-semibold`}
                      />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="text"
                        value={row.tanyaJawab}
                        onChange={(e) =>
                          updateAssessmentField(
                            row.id,
                            "tanyaJawab",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center font-semibold`}
                      />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="text"
                        value={row.verifikasiPortofolio}
                        onChange={(e) =>
                          updateAssessmentField(
                            row.id,
                            "verifikasiPortofolio",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center`}
                      />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="text"
                        value={row.reviuProduk}
                        onChange={(e) =>
                          updateAssessmentField(
                            row.id,
                            "reviuProduk",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center`}
                      />
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="text"
                        value={row.verifikasiPihakKetiga}
                        onChange={(e) =>
                          updateAssessmentField(
                            row.id,
                            "verifikasiPihakKetiga",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className={`${compactInputClass} text-center`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3 — Mengidentifikasi Persyaratan Modifikasi           */}
        {/* ============================================================ */}
        <div className="space-y-2">
          <div className="border border-gray-200">
            <table className="w-full border-collapse text-sm table-fixed">
              <colgroup>
                <col className="w-14" />
                <col className="w-72" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800"
                  >
                    3. Mengidentifikasi Persyaratan Modifikasi dan
                    Kontekstualisasi:
                  </td>
                </tr>

                <tr>
                  <td
                    rowSpan={2}
                    className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700"
                  >
                    3.1
                  </td>
                  <td className="align-top px-4 py-3 border border-gray-200 text-gray-700">
                    <span className="font-semibold">a.</span> Karakteristik
                    Kandidat:
                  </td>
                  <td className="px-4 py-3 border border-gray-200">
                    <AdaTidakAdaToggle
                      ada={karakteristikKandidat.ada}
                      onChange={(v) =>
                        setKarakteristikKandidat((p) => ({ ...p, ada: v }))
                      }
                      isEditing={isEditing}
                      suffix="karakteristik khusus kandidat"
                    />
                    <p className="text-sm text-gray-700 mt-1">
                      Jika ada, tuliskan:
                    </p>
                    <EditableText
                      value={karakteristikKandidat.catatan}
                      onChange={(v) =>
                        setKarakteristikKandidat((p) => ({
                          ...p,
                          catatan: v,
                        }))
                      }
                      isEditing={isEditing}
                      className="text-sm text-gray-700 mt-1"
                      rows={2}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="align-top px-4 py-3 border border-gray-200 text-gray-700">
                    <span className="font-semibold">b.</span> Kebutuhan
                    kontekstualisasi terkait tempat kerja:
                  </td>
                  <td className="px-4 py-3 border border-gray-200">
                    <AdaTidakAdaToggle
                      ada={kebutuhanKontekstualisasi.ada}
                      onChange={(v) =>
                        setKebutuhanKontekstualisasi((p) => ({
                          ...p,
                          ada: v,
                        }))
                      }
                      isEditing={isEditing}
                      suffix="kebutuhan kontekstualisasi"
                    />
                    <p className="text-sm text-gray-700 mt-1">
                      Jika ada, tuliskan:
                    </p>
                    <EditableText
                      value={kebutuhanKontekstualisasi.catatan}
                      onChange={(v) =>
                        setKebutuhanKontekstualisasi((p) => ({
                          ...p,
                          catatan: v,
                        }))
                      }
                      isEditing={isEditing}
                      className="text-sm text-gray-700 mt-1"
                      rows={2}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                    3.2
                  </td>
                  <td className="align-top px-4 py-3 border border-gray-200 text-gray-700">
                    Saran yang diberikan oleh paket pelatihan atau pengembang
                    pelatihan
                  </td>
                  <td className="px-4 py-3 border border-gray-200">
                    <AdaTidakAdaToggle
                      ada={saranPelatihan.ada}
                      onChange={(v) =>
                        setSaranPelatihan((p) => ({ ...p, ada: v }))
                      }
                      isEditing={isEditing}
                      suffix="saran Jika ada, tuliskan:"
                    />
                    <EditableText
                      value={saranPelatihan.catatan}
                      onChange={(v) =>
                        setSaranPelatihan((p) => ({ ...p, catatan: v }))
                      }
                      isEditing={isEditing}
                      className="text-sm text-gray-700 mt-1"
                      rows={2}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                    3.4
                  </td>
                  <td className="align-top px-4 py-3 border border-gray-200 text-gray-700">
                    Peluang untuk kegiatan asesmen terintegrasi dan mencatat
                    setiap perubahan yang diperlukan untuk alat asesmen
                  </td>
                  <td className="px-4 py-3 border border-gray-200">
                    <AdaTidakAdaToggle
                      ada={peluangTerintegrasi.ada}
                      onChange={(v) =>
                        setPeluangTerintegrasi((p) => ({ ...p, ada: v }))
                      }
                      isEditing={isEditing}
                      suffix="peluang Jika Ada, tuliskan:"
                    />
                    <EditableText
                      value={peluangTerintegrasi.catatan}
                      onChange={(v) =>
                        setPeluangTerintegrasi((p) => ({
                          ...p,
                          catatan: v,
                        }))
                      }
                      isEditing={isEditing}
                      className="text-sm text-gray-700 mt-1"
                      rows={10}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs italic text-gray-500 px-1">
            *Coret yang tidak perlu
          </p>
        </div>

        {/* ============================================================ */}
        {/* Konfirmasi dengan orang yang relevan                          */}
        {/* ============================================================ */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800">
            Konfirmasi dengan orang yang relevan
          </div>
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-72" />
              <col />
              <col className="w-56" />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50">
                  Orang yang relevan
                </th>
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50">
                  Nama
                </th>
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50">
                  Tanda Tangan dan Tanggal
                </th>
              </tr>
            </thead>
            <tbody>
              {konfirmasiOrangRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 border border-gray-200 text-gray-700">
                    {row.orang}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input
                      type="text"
                      value={row.nama}
                      onChange={(e) =>
                        updateKonfirmasiOrang(row.id, e.target.value)
                      }
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-2 border border-gray-200">
                    <SignatureBox
                      value={row.ttd}
                      onChange={(v) => updateKonfirmasiOrangTtd(row.id, v)}
                      isEditing={isEditing}
                      inputId={`${row.id}-ttd-upload`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ============================================================ */}
        {/* PENYUSUN DAN VALIDATOR                                        */}
        {/* ============================================================ */}
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
