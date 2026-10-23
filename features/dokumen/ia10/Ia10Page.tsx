"use client";

/*
 * FR.IA.10 - Verifikasi Pihak Ketiga (metode VP).
 * Tampilan & style mengikuti mockup app/dashboard/fr/ia-10; data & aksi disambungkan ke API.
 * Asesor mencatat hasil verifikasi dengan pihak ketiga, tanda tangan, lalu Selesaikan
 * (tanpa persetujuan asesi). Tempat kerja/alamat/telepon terisi awal dari FR.APL.01.
 */

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import { pesanError } from "@/lib/api/axios";
import { formatTanggal } from "@/lib/format";
import { DokumenStatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import type { DokumenPageProps } from "@/features/dokumen/registry";
import type { Ia10Isian, Ia10Payload, Pencapaian } from "@/types/dokumen";
import { EditableText, PesanError, checkboxClass, inputClass } from "@/features/dokumen/mapa/MapaShared";
import { AkBanner, AkControls, AkDialogs, AkHeader, TtdKotak, useAkForm } from "@/features/dokumen/ak/AkShared";
import { BarisTanggal } from "@/features/dokumen/ak/BarisHeader";

const SLUG = "ia-10";

const PANDUAN_ASESOR = [
  "Verifikasi pihak ketiga dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.",
  "Tentukan pihak ketiga yang akan dimintai verifikasi.",
  "Ajukan pertanyaan kepada pihak ketiga.",
  "Berikan penilaian kepada asesi berdasarkan verifikasi pihak ketiga.",
  "Pertanyaan/pernyataan dapat dikembangkan sesuai dengan konteks pekerjaan dan relasi.",
];

const CITATION =
  "Diadopsi dari tempat yang disediakan di Depratemen Pendidikan dan Pelatihan, Australia. Merancang alat asesmen untuk hasil yang berkualitas di VET.2008";

type Uraian = "hubungan" | "lama_bekerja" | "kedekatan" | "pengalaman" | "keyakinan" | "kebutuhan_pelatihan" | "komentar";

const HUBUNGAN: { key: Uraian; label: string; rows: number }[] = [
  { key: "hubungan", label: "Apa hubungan Anda dengan asesi?", rows: 1 },
  { key: "lama_bekerja", label: "Berapa lama Anda bekerja dengan asesi?", rows: 1 },
  { key: "kedekatan", label: "Seberapa dekat Anda bekerja dengan asesi di area yang dinilai?", rows: 1 },
  {
    key: "pengalaman",
    label: "Apa pengalaman teknis dan/atau kualifikasi Anda di bidang yang dinilai? (termasuk asesmen atau kualifikasi pelatihan)",
    rows: 2,
  },
];

const KEYAKINAN: { key: Uraian; label: string }[] = [
  { key: "keyakinan", label: "Secara keseluruhan, apakah Anda yakin asesi melakukan sesuai standar yang diminta oleh unit kompetensi secara konsisten?" },
  { key: "kebutuhan_pelatihan", label: "Identifikasi kebutuhan pelatihan lebih lanjut untuk asesi:" },
  { key: "komentar", label: "Ada komentar lain:" },
];

const PENGAWAS: { key: keyof Ia10Isian["pengawas"]; label: string }[] = [
  { key: "tempat_kerja", label: "Tempat Kerja" },
  { key: "alamat", label: "Alamat" },
  { key: "telepon", label: "Telepon" },
];

export function Ia10Page({ penilaian, role }: DokumenPageProps) {
  const { data, error, isLoading, mutate } = useSWR(
    swrKey.dokumen(penilaian.id, SLUG),
    () => mukDokumen.get<Ia10Payload>(penilaian.id, SLUG),
    { revalidateOnFocus: false },
  );

  if (error) {
    return <ErrorState title="Gagal memuat FR.IA.10" description={pesanError(error)} onRetry={() => mutate()} />;
  }
  if (isLoading || !data) return <PageLoader label="Memuat FR.IA.10..." />;

  return <Ia10Form key={data.dokumen.id} payload={data} peran={role} setPayload={(p) => mutate(p, { revalidate: false })} />;
}

function Ia10Form({
  payload,
  peran,
  setPayload,
}: {
  payload: Ia10Payload;
  peran: DokumenPageProps["role"];
  setPayload: (p: Ia10Payload) => Promise<unknown>;
}) {
  const f = useAkForm<Ia10Isian, Ia10Payload>({ payload, setPayload, slug: SLUG, nama: "FR.IA.10", peran, tanpaPersetujuan: true });
  const { meta, isian, editable, errors, ubah } = f;

  const ubahPengawas = (key: keyof Ia10Isian["pengawas"], v: string) =>
    ubah((p) => ({ ...p, pengawas: { ...p.pengawas, [key]: v } }), "isian.pengawas");

  const setJawaban = (i: number, nilai: Exclude<Pencapaian, null>) =>
    ubah((p) => ({ ...p, jawaban: p.jawaban.map((j, k) => (k === i ? (j === nilai ? null : nilai) : j)) }), `isian.jawaban.${i}`);

  const barisUraian = (u: { key: Uraian; label: string; rows?: number }) => (
    <tr key={u.key} data-error={`isian.${u.key}`}>
      <td className="align-top px-4 py-3 border border-gray-200 font-semibold text-gray-700">{u.label}</td>
      <td className="px-4 py-3 border border-gray-200">
        <EditableText
          value={isian[u.key] ?? ""}
          onChange={(v) => ubah((p) => ({ ...p, [u.key]: v }), `isian.${u.key}`)}
          isEditing={editable}
          ariaLabel={u.label}
          className="text-sm text-gray-700"
          rows={u.rows ?? 2}
        />
        <PesanError kunci={`isian.${u.key}`} errors={errors} />
      </td>
    </tr>
  );

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

        {/* Panduan bagi Asesor */}
        <div className="border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 font-bold text-gray-800 bg-gray-50">PANDUAN BAGI ASESOR</div>
          <ul className="list-disc list-outside pl-8 pr-4 py-3 space-y-1.5">
            {PANDUAN_ASESOR.map((teks, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-snug">
                {teks}
              </li>
            ))}
          </ul>
        </div>

        {/* Nama Pengawas */}
        <div className="border border-gray-200" data-error="isian.pengawas">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td colSpan={2} className="px-4 py-3 border border-gray-200 font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">Nama Pengawas/Penyelia/Atasan/Orang lain di Perusahaan:</span>
                    <input
                      type="text"
                      aria-label="Nama pengawas"
                      value={isian.pengawas.nama ?? ""}
                      maxLength={500}
                      onChange={(e) => ubahPengawas("nama", e.target.value)}
                      disabled={!editable}
                      className={`${inputClass} font-normal`}
                    />
                  </div>
                  <PesanError kunci="isian.pengawas" errors={errors} />
                </td>
              </tr>
              {PENGAWAS.map((p) => (
                <tr key={p.key}>
                  <td className="w-48 px-4 py-3 border border-gray-200 text-gray-600">{p.label}</td>
                  <td className="px-3 py-2 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">:</span>
                      <input
                        type="text"
                        aria-label={p.label}
                        value={isian.pengawas[p.key] ?? ""}
                        maxLength={500}
                        onChange={(e) => ubahPengawas(p.key, e.target.value)}
                        disabled={!editable}
                        className={inputClass}
                      />
                    </div>
                  </td>
                </tr>
              ))}
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
                <th className="px-4 py-2.5 border border-gray-200 bg-gray-50">Pertanyaan</th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Ya</th>
                <th className="px-2 py-2.5 border border-gray-200 bg-gray-50">Tidak</th>
              </tr>
            </thead>
            <tbody>
              {payload.pertanyaan.map((teks, i) => (
                <tr key={i} data-error={`isian.jawaban.${i}`}>
                  <td className="px-4 py-2.5 border border-gray-200">
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="shrink-0">&#8226;</span>
                      <span>{teks}</span>
                    </div>
                    <PesanError kunci={`isian.jawaban.${i}`} errors={errors} />
                  </td>
                  {(["ya", "tidak"] as const).map((nilai) => (
                    <td key={nilai} className="px-2 py-2.5 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Pertanyaan ${i + 1}: ${nilai}`}
                        checked={isian.jawaban[i] === nilai}
                        disabled={!editable}
                        onChange={() => setJawaban(i, nilai)}
                        className={`${checkboxClass} mx-auto`}
                      />
                    </td>
                  ))}
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
            <tbody>{HUBUNGAN.map(barisUraian)}</tbody>
          </table>
        </div>

        {/* Keyakinan standar & rekomendasi */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-96" />
              <col />
            </colgroup>
            <tbody>{KEYAKINAN.map(barisUraian)}</tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-1/2 align-top px-4 py-3 border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-2">Tanda Tangan Asesor:</p>
                  <TtdKotak f={f} pihak="asesor" />
                  <PesanError kunci="tanda_tangan" errors={errors} />
                </td>
                <td className="w-1/2 align-top px-4 py-3 border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-2">Tanggal:</p>
                  <input
                    type="text"
                    aria-label="Tanggal tanda tangan"
                    value={meta.tanda_tangan.asesor.tanggal ? formatTanggal(meta.tanda_tangan.asesor.tanggal) : ""}
                    disabled
                    readOnly
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
        <AkControls f={f} />
      </div>

      <AkDialogs f={f} />
    </form>
  );
}
