"use client";

/*
 * FR.AK.06 - Meninjau Proses Asesmen — hanya asesor/lead asesor, setelah FR.AK.02 selesai.
 * Tampilan & style mengikuti mockup app/dashboard/fr/ak-06; data & aksi disambungkan ke API.
 * Dimensi kompetensi terisi awal dengan instrumen IA yang dipakai pada penilaian ini.
 */

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ak06Aspek, Ak06Dimensi, Ak06Isian, Ak06Payload } from "@/types/dokumen";
import { EditableText, PesanError, checkboxClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";
import { BarisTanggal } from "@/features/dokumen/ak/BarisHeader";

const SLUG = "ak-06";

const PENJELASAN = [
  "Peninjauan dapat dilakukan oleh lead asesor atau asesor yang melaksanakan asesmen.",
  "Peninjauan dapat dilakukan secara terpadu dalam skema sertifikasi dan/atau peserta kelompok yang homogen.",
  "Isilah pemenuhan dimensi kompetensi dengan menuliskan jenis bukti dan instrumen yang digunakan pada saat asesmen sebagai bukti terpenuhinya dimensi kompetensi.",
];

const PRINSIP = [
  { id: "validitas", label: "Validitas" },
  { id: "reliable", label: "Reliable" },
  { id: "fleksibel", label: "Fleksibel" },
  { id: "adil", label: "Adil" },
];

export function Ak06Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ak06Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.AK.06" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.AK.06..." />;

  return <Ak06Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ak06Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ak06Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ak06Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ak06Isian, Ak06Payload>({ payload, setPayload, slug: SLUG, nama: "FR.AK.06", peran, tanpaPersetujuan: true });
  const { meta, isian, editable, errors, ubah } = f;

  const togglePrinsip = (aspek: Ak06Aspek, prinsip: string) =>
    ubah((p) => {
      const lama = p.prinsip[aspek];
      return { ...p, prinsip: { ...p.prinsip, [aspek]: lama.includes(prinsip) ? lama.filter((x) => x !== prinsip) : [...lama, prinsip] } };
    });

  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>· Diselesaikan {formatTanggal(meta.submitted_at)}</span>}
        </div>
        <AkControls f={f} />
      </div>

      <AkBanner f={f} />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <AkHeader
            info={payload.info}
            opsiTuk={payload.opsi_tuk}
            tuk={isian.tuk}
            onTuk={(tuk) => ubah((p) => ({ ...p, tuk }), "isian.tuk")}
            editable={editable}
            errors={errors}
          >
            <BarisTanggal tanggal={isian.tanggal} onUbah={(v) => ubah((p) => ({ ...p, tanggal: v }), "isian.tanggal")} editable={editable} errors={errors} />
          </AkHeader>
          <p className="text-xs italic text-gray-500 px-1">*coret yang tidak perlu</p>
        </div>

        {/* Penjelasan */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">Penjelasan</div>
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
                <th rowSpan={2} className="px-4 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  Aspek yang ditinjau
                </th>
                <th colSpan={4} className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                  Kesesuaian dengan prinsip asesmen
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                {PRINSIP.map((col) => (
                  <th key={col.id} className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-2.5 border border-gray-200 font-semibold text-gray-700">
                  Prosedur asesmen:
                </td>
              </tr>
              {payload.aspek.map((row) => (
                <tr key={row.kunci}>
                  <td className="pl-8 pr-4 py-3 border border-gray-200 text-gray-700">{row.label}</td>
                  {PRINSIP.map((col) =>
                    row.tanpa.includes(col.id) ? (
                      <td key={col.id} className="border border-gray-200 bg-black" />
                    ) : (
                      <td key={col.id} className="px-2 py-3 border border-gray-200 text-center">
                        <input
                          type="checkbox"
                          aria-label={`${row.label}: ${col.label}`}
                          checked={isian.prinsip[row.kunci].includes(col.id)}
                          disabled={!editable}
                          onChange={() => togglePrinsip(row.kunci, col.id)}
                          className={`${checkboxClass} mx-auto`}
                        />
                      </td>
                    ),
                  )}
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="align-top px-4 py-3 border border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">Rekomendasi untuk peningkatan</p>
                  <EditableText
                    value={isian.rekomendasi_prinsip ?? ""}
                    onChange={(v) => ubah((p) => ({ ...p, rekomendasi_prinsip: v }))}
                    isEditing={editable}
                    ariaLabel="Rekomendasi untuk peningkatan (prinsip)"
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
                <th rowSpan={2} className="px-4 py-2.5 border border-gray-200 align-middle bg-gray-50">
                  Aspek yang ditinjau
                </th>
                <th colSpan={5} className="px-3 py-2.5 border border-gray-200 bg-gray-50">
                  Pemenuhan dimensi kompetensi
                </th>
              </tr>
              <tr className="text-xs font-semibold text-gray-700">
                {payload.opsi_dimensi.map((col) => (
                  <th key={col.value} className="px-2 py-2.5 border border-gray-200 bg-gray-50">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200">
                  <p className="font-semibold text-gray-700">Konsistensi keputusan asesmen</p>
                  <p className="mt-1 text-xs text-gray-500 leading-snug">Bukti dari berbagai asesmen diperiksa untuk konsistensi dimensi kompetensi</p>
                </td>
                {payload.opsi_dimensi.map((col) => {
                  const kunci = col.value as Ak06Dimensi;
                  return (
                    <td key={col.value} className="align-top px-2 py-3 border border-gray-200" data-error={`isian.dimensi.${kunci}`}>
                      <EditableText
                        value={isian.dimensi[kunci] ?? ""}
                        onChange={(v) => ubah((p) => ({ ...p, dimensi: { ...p.dimensi, [kunci]: v } }), `isian.dimensi.${kunci}`)}
                        isEditing={editable}
                        ariaLabel={col.label}
                        className="text-xs text-gray-700"
                        rows={3}
                      />
                      <PesanError kunci={`isian.dimensi.${kunci}`} errors={errors} />
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td colSpan={6} className="align-top px-4 py-3 border border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">Rekomendasi untuk peningkatan</p>
                  <EditableText
                    value={isian.rekomendasi_dimensi ?? ""}
                    onChange={(v) => ubah((p) => ({ ...p, rekomendasi_dimensi: v }))}
                    isEditing={editable}
                    ariaLabel="Rekomendasi untuk peningkatan (dimensi)"
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
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50 text-left">Tanggal dan Tanda Tangan</th>
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50 text-left">Komentar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="align-top px-3 py-3 border border-gray-200" data-error="isian.nama_peninjau">
                  <EditableText
                    value={isian.nama_peninjau ?? ""}
                    onChange={(v) => ubah((p) => ({ ...p, nama_peninjau: v }), "isian.nama_peninjau")}
                    isEditing={editable}
                    ariaLabel="Nama lead asesor/asesor"
                    className="text-sm text-gray-700"
                    rows={2}
                  />
                  <PesanError kunci="isian.nama_peninjau" errors={errors} />
                </td>
                <td className="align-top px-3 py-3 border border-gray-200">
                  <TtdKotak f={f} pihak="asesor" />
                  <PesanError kunci="tanda_tangan" errors={errors} />
                </td>
                <td className="align-top px-3 py-3 border border-gray-200">
                  <EditableText
                    value={isian.komentar ?? ""}
                    onChange={(v) => ubah((p) => ({ ...p, komentar: v }))}
                    isEditing={editable}
                    ariaLabel="Komentar"
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
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
