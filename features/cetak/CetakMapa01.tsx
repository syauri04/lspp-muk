"use client";

import { Frown, Meh, Smile } from "lucide-react";
import type { Emoji, Mapa01Grup, Mapa01Hubungan, Mapa01Modifikasi, Mapa01Payload, MapaPenandatangan, Opsi } from "@/types/dokumen";
import { Coret, Kotak, TabelSkema, TtdPenandatanganCetak, tgl } from "./CetakShared";

const SLUG = "mapa-01";

const KOLOM_METODE: { key: keyof Mapa01Payload["rencana"][number]; judul: string; ket: string }[] = [
  { key: "observasi_langsung", judul: "Observasi Langsung", ket: "kerja nyata/aktivitas waktu nyata di tempat kerja di lingkungan tempat kerja yang disimulasikan" },
  { key: "kegiatan_terstruktur", judul: "Kegiatan Terstruktur", ket: "latihan simulasi dan bermain peran, proyek, presentasi, lembar kegiatan" },
  { key: "tanya_jawab", judul: "Tanya Jawab", ket: "pertanyaan tertulis, wawancara, asesmen diri, tanya jawab lisan, angket, ujian lisan atau tertulis" },
  {
    key: "verifikasi_portofolio",
    judul: "Verifikasi Portofolio",
    ket: "sampel pekerjaan yang disusun oleh Asesi, produk dengan dokumentasi pendukung, bukti sejarah, jurnal atau buku catatan, informasi tentang pengalaman hidup",
  },
  { key: "reviu_produk", judul: "Reviu Produk", ket: "Produk hasil proyek, contoh hasil kerja/produk" },
  {
    key: "verifikasi_pihak_ketiga",
    judul: "Verifikasi Pihak Ketiga",
    ket: "testimoni dan laporan dari atasan, buktipelatihan, otentikasi pencapaian sebelumnya, wawancara dengan atasan atau rekan kerja",
  },
];

const MODIFIKASI: { key: Mapa01Modifikasi; nomor?: string; huruf?: string; label: string; suffix: string }[] = [
  { key: "karakteristik", nomor: "3.1", huruf: "a.", label: "Karakteristik Kandidat:", suffix: "karakteristik khusus kandidat Jika ada, tuliskan:" },
  { key: "kontekstualisasi", huruf: "b.", label: "Kebutuhan kontekstualisasi terkait tempat kerja:", suffix: "kebutuhan kontekstualisasi Jika ada, tuliskan:" },
  { key: "saran", nomor: "3.2", label: "Saran yang diberikan oleh paket pelatihan atau pengembang pelatihan", suffix: "saran Jika ada, tuliskan:" },
  { key: "penyesuaian", nomor: "3.3", label: "Penyesuaian perangkat asesmen terkait kebutuhan kontekstualisasi", suffix: "penyesuaian perangkat Jika ada, tuliskan:" },
  {
    key: "peluang_terintegrasi",
    nomor: "3.4",
    label: "Peluang untuk kegiatan asesmen terintegrasi dan mencatat setiap perubahan yang diperlukan untuk alat asesmen",
    suffix: "peluang Jika ada, tuliskan:",
  },
];

const EMOJI: { key: Emoji; Icon: typeof Smile }[] = [
  { key: "senang", Icon: Smile },
  { key: "netral", Icon: Meh },
  { key: "sedih", Icon: Frown },
];

function Wajah({ dipilih }: { dipilih: Emoji | null }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, verticalAlign: "middle", marginLeft: 6 }}>
      {EMOJI.map(({ key, Icon }) => (
        <span
          key={key}
          style={{
            display: "inline-flex",
            borderRadius: 999,
            background: dipilih === key ? "#F5C542" : "transparent",
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}
        >
          <Icon size={14} strokeWidth={2} color="#000" />
        </span>
      ))}
    </span>
  );
}

export function CetakMapa01({ p }: { p: Mapa01Payload }) {
  const { isian, opsi } = p;
  const meta = p.dokumen;
  const tanggalBawaan = tgl(meta.submitted_at);

  const daftar = (grup: Mapa01Grup, items: Opsi[]) =>
    items.map((o) => (
      <div key={o.value} style={{ display: "flex", gap: 6 }}>
        <Kotak on={isian[grup].includes(o.value)} />
        <span>{o.label}</span>
      </div>
    ));

  const sebaris = (grup: Mapa01Grup, items: Opsi[]) => (
    <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
      {items.map((o) => (
        <span key={o.value}>
          <Kotak on={isian[grup].includes(o.value)} /> {o.label}
        </span>
      ))}
    </div>
  );

  const standarKompetensi = opsi.standar.find((o) => o.value === "kompetensi");
  const standarLainnya = opsi.standar.filter((o) => o.value !== "kompetensi");
  const penyusunGrup = [
    { status: "PENYUSUN", baris: p.penyusun.filter((x) => x.peran === "penyusun") },
    { status: "VALIDATOR", baris: p.penyusun.filter((x) => x.peran === "validator") },
  ].filter((g) => g.baris.length > 0);

  const ttd = (baris: MapaPenandatangan) => (
    <div className="ttd-sel">
      <TtdPenandatanganCetak penilaianId={meta.penilaian_id} slug={SLUG} baris={baris} />
      {baris.ada_ttd ? tgl(baris.tanggal) || tanggalBawaan : ""}
    </div>
  );

  return (
    <>
      <h1>FR.MAPA.01. MERENCANAKAN AKTIVITAS DAN PROSES ASESMEN</h1>
      <TabelSkema skema={p.skema} />

      {/* 1. Menentukan Pendekatan Asesmen */}
      <table className="tbl">
        <colgroup>
          <col style={{ width: "6%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "20%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={4} className="b">
              1. Menentukan Pendekatan Asesmen
            </td>
          </tr>
          <tr>
            <td rowSpan={7}>1.1.</td>
            <td>Asesi</td>
            <td colSpan={2}>{daftar("asesi", opsi.asesi)}</td>
          </tr>
          <tr>
            <td>Tujuan Asesmen</td>
            <td colSpan={2}>{daftar("tujuan", opsi.tujuan)}</td>
          </tr>
          <tr>
            <td rowSpan={4}>Konteks Asesmen</td>
            <td>Lingkungan</td>
            <td>{sebaris("lingkungan", opsi.lingkungan)}</td>
          </tr>
          <tr>
            <td>Peluang untuk mengumpulkan bukti dalam sejumlah situasi</td>
            <td className="m">{sebaris("peluang", opsi.peluang)}</td>
          </tr>
          <tr>
            <td className="m">Hubungan antara standar kompetensi dan</td>
            <td>
              {opsi.hubungan.map((o) => {
                const h = isian.hubungan[o.value as Mapa01Hubungan];
                return (
                  <div key={o.value} style={{ display: "flex", alignItems: "center", gap: 6, padding: "1px 0" }}>
                    <Kotak on={!!h?.checked} />
                    <span>{o.label.replace(/:\s*$/, "")}:</span>
                    <Wajah dipilih={h?.emoji ?? null} />
                  </div>
                );
              })}
            </td>
          </tr>
          <tr>
            <td className="m">Siapa yang melakukan asesmen/RPL</td>
            <td>{daftar("siapa", opsi.siapa)}</td>
          </tr>
          <tr>
            <td>Konfirmasi dengan orang yang relevan</td>
            <td colSpan={2}>{daftar("konfirmasi", opsi.konfirmasi)}</td>
          </tr>
          <tr>
            <td>1.2.</td>
            <td>Standar Industri atau Tempat Kerja</td>
            <td colSpan={2}>
              {standarKompetensi && (
                <>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Kotak on={isian.standar.includes("kompetensi")} />
                    <span>{standarKompetensi.label}</span>
                  </div>
                  <ol className="angka kecil" style={{ paddingLeft: 40, textAlign: "justify" }}>
                    {p.standar_kompetensi.map((s, i) => (
                      <li key={i} className="pre">
                        {s}
                      </li>
                    ))}
                  </ol>
                </>
              )}
              {standarLainnya.map((o) => (
                <div key={o.value} style={{ display: "flex", gap: 6, borderTop: "1px solid #000", margin: "0 -5px", padding: "2px 5px" }}>
                  <Kotak on={isian.standar.includes(o.value)} />
                  <span>{o.label}</span>
                </div>
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 2. Mempersiapkan Rencana Asesmen */}
      <h2 className="putus-sebelum">2. Mempersiapkan Rencana Asesmen</h2>
      <table className="tbl">
        <colgroup>
          <col style={{ width: "19%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "20%" }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th style={{ border: 0, borderRight: "1px solid #000" }}></th>
            <th>No.</th>
            <th>Kode Unit</th>
            <th>Judul Unit</th>
          </tr>
        </thead>
        <tbody>
          {p.unit_kompetensi.map((u, i) => (
            <tr key={u.id}>
              {i === 0 && (
                <td rowSpan={p.unit_kompetensi.length} className="b c m">
                  {(p.skema.judul ?? "").toUpperCase()}
                </td>
              )}
              <td className="c">{i + 1}.</td>
              <td className="c">{u.kode_unit}</td>
              <td>{u.judul_unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl kecil putus-sebelum">
        <colgroup>
          <col style={{ width: "17%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "4%" }} />
          <col style={{ width: "4%" }} />
          <col style={{ width: "4%" }} />
          {KOLOM_METODE.map((k) => (
            <col key={k.key} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>Unit Kompetensi</th>
            <th rowSpan={2} style={{ fontWeight: 400 }}>
              <span className="b">Bukti-Bukti</span>
              <br />
              (Kinerja, Produk, Portofolio, dan/atau Pengetaahuan) diidentifikasi berdasarkan Kriteria Unjuk Kerja dan Pendekatan Asesmen
            </th>
            <th colSpan={3}>Jenis Bukti</th>
            <th colSpan={6}>
              Metode dan Perangkat Asesmen CL (Ceklis Observasi), DIT (Daftar Instruksi Terstruktur), DPL (Daftar Pertanyaan Lisan), DPT
              (Daftar Pertanyaan Tertulis), VPK (Verifikasi Pihak Ketiga), CVP (Ceklis Verfikasi Portofolio), CRP (Ceklis Reviu Produk), PW
              (Pertanyaan Wawancara)
            </th>
          </tr>
          <tr>
            <th>L</th>
            <th>TL</th>
            <th>T</th>
            {KOLOM_METODE.map((k) => (
              <th key={k.key} style={{ height: 240, padding: "4px 2px" }}>
                <div className="vertikal" style={{ fontWeight: 400 }}>
                  <span className="b">{k.judul}</span>
                  <br />({k.ket})
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {p.rencana.map((r, i) => (
            <tr key={r.unit_id}>
              <td>
                {i + 1}. {r.judul_unit}
              </td>
              <td className="pre">{r.bukti}</td>
              <td className="c m">{r.jenis_l ? "L" : ""}</td>
              <td className="c m">{r.jenis_tl ? "TL" : ""}</td>
              <td className="c m">{r.jenis_t ? "T" : ""}</td>
              {KOLOM_METODE.map((k) => (
                <td key={k.key} className="c m">
                  {String(r[k.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 3. Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi */}
      <h2 className="putus-sebelum">3.&nbsp;&nbsp;Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi:</h2>
      <table className="tbl">
        <colgroup>
          <col style={{ width: "6%" }} />
          <col style={{ width: "46%" }} />
          <col />
        </colgroup>
        <tbody>
          {MODIFIKASI.map((m) => {
            const n = isian.modifikasi[m.key];
            const aktif = n?.ada === true ? 0 : n?.ada === false ? 1 : null;
            return (
              <tr key={m.key}>
                <td>{m.nomor}</td>
                <td>
                  {m.huruf && <span style={{ display: "inline-block", width: 22 }}>{m.huruf}</span>}
                  {m.label}
                </td>
                <td>
                  <Coret pilihan={["Ada", "tidak ada"]} aktif={aktif} /> {m.suffix}
                  {n?.catatan && <div className="pre">{n.catatan}</div>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="b">Konfirmasi dengan orang yang relevan</p>
      <table className="tbl">
        <colgroup>
          <col style={{ width: "48%" }} />
          <col style={{ width: "27%" }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>Orang yang relevan</th>
            <th>Nama</th>
            <th>Tandatangan dan Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {p.konfirmasi_orang.map((row) => (
            <tr key={row.id}>
              <td className="m">{row.peran}</td>
              <td className="m">{row.nama}</td>
              <td>{ttd(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {penyusunGrup.length > 0 && (
        <div className="putus-sebelum">
          <p className="b">PENYUSUN DAN VALIDATOR</p>
          <table className="tbl">
            <colgroup>
              <col style={{ width: "14%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "28%" }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>STATUS</th>
                <th>NO</th>
                <th>NAMA</th>
                <th>NOMOR MET</th>
                <th>TANDA TANGAN DAN TANGGAL</th>
              </tr>
            </thead>
            <tbody>
              {penyusunGrup.flatMap((g) =>
                g.baris.map((row, idx) => (
                  <tr key={row.id}>
                    {idx === 0 && (
                      <td rowSpan={g.baris.length} className="b c m">
                        {g.status}
                      </td>
                    )}
                    <td className="b c m">{idx + 1}</td>
                    <td className="m">{row.nama}</td>
                    <td className="m">{row.no_reg}</td>
                    <td>{ttd(row)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
