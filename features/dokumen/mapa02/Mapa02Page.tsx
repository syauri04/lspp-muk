"use client";

/*
 * FR.MAPA.02 - Peta Instrumen Asesmen (diisi asesor).
 * Tampilan & style mengikuti mockup app/dashboard/fr/mapa-02; daftar instrumen sesuai
 * formulir resmi. Asesor mencentang Potensi Asesi; penyusun & validator dari template CMS.
 */

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Mapa02Isian, Mapa02Payload, MapaPenandatangan } from "@/types/dokumen";
import {
  MapaControls,
  PesanError,
  SkemaHeader,
  TtdPenandatangan,
  checkboxClass,
  inputClass,
  compactInputClass,
  useMapaForm,
} from "@/features/dokumen/mapa/MapaShared";

const SLUG = "mapa-02";
const POTENSI = [1, 2, 3, 4, 5];

export function Mapa02Page({ penilaian }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Mapa02Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.MAPA.02" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.MAPA.02..." />;

  return <Mapa02Form key={data.dokumen.id} payload={data} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function KolomPenandatangan({
  judul,
  label,
  baris,
  penilaianId,
}: {
  judul: string;
  label: string;
  baris: MapaPenandatangan[];
  penilaianId: number;
}) {
  const daftar: (MapaPenandatangan | null)[] = baris.length ? baris : [null];

  return (
    <td className="w-1/2 align-top border border-gray-200 p-0">
      <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200 font-bold text-gray-800">{judul}</div>
      {daftar.map((b, idx) => (
        <div key={b?.id ?? idx} className={`p-5 space-y-4 ${idx > 0 ? "border-t border-gray-200" : ""}`}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Nama {label}</label>
            <input type="text" aria-label={`Nama ${label}`} value={b?.nama ?? ""} disabled readOnly className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">No. Reg</label>
            <input type="text" aria-label={`No. Reg ${label}`} value={b?.no_reg ?? ""} disabled readOnly className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Tanda Tangan dan Tanggal</label>
            <TtdPenandatangan penilaianId={penilaianId} slug={SLUG} baris={b} />
          </div>
        </div>
      ))}
    </td>
  );
}

function Mapa02Form({ payload, setPayload }: { payload: Mapa02Payload; setPayload: (p: Mapa02Payload) => Promise<unknown> }) {
  const f = useMapaForm<Mapa02Isian, Mapa02Payload>({ payload, setPayload, slug: SLUG, nama: "FR.MAPA.02" });
  const { meta, isian, editable } = f;
  const units = payload.unit_kompetensi;

  const togglePotensi = (kunci: string, n: number) =>
    f.ubah(
      (prev) => {
        const lama = prev.potensi[kunci] ?? [];
        const baru = lama.includes(n) ? lama.filter((x) => x !== n) : [...lama, n].sort((a, b) => a - b);
        return { potensi: { ...prev.potensi, [kunci]: baru } };
      },
      "isian.potensi",
    );

  const adaPotensi = Object.values(isian.potensi).some((v) => v.length > 0);
  const siapSelesai = adaPotensi && !f.dirty;
  const penyusun = payload.penyusun.filter((p) => p.peran === "penyusun");
  const validator = payload.penyusun.filter((p) => p.peran === "validator");

  const kontrol = (
    <MapaControls
      bisaUbah={f.bisaUbah}
      isEditing={f.isEditing}
      savedSuccess={f.savedSuccess}
      menyimpan={f.menyimpan}
      onUbah={() => f.setIsEditing(true)}
      onSelesaikan={() => f.setKonfirmasi(true)}
      siapSelesai={siapSelesai}
      alasanBelumSiap="Centang potensi asesi pada minimal satu instrumen lalu simpan"
    />
  );

  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>· Diselesaikan {formatTanggal(meta.submitted_at)}</span>}
        </div>
        {kontrol}
      </div>

      {meta.status === "selesai" && (
        <p className="text-sm text-[#5A7A22] font-semibold bg-[#F2F5E9] border border-[#8AA53C]/40 rounded-lg p-3">
          FR.MAPA.02 sudah diselesaikan.
        </p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-8">
        <SkemaHeader skema={payload.skema} />

        {/* Tabel Unit Kompetensi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <thead>
              <tr className="text-xs font-semibold text-gray-600">
                <th className="w-45 px-3 py-2.5 border border-gray-200"></th>
                <th className="w-14 px-3 py-2.5 border border-gray-200">No</th>
                <th className="w-52 px-3 py-2.5 border border-gray-200 text-left">Kode Unit</th>
                <th className="px-3 py-2.5 border border-gray-200 text-left">Judul Unit</th>
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
                      {payload.skema.judul}
                    </td>
                  )}
                  <td className="px-3 py-2 border border-gray-200 text-center text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input type="text" aria-label="Kode unit" value={unit.kode_unit ?? ""} disabled readOnly className={`${compactInputClass} font-mono`} />
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <input type="text" aria-label="Judul unit" value={unit.judul_unit} disabled readOnly className={compactInputClass} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabel Instrumen Asesmen */}
        <div className="border border-gray-200" data-error="isian.potensi">
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
                <th rowSpan={2} className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  No
                </th>
                <th rowSpan={2} className="px-3 py-2.5 border border-gray-200 align-middle bg-gray-50 text-left">
                  Instrumen Asesmen**
                </th>
                <th colSpan={5} className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                  Potensi Asesi*
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                {POTENSI.map((n) => (
                  <th key={n} className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.instrumen.map((row) => (
                <tr key={row.kunci} className="align-top">
                  <td className="px-3 py-3 border border-gray-200 text-center text-gray-600">{row.nomor}</td>
                  <td className="px-3 py-3 border border-gray-200 overflow-hidden">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold text-gray-700 font-mono wrap-break-word">{row.kode}</p>
                      <p className="text-sm text-gray-700 wrap-break-word">{row.label}</p>
                    </div>
                  </td>
                  {POTENSI.map((n) => (
                    <td key={n} className="px-2 py-3 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${row.kode} potensi ${n}`}
                        checked={(isian.potensi[row.kunci] ?? []).includes(n)}
                        disabled={!editable}
                        onChange={() => togglePotensi(row.kunci, n)}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PesanError kunci="isian.potensi" errors={f.errors} />

        {/* Footnote */}
        <div className="text-xs text-gray-500 italic space-y-1">
          <p>* diisi berdasarkan hasil penentuan pendekatan asesmen dan perencanaan asesmen</p>
        </div>

        {/* Penyusun dan Validator */}
        {payload.penyusun.length === 0 && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Penyusun dan validator FR.MAPA.02 untuk skema &amp; metode ini belum diisi admin di CMS.
          </p>
        )}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 text-sm bg-gray-50">Penyusun dan Validator</div>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <KolomPenandatangan judul="Penyusun" label="Penyusun" baris={penyusun} penilaianId={f.penilaianId} />
                <KolomPenandatangan judul="Validator" label="Validator" baris={validator} penilaianId={f.penilaianId} />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Keterangan */}
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-gray-800">Keterangan:</p>
          <ol className="list-decimal list-inside space-y-1">
            {payload.keterangan_potensi.map((teks, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-snug">
                {teks}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="flex justify-end">{kontrol}</div>

      <ConfirmDialog
        open={f.konfirmasi}
        onOpenChange={f.setKonfirmasi}
        title="Selesaikan FR.MAPA.02?"
        description={
          <>
            <p>Setelah diselesaikan, peta instrumen tidak dapat diubah lagi.</p>
            <p>Dokumen asesmen (AK/IA) terbuka setelah FR.MAPA.01 dan FR.MAPA.02 selesai.</p>
          </>
        }
        confirmLabel="Selesaikan"
        onConfirm={f.selesaikan}
        loading={f.prosesSelesai}
      />
    </form>
  );
}
