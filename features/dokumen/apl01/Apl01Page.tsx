"use client";

/*
 * FR.APL.01 - Permohonan Sertifikasi Kompetensi.
 * Tampilan & style mengikuti formulir asli (app/dashboard/fr/apl-01 versi mock);
 * data dan aksi disambungkan ke API MUK.
 */

import { useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Plus, Save, Send, Upload, X } from "lucide-react";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { fieldErrors, pesanError, statusError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import { SignatureDialog } from "@/components/dokumen/SignatureDialog";
import { SignatureImage } from "@/components/dokumen/SignatureImage";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Apl01BuktiPersyaratan, Apl01Isian, Apl01Payload, Apl01Patch } from "@/types/dokumen";

const SLUG = "apl-01";
const SECTIONS = ["rincian", "data-sertifikasi", "bukti-kelengkapan"];

/* ---------------------------------------------------------------------- */
/* Shared style tokens                                                     */
/* ---------------------------------------------------------------------- */

const lineInputClass =
  "w-full bg-transparent border-0 border-b border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-0 text-sm text-gray-800 px-0.5 py-1.5 disabled:text-gray-700 transition-colors";

const cellInputClass =
  "w-full bg-transparent border-0 border-b border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-0 text-sm text-gray-800 px-0.5 py-1 disabled:text-gray-700 transition-colors";

const tableCellClass = "border border-gray-300 px-3 py-2.5 align-top";
const tableHeadClass =
  "border border-gray-300 px-3 py-2.5 align-middle text-xs font-semibold text-gray-700 bg-gray-50 text-center";

function SectionDivider() {
  return <div className="border-t-2 border-dashed border-gray-200 my-2" />;
}

/** Pesan error validasi dari API, di bawah baris isian. */
function ErrorText({ message, indent = true }: { message?: string; indent?: boolean }) {
  if (!message) return null;
  return (
    <p className={`text-xs text-red-600 mt-1 ${indent ? "md:ml-52" : ""}`} role="alert">
      {message}
    </p>
  );
}

type Path = `pribadi.${keyof Apl01Isian["pribadi"]}` | `pekerjaan.${keyof Apl01Isian["pekerjaan"]}` | "tujuan_asesmen" | "tujuan_lainnya";

function ambil(isian: Apl01Isian, path: Path): string {
  const [a, b] = path.split(".") as [string, string?];
  const nilai = b ? (isian as unknown as Record<string, Record<string, string | null>>)[a][b] : (isian as unknown as Record<string, string | null>)[a];
  return nilai ?? "";
}

function setel(isian: Apl01Isian, path: Path, value: string | null): Apl01Isian {
  const [a, b] = path.split(".") as ["pribadi" | "pekerjaan" | "tujuan_asesmen" | "tujuan_lainnya", string?];
  if (b && (a === "pribadi" || a === "pekerjaan")) {
    return { ...isian, [a]: { ...isian[a], [b]: value } };
  }
  return { ...isian, [a]: value };
}

interface SectionProps {
  isian: Apl01Isian;
  ubah: (path: Path, value: string | null) => void;
  isEditing: boolean;
  errors: Record<string, string>;
}

/* ---------------------------------------------------------------------- */
/* Small primitives                                                        */
/* ---------------------------------------------------------------------- */

function FieldRow({
  label,
  name,
  isian,
  ubah,
  isEditing,
  errors,
  type = "text",
  maxLength = 255,
}: {
  label: string;
  name: Path;
  type?: string;
  maxLength?: number;
} & SectionProps) {
  const error = errors[`isian.${name}`];
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="w-44 shrink-0 text-sm text-gray-500">{label}</span>
        <span className="text-sm text-gray-400 shrink-0">:</span>
        <input
          type={type}
          name={name}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          value={ambil(isian, name)}
          onChange={(e) => ubah(name, e.target.value === "" ? null : e.target.value)}
          disabled={!isEditing}
          maxLength={maxLength}
          className={`${lineInputClass} ${error ? "border-red-400" : ""}`}
        />
      </div>
      <ErrorText message={error} />
    </div>
  );
}

function SubFieldRow({
  label,
  name,
  isian,
  ubah,
  isEditing,
  errors,
  type = "text",
}: {
  label: string;
  name: Path;
  type?: string;
} & SectionProps) {
  const error = errors[`isian.${name}`];
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="w-14 shrink-0 text-sm text-gray-500">{label}</span>
        <span className="text-sm text-gray-400 shrink-0">:</span>
        <input
          type={type}
          name={name}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          value={ambil(isian, name)}
          onChange={(e) => ubah(name, e.target.value === "" ? null : e.target.value)}
          disabled={!isEditing}
          maxLength={type === "email" ? 255 : 30}
          className={`${lineInputClass} ${error ? "border-red-400" : ""}`}
        />
      </div>
      <ErrorText message={error} indent={false} />
    </div>
  );
}

function FileUploadTrigger({
  namaFile,
  isEditing,
  proses,
  accept,
  onPilih,
  onHapus,
  onLihat,
}: {
  namaFile: string | null;
  isEditing: boolean;
  proses?: boolean;
  accept?: string;
  onPilih?: (file: File) => void;
  onHapus?: () => void;
  onLihat?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const bisaUnggah = isEditing && !!onPilih && !proses;

  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => {
          if (bisaUnggah) inputRef.current?.click();
          else if (namaFile && onLihat) onLihat();
        }}
        disabled={proses || (!bisaUnggah && !(namaFile && onLihat))}
        className={`inline-flex items-center gap-1.5 text-xs ${
          namaFile ? "text-gray-600" : "text-gray-400"
        } ${bisaUnggah || (namaFile && onLihat) ? "hover:text-[#7E9631] cursor-pointer" : "cursor-default"}`}
      >
        {proses ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
        <span className="truncate max-w-55">{proses ? "Mengunggah..." : namaFile || "Unggah Dokumen"}</span>
      </button>
      {namaFile && isEditing && onHapus && !proses && (
        <button type="button" onClick={onHapus} aria-label="Hapus berkas" className="text-gray-400 hover:text-red-500 cursor-pointer">
          <X size={12} />
        </button>
      )}
      {onPilih && (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={!bisaUnggah}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPilih(file);
            e.target.value = "";
          }}
        />
      )}
    </div>
  );
}

function SignatureBox({
  label,
  penilaianId,
  pihak,
  ada,
  tanggal,
  versi,
  onClick,
}: {
  label: string;
  penilaianId: number;
  pihak: "asesi" | "admin";
  ada: boolean;
  tanggal: string | null;
  versi?: number;
  /** Diisi bila kotak bisa diklik untuk menandatangani. */
  onClick?: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-32 shrink-0 text-xs text-gray-500 pt-3">{label}</span>
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `${label}: klik untuk menandatangani` : undefined}
        onClick={onClick}
        onKeyDown={(e) => onClick && (e.key === "Enter" || e.key === " ") && onClick()}
        className={`flex-1 min-h-20 rounded-md border border-dashed flex flex-col items-center justify-center text-xs transition-all py-1 ${
          onClick
            ? "border-gray-300 bg-white cursor-pointer hover:border-[#7E9631]"
            : "border-gray-200 bg-gray-50/50 cursor-default"
        }`}
      >
        {ada ? (
          <>
            <SignatureImage penilaianId={penilaianId} slug={SLUG} pihak={pihak} versi={versi} alt={label} />
            {tanggal && <span className="text-[11px] text-gray-500">{formatTanggal(tanggal)}</span>}
          </>
        ) : (
          <Plus size={18} className="text-gray-300" />
        )}
      </div>
    </div>
  );
}

function TableCheckbox({ checked, label }: { checked: boolean; label: string }) {
  // Kolom verifikasi diisi admin LSP: selalu read-only bagi asesi.
  return (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        disabled
        readOnly
        aria-label={label}
        className="w-4 h-4 rounded-sm border-gray-400 text-[#7E9631] focus:ring-[#8AA53C]/40 cursor-default"
      />
    </div>
  );
}

function EditSaveControls({
  bisaUbah,
  isEditing,
  savedSuccess,
  menyimpan,
  onUbah,
  onKirim,
  siapKirim,
}: {
  bisaUbah: boolean;
  isEditing: boolean;
  savedSuccess: boolean;
  menyimpan: boolean;
  onUbah: () => void;
  onKirim: () => void;
  siapKirim: boolean;
}) {
  if (!bisaUbah) return null;

  return (
    <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
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
        disabled={!isEditing || menyimpan}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
      >
        {menyimpan ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
        Simpan
      </button>
      {!isEditing && (
        <button
          type="button"
          onClick={onKirim}
          disabled={!siapKirim}
          title={siapKirim ? undefined : "Lengkapi isian, unggah bukti, dan tanda tangani terlebih dahulu"}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          <Send size={13} />
          Kirim
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Bagian 1 - Rincian Data Pemohon                                         */
/* ---------------------------------------------------------------------- */

function SectionRincian(props: SectionProps & { opsiJenisKelamin: { value: string; label: string }[] }) {
  const { isian, ubah, isEditing, errors, opsiJenisKelamin } = props;
  const errorTtl = errors["isian.pribadi.tempat_lahir"] ?? errors["isian.pribadi.tanggal_lahir"];

  return (
    <section id="rincian" className="scroll-mt-28">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500">Bagian 1:</p>
        <h2 className="text-2xl md:text-[28px] font-bold text-gray-800 tracking-tight">
          Rincian Data Pemohon Sertifikasi
        </h2>
        <p className="text-xs md:text-sm text-gray-400 mt-1.5">
          Pada bagian ini, cantumkan data pribadi, data pendidikan formal, serta
          data pekerjaan anda pada saat ini.
        </p>
      </div>

      <div className="space-y-8">
        {/* a. Data Pribadi */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-4">a. Data Pribadi</h3>
          <div className="space-y-3.5">
            <FieldRow label="Nama Lengkap" name="pribadi.nama_lengkap" {...props} />
            <FieldRow label="No. KTP/NIK/Paspor" name="pribadi.nik" maxLength={30} {...props} />

            <div>
              <div className="flex items-center gap-4">
                <span className="w-44 shrink-0 text-sm text-gray-500">Tempat/Tgl. Lahir</span>
                <span className="text-sm text-gray-400 shrink-0">:</span>
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="text"
                    aria-label="Tempat lahir"
                    placeholder="Tempat"
                    value={ambil(isian, "pribadi.tempat_lahir")}
                    onChange={(e) => ubah("pribadi.tempat_lahir", e.target.value || null)}
                    disabled={!isEditing}
                    maxLength={255}
                    className={lineInputClass}
                  />
                  <span className="text-sm text-gray-400 shrink-0">/</span>
                  <input
                    type="date"
                    aria-label="Tanggal lahir"
                    value={ambil(isian, "pribadi.tanggal_lahir")}
                    onChange={(e) => ubah("pribadi.tanggal_lahir", e.target.value || null)}
                    disabled={!isEditing}
                    className={`${lineInputClass} max-w-45`}
                  />
                </div>
              </div>
              <ErrorText message={errorTtl} />
            </div>

            <div>
              <div className="flex items-center gap-4">
                <span className="w-44 shrink-0 text-sm text-gray-500">Jenis Kelamin</span>
                <span className="text-sm text-gray-400 shrink-0">:</span>
                <div className="flex items-center gap-6" role="radiogroup" aria-label="Jenis kelamin">
                  {opsiJenisKelamin.map((opt, i) => {
                    const terpilih = isian.pribadi.jenis_kelamin === opt.value;
                    return (
                      <label
                        key={opt.value}
                        role="radio"
                        aria-checked={terpilih}
                        tabIndex={isEditing ? 0 : -1}
                        onClick={() => isEditing && ubah("pribadi.jenis_kelamin", opt.value)}
                        onKeyDown={(e) => isEditing && (e.key === "Enter" || e.key === " ") && ubah("pribadi.jenis_kelamin", opt.value)}
                        className={`inline-flex items-center gap-2 select-none text-sm ${
                          isEditing ? "cursor-pointer" : "cursor-default"
                        } ${terpilih ? "text-gray-800 font-medium" : "text-gray-400"}`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            terpilih ? "border-[#7E9631]" : "border-gray-300"
                          }`}
                        >
                          {terpilih && <span className="w-1.5 h-1.5 rounded-full bg-[#7E9631]" />}
                        </span>
                        {opt.label}
                        {i === 0 && <span className="text-gray-300">/</span>}
                      </label>
                    );
                  })}
                  <span className="text-gray-400">*</span>
                </div>
              </div>
              <ErrorText message={errors["isian.pribadi.jenis_kelamin"]} />
            </div>

            <FieldRow label="Kebangsaan" name="pribadi.kebangsaan" maxLength={100} {...props} />
            <FieldRow label="Alamat Rumah" name="pribadi.alamat_rumah" maxLength={500} {...props} />

            <div className="flex items-center gap-4">
              <span className="w-44 shrink-0" />
              <span className="w-3 shrink-0" />
              <div className="flex-1 flex items-center gap-3">
                <span className="text-sm text-gray-500 shrink-0">Kode Pos</span>
                <span className="text-sm text-gray-400 shrink-0">:</span>
                <input
                  type="text"
                  aria-label="Kode pos rumah"
                  value={ambil(isian, "pribadi.kode_pos")}
                  onChange={(e) => ubah("pribadi.kode_pos", e.target.value || null)}
                  disabled={!isEditing}
                  maxLength={10}
                  className={`${lineInputClass} max-w-40`}
                />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-44 shrink-0 text-sm text-gray-500 pt-1.5">No. Telepon/E-Mail</span>
              <span className="text-sm text-gray-400 shrink-0 pt-1.5">:</span>
              <div className="flex-1 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SubFieldRow label="Rumah" name="pribadi.telp_rumah" type="tel" {...props} />
                  <SubFieldRow label="Kantor" name="pribadi.telp_kantor" type="tel" {...props} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SubFieldRow label="HP" name="pribadi.hp" type="tel" {...props} />
                  <SubFieldRow label="E-Mail" name="pribadi.email" type="email" {...props} />
                </div>
              </div>
            </div>

            <FieldRow label="Kualifikasi Pendidikan" name="pribadi.kualifikasi_pendidikan" {...props} />
          </div>
          <p className="text-xs italic text-gray-400 mt-3">*coret yang tidak perlu</p>
        </div>

        {/* b. Data Pekerjaan */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-4">b. Data Pekerjaan Sekarang</h3>
          <div className="space-y-3.5">
            <FieldRow label="Nama Institusi/ Perusahaan" name="pekerjaan.nama_institusi" {...props} />
            <FieldRow label="jabatan" name="pekerjaan.jabatan" {...props} />
            <FieldRow label="Alamat Kantor" name="pekerjaan.alamat_kantor" maxLength={500} {...props} />

            <div className="flex items-center gap-4">
              <span className="w-44 shrink-0" />
              <span className="w-3 shrink-0" />
              <div className="flex-1 flex items-center gap-3">
                <span className="text-sm text-gray-500 shrink-0">Kode Pos</span>
                <span className="text-sm text-gray-400 shrink-0">:</span>
                <input
                  type="text"
                  aria-label="Kode pos kantor"
                  value={ambil(isian, "pekerjaan.kode_pos")}
                  onChange={(e) => ubah("pekerjaan.kode_pos", e.target.value || null)}
                  disabled={!isEditing}
                  maxLength={10}
                  className={`${lineInputClass} max-w-40`}
                />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-44 shrink-0 text-sm text-gray-500 pt-1.5">No. Telepon/E-Mail</span>
              <span className="text-sm text-gray-400 shrink-0 pt-1.5">:</span>
              <div className="flex-1 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SubFieldRow label="Telp" name="pekerjaan.telp" type="tel" {...props} />
                  <SubFieldRow label="Fax" name="pekerjaan.fax" {...props} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SubFieldRow label="E-Mail" name="pekerjaan.email" type="email" {...props} />
                  <span />
                </div>
              </div>
            </div>

            <FieldRow label="Kualifikasi Pendidikan" name="pekerjaan.kualifikasi_pendidikan" {...props} />
          </div>
          <p className="text-xs italic text-gray-400 mt-3">*coret yang tidak perlu</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Bagian 2 - Data Sertifikasi                                             */
/* ---------------------------------------------------------------------- */

function SectionDataSertifikasi({
  isian,
  ubah,
  isEditing,
  errors,
  payload,
}: SectionProps & { payload: Apl01Payload }) {
  // Tujuan asesmen: tampil sebagai checkbox, tetapi hanya satu pilihan.
  const pilihTujuan = (val: string) => {
    ubah("tujuan_asesmen", isian.tujuan_asesmen === val ? null : val);
  };
  const units = payload.unit_kompetensi;

  return (
    <section id="data-sertifikasi" className="scroll-mt-28">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500">Bagian 2:</p>
        <h2 className="text-2xl md:text-[28px] font-bold text-gray-800 tracking-tight">Data Sertifikasi</h2>
        <p className="text-xs md:text-sm text-gray-400 mt-1.5 max-w-3xl">
          Tuliskan Judul dan Nomor Skema Sertifikasi yang anda ajukan berikut
          Daftar Unit Kompetensi sesuai kemasan pada Skema Sertifikasi untuk
          mendapatkan pengakuan sesuai dengan latar belakang pendidikan,
          pelatihan, serta pengalaman kerja yang anda miliki.
        </p>
      </div>

      <div className="space-y-6">
        <table className="w-full border border-gray-300 border-collapse text-sm">
          <tbody>
            <tr>
              <td rowSpan={3} className={`${tableCellClass} w-56 font-semibold text-gray-800 bg-gray-50`}>
                Skema Sertifikasi
                <br />
                <span className="text-xs font-normal text-gray-500">(KKNI/Okupasi/Klaster)</span>
              </td>
              <td className={`${tableCellClass} w-32 text-gray-600`}>Judul</td>
              <td className={`${tableCellClass} w-4 text-gray-400 text-center`}>:</td>
              <td className={tableCellClass}>
                <input type="text" aria-label="Judul skema" value={payload.skema.judul ?? ""} disabled readOnly className={cellInputClass} />
              </td>
            </tr>
            <tr>
              <td className={`${tableCellClass} text-gray-600`}>Nomor</td>
              <td className={`${tableCellClass} text-gray-400 text-center`}>:</td>
              <td className={tableCellClass}>
                <input type="text" aria-label="Nomor skema" value={payload.skema.nomor ?? ""} disabled readOnly className={cellInputClass} />
              </td>
            </tr>
            <tr>
              <td className={`${tableCellClass} text-gray-600`}>Tujuan Asesmen</td>
              <td className={`${tableCellClass} text-gray-400 text-center`}>:</td>
              <td className={tableCellClass}>
                <div className="space-y-2">
                  {payload.opsi.tujuan_asesmen.map((opt) => (
                    <div key={opt.value} className="flex items-center gap-3 flex-wrap">
                      <label className={`flex items-center gap-2.5 select-none w-fit ${isEditing ? "cursor-pointer" : "cursor-default"}`}>
                        <input
                          type="checkbox"
                          checked={isian.tujuan_asesmen === opt.value}
                          disabled={!isEditing}
                          onChange={() => pilihTujuan(opt.value)}
                          className="w-4 h-4 rounded-sm border-gray-400 text-[#7E9631] focus:ring-[#8AA53C]/40 cursor-pointer disabled:cursor-default"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                      {opt.value === "lainnya" && isian.tujuan_asesmen === "lainnya" && (
                        <input
                          type="text"
                          aria-label="Tujuan asesmen lainnya"
                          placeholder="Sebutkan"
                          value={isian.tujuan_lainnya ?? ""}
                          onChange={(e) => ubah("tujuan_lainnya", e.target.value || null)}
                          disabled={!isEditing}
                          maxLength={255}
                          className={`${lineInputClass} max-w-64`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <ErrorText message={errors["isian.tujuan_asesmen"] ?? errors["isian.tujuan_lainnya"]} indent={false} />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Daftar Unit Kompetensi sesuai kemasan:</h3>
          </div>

          <table className="w-full border border-gray-300 border-collapse text-sm">
            <thead>
              <tr>
                <th className={`${tableHeadClass} w-12`}>No</th>
                <th className={`${tableHeadClass} w-40 text-left`}>Kode Unit</th>
                <th className={`${tableHeadClass} text-left`}>Judul Unit</th>
                <th className={`${tableHeadClass} w-72 text-left`}>Standar Kompetensi Kerja</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, idx) => (
                <tr key={unit.id}>
                  <td className={`${tableCellClass} text-center text-gray-500`}>{idx + 1}</td>
                  <td className={tableCellClass}>
                    <input type="text" aria-label={`Kode unit ${idx + 1}`} value={unit.kode_unit} disabled readOnly className={`${cellInputClass} font-mono`} />
                  </td>
                  <td className={tableCellClass}>
                    <input type="text" aria-label={`Judul unit ${idx + 1}`} value={unit.judul_unit} disabled readOnly className={cellInputClass} />
                  </td>
                  {idx === 0 && (
                    <td rowSpan={units.length} className={`${tableCellClass} align-top`}>
                      <textarea
                        aria-label="Standar kompetensi kerja"
                        value={payload.skema.standar_kompetensi_kerja ?? ""}
                        disabled
                        readOnly
                        rows={Math.max(6, units.length * 2)}
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-xs text-gray-700 leading-relaxed px-0 py-0 resize-none disabled:text-gray-700"
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Bagian 3 - Bukti Kelengkapan Pemohon                                    */
/* ---------------------------------------------------------------------- */

interface BarisBukti {
  key: string;
  label: string;
  namaFile: string | null;
  memenuhi: boolean;
  tidakMemenuhi: boolean;
  tidakAda: boolean;
  onPilih?: (file: File) => void;
  onHapus?: () => void;
  onLihat?: () => void;
  proses?: boolean;
}

function PersyaratanTable({ items, isEditing, accept }: { items: BarisBukti[]; isEditing: boolean; accept?: string }) {
  return (
    <div className="space-y-3">
      <table className="w-full border border-gray-300 border-collapse text-sm">
        <thead>
          <tr>
            <th rowSpan={2} className={`${tableHeadClass} w-12`}>No</th>
            <th rowSpan={2} className={`${tableHeadClass} text-left`}>Bukti Persyaratan Dasar</th>
            <th colSpan={2} className={tableHeadClass}>Ada</th>
            <th rowSpan={2} className={`${tableHeadClass} w-24`}>Tidak Ada</th>
          </tr>
          <tr>
            <th className={`${tableHeadClass} w-28`}>Memenuhi Syarat</th>
            <th className={`${tableHeadClass} w-28`}>Tidak Memenuhi Syarat</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.key}>
              <td className={`${tableCellClass} text-center text-gray-500`}>{idx + 1}</td>
              <td className={tableCellClass}>
                <textarea
                  aria-label={`Bukti ${idx + 1}`}
                  value={item.label}
                  disabled
                  readOnly
                  rows={2}
                  className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm text-gray-800 px-0 py-0 resize-none disabled:text-gray-700"
                />
                <FileUploadTrigger
                  namaFile={item.namaFile}
                  isEditing={isEditing}
                  proses={item.proses}
                  accept={accept}
                  onPilih={item.onPilih}
                  onHapus={item.onHapus}
                  onLihat={item.onLihat}
                />
              </td>
              <td className={tableCellClass}>
                <TableCheckbox checked={item.memenuhi} label="Memenuhi syarat" />
              </td>
              <td className={tableCellClass}>
                <TableCheckbox checked={item.tidakMemenuhi} label="Tidak memenuhi syarat" />
              </td>
              <td className={tableCellClass}>
                <TableCheckbox checked={item.tidakAda} label="Tidak ada" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionBuktiKelengkapan({
  payload,
  isian,
  isEditing,
  errors,
  bisaUbah,
  buktiProses,
  versiTtd,
  onUnggah,
  onHapusBukti,
  onLihatBukti,
  onTandaTangan,
}: {
  payload: Apl01Payload;
  isian: Apl01Isian;
  isEditing: boolean;
  errors: Record<string, string>;
  bisaUbah: boolean;
  buktiProses: number | null;
  versiTtd: number;
  onUnggah: (bukti: Apl01BuktiPersyaratan, file: File) => void;
  onHapusBukti: (bukti: Apl01BuktiPersyaratan) => void;
  onLihatBukti: (bukti: Apl01BuktiPersyaratan) => void;
  onTandaTangan: () => void;
}) {
  const meta = payload.dokumen;
  const accept = payload.unggah.mimes.map((m) => `.${m}`).join(",");
  const rekomendasi = meta.hasil_rekomendasi_admin === "diterima" ? "Diterima" : meta.hasil_rekomendasi_admin === "ditolak" ? "Tidak diterima" : "";

  const persyaratanDasar: BarisBukti[] = payload.bukti_persyaratan.map((b) => ({
    key: `pd-${b.id}`,
    label: b.deskripsi,
    namaFile: b.file?.nama ?? null,
    memenuhi: b.memenuhi_syarat === true,
    tidakMemenuhi: b.memenuhi_syarat === false && b.ada !== false,
    tidakAda: b.ada === false,
    proses: buktiProses === b.id,
    onPilih: bisaUbah ? (file) => onUnggah(b, file) : undefined,
    onHapus: bisaUbah ? () => onHapusBukti(b) : undefined,
    onLihat: b.file ? () => onLihatBukti(b) : undefined,
  }));

  // Bukti administratif berasal dari berkas pendaftaran (tidak diunggah ulang di sini).
  const buktiAdministratif: BarisBukti[] = payload.bukti_administratif.map((b) => ({
    key: `ba-${b.jenis}`,
    label: b.label,
    namaFile: b.nama_file ?? (b.ada ? "Diunggah saat pendaftaran" : null),
    memenuhi: b.verifikasi === "memenuhi",
    tidakMemenuhi: b.verifikasi === "tidak_memenuhi",
    tidakAda: b.verifikasi === "tidak_ada",
  }));

  return (
    <section id="bukti-kelengkapan" className="scroll-mt-28">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500">Bagian 3:</p>
        <h2 className="text-2xl md:text-[28px] font-bold text-gray-800 tracking-tight">Bukti Kelengkapan Pemohon</h2>
      </div>

      <div className="space-y-8">
        <div className="space-y-3" data-field="bukti_persyaratan">
          <h3 className="text-sm font-bold text-gray-800">1. Bukti Persyaratan Dasar Pemohon</h3>
          <PersyaratanTable items={persyaratanDasar} isEditing={isEditing} accept={accept} />
          <ErrorText message={errors.bukti_persyaratan} indent={false} />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800">2. Bukti Administratif</h3>
          <PersyaratanTable items={buktiAdministratif} isEditing={false} />
        </div>

        <table className="w-full border border-gray-300 border-collapse text-sm">
          <tbody>
            <tr>
              <td rowSpan={3} className={`${tableCellClass} w-1/2`}>
                <p className="font-semibold text-gray-800 mb-1.5">Rekomendasi (diisi oleh LSP):</p>
                <p className="text-xs text-gray-600 leading-relaxed">Berdasarkan ketentuan persyaratan dasar, maka pemohon:</p>
                <div className="flex items-center gap-4 mt-2">
                  {(["Diterima", "Tidak diterima"] as const).map((opt, i) => (
                    <span
                      key={opt}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold select-none ${
                        opt === "Diterima" ? "text-[#5A7A22]" : "text-red-500"
                      } cursor-default ${rekomendasi && rekomendasi !== opt ? "opacity-30" : ""}`}
                    >
                      {opt}
                      {i === 0 && <span className="text-gray-300">/</span>}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  sebagai peserta sertifikasi
                  <br />
                  <span className="italic">*coret yang tidak sesuai</span>
                </p>
              </td>
              <td className={`${tableCellClass} font-semibold text-gray-700`}>Pemohon/Kandidat:</td>
            </tr>
            <tr>
              <td className={tableCellClass}>
                <div className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-xs text-gray-500">Nama</span>
                  <input type="text" aria-label="Nama pemohon" value={isian.pribadi.nama_lengkap ?? ""} disabled readOnly className={cellInputClass} />
                </div>
              </td>
            </tr>
            <tr>
              <td className={tableCellClass} data-field="tanda_tangan">
                <SignatureBox
                  label="Tanda Tangan/Tanggal"
                  penilaianId={meta.penilaian_id}
                  pihak="asesi"
                  ada={meta.tanda_tangan.asesi.ada}
                  tanggal={meta.tanda_tangan.asesi.tanggal}
                  versi={versiTtd}
                  onClick={bisaUbah ? onTandaTangan : undefined}
                />
                <ErrorText message={errors.tanda_tangan} indent={false} />
              </td>
            </tr>

            <tr>
              <td rowSpan={3} className={tableCellClass}>
                <p className="font-semibold text-gray-800 mb-2">Catatan:</p>
                <textarea
                  aria-label="Catatan admin LSP"
                  value={meta.catatan_admin ?? ""}
                  disabled
                  readOnly
                  rows={6}
                  className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-xs text-gray-700 px-0 py-0 resize-none disabled:text-gray-600"
                />
              </td>
              <td className={`${tableCellClass} font-semibold text-gray-700`}>Admin LSP:</td>
            </tr>
            <tr>
              <td className={tableCellClass}>
                <div className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-xs text-gray-500">Nama</span>
                  <input type="text" aria-label="Nama admin LSP" value={payload.admin.nama ?? ""} disabled readOnly className={cellInputClass} />
                </div>
              </td>
            </tr>
            <tr>
              <td className={tableCellClass}>
                <SignatureBox
                  label="Tanda Tangan/Tanggal"
                  penilaianId={meta.penilaian_id}
                  pihak="admin"
                  ada={meta.tanda_tangan.admin.ada}
                  tanggal={meta.tanda_tangan.admin.tanggal}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Page                                                                     */
/* ---------------------------------------------------------------------- */

export function Apl01Page({ penilaian }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Apl01Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false }, // jangan timpa isian yang sedang diedit
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.APL.01" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.APL.01..." />;

  return <Apl01Form key={data.dokumen.id} payload={data} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Apl01Form({ payload, setPayload }: { payload: Apl01Payload; setPayload: (p: Apl01Payload) => Promise<unknown> }) {
  const { mutate } = useSWRConfig();
  const meta = payload.dokumen;
  const penilaianId = meta.penilaian_id;
  const bisaUbah = meta.dapat_diubah;

  const [isian, setIsian] = useState<Apl01Isian>(payload.isian);
  const [isEditing, setIsEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [buktiProses, setBuktiProses] = useState<number | null>(null);
  const [dialogTtd, setDialogTtd] = useState(false);
  const [versiTtd, setVersiTtd] = useState(0);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [prosesKirim, setProsesKirim] = useState(false);

  // Scroll-spy bagian formulir -> sidebar (sama seperti layout APL.01 asli).
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && SECTIONS.includes(hash)) {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }

    const observers = SECTIONS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          window.dispatchEvent(new CustomEvent("apl01-section-change", { detail: id }));
          if (window.location.hash !== `#${id}`) window.history.replaceState(null, "", `#${id}`);
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // Peringatan sebelum meninggalkan halaman bila ada perubahan belum disimpan.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const terima = async (res: Apl01Payload, opsi: { resetIsian?: boolean } = {}) => {
    const statusBerubah = res.dokumen.status !== meta.status;
    if (meta.tanda_tangan.asesi.ada && !res.dokumen.tanda_tangan.asesi.ada) {
      toast.info("Isi dokumen berubah, silakan tanda tangani ulang.");
    }
    await setPayload(res);
    if (opsi.resetIsian) setIsian(res.isian);
    // Sidebar & ringkasan memakai status dari detail penilaian.
    if (statusBerubah) void mutate(swrKey.penilaian(penilaianId));
  };

  const ubah = (path: Path, value: string | null) => {
    setIsian((s) => setel(s, path, value));
    setDirty(true);
    setErrors((e) => {
      const salinan = { ...e };
      delete salinan[`isian.${path}`];
      return salinan;
    });
  };

  const handleUbah = () => setIsEditing(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    setMenyimpan(true);
    try {
      const res = await mukDokumen.simpan<Apl01Payload, Apl01Patch>(penilaianId, SLUG, { isian });
      await terima(res, { resetIsian: true });
      setDirty(false);
      setIsEditing(false);
      setErrors({});
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      const fe = fieldErrors(err);
      setErrors(fe);
      toast.error(Object.keys(fe).length ? "Periksa kembali isian yang ditandai." : pesanError(err, "Gagal menyimpan."));
    } finally {
      setMenyimpan(false);
    }
  };

  const unggah = async (bukti: Apl01BuktiPersyaratan, file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!payload.unggah.mimes.includes(ext)) {
      toast.error("Berkas harus berformat PDF, JPG, atau PNG.");
      return;
    }
    if (file.size > payload.unggah.max_kb * 1024) {
      toast.error(`Ukuran berkas maksimal ${Math.round(payload.unggah.max_kb / 1024)} MB.`);
      return;
    }
    setBuktiProses(bukti.id);
    try {
      await terima(await mukDokumen.unggahBuktiApl01<Apl01Payload>(penilaianId, bukti.id, file));
      setErrors((e) => {
        const salinan = { ...e };
        delete salinan.bukti_persyaratan;
        return salinan;
      });
      toast.success("Berkas diunggah.");
    } catch (err) {
      toast.error(fieldErrors(err).file ?? pesanError(err, "Gagal mengunggah berkas."));
    } finally {
      setBuktiProses(null);
    }
  };

  const hapusBukti = async (bukti: Apl01BuktiPersyaratan) => {
    setBuktiProses(bukti.id);
    try {
      await terima(await mukDokumen.hapusBuktiApl01<Apl01Payload>(penilaianId, bukti.id));
    } catch (err) {
      toast.error(pesanError(err, "Gagal menghapus berkas."));
    } finally {
      setBuktiProses(null);
    }
  };

  const lihatBukti = async (bukti: Apl01BuktiPersyaratan) => {
    // Buka tab dulu (sinkron dengan klik) agar tidak diblokir popup blocker.
    const tab = window.open("", "_blank");
    try {
      const blob = await mukDokumen.berkasBuktiApl01(penilaianId, bukti.id);
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      toast.error(pesanError(err, "Berkas tidak dapat dibuka."));
    }
  };

  const bukaTandaTangan = () => {
    if (isEditing && dirty) {
      toast.error("Simpan perubahan terlebih dahulu sebelum menandatangani.");
      return;
    }
    setDialogTtd(true);
  };

  const simpanTandaTangan = async (dataUrl: string) => {
    try {
      await terima(await mukDokumen.tandaTangan<Apl01Payload>(penilaianId, SLUG, dataUrl));
      setVersiTtd((v) => v + 1);
      setErrors((e) => {
        const salinan = { ...e };
        delete salinan.tanda_tangan;
        return salinan;
      });
      toast.success("Tanda tangan tersimpan.");
    } catch (err) {
      toast.error(fieldErrors(err).tanda_tangan ?? pesanError(err, "Gagal menyimpan tanda tangan."));
      throw err;
    }
  };

  const kirim = async () => {
    setProsesKirim(true);
    try {
      const res = await mukDokumen.submit<Apl01Payload>(penilaianId, SLUG);
      setKonfirmasi(false);
      await terima(res, { resetIsian: true });
      toast.success("FR.APL.01 berhasil dikirim.");
    } catch (err) {
      setKonfirmasi(false);
      const fe = fieldErrors(err);
      if (statusError(err) === 422 && Object.keys(fe).length) {
        setErrors(fe);
        toast.error("Lengkapi isian yang ditandai sebelum mengirim.");
        const pertama = Object.keys(fe)[0];
        const target = document.querySelector(`[data-field="${pertama}"]`) ?? document.querySelector(`[name="${pertama.replace("isian.", "")}"]`);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error(pesanError(err, "Gagal mengirim dokumen."));
      }
    } finally {
      setProsesKirim(false);
    }
  };

  const adaBerkas = payload.bukti_persyaratan.some((b) => b.file) || payload.bukti_persyaratan.length === 0;
  const siapKirim = meta.tanda_tangan.asesi.ada && adaBerkas && !dirty;
  const sectionProps: SectionProps = { isian, ubah, isEditing: isEditing && bisaUbah, errors };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white px-6 md:px-12 py-8 md:py-10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>Dikirim {formatTanggal(meta.submitted_at)}</span>}
          {payload.prefill && bisaUbah && <span>Sebagian data diisi dari profil akun Anda.</span>}
          {bisaUbah && meta.hasil_rekomendasi_admin === "ditolak" && (
            <span className="text-red-600 font-semibold">
              Dikembalikan admin LSP untuk revisi. Lihat catatan di bagian bawah, perbaiki, tanda tangani, lalu kirim ulang.
            </span>
          )}
        </div>
        <EditSaveControls
          bisaUbah={bisaUbah}
          isEditing={isEditing}
          savedSuccess={savedSuccess}
          menyimpan={menyimpan}
          onUbah={handleUbah}
          onKirim={() => setKonfirmasi(true)}
          siapKirim={siapKirim}
        />
      </div>

      <div className="space-y-10">
        <SectionRincian {...sectionProps} opsiJenisKelamin={payload.opsi.jenis_kelamin} />
        <SectionDivider />
        <SectionDataSertifikasi {...sectionProps} payload={payload} />
        <SectionDivider />
        <SectionBuktiKelengkapan
          payload={payload}
          isian={isian}
          isEditing={isEditing && bisaUbah}
          errors={errors}
          bisaUbah={bisaUbah}
          buktiProses={buktiProses}
          versiTtd={versiTtd}
          onUnggah={unggah}
          onHapusBukti={hapusBukti}
          onLihatBukti={lihatBukti}
          onTandaTangan={bukaTandaTangan}
        />
      </div>

      <div className="flex justify-end pt-4">
        <EditSaveControls
          bisaUbah={bisaUbah}
          isEditing={isEditing}
          savedSuccess={savedSuccess}
          menyimpan={menyimpan}
          onUbah={handleUbah}
          onKirim={() => setKonfirmasi(true)}
          siapKirim={siapKirim}
        />
      </div>

      <SignatureDialog
        open={dialogTtd}
        onOpenChange={setDialogTtd}
        title="Tanda Tangan Pemohon/Kandidat"
        keterangan="Dengan menandatangani, saya menyatakan data di atas benar. Mengubah isian atau berkas setelah menandatangani akan menghapus tanda tangan."
        onSimpan={simpanTandaTangan}
      />

      <ConfirmDialog
        open={konfirmasi}
        onOpenChange={setKonfirmasi}
        title="Kirim FR.APL.01?"
        description={
          <>
            <p>Setelah dikirim, dokumen tidak dapat diubah dan akan ditinjau oleh admin LSP.</p>
            <p>Pastikan seluruh data sudah benar.</p>
          </>
        }
        confirmLabel="Kirim sekarang"
        onConfirm={kirim}
        loading={prosesKirim}
      />
    </form>
  );
}
