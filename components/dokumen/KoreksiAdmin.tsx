"use client";

/*
 * Koreksi isi dokumen MUK oleh super admin (token dari CMS "Buka di MUK").
 * Dipakai bersama oleh useAkForm, useMapaForm, dan halaman dokumen khusus (APL.01, APL.02, AK.03, IA.06A):
 * - backend menentukan boleh/tidaknya (meta.koreksi: dokumen terkirim & sertifikat belum terbit),
 * - Simpan Koreksi meminta alasan; tanda tangan & status dokumen tidak berubah,
 * - perubahan dicatat (sebelum/sesudah + alasan) dan asesor diberi tahu oleh backend.
 */

import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { toast } from "sonner";
import { Loader2, PencilLine, Save, ShieldAlert, X } from "lucide-react";
import { mukDokumen } from "@/lib/api/muk";
import { fieldErrors, pesanError, statusError } from "@/lib/api/axios";
import type { DokumenMeta } from "@/types/dokumen";

export const MIN_ALASAN_KOREKSI = 10;
export const MAKS_ALASAN_KOREKSI = 1000;

/**
 * State & aksi koreksi. `body()` = bentuk isian yang dikirim (sama dengan PATCH Simpan biasa);
 * `terima` menerapkan payload hasil ke form; `setErrors` menandai field yang ditolak server.
 */
export function useKoreksiAdmin<P>({
  meta,
  slug,
  body,
  terima,
  setErrors,
  onTersimpan,
}: {
  meta: DokumenMeta;
  slug: string;
  body: () => object;
  terima: (res: P) => Promise<void> | void;
  setErrors: (e: Record<string, string>) => void;
  /** Dipanggil setelah koreksi tersimpan (mis. keluar dari mode ubah). */
  onTersimpan?: () => void;
}) {
  const bisa = !!meta.koreksi?.bisa;
  const [dialog, setDialog] = useState(false);
  const [proses, setProses] = useState(false);

  const kirim = async (alasan: string) => {
    setProses(true);
    try {
      const { data, jumlah } = await mukDokumen.koreksi<P>(meta.penilaian_id, slug, { ...body(), alasan });
      await terima(data);
      setDialog(false);
      onTersimpan?.();
      toast.success(jumlah > 0 ? `Koreksi tersimpan (${jumlah} isian berubah). Asesor telah diberi tahu.` : "Tidak ada isian yang berubah.");
    } catch (err) {
      const fe = fieldErrors(err);
      if (fe.alasan) {
        toast.error(fe.alasan);
      } else if (statusError(err) === 422 && Object.keys(fe).length) {
        // Isian ditolak (format salah / jadi tidak lengkap): tutup dialog & tandai di form.
        setDialog(false);
        setErrors(fe);
        toast.error("Koreksi ditolak. Periksa isian yang ditandai merah.");
        const pertama = Object.keys(fe)[0];
        document.querySelector(`[data-error="${pertama}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setDialog(false);
        toast.error(pesanError(err, "Gagal menyimpan koreksi."));
      }
    } finally {
      setProses(false);
    }
  };

  return { bisa, dialog, setDialog, proses, kirim };
}

export type KoreksiAdmin = ReturnType<typeof useKoreksiAdmin>;

/** Keterangan untuk super admin di atas formulir: mode koreksi atau alasan dokumen terkunci. */
export function KoreksiInfo({ meta, isEditing }: { meta: DokumenMeta; isEditing: boolean }) {
  if (!meta.koreksi) return null;
  if (!meta.koreksi.bisa) {
    return meta.koreksi.alasan ? (
      <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">{meta.koreksi.alasan}</p>
    ) : null;
  }
  return (
    <div className="flex gap-2.5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
      <ShieldAlert size={18} className="shrink-0 mt-0.5" />
      <p>
        {isEditing ? (
          <>
            <strong>Mode koreksi.</strong> Ubah isian yang perlu diperbaiki, lalu klik <strong>Simpan Koreksi</strong> dan tuliskan alasannya.
          </>
        ) : (
          <>
            Sebagai super admin Anda dapat <strong>mengoreksi</strong> isi dokumen ini.
          </>
        )}{" "}
        Tanda tangan dan status dokumen tidak berubah; setiap koreksi dicatat di riwayat dan asesor diberi tahu.
      </p>
    </div>
  );
}

/** Tombol Koreksi / Batal / Simpan Koreksi (Simpan = submit form: hook membuka dialog alasan). */
export function KoreksiTombol({
  isEditing,
  onKoreksi,
  onBatal,
  proses,
}: {
  isEditing: boolean;
  onKoreksi: () => void;
  onBatal: () => void;
  proses: boolean;
}) {
  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={onKoreksi}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-amber-500 text-amber-700 bg-white hover:bg-amber-50 transition-all cursor-pointer"
      >
        <PencilLine size={13} />
        Koreksi
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
      <button
        type="button"
        onClick={onBatal}
        disabled={proses}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
      >
        <X size={13} />
        Batal
      </button>
      <button
        type="submit"
        disabled={proses}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
      >
        {proses ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
        Simpan Koreksi
      </button>
    </div>
  );
}

/** Dialog alasan koreksi (wajib, 10–1000 karakter). */
export function AlasanKoreksiDialog({ k, nama }: { k: KoreksiAdmin; nama: string }) {
  return (
    <AlertDialog.Root open={k.dialog} onOpenChange={(o) => !k.proses && k.setDialog(o)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        {/* Isi dipasang ulang setiap dialog dibuka -> alasan selalu mulai kosong. */}
        {k.dialog && <IsiAlasanKoreksi k={k} nama={nama} />}
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

function IsiAlasanKoreksi({ k, nama }: { k: KoreksiAdmin; nama: string }) {
  const [alasan, setAlasan] = useState("");
  const panjang = alasan.trim().length;
  const sah = panjang >= MIN_ALASAN_KOREKSI && panjang <= MAKS_ALASAN_KOREKSI;

  return (
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl space-y-4">
          <AlertDialog.Title className="text-base font-bold text-gray-800">Simpan koreksi {nama}?</AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-gray-600">
            Tanda tangan tetap dipertahankan. Alasan dan perubahan dicatat di riwayat dokumen, dan asesor diberi tahu lewat email.
          </AlertDialog.Description>
          <div className="space-y-1.5">
            <label htmlFor="alasan-koreksi" className="text-xs font-semibold text-gray-700">
              Alasan koreksi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="alasan-koreksi"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              maxLength={MAKS_ALASAN_KOREKSI}
              rows={4}
              placeholder="Contoh: Salah ketik nama TUK sesuai berita acara."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
            />
            <p className={`text-[11px] ${panjang > 0 && panjang < MIN_ALASAN_KOREKSI ? "text-red-600" : "text-gray-400"}`}>
              Minimal {MIN_ALASAN_KOREKSI} karakter ({panjang}/{MAKS_ALASAN_KOREKSI}).
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <AlertDialog.Cancel
              disabled={k.proses}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Batal
            </AlertDialog.Cancel>
            <button
              type="button"
              onClick={() => void k.kirim(alasan.trim())}
              disabled={!sah || k.proses}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
            >
              {k.proses && <Loader2 size={14} className="animate-spin" />}
              Simpan Koreksi
            </button>
          </div>
        </AlertDialog.Content>
  );
}
