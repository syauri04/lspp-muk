"use client";

import useSWR from "swr";
import { mukDokumen, swrKey } from "@/lib/api/muk";
import type { AkInfo, Ia06aPayload, Ia06bPayload, Ia06cPayload, Ia06Header } from "@/types/dokumen";
import { KepalaAk } from "./CetakAk";
import { Coret, Kotak, TabelPenyusun, TtdPihak, tgl, tglPanjang } from "./CetakShared";

/** Kepala FR.IA.06 A/B/C: + Tanggal & Waktu. */
function KepalaIa06({ info, header }: { info: AkInfo; header: Ia06Header }) {
  return (
    <>
      <KepalaAk info={info} tuk={header.tuk}>
        <tr>
          <td colSpan={2}>Tanggal</td>
          <td className="c">:</td>
          <td>{tgl(header.tanggal)}</td>
        </tr>
        <tr>
          <td colSpan={2}>Waktu</td>
          <td className="c">:</td>
          <td>{header.waktu}</td>
        </tr>
      </KepalaAk>
      <p className="i kecil" style={{ marginTop: -10 }}>
        *Coret yang tidak perlu
      </p>
    </>
  );
}

function DaftarBernomor({ judul, baris }: { judul?: string; baris: React.ReactNode[] }) {
  return (
    <table className="tbl">
      <colgroup>
        <col style={{ width: "4%" }} />
        <col />
      </colgroup>
      <tbody>
        {judul && (
          <tr>
            <td colSpan={2} className="b c">
              {judul}
            </td>
          </tr>
        )}
        {baris.map((b, i) => (
          <tr key={i}>
            <td>{i + 1}.</td>
            <td style={{ minHeight: 40, height: 44 }}>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ------------------------------ FR.IA.06A ------------------------------ */

export function CetakIa06a({ p }: { p: Ia06aPayload }) {
  const meta = p.dokumen;
  // Penyusun & validator soal esai tersimpan di FR.IA.06B (dokumen asesor); halaman cetak khusus admin dapat membacanya.
  const { data: kunci } = useSWR(swrKey.dokumen(meta.penilaian_id, "ia-06b"), () => mukDokumen.get<Ia06bPayload>(meta.penilaian_id, "ia-06b"), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  return (
    <>
      <h1>FR.IA.06A.&nbsp;&nbsp;&nbsp;DPT – DAFTAR PERTANYAAN TERTULIS ESAI</h1>
      <KepalaIa06 info={p.info} header={p.persiapan} />

      <p className="b" style={{ marginTop: 16 }}>
        Jawablah semua pertanyaan di bawah ini:
      </p>
      <DaftarBernomor baris={p.pertanyaan.map((t, i) => <div key={i} className="pre">{t}</div>)} />

      {kunci && (
        <div style={{ marginTop: 18 }}>
          <TabelPenyusun penilaianId={meta.penilaian_id} slug="ia-06b" penyusun={kunci.penyusun} tanggalBawaan={kunci.dokumen.submitted_at} formatTgl={tglPanjang} />
        </div>
      )}
    </>
  );
}

/* ------------------------------ FR.IA.06B ------------------------------ */

export function CetakIa06b({ p }: { p: Ia06bPayload }) {
  const meta = p.dokumen;
  return (
    <>
      <h1>FR.IA.06.B.&nbsp;&nbsp;&nbsp;LEMBAR KUNCI JAWABAN PERTANYAAN TERTULIS ESAI</h1>
      <KepalaIa06 info={p.info} header={p.header} />

      <div style={{ marginTop: 16 }}>
        <DaftarBernomor judul="Jawaban:" baris={p.soal.map((s, i) => <div key={i} className="pre">{s.kunci}</div>)} />
      </div>

      <div style={{ marginTop: 18 }}>
        <TabelPenyusun penilaianId={meta.penilaian_id} slug={meta.slug} penyusun={p.penyusun} tanggalBawaan={meta.submitted_at} formatTgl={tglPanjang} />
      </div>
    </>
  );
}

/* ------------------------------ FR.IA.06C ------------------------------ */

export function CetakIa06c({ p }: { p: Ia06cPayload }) {
  const meta = p.dokumen;
  const { info, isian } = p;
  const nilai = isian.pencapaian;
  // (tercapai/ belum tercapai)*: dicoret mengikuti penilaian (semua Ya = tercapai; ada Tidak = belum tercapai).
  const tercapai = nilai.length && nilai.every((n) => n === "ya") ? 0 : nilai.some((n) => n === "tidak") ? 1 : null;

  return (
    <>
      <h1>FR.IA.06.C.&nbsp;&nbsp;LEMBAR JAWABAN PERTANYAAN TERTULIS ESAI</h1>
      <KepalaIa06 info={info} header={p.header} />

      <table className="tbl" style={{ marginTop: 16 }}>
        <colgroup>
          <col style={{ width: "4%" }} />
          <col />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2} colSpan={2}>
              Jawaban
            </th>
            <th colSpan={2}>Pencapaian</th>
          </tr>
          <tr>
            <th>Ya</th>
            <th>Tidak</th>
          </tr>
        </thead>
        <tbody>
          {p.jawaban_asesi.map((j, i) => (
            <tr key={i}>
              <td>{i + 1}.</td>
              <td className="pre" style={{ height: 130 }}>
                {j.jawaban}
              </td>
              <td className="c m">
                <Kotak on={nilai[i] === "ya"} />
              </td>
              <td className="c m">
                <Kotak on={nilai[i] === "tidak"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl putus-sebelum">
        <colgroup>
          <col style={{ width: "27%" }} />
          <col style={{ width: "3%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ height: 150 }}>Umpan balik untuk asesi</td>
            <td className="c">:</td>
            <td style={{ textAlign: "justify" }}>
              Aspek pengetahuan seluruh unit kompetensi yang diujikan (<Coret pilihan={["tercapai", " belum tercapai"]} aktif={tercapai} bintang=")*" />
              <br />
              <br />
              Tuliskan Unit/Elemen/KUK jika belum tercapai: {isian.umpan_balik ? <span className="pre">{isian.umpan_balik}</span> : "…."}
            </td>
          </tr>
          {(["asesi", "asesor"] as const).map((pihak) => (
            <FragmenTtd key={pihak} pihak={pihak} info={info} meta={meta} />
          ))}
        </tbody>
      </table>
    </>
  );
}

function FragmenTtd({ pihak, info, meta }: { pihak: "asesi" | "asesor"; info: AkInfo; meta: Ia06cPayload["dokumen"] }) {
  return (
    <>
      <tr>
        <td colSpan={3} className="b">
          {pihak === "asesi" ? "Asesi:" : "Asesor:"}
        </td>
      </tr>
      <tr>
        <td>Nama</td>
        <td className="c">:</td>
        <td>{pihak === "asesi" ? info.asesi.nama : info.asesor.nama}</td>
      </tr>
      {pihak === "asesor" && (
        <tr>
          <td>No. Reg</td>
          <td className="c">:</td>
          <td>{info.asesor.nomor_registrasi}</td>
        </tr>
      )}
      <tr>
        <td className="m">Tanda Tangan/Tanggal</td>
        <td className="c m">:</td>
        <td className="ttd-sel">
          <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak={pihak} ada={meta.tanda_tangan[pihak].ada} />
          {tgl(meta.tanda_tangan[pihak].tanggal)}
        </td>
      </tr>
    </>
  );
}
