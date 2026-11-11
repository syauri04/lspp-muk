"use client";

import type { Apl02Bukti, Apl02Payload } from "@/types/dokumen";
import { Coret, Kotak, TabelSkema, TtdPihak, tgl } from "./CetakShared";

const SLUG = "apl-02";

/** Nama bukti untuk kolom "Bukti Yang Relevan": berkas, link, dan/atau lampiran FR.APL.01. */
function namaBukti(b: Apl02Bukti): string[] {
  return [b.file?.nama, b.lampiran ? `Lampiran APL.01: ${b.lampiran.nama}` : null, b.link].filter((x): x is string => !!x);
}

export function CetakApl02({ p }: { p: Apl02Payload }) {
  const meta = p.dokumen;
  const rekomendasi = p.peninjau.rekomendasi === "dapat_dilanjutkan" ? 0 : p.peninjau.rekomendasi === "tidak_dapat_dilanjutkan" ? 1 : null;

  return (
    <>
      <h1>FR.APL.02. ASESMEN MANDIRI</h1>
      <TabelSkema skema={p.skema} />

      <table className="tbl">
        <tbody>
          <tr>
            <td className="b">PANDUAN ASESMEN MANDIRI</td>
          </tr>
          <tr>
            <td>
              <span className="b">Instruksi:</span>
              <ul className="titik">
                <li>Baca setiap pertanyaan di kolom sebelah kiri</li>
                <li>Beri tanda centang (✔) pada kotak jika anda yakin dapat melakukan tugas yang dijelaskan.</li>
                <li>Isi kolom di sebelah kanan dengan menuliskan bukti yang relevan anda miliki untuk menunjukkan bahwa anda melakukan pekerjaan.</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {p.unit_kompetensi.map((u, ui) => (
        <table key={u.id} className="tbl">
          <colgroup>
            <col style={{ width: "24%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "3%" }} />
            <col style={{ width: "21%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td rowSpan={2} className="b c m">
                Unit Kompetensi {ui + 1}
              </td>
              <td>Kode Unit</td>
              <td className="c b">:</td>
              <td colSpan={4} className="b">
                {u.kode_unit}
              </td>
            </tr>
            <tr>
              <td>Judul Unit</td>
              <td className="c b">:</td>
              <td colSpan={4} className="b">
                {u.judul_unit}
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="b">
                Dapatkah Saya ....................?
              </td>
              <td className="b c">K</td>
              <td className="b c">BK</td>
              <td className="b c">Bukti Yang Relevan</td>
            </tr>
            {u.elemen.map((e) => (
              <tr key={e.id}>
                <td colSpan={4}>
                  <div className="b" style={{ display: "flex", gap: 4 }}>
                    <span>{e.nomor}.</span>
                    <span>Elemen:</span>
                    <span>{e.nama}</span>
                  </div>
                  <div style={{ paddingLeft: 14 }}>• Kriteria Unjuk Kerja:</div>
                  {e.kuk.map((k) => (
                    <div key={k.id} style={{ display: "flex", gap: 8, paddingLeft: 28 }}>
                      <span style={{ minWidth: 26 }}>{k.nomor}</span>
                      <span>{k.deskripsi}</span>
                    </div>
                  ))}
                </td>
                <td className="c m">
                  <Kotak on={e.jawaban.kompeten === "K"} />
                </td>
                <td className="c m">
                  <Kotak on={e.jawaban.kompeten === "BK"} />
                </td>
                <td className="kecil" style={{ wordBreak: "break-word" }}>
                  {e.jawaban.bukti.flatMap(namaBukti).map((n, i) => (
                    <div key={i}>{n}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      <table className="tbl">
        <colgroup>
          <col style={{ width: "41%" }} />
          <col style={{ width: "26%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td className="b">Rekomendasi Untuk Asesi:</td>
            <td colSpan={2} className="b">
              Asesi:
            </td>
          </tr>
          <tr>
            <td rowSpan={6}>
              Asesmen <Coret pilihan={["dapat", "tidak dapat"]} aktif={rekomendasi} bintang="" /> dilanjutkan
              {p.peninjau.catatan && (
                <div className="pre" style={{ marginTop: 6 }}>
                  <span className="b">Catatan:</span> {p.peninjau.catatan}
                </div>
              )}
            </td>
            <td>Nama</td>
            <td>{p.asesi.nama}</td>
          </tr>
          <tr>
            <td className="m">Tanda Tangan/Tanggal</td>
            <td className="ttd-sel">
              <TtdPihak penilaianId={meta.penilaian_id} slug={SLUG} pihak="asesi" ada={meta.tanda_tangan.asesi.ada} />
              {tgl(meta.tanda_tangan.asesi.tanggal)}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="b">
              Ditinjau Oleh Asesor:
            </td>
          </tr>
          <tr>
            <td>Nama</td>
            <td>{p.peninjau.nama}</td>
          </tr>
          <tr>
            <td>No. Reg</td>
            <td>{p.peninjau.nomor_registrasi}</td>
          </tr>
          <tr>
            <td className="m">Tanda Tangan/Tanggal</td>
            <td className="ttd-sel">
              <TtdPihak penilaianId={meta.penilaian_id} slug={SLUG} pihak="asesor" ada={meta.tanda_tangan.asesor.ada} />
              {tgl(meta.tanda_tangan.asesor.tanggal)}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
