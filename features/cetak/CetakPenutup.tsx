"use client";

import type { Ak02Payload, Ak03Payload, AkInfo, JenisTuk } from "@/types/dokumen";
import { KepalaAk } from "./CetakAk";
import { Kotak, TtdPihak, tgl } from "./CetakShared";

/** Kepala AK penutup: TUK + "Tanggal Asesmen Mulai/Selesai". */
function KepalaPenutup({ info, tuk, mulai, selesai, coret = "Coret" }: { info: AkInfo; tuk: JenisTuk | null; mulai: string | null; selesai: string | null; coret?: string }) {
  return (
    <>
      <KepalaAk info={info} tuk={tuk}>
        <tr>
          <td rowSpan={2} className="m">
            Tanggal Asesmen
          </td>
          <td>Mulai</td>
          <td className="c">:</td>
          <td>{tgl(mulai)}</td>
        </tr>
        <tr>
          <td>Selesai</td>
          <td className="c">:</td>
          <td>{tgl(selesai)}</td>
        </tr>
      </KepalaAk>
      <p className="i kecil" style={{ marginTop: -10 }}>
        *{coret} yang tidak perlu
      </p>
    </>
  );
}

/* ------------------------------ FR.AK.02 ------------------------------ */

export function CetakAk02({ p }: { p: Ak02Payload }) {
  const meta = p.dokumen;
  const { isian, info } = p;
  const kolom = p.opsi_bukti;

  return (
    <>
      <h1>FR.AK.02. REKAMAN ASESMEN KOMPETENSI</h1>
      <KepalaPenutup info={info} tuk={isian.tuk} mulai={isian.tanggal_mulai} selesai={isian.tanggal_selesai} />

      <p style={{ marginTop: 14 }}>Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang sesuai untuk setiap Unit Kompetensi.</p>

      <table className="tbl">
        <colgroup>
          <col style={{ width: "40%" }} />
          {kolom.map((k) => (
            <col key={k.value} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th style={{ height: 170 }}>Unit Kompetensi</th>
            {kolom.map((k) => (
              <th key={k.value} style={{ padding: "4px 1px" }}>
                <div className="vertikal" style={{ fontSize: "9.5pt", fontWeight: 700, maxHeight: 160 }}>
                  {k.label}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {p.unit_kompetensi.map((u) => {
            const dipilih = isian.bukti[`u${u.id}`] ?? [];
            return (
              <tr key={u.id}>
                <td>{u.judul_unit}</td>
                {kolom.map((k) => (
                  <td key={k.value} className="c m">
                    {dipilih.includes(k.value) ? "√" : ""}
                  </td>
                ))}
              </tr>
            );
          })}
          <tr>
            <td className="b">Rekomendasi hasil Asesmen</td>
            <td colSpan={kolom.length}>
              <Kotak on={isian.rekomendasi === "kompeten"} /> Kompeten/&nbsp;&nbsp;&nbsp;
              <Kotak on={isian.rekomendasi === "belum_kompeten"} /> Belum Kompeten
            </td>
          </tr>
          <tr>
            <td style={{ height: 80 }}>
              <span className="b">Tindak lanjut yang dibutuhkan</span>
              <br />
              (Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)
            </td>
            <td colSpan={kolom.length} className="pre">
              {isian.tindak_lanjut}
            </td>
          </tr>
          <tr>
            <td style={{ height: 70 }}>Komentar/ Observasi oleh asesor</td>
            <td colSpan={kolom.length} className="pre">
              {isian.komentar}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="tbl" style={{ width: "66%", marginTop: 16 }}>
        <colgroup>
          <col style={{ width: "36%" }} />
          <col style={{ width: "4%" }} />
          <col />
        </colgroup>
        <tbody>
          {(["asesi", "asesor"] as const).map((pihak) => (
            <BarisTtdPenutup key={pihak} pihak={pihak} info={info} meta={meta} />
          ))}
        </tbody>
      </table>

      <p style={{ marginBottom: 2 }}>LAMPIRAN DOKUMEN:</p>
      <ol className="angka" style={{ paddingLeft: 30 }}>
        <li>Dokumen APL 01 peserta</li>
        <li>Dokumen APL 02 peserta</li>
        <li>Bukti-bukti berkualitas peserta</li>
        <li>Tinjauan proses asesmen</li>
      </ol>
    </>
  );
}

function BarisTtdPenutup({ pihak, info, meta }: { pihak: "asesi" | "asesor"; info: AkInfo; meta: Ak02Payload["dokumen"] }) {
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
        <td className="m">Tanda Tanda/Tanggal</td>
        <td className="c m">:</td>
        <td className="ttd-sel">
          <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak={pihak} ada={meta.tanda_tangan[pihak].ada} />
          {tgl(meta.tanda_tangan[pihak].tanggal)}
        </td>
      </tr>
    </>
  );
}

/* ------------------------------ FR.AK.03 ------------------------------ */

export function CetakAk03({ p }: { p: Ak03Payload }) {
  const { isian, info, header } = p;

  return (
    <>
      <h1>FR.AK.03. UMPAN BALIK DAN CATATAN ASESMEN</h1>
      <KepalaPenutup info={info} tuk={header.tuk} mulai={header.tanggal_mulai} selesai={header.tanggal_selesai} coret="coret" />

      <p style={{ marginTop: 14 }}>Umpan balik dari Asesi (diisi oleh Asesi setelah pengambilan keputusan):</p>
      <table className="tbl">
        <colgroup>
          <col style={{ width: "55%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>Komponen</th>
            <th colSpan={2}>Hasil</th>
            <th rowSpan={2}>Catatan/Komentar Asesi</th>
          </tr>
          <tr>
            <th>Ya</th>
            <th>Tidak</th>
          </tr>
        </thead>
        <tbody>
          {p.komponen.map((k, i) => {
            const n = isian.komponen[i] ?? { hasil: null, catatan: null };
            return (
              <tr key={i}>
                <td>{k}</td>
                <td className="c m">
                  <Kotak on={n.hasil === "ya"} />
                </td>
                <td className="c m">
                  <Kotak on={n.hasil === "tidak"} />
                </td>
                <td className="pre kecil">{n.catatan}</td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={4} style={{ height: 120 }}>
              Catatan/komentar lainnya (apabila ada) :
              <div className="pre">{isian.catatan_lainnya}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
