"use client";

/*
 * FR.AK.01 - Persetujuan Asesmen dan Kerahasiaan.
 * Tampilan & style mengikuti mockup app/dashboard/fr/ak-01; data & aksi disambungkan ke API.
 * Asesor mengisi TUK, bukti yang akan dikumpulkan & pelaksanaan, lalu menandatangani;
 * asesi menyetujui pernyataan dengan tanda tangan.
 * Otomatis: skema, nama asesor/asesi, TUK (FR.AK.07), bukti (rencana FR.MAPA.01), jadwal.
 */

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ak01Isian, Ak01Payload } from "@/types/dokumen";
import { PesanError, checkboxClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";

const SLUG = "ak-01";

const PENGANTAR = "Persetujuan Asesmen ini untuk menjamin bahwa Asesi telah diberi arahan secara rinci tentang perencanaan dan proses asesmen";

export function Ak01Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ak01Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.AK.01" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.AK.01..." />;

  return <Ak01Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

/** "2026-11-01" -> "Minggu, 1 November 2026" */
function hariTanggal(tanggal: string | null): string {
  return tanggal ? formatTanggal(tanggal, "EEEE, d MMMM yyyy") : "";
}

function Ak01Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ak01Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ak01Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ak01Isian, Ak01Payload>({ payload, setPayload, slug: SLUG, nama: "FR.AK.01", peran });
  const { meta, isian, editable, errors, ubah } = f;
  const info = payload.info;

  const toggleBukti = (v: string) =>
    ubah((p) => ({ ...p, bukti: p.bukti.includes(v) ? p.bukti.filter((x) => x !== v) : [...p.bukti, v] }), "isian.bukti");

  const ubahPelaksanaan = (kunci: keyof Ak01Isian["pelaksanaan"], nilai: string) =>
    ubah((p) => ({ ...p, pelaksanaan: { ...p.pelaksanaan, [kunci]: nilai || null } }), `isian.pelaksanaan.${kunci}`);

  const pernyataan = [
    { judul: "Asesi:", teks: payload.pernyataan.asesi_banding },
    { judul: "Asesor:", teks: payload.pernyataan.asesor },
    { judul: "Asesi:", teks: payload.pernyataan.asesi_setuju },
  ];

  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <DokumenStatusBadge status={meta.status} />
          {meta.submitted_at && <span>· Dikirim {formatTanggal(meta.submitted_at)}</span>}
        </div>
        <AkControls f={f} />
      </div>

      <AkBanner f={f} />
      {meta.persetujuan && !meta.persetujuan.bisa && meta.status !== "selesai" && meta.persetujuan.alasan && (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">{meta.persetujuan.alasan}</p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-2">
        <AkHeader
          info={info}
          opsiTuk={payload.opsi_tuk}
          tuk={isian.tuk}
          onTuk={(tuk) => ubah((p) => ({ ...p, tuk }), "isian.tuk")}
          editable={editable}
          errors={errors}
          pengantar={PENGANTAR}
        >
          <tr>
            <td colSpan={2} className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-600">
              Bukti yang akan dikumpulkan
            </td>
            <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="px-3 py-3 border border-gray-200" data-error="isian.bukti">
              <div className="grid grid-cols-2 grid-rows-4 grid-flow-col gap-x-8 gap-y-2">
                {payload.opsi_bukti.map((item) => (
                  <label
                    key={item.value}
                    className={`flex items-center gap-2.5 text-sm text-gray-700 ${editable ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isian.bukti.includes(item.value)}
                      disabled={!editable}
                      onChange={() => toggleBukti(item.value)}
                      className={checkboxClass}
                    />
                    {item.label}
                    {item.value === "lainnya" && (
                      <input
                        type="text"
                        aria-label="Bukti lainnya"
                        value={isian.bukti_lainnya ?? ""}
                        maxLength={255}
                        onChange={(e) => ubah((p) => ({ ...p, bukti_lainnya: e.target.value }), "isian.bukti")}
                        disabled={!editable || !isian.bukti.includes("lainnya")}
                        placeholder="......"
                        className="flex-1 min-w-0 px-2 py-1 text-xs text-gray-800 bg-white border border-gray-300 focus:border-[#7E9631] focus:outline-none focus:ring-2 focus:ring-[#7E9631]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    )}
                  </label>
                ))}
              </div>
              <PesanError kunci="isian.bukti" errors={errors} />
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-600">
              Pelaksanaan asesmen disepakati pada
            </td>
            <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
            <td className="p-0 border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="w-32 px-4 py-3 border border-gray-200 text-gray-600">Hari/Tanggal</td>
                    <td className="w-8 px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-2 border border-gray-200" data-error="isian.pelaksanaan.tanggal">
                      {editable ? (
                        <input
                          type="date"
                          aria-label="Tanggal pelaksanaan"
                          value={isian.pelaksanaan.tanggal ?? ""}
                          onChange={(e) => ubahPelaksanaan("tanggal", e.target.value)}
                          className={inputClass}
                        />
                      ) : (
                        <input type="text" aria-label="Hari/Tanggal" value={hariTanggal(isian.pelaksanaan.tanggal)} disabled readOnly className={inputClass} />
                      )}
                      <PesanError kunci="isian.pelaksanaan.tanggal" errors={errors} />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">Waktu</td>
                    <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-2 border border-gray-200" data-error="isian.pelaksanaan.waktu">
                      <input
                        type="text"
                        aria-label="Waktu pelaksanaan"
                        value={isian.pelaksanaan.waktu ?? ""}
                        maxLength={100}
                        onChange={(e) => ubahPelaksanaan("waktu", e.target.value)}
                        disabled={!editable}
                        placeholder="mis. 08:00 - 12:00 WIB"
                        className={inputClass}
                      />
                      <PesanError kunci="isian.pelaksanaan.waktu" errors={errors} />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">TUK</td>
                    <td className="px-2 py-3 border border-gray-200 text-center text-gray-400">:</td>
                    <td className="px-3 py-2 border border-gray-200" data-error="isian.pelaksanaan.tuk">
                      <input
                        type="text"
                        aria-label="TUK pelaksanaan"
                        value={isian.pelaksanaan.tuk ?? ""}
                        maxLength={255}
                        onChange={(e) => ubahPelaksanaan("tuk", e.target.value)}
                        disabled={!editable}
                        className={inputClass}
                      />
                      <PesanError kunci="isian.pelaksanaan.tuk" errors={errors} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          {pernyataan.map((p, idx) => (
            <tr key={idx}>
              <td colSpan={4} className="px-4 py-3 border border-gray-200">
                <p className="font-bold text-gray-800 mb-1">{p.judul}</p>
                <p className="whitespace-pre-wrap text-sm text-gray-700">{p.teks}</p>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} className="align-top px-4 py-3 border border-gray-200">
              <p className="text-gray-700 mb-2">Tanda tangan Asesor :</p>
              <TtdKotak f={f} pihak="asesor" />
              <PesanError kunci="tanda_tangan" errors={errors} />
            </td>
            <td colSpan={2} className="align-top px-4 py-3 border border-gray-200">
              <p className="text-gray-700 mb-2">Tanggal :</p>
              <input
                type="text"
                aria-label="Tanggal tanda tangan asesor"
                value={meta.tanda_tangan.asesor.tanggal ? formatTanggal(meta.tanda_tangan.asesor.tanggal) : ""}
                disabled
                readOnly
                className={inputClass}
              />
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="align-top px-4 py-3 border border-gray-200">
              <p className="text-gray-700 mb-2">Tanda tangan Asesi :</p>
              <TtdKotak f={f} pihak="asesi" />
            </td>
            <td colSpan={2} className="align-top px-4 py-3 border border-gray-200">
              <p className="text-gray-700 mb-2">Tanggal :</p>
              <input
                type="text"
                aria-label="Tanggal tanda tangan asesi"
                value={meta.tanda_tangan.asesi.tanggal ? formatTanggal(meta.tanda_tangan.asesi.tanggal) : ""}
                disabled
                readOnly
                className={inputClass}
              />
            </td>
          </tr>
        </AkHeader>

        <p className="text-xs italic text-gray-500 px-1">*coret yang tidak perlu</p>
      </div>

      <div className="flex justify-end">
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
