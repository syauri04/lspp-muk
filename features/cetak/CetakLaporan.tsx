"use client";

import type { Ak05Payload, Ak06Payload } from "@/types/dokumen";
import { KepalaAk } from "./CetakAk";
import { Kotak, TtdPihak, tgl } from "./CetakShared";

function BarisTanggal({ nilai }: { nilai: string | null }) {
  return (
    <tr>
      <td colSpan={2}>Tanggal</td>
      <td className="c">:</td>
      <td>{tgl(nilai)}</td>
    </tr>
  );
}

/* ------------------------------ FR.AK.05 ------------------------------ */

export function CetakAk05({ p }: { p: Ak05Payload }) {
  const meta = p.dokumen;
  const { isian, info } = p;
  // Formulir asli memuat 4 baris asesi; dokumen ini per asesi, baris lainnya dibiarkan kosong.
  const baris = [{ nama: info.asesi.nama, rek: p.rekomendasi, ket: isian.keterangan }, null, null, null];

  return (
    <>
      <h1>FR.AK.05. LAPORAN ASESMEN</h1>
      <KepalaAk info={info} tuk={isian.tuk} tanpaAsesi>
        <BarisTanggal nilai={isian.tanggal} />
      </KepalaAk>
      <p className="i kecil" style={{ marginTop: -10 }}>
        *Coret yang tidak perlu
      </p>

      <table className="tbl" style={{ marginTop: 16, marginBottom: 2 }}>
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "43%" }} />
          <col style={{ width: "8.5%" }} />
          <col style={{ width: "8.5%" }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>No</th>
            <th rowSpan={2}>Nama Asesi</th>
            <th colSpan={2}>Rekomendasi</th>
            <th rowSpan={2}>Keterangan**</th>
          </tr>
          <tr>
            <th>K</th>
            <th>BK</th>
          </tr>
        </thead>
        <tbody>
          {baris.map((b, i) => (
            <tr key={i}>
              <td className="c m" style={{ height: 44 }}>
                {i + 1}.
              </td>
              <td className="m">{b?.nama}</td>
              <td className="c m">
                <Kotak on={b?.rek === "kompeten"} />
              </td>
              <td className="c m">
                <Kotak on={b?.rek === "belum_kompeten"} />
              </td>
              <td className="pre kecil m">{b?.ket}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="kecil">** tuliskan Kode dan Judul Unit Kompetensi yang dinyatakan BK bila mengases satu skema</p>

      <table className="tbl" style={{ marginTop: 14 }}>
        <colgroup>
          <col style={{ width: "46%" }} />
          <col />
        </colgroup>
        <tbody>
          {(
            [
              ["Aspek Negatif dan Positif dalam Asesemen", isian.aspek],
              ["Pencatatan Penolakan Hasil Asesmen", isian.penolakan],
              ["Saran Perbaikan: (Asesor/Personil Terkait)", isian.saran],
            ] as const
          ).map(([label, isi]) => (
            <tr key={label}>
              <td className="m" style={{ height: 32 }}>
                {label}
              </td>
              <td className="pre">{isi}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl" style={{ marginTop: 14 }}>
        <colgroup>
          <col style={{ width: "41%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "3%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td rowSpan={4}>
              Catatan:
              <div className="pre">{isian.catatan}</div>
            </td>
            <td colSpan={3} className="b">
              Asesor:
            </td>
          </tr>
          <tr>
            <td>Nama</td>
            <td className="c">:</td>
            <td>{info.asesor.nama}</td>
          </tr>
          <tr>
            <td>No. Reg</td>
            <td className="c">:</td>
            <td>{info.asesor.nomor_registrasi}</td>
          </tr>
          <tr>
            <td className="m">Tanda Tangan/ Tanggal</td>
            <td className="c m">:</td>
            <td className="ttd-sel">
              <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak="asesor" ada={meta.tanda_tangan.asesor.ada} />
              {tgl(meta.tanda_tangan.asesor.tanggal)}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

/* ------------------------------ FR.AK.06 ------------------------------ */

const PRINSIP: { key: string; label: string }[] = [
  { key: "validitas", label: "Validitas" },
  { key: "reliable", label: "Reliabel" },
  { key: "fleksibel", label: "Fleksibel" },
  { key: "adil", label: "Adil" },
];

export function CetakAk06({ p }: { p: Ak06Payload }) {
  const meta = p.dokumen;
  const { isian, info } = p;

  return (
    <>
      <h1 style={{ display: "flex", gap: 40 }}>
        <span>FR.AK.06.</span>
        <span>MENINJAU PROSES ASESMEN</span>
      </h1>
      <KepalaAk info={info} tuk={isian.tuk} tanpaAsesi>
        <BarisTanggal nilai={isian.tanggal} />
      </KepalaAk>

      <table className="tbl">
        <tbody>
          <tr>
            <td className="b">Penjelasan:</td>
          </tr>
          <tr>
            <td style={{ textAlign: "justify" }}>
              <ol className="angka">
                <li>Peninjauan dapat dilakukan oleh lead asesor atau asesor yang melaksanakan asesmen.</li>
                <li>Peninjauan dapat dilakukan secara terpadu dalam skema sertifikasi dan / atau peserta kelompok yang homogen.</li>
                <li>
                  Isilah pemenuhan dimensi kompetensi dengan menuliskan jenis bukti dan instrumen yang digunakan pada saat asesmen sebagai bukti
                  terpenuhinya dimensi kompetensi.
                </li>
              </ol>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="tbl">
        <colgroup>
          <col style={{ width: "45%" }} />
          {PRINSIP.map((x) => (
            <col key={x.key} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2} style={{ textAlign: "left" }}>
              Asepek yang ditinjau
            </th>
            <th colSpan={4}>Kesesuaian dengan prinsip asesmen</th>
          </tr>
          <tr>
            {PRINSIP.map((x) => (
              <th key={x.key} className="i" style={{ fontWeight: 400 }}>
                {x.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Prosedur asesmen:</td>
            {PRINSIP.map((x) => (
              <td key={x.key} />
            ))}
          </tr>
          {p.aspek.map((a) => (
            <tr key={a.kunci}>
              <td>
                <ul className="titik">
                  <li>{a.label}</li>
                </ul>
              </td>
              {PRINSIP.map((x) =>
                a.tanpa.includes(x.key) ? (
                  <td key={x.key} style={{ background: "#404040", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} />
                ) : (
                  <td key={x.key} className="c m">
                    <Kotak on={(isian.prinsip[a.kunci] ?? []).includes(x.key)} />
                  </td>
                ),
              )}
            </tr>
          ))}
          <tr>
            <td colSpan={5} style={{ height: 48 }}>
              Rekomendasi untuk peningkatan
              <div className="pre">{isian.rekomendasi_prinsip}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="tbl">
        <colgroup>
          <col style={{ width: "26%" }} />
          {p.opsi_dimensi.map((d) => (
            <col key={d.value} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>Aspek yang ditinjau</th>
            <th colSpan={p.opsi_dimensi.length}>Pemenuhan dimensi kompetensi</th>
          </tr>
          <tr>
            {p.opsi_dimensi.map((d) => (
              <th key={d.value} className="i" style={{ fontWeight: 400 }}>
                {d.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="b">Konsistensi keputusan asesmen</span>
              <br />
              Bukti dari berbagai asesmen diperiksa untuk konsistensi dimensi kompetensi
            </td>
            {p.opsi_dimensi.map((d) => (
              <td key={d.value} className="pre kecil">
                {isian.dimensi[d.value as keyof typeof isian.dimensi]}
              </td>
            ))}
          </tr>
          <tr>
            <td colSpan={p.opsi_dimensi.length + 1} style={{ height: 48 }}>
              Rekomendasi untuk peningkatan:
              <div className="pre">{isian.rekomendasi_dimensi}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="tbl">
        <colgroup>
          <col style={{ width: "28%" }} />
          <col style={{ width: "28%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td className="b">
              Nama
              <br />
              Lead Asesor/Asesor
            </td>
            <td className="b">Tanggal &amp; Tanda Tangan</td>
            <td className="b">Komentar</td>
          </tr>
          <tr>
            <td style={{ height: 80 }}>{isian.nama_peninjau}</td>
            <td>
              <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak="asesor" ada={meta.tanda_tangan.asesor.ada} />
              {tgl(meta.tanda_tangan.asesor.tanggal)}
            </td>
            <td className="pre">{isian.komentar}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
