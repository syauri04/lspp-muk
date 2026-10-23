"use client";

/*
 * FR.AK.02 - Rekaman Asesmen Kompetensi (keputusan akhir K/BK).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ak-02; data & aksi disambungkan ke API.
 * Asesor mencentang bukti per unit, memberi rekomendasi + tindak lanjut & komentar, tanda tangan,
 * Kirim ke Asesi; asesi menyetujui dengan tanda tangan. Rekomendasi menentukan status akhir penilaian.
 */

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ak02Isian, Ak02Payload, Rekomendasi } from "@/types/dokumen";
import { EditableText, PesanError, checkboxClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";
import { BarisRentangTanggal } from "@/features/dokumen/ak/BarisHeader";

const SLUG = "ak-02";

const LAMPIRAN = ["Dokumen APL 01 peserta", "Dokumen APL 02 peserta", "Bukti-bukti berkualitas peserta", "Tinjauan proses asesmen"];

export function Ak02Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ak02Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.AK.02" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.AK.02..." />;

  return <Ak02Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ak02Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ak02Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ak02Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ak02Isian, Ak02Payload>({ payload, setPayload, slug: SLUG, nama: "FR.AK.02", peran });
  const { meta, isian, editable, errors, ubah } = f;
  const info = payload.info;
  const labelClass = `flex items-center gap-2.5 text-sm text-gray-700 ${editable ? "cursor-pointer" : "cursor-default"}`;

  const toggleBukti = (kunci: string, bukti: string) =>
    ubah((p) => {
      const lama = p.bukti[kunci] ?? [];
      return { ...p, bukti: { ...p.bukti, [kunci]: lama.includes(bukti) ? lama.filter((b) => b !== bukti) : [...lama, bukti] } };
    }, `isian.bukti.${kunci}`);

  const setRekomendasi = (nilai: Rekomendasi) =>
    ubah((p) => ({ ...p, rekomendasi: p.rekomendasi === nilai ? null : nilai }), "isian.rekomendasi");

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
      {peran === "asesor" && payload.indikasi.length > 0 && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="font-semibold mb-1">Hasil belum tercapai pada dokumen IA (pertimbangkan sebelum memutuskan):</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {payload.indikasi.map((i, idx) => (
              <li key={idx}>
                {i.dokumen}: {i.keterangan}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs">Bila tetap memutuskan Kompeten, tuliskan alasan/bukti pendukung pada Komentar.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <AkHeader
            info={info}
            opsiTuk={payload.opsi_tuk}
            tuk={isian.tuk}
            onTuk={(tuk) => ubah((p) => ({ ...p, tuk }), "isian.tuk")}
            editable={editable}
            errors={errors}
          >
            <BarisRentangTanggal
              mulai={isian.tanggal_mulai}
              selesai={isian.tanggal_selesai}
              onUbah={(patch) => ubah((p) => ({ ...p, ...patch }), "isian.tanggal_mulai")}
              editable={editable}
              errors={errors}
            />
          </AkHeader>
          <p className="text-xs italic text-gray-500 px-1">*coret yang tidak perlu</p>
        </div>

        <p className="text-sm italic text-gray-600">
          Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang sesuai untuk setiap Unit Kompetensi.
        </p>

        {/* Tabel Unit Kompetensi x Bukti */}
        <div className="border border-gray-200 overflow-x-auto">
          <table className="border-collapse text-sm min-w-[1400px] w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-700">
                <th className="w-72 px-4 py-3 border border-gray-200 bg-gray-50 text-left align-middle">Unit Kompetensi</th>
                {payload.opsi_bukti.map((col) => (
                  <th key={col.value} className="px-2 py-3 border border-gray-200 bg-gray-50 align-middle">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.unit_kompetensi.map((unit) => {
                const kunci = `u${unit.id}`;
                return (
                  <tr key={unit.id} data-error={`isian.bukti.${kunci}`}>
                    <td className="px-4 py-3 border border-gray-200">
                      <p className="whitespace-pre-wrap text-sm text-gray-700">{unit.judul_unit}</p>
                      <PesanError kunci={`isian.bukti.${kunci}`} errors={errors} />
                    </td>
                    {payload.opsi_bukti.map((col) => (
                      <td key={col.value} className="px-2 py-3 border border-gray-200 text-center">
                        <input
                          type="checkbox"
                          aria-label={`${unit.judul_unit}: ${col.label}`}
                          checked={(isian.bukti[kunci] ?? []).includes(col.value)}
                          disabled={!editable}
                          onChange={() => toggleBukti(kunci, col.value)}
                          className={`${checkboxClass} mx-auto`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rekomendasi & Tindak Lanjut */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr data-error="isian.rekomendasi">
                <td className="w-56 align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Rekomendasi hasil Asesmen</td>
                <td className="px-4 py-3 border border-gray-200">
                  <div className="flex flex-wrap gap-x-10 gap-y-2">
                    <label className={labelClass}>
                      <input
                        type="checkbox"
                        checked={isian.rekomendasi === "kompeten"}
                        disabled={!editable}
                        onChange={() => setRekomendasi("kompeten")}
                        className={checkboxClass}
                      />
                      Kompeten
                    </label>
                    <label className={labelClass}>
                      <input
                        type="checkbox"
                        checked={isian.rekomendasi === "belum_kompeten"}
                        disabled={!editable}
                        onChange={() => setRekomendasi("belum_kompeten")}
                        className={checkboxClass}
                      />
                      Belum Kompeten
                    </label>
                  </div>
                  <PesanError kunci="isian.rekomendasi" errors={errors} />
                </td>
              </tr>
              <tr data-error="isian.tindak_lanjut">
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  Tindak lanjut yang dibutuhkan
                  <p className="mt-1 text-xs italic font-normal text-gray-500">
                    (Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)
                  </p>
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={isian.tindak_lanjut ?? ""}
                    onChange={(v) => ubah((p) => ({ ...p, tindak_lanjut: v }), "isian.tindak_lanjut")}
                    isEditing={editable}
                    ariaLabel="Tindak lanjut yang dibutuhkan"
                    className="text-sm text-gray-700"
                    rows={3}
                  />
                  <PesanError kunci="isian.tindak_lanjut" errors={errors} />
                </td>
              </tr>
              <tr data-error="isian.komentar">
                <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">Komentar/ Observasi oleh asesor</td>
                <td className="px-4 py-3 border border-gray-200">
                  <EditableText
                    value={isian.komentar ?? ""}
                    onChange={(v) => ubah((p) => ({ ...p, komentar: v }), "isian.komentar")}
                    isEditing={editable}
                    ariaLabel="Komentar asesor"
                    className="text-sm text-gray-700"
                    rows={3}
                  />
                  <PesanError kunci="isian.komentar" errors={errors} />
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
                <td colSpan={2} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50">
                  Asesi:
                </td>
              </tr>
              <tr>
                <td className="w-48 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="Nama asesi" value={info.asesi.nama ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda Tangan/Tanggal</td>
                <td className="px-3 py-3 border border-gray-200">
                  <TtdKotak f={f} pihak="asesi" />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 py-2.5 border border-gray-200 font-bold text-gray-800 bg-gray-50">
                  Asesor:
                </td>
              </tr>
              <tr>
                <td className="w-48 px-4 py-3 border border-gray-200 text-gray-600">Nama</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="Nama asesor" value={info.asesor.nama ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border border-gray-200 text-gray-600">No. Reg</td>
                <td className="px-3 py-2 border border-gray-200">
                  <input type="text" aria-label="No. Reg asesor" value={info.asesor.nomor_registrasi ?? ""} disabled readOnly className={inputClass} />
                </td>
              </tr>
              <tr>
                <td className="align-top px-4 py-3 border border-gray-200 text-gray-600">Tanda Tangan/Tanggal</td>
                <td className="px-3 py-3 border border-gray-200">
                  <TtdKotak f={f} pihak="asesor" />
                  <PesanError kunci="tanda_tangan" errors={errors} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Lampiran Dokumen */}
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-gray-800">LAMPIRAN DOKUMEN:</p>
          <ol className="list-decimal list-inside space-y-1">
            {LAMPIRAN.map((l) => (
              <li key={l} className="text-sm text-gray-700">
                {l}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="flex justify-end">
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
