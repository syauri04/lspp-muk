"use client";

import type { Ak01Payload, Ak07Payload, AkInfo, JenisTuk } from "@/types/dokumen";
import { Coret, hariTanggal, Kotak, TtdPihak, tgl } from "./CetakShared";

const TUK: { key: JenisTuk; label: string }[] = [
  { key: "sewaktu", label: "Sewaktu" },
  { key: "tempat_kerja", label: "Tempat Kerja" },
  { key: "mandiri", label: "Mandiri" },
];

const JENIS_SKEMA = ["KKNI", "Okupasi", "Klaster"];

/** Kepala dokumen AK/IA: skema, TUK (coret), asesor, asesi (+ baris tambahan). */
export function KepalaAk({
  info,
  tuk,
  children,
  kalimatAtas,
  sebelumAsesor,
  tanpaAsesi = false,
}: {
  info: AkInfo;
  tuk: JenisTuk | null;
  children?: React.ReactNode;
  kalimatAtas?: string;
  /** Baris di antara TUK dan Nama Asesor (mis. "Judul Kegiatan Terstruktur" FR.IA.04B). */
  sebelumAsesor?: React.ReactNode;
  /** Laporan asesor (AK.05/AK.06) tidak memuat baris Nama Asesi. */
  tanpaAsesi?: boolean;
}) {
  const idxTuk = tuk ? TUK.findIndex((t) => t.key === tuk) : null;
  const idxJenis = JENIS_SKEMA.findIndex((j) => j.toLowerCase() === (info.skema.jenis ?? "").toLowerCase());
  return (
    <table className="tbl">
      <colgroup>
        <col style={{ width: "27%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "3%" }} />
        <col />
      </colgroup>
      <tbody>
        {kalimatAtas && (
          <tr>
            <td colSpan={4} style={{ textAlign: "justify" }}>
              {kalimatAtas}
            </td>
          </tr>
        )}
        <tr>
          <td rowSpan={2} className="b">
            Skema Sertifikasi (<Coret pilihan={JENIS_SKEMA} aktif={idxJenis === -1 ? null : idxJenis} bintang="" />)
          </td>
          <td>Judul</td>
          <td className="c">:</td>
          <td className="b">{(info.skema.judul ?? "").toUpperCase()}</td>
        </tr>
        <tr>
          <td>Nomor</td>
          <td className="c">:</td>
          <td className="b">{info.skema.nomor}</td>
        </tr>
        <tr>
          <td colSpan={2}>TUK</td>
          <td className="c">:</td>
          <td>
            <Coret pilihan={TUK.map((t) => t.label)} aktif={idxTuk === -1 ? null : idxTuk} />
          </td>
        </tr>
        {sebelumAsesor}
        <tr>
          <td colSpan={2}>Nama Asesor</td>
          <td className="c">:</td>
          <td>{info.asesor.nama}</td>
        </tr>
        {!tanpaAsesi && (
          <tr>
            <td colSpan={2}>Nama Asesi</td>
            <td className="c">:</td>
            <td>{info.asesi.nama}</td>
          </tr>
        )}
        {children}
      </tbody>
    </table>
  );
}

/* ------------------------------ FR.AK.07 ------------------------------ */

export function CetakAk07({ p }: { p: Ak07Payload }) {
  const meta = p.dokumen;
  const { isian } = p;

  return (
    <>
      <h1>FR.AK.07. CEKLIS PENYESUAIAN YANG WAJAR DAN BERALASAN</h1>
      <KepalaAk info={p.info} tuk={isian.tuk}>
        <tr>
          <td colSpan={2}>Tanggal</td>
          <td className="c">:</td>
          <td>{tgl(isian.tanggal)}</td>
        </tr>
      </KepalaAk>
      <p className="i kecil" style={{ marginTop: -10 }}>
        *Coret yang tidak perlu
      </p>

      <table className="tbl">
        <tbody>
          <tr>
            <td className="b">PANDUAN BAGI ASESOR</td>
          </tr>
          <tr>
            <td style={{ textAlign: "justify" }}>
              <ul className="titik">
                <li>
                  Formulir ini dapat digunakan (sebelum pra-asesmen, saat pelaksanaan pra-asesmen, setelah pra-asesmen) jika ada asesi yang
                  mempunyai keterbatasan sesuai karakteristik yang dimilikinya sehingga diperlukan penyesuaian yang wajar dan beralasan, jika
                  rencana asesmen dan perangkat asesmen tidak sesuai dengan acuan pembanding, potensi asesi dan konteks asesi, jika asesi
                  merasa keletihan, sakit, serta jika kondisi alam, listrik padam, ......
                </li>
                <li>Coretlah pada tanda * yang tidak sesuai.</li>
                <li>Berilah tanda (✓) pada kotak (☐) kolom potensi asesi.</li>
                <li>
                  Berilah tanda (✓) Ya atau Tidak pada tanda ** sesuai pilihan, jika jawaban Ya selanjutnya pada kolom keterangan berilah tanda
                  (✓) di kotak (☐) yang tersedia, pilihan boleh lebih dari satu.
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="tbl" style={{ marginTop: 18 }}>
        <colgroup>
          <col style={{ width: "19%" }} />
          <col style={{ width: "6%" }} />
          <col />
        </colgroup>
        <tbody>
          {p.opsi_potensi.map((o, i) => (
            <tr key={o.value}>
              {i === 0 && <td rowSpan={p.opsi_potensi.length}>Potensi Asesi</td>}
              <td className="c m">
                <Kotak on={isian.potensi.includes(o.value)} />
              </td>
              <td>{o.label}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl" style={{ marginTop: 18 }}>
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "33%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "6%" }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>No</th>
            <th rowSpan={2} style={{ textAlign: "left" }}>
              Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi (Karakter Asesi):
            </th>
            <th colSpan={2}>Diperlukan Penyesuaian**</th>
            <th rowSpan={2} colSpan={2}>
              Keterangan
            </th>
          </tr>
          <tr>
            <th>Ya</th>
            <th>Tidak</th>
          </tr>
        </thead>
        <tbody>
          {p.karakter.map((k, ki) => {
            const nilai = isian.karakter[k.kunci] ?? { penyesuaian: null, pilihan: [], lainnya: [] };
            const lainnya = nilai.lainnya.length ? nilai.lainnya : [{ teks: null, checked: false }];
            const baris = [
              ...k.opsi.map((label, oi) => ({ label, on: nilai.pilihan.includes(oi) })),
              ...lainnya.map((l) => ({ label: l.teks || "......................................................", on: l.checked })),
            ];
            return baris.map((b, bi) => (
              <tr key={`${k.kunci}-${bi}`}>
                {bi === 0 && (
                  <>
                    <td rowSpan={baris.length}>{ki + 1}.</td>
                    <td rowSpan={baris.length}>{k.label}</td>
                    <td rowSpan={baris.length} className="c">
                      {nilai.penyesuaian === "ya" ? "✓" : ""}
                    </td>
                    <td rowSpan={baris.length} className="c">
                      {nilai.penyesuaian === "tidak" ? "✓" : ""}
                    </td>
                  </>
                )}
                <td className="c m">
                  <Kotak on={b.on} />
                </td>
                <td>{b.label}</td>
              </tr>
            ));
          })}
        </tbody>
      </table>

      <table className="tbl" style={{ marginTop: 18 }}>
        <tbody>
          <tr>
            <td className="b">Hasil Penyesuaian yang Wajar dan Beralasan disepakati menggunakan:</td>
          </tr>
          {(
            [
              ["1)", "Acuan Pembanding Asesmen", isian.hasil.acuan],
              ["2)", "Metode Asesmen", isian.hasil.metode],
              ["3)", "Instrumen Asesmen", isian.hasil.instrumen],
            ] as const
          ).map(([no, label, isi]) => (
            <tr key={no}>
              <td style={{ height: 80 }}>
                {no}&nbsp;&nbsp;{label}: (tuliskan nama acuan pembanding)
                <div className="pre" style={{ paddingLeft: 22 }}>
                  {isi}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl" style={{ marginTop: 18 }}>
        <colgroup>
          <col style={{ width: "50%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ height: 100 }}>
              Nama Asesor:
              <div>{p.info.asesor.nama}</div>
            </td>
            <td>
              Tanda Tangan Asesor dan Tanggal:
              <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak="asesor" ada={meta.tanda_tangan.asesor.ada} />
              {tgl(meta.tanda_tangan.asesor.tanggal)}
            </td>
          </tr>
          <tr>
            <td style={{ height: 100 }}>
              Nama Asesi:
              <div>{p.info.asesi.nama}</div>
            </td>
            <td>
              Tanda Tangan Asesi dan Tanggal:
              <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak="asesi" ada={meta.tanda_tangan.asesi.ada} />
              {tgl(meta.tanda_tangan.asesi.tanggal)}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

/* ------------------------------ FR.AK.01 ------------------------------ */

export function CetakAk01({ p }: { p: Ak01Payload }) {
  const { isian } = p;
  // Formulir asli: 2 kolom (4 butir kiri, 4 butir kanan), dibaca per baris.
  const separuh = Math.ceil(p.opsi_bukti.length / 2);
  const pasangan = Array.from({ length: separuh }, (_, i) => [p.opsi_bukti[i], p.opsi_bukti[i + separuh]] as const);

  const labelBukti = (o: { value: string; label: string } | undefined) =>
    o ? (o.value === "lainnya" ? `${o.label}${isian.bukti_lainnya ? `: ${isian.bukti_lainnya}` : "..........."}` : o.label) : null;

  return (
    <>
      <h1>FR.AK.01. PERSETUJUAN ASESMEN DAN KERAHASIAAN</h1>
      <KepalaAk
        info={p.info}
        tuk={isian.tuk}
        kalimatAtas="Persetujuan Asesmen ini untuk menjamin bahwa Asesi telah diberi arahan secara rinci tentang perencanaan dan proses asesmen"
      >
        <tr>
          <td colSpan={2} className="m">
            Bukti yang akan dikumpulkan
          </td>
          <td className="c m">:</td>
          <td>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {pasangan.map(([kiri, kanan], i) => (
                  <tr key={i}>
                    {[kiri, kanan].map((o, j) => (
                      <td key={j} style={{ border: 0, padding: "4px 2px", width: "50%" }} className="kecil">
                        {o && (
                          <>
                            <Kotak on={isian.bukti.includes(o.value)} />
                            &nbsp;&nbsp;{labelBukti(o)}
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td colSpan={2} rowSpan={3} className="m">
            Pelaksanaan Asesmen disepakati pada:
          </td>
          <td colSpan={2} style={{ padding: 0 }}>
            <BarisPelaksanaan label="Hari/Tanggal" isi={hariTanggal(isian.pelaksanaan.tanggal)} />
          </td>
        </tr>
        <tr>
          <td colSpan={2} style={{ padding: 0 }}>
            <BarisPelaksanaan label="Waktu" isi={isian.pelaksanaan.waktu} />
          </td>
        </tr>
        <tr>
          <td colSpan={2} style={{ padding: 0 }}>
            <BarisPelaksanaan label="TUK" isi={isian.pelaksanaan.tuk} />
          </td>
        </tr>
        <tr>
          <td colSpan={4} className="b">
            Asesi:
          </td>
        </tr>
        <tr>
          <td colSpan={4}>{p.pernyataan.asesi_banding}</td>
        </tr>
        <tr>
          <td colSpan={4} className="b">
            Asesor:
          </td>
        </tr>
        <tr>
          <td colSpan={4} style={{ textAlign: "justify" }}>
            {p.pernyataan.asesor}
          </td>
        </tr>
        <tr>
          <td colSpan={4} className="b">
            Asesi:
          </td>
        </tr>
        <tr>
          <td colSpan={4} style={{ textAlign: "justify" }}>
            {p.pernyataan.asesi_setuju}
          </td>
        </tr>
        <BarisTtd label="Tanda Tangan Asesor" pihak="asesor" p={p} />
        <BarisTtd label="Tanda Tangan Asesi" pihak="asesi" p={p} />
      </KepalaAk>
      <p className="i kecil" style={{ marginTop: -10 }}>
        *Coret yang tidak perlu
      </p>
    </>
  );
}

function BarisPelaksanaan({ label, isi }: { label: string; isi: string | null }) {
  return (
    <div style={{ display: "flex" }}>
      <span style={{ width: 120, padding: "2px 5px", borderRight: "1px solid #000" }}>{label}</span>
      <span style={{ width: 24, padding: "2px 5px", borderRight: "1px solid #000", textAlign: "center" }}>:</span>
      <span style={{ padding: "2px 5px" }}>{isi}</span>
    </div>
  );
}

function BarisTtd({ label, pihak, p }: { label: string; pihak: "asesor" | "asesi"; p: Ak01Payload }) {
  const meta = p.dokumen;
  return (
    <tr>
      <td colSpan={4} style={{ height: 110, verticalAlign: "bottom" }}>
        <div style={{ display: "grid", gridTemplateColumns: "150px 14px 1fr 70px 14px 110px", alignItems: "end" }}>
          <span>{label}</span>
          <span>:</span>
          <span>
            <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak={pihak} ada={meta.tanda_tangan[pihak].ada} />
          </span>
          <span>Tanggal</span>
          <span>:</span>
          <span>{tgl(meta.tanda_tangan[pihak].tanggal)}</span>
        </div>
      </td>
    </tr>
  );
}
