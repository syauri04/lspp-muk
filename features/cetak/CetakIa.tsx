"use client";

import { Fragment } from "react";
import type { DokumenMeta, Ia01Payload, Ia02Payload, Ia03Payload, Ia04aPayload, Ia04bPayload, Pencapaian } from "@/types/dokumen";
import { KepalaAk } from "./CetakAk";
import { Kotak, TabelPenyusun, TabelUnit, TtdPihak, tgl, tglPanjang } from "./CetakShared";

/* ------------------------------ bagian bersama IA ------------------------------ */

function BarisTanggal({ nilai }: { nilai: string | null | undefined }) {
  return (
    <tr>
      <td colSpan={2}>Tanggal</td>
      <td className="c">:</td>
      <td>{tgl(nilai)}</td>
    </tr>
  );
}

function CatatanCoret({ kecil = "Coret" }: { kecil?: string }) {
  return (
    <p className="i kecil" style={{ marginTop: -10 }}>
      *{kecil} yang tidak perlu
    </p>
  );
}

function Panduan({ judul = "PANDUAN BAGI ASESOR", butir }: { judul?: string; butir: React.ReactNode[] }) {
  return (
    <table className="tbl">
      <tbody>
        <tr>
          <td className="b">{judul}</td>
        </tr>
        <tr>
          <td style={{ textAlign: "justify" }}>
            <ul className="titik">
              {butir.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function KotakTeks({ judul, isi, tinggi = 110 }: { judul: string; isi: string | null | undefined; tinggi?: number }) {
  return (
    <table className="tbl">
      <tbody>
        <tr>
          <td style={{ height: tinggi }}>
            {judul}
            <div className="pre">{isi}</div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Blok tanda tangan "Asesi: Nama / Tanda tangan dan Tanggal — Asesor: Nama / No. Reg / Tanda tangan dan Tanggal". */
function BlokTtdAsesiAsesor({ meta, asesi, asesor }: { meta: DokumenMeta; asesi: string | null; asesor: { nama: string | null; nomor_registrasi: string | null } }) {
  const ttd = (pihak: "asesi" | "asesor") => (
    <>
      <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak={pihak} ada={meta.tanda_tangan[pihak].ada} />
      {tgl(meta.tanda_tangan[pihak].tanggal)}
    </>
  );
  return (
    <table className="tbl">
      <colgroup>
        <col style={{ width: "18%" }} />
        <col style={{ width: "2%" }} />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td colSpan={3} className="b">
            Asesi :
          </td>
        </tr>
        <tr>
          <td>Nama</td>
          <td>:</td>
          <td>{asesi}</td>
        </tr>
        <tr>
          <td className="m">Tanda tangan dan Tanggal</td>
          <td className="m">:</td>
          <td className="ttd-sel">{ttd("asesi")}</td>
        </tr>
        <tr>
          <td colSpan={3} className="b">
            Asesor :
          </td>
        </tr>
        <tr>
          <td>Nama</td>
          <td>:</td>
          <td>{asesor.nama}</td>
        </tr>
        <tr>
          <td>No. Reg</td>
          <td>:</td>
          <td>{asesor.nomor_registrasi}</td>
        </tr>
        <tr>
          <td className="m">Tanda tangan dan Tanggal</td>
          <td className="m">:</td>
          <td className="ttd-sel">{ttd("asesor")}</td>
        </tr>
      </tbody>
    </table>
  );
}

/** Tabel "Unit Kompetensi N | Kode Unit : … | Judul Unit : …". */
function KepalaUnit({ nomor, kode, judul }: { nomor: number; kode: string | null; judul: string }) {
  return (
    <table className="tbl" style={{ marginBottom: 8 }}>
      <colgroup>
        <col style={{ width: "26%" }} />
        <col style={{ width: "12%" }} />
        <col style={{ width: "3%" }} />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td rowSpan={2} className="b c m">
            Unit Kompetensi {nomor}
          </td>
          <td>Kode Unit</td>
          <td className="c">:</td>
          <td className="b">{kode}</td>
        </tr>
        <tr>
          <td>Judul Unit</td>
          <td className="c">:</td>
          <td className="b">{judul}</td>
        </tr>
      </tbody>
    </table>
  );
}

const ya = (p: Pencapaian) => <Kotak on={p === "ya"} />;
const tidak = (p: Pencapaian) => <Kotak on={p === "tidak"} />;

/* ------------------------------ FR.IA.01 ------------------------------ */

export function CetakIa01({ p }: { p: Ia01Payload }) {
  const { isian, info } = p;
  const meta = p.dokumen;
  const lanjut = isian.rekomendasi === "lanjutan";

  return (
    <>
      <h1>FR.IA.01.CL – CEKLIS OBSERVASI AKTIVITAS DI TEMPAT KERJA ATAU TEMPAT KERJA SIMULASI</h1>
      <KepalaAk info={info} tuk={isian.tuk}>
        <BarisTanggal nilai={isian.tanggal} />
      </KepalaAk>
      <CatatanCoret />

      <Panduan
        butir={[
          "Lengkapi nama unit kompetensi, elemen, dan kriteria unjuk kerja sesuai kolom dalam tabel.",
          "Isilah standar industri atau tempat kerja.",
          "Beri tanda (✓) pada kolom “YA” jika anda yakin asesi dapat melakukan/mendemonstrasikan tugas sesuai KAK, atau centang (✓) pada kolom “TIDAK” bila sebaliknya.",
          "Penilaian lanjut diisi bila hasil belum dapat disimpulkan, untuk itu gunakan metode lain sehingga keputusan dapat dibuat.",
          "Isilah kolom KUK sesuai dengan Unit Kompetensi/SKKNI",
        ]}
      />

      <TabelUnit judulSkema={info.skema.judul} unit={p.struktur} />

      {p.struktur.map((u, ui) => (
        <div key={u.id} className={ui === 0 ? "putus-sebelum" : ""} style={{ marginTop: 12 }}>
          <KepalaUnit nomor={ui + 1} kode={u.kode_unit} judul={u.judul_unit} />
          <table className="tbl">
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "19%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={2}>No</th>
                <th rowSpan={2}>Elemen</th>
                <th rowSpan={2} colSpan={2}>
                  Kriteria Unjuk Kerja
                </th>
                <th rowSpan={2}>Standar Industri atau Tempat Kerja</th>
                <th colSpan={2}>Pencapaian</th>
                <th rowSpan={2}>Penilaian Lanjut</th>
              </tr>
              <tr>
                <th>Ya</th>
                <th>Tidak</th>
              </tr>
            </thead>
            <tbody>
              {u.elemen.map((e) => {
                const n = isian.elemen[e.kunci] ?? { standar: null, pencapaian: null, lanjut: null };
                const kuk = e.kuk.length ? e.kuk : [{ nomor: null, deskripsi: "" }];
                // Pencapaian dinilai per elemen: kotak & penilaian lanjut digabung untuk seluruh KUK elemen.
                return kuk.map((k, ki) => (
                  <tr key={`${e.kunci}-${ki}`}>
                    {ki === 0 && (
                      <>
                        <td rowSpan={kuk.length}>{e.nomor}.</td>
                        <td rowSpan={kuk.length} className="b">
                          {e.nama}
                        </td>
                      </>
                    )}
                    <td className="m">{k.nomor}</td>
                    <td>{k.deskripsi}</td>
                    {ki === 0 && (
                      <>
                        <td rowSpan={kuk.length} className="pre kecil">
                          {n.standar}
                        </td>
                        <td rowSpan={kuk.length} className="c m">
                          {ya(n.pencapaian)}
                        </td>
                        <td rowSpan={kuk.length} className="c m">
                          {tidak(n.pencapaian)}
                        </td>
                        <td rowSpan={kuk.length} className="pre kecil">
                          {n.lanjut}
                        </td>
                      </>
                    )}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      ))}

      <KotakTeks judul="Umpan balik untuk asesi:" isi={isian.umpan_balik} />

      <table className="tbl putus-sebelum">
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "41%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "3%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} className="b">
              Rekomendasi:
            </td>
            <td colSpan={3} className="b">
              Asesi
            </td>
          </tr>
          <tr>
            <td rowSpan={2} style={{ borderRight: 0 }}>
              <Kotak on={isian.rekomendasi === "kompeten"} />
            </td>
            <td rowSpan={2} style={{ borderLeft: 0 }}>
              Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <span className="b">KOMPETEN</span>
            </td>
            <td>Nama</td>
            <td className="c">:</td>
            <td>{info.asesi.nama}</td>
          </tr>
          <tr>
            <td className="m">Tanda Tangan/Tanggal</td>
            <td className="c m">:</td>
            <td className="ttd-sel">
              <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak="asesi" ada={meta.tanda_tangan.asesi.ada} />
              {tgl(meta.tanda_tangan.asesi.tanggal)}
            </td>
          </tr>
          <tr>
            <td rowSpan={4} style={{ borderRight: 0 }}>
              <Kotak on={lanjut} />
            </td>
            <td rowSpan={4} style={{ borderLeft: 0 }}>
              Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <span className="b">BELUM KOMPETEN</span>
              <br />
              Pada:
              <br />
              Kelompok Pekerjaan: {(lanjut && isian.lanjutan.kelompok) || "........................"}
              <br />
              Unit: {(lanjut && isian.lanjutan.unit) || "........................"}
              <br />
              Elemen: {(lanjut && isian.lanjutan.elemen) || "..................."}
              <br />
              KUK: {(lanjut && isian.lanjutan.kuk) || "........................"}
            </td>
            <td colSpan={3} className="b">
              Asesor
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
            <td className="m">Tanda Tangan/Tanggal</td>
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

/* ------------------------------ FR.IA.02 ------------------------------ */

export function CetakIa02({ p }: { p: Ia02Payload }) {
  const { isian, info } = p;
  const meta = p.dokumen;

  return (
    <>
      <h1>FR.IA.02.&nbsp;&nbsp;&nbsp;&nbsp;TPD - TUGAS PRAKTIK DEMONSTRASI</h1>
      <KepalaAk info={info} tuk={isian.tuk}>
        <BarisTanggal nilai={isian.tanggal} />
      </KepalaAk>
      <CatatanCoret />

      <h2>A.&nbsp;&nbsp;Petunjuk</h2>
      <ol className="angka" style={{ paddingLeft: 40 }}>
        <li>Baca dan pelajari setiap instruksi kerja di bawah ini dengan cermat sebelum melaksanakan praktek</li>
        <li>Klarifikasi kepada asesor kompetensi apabila ada hal-hal yang belum jelas</li>
        <li>Laksanakan pekerjaan sesuai dengan urutan proses yang sudah ditetapkan</li>
        <li>Seluruh proses kerja mengacu kepada SOP/WI yang dipersyaratkan (Jika Ada)</li>
      </ol>

      <h2>B.&nbsp;&nbsp;Skenario Tugas Praktik Demonstrasi</h2>
      <TabelUnit judulSkema={info.skema.judul} unit={p.unit_kompetensi} />

      <p className="b" style={{ marginTop: 16 }}>
        Skenario Tugas Praktik Demonstrasi:
      </p>
      <div className="pre" style={{ textAlign: "justify", marginBottom: 12 }}>
        {p.instrumen.skenario}
      </div>
      {p.instrumen.waktu && <p className="b">Waktu : {p.instrumen.waktu}</p>}

      <div style={{ marginTop: 16 }}>
        <BlokTtdAsesiAsesor meta={meta} asesi={info.asesi.nama} asesor={info.asesor} />
      </div>

      <div className="putus-sebelum">
        <TabelPenyusun penilaianId={meta.penilaian_id} slug={meta.slug} penyusun={p.penyusun} tanggalBawaan={meta.submitted_at} />
      </div>
    </>
  );
}

/* ------------------------------ FR.IA.03 ------------------------------ */

export function CetakIa03({ p }: { p: Ia03Payload }) {
  const { isian, info } = p;
  const meta = p.dokumen;
  const daftar = [
    ...isian.pertanyaan.map((teks, i) => ({ teks, ...(isian.jawaban[i] ?? { tanggapan: null, pencapaian: null }) })),
    ...isian.tambahan.map((t) => ({ teks: t.teks ?? "", tanggapan: t.tanggapan, pencapaian: t.pencapaian })),
  ];

  return (
    <>
      <h1>FR.IA.03.&nbsp;&nbsp;PERTANYAAN UNTUK MENDUKUNG OBSERVASI</h1>
      <KepalaAk info={info} tuk={isian.tuk}>
        <BarisTanggal nilai={isian.tanggal} />
      </KepalaAk>
      <CatatanCoret />

      <Panduan
        butir={[
          "Formulir ini di isi oleh asesor kompetensi dapat sebelum, pada saat atau setelah melakukan asesmen dengan metode observasi demonstrasi.",
          "Pertanyaan dibuat dengan tujuan untuk menggali, dapat berisi pertanyaan yang berkaitan dengan dimensi kompetensi, batasan variabel dan aspek kritis yang relevan dengan skenario tugas dan praktik demonstrasi.",
          "Jika pertanyaan disampaikan sebelum asesi melakukan praktik demonstrasi, maka pertanyaan dibuat berkaitan dengan aspek K3L, SOP, penggunaan peralatan dan perlengkapan.",
          <>
            Jika setelah asesi melakukan praktik demonstrasi terdapat item pertanyaan pendukung observasi telah terpenuhi, maka pertanyaan
            tersebut tidak perlu ditanyakan lagi dan cukup memberi catatan bahwa sudah terpenuhi pada saat tugas praktek demonstrasi pada kolom
            tanggapan
            <br />
            Jika pada saat observasi ada hal yang perlu dikonfirmasi sedangkan di instrumen daftar pertanyaan pendukung observasi tidak ada,
            maka asesor dapat memberikan pertanyaan dengan syarat pertanyaan harus berkaitan dengan tugas praktek demonstrasi. Jika dilakukan,
            asesor harus mencatat dalam instrumen pertanyaan pendukung observasi.
          </>,
          "Tanggapan asesi ditulis pada kolom tanggapan.",
        ]}
      />

      <div style={{ marginTop: 16 }}>
        <TabelUnit judulSkema={info.skema.judul} unit={p.unit_kompetensi} />
      </div>

      <table className="tbl putus-sebelum">
        <colgroup>
          <col style={{ width: "9%" }} />
          <col />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2} colSpan={2}>
              Pertanyaan
            </th>
            <th colSpan={2} style={{ fontWeight: 400 }}>
              Pencapaian
            </th>
          </tr>
          <tr>
            <th style={{ fontWeight: 400 }}>Ya</th>
            <th style={{ fontWeight: 400 }}>Tdk</th>
          </tr>
        </thead>
        <tbody>
          {daftar.map((d, i) => (
            <Fragment key={i}>
              <tr>
                <td>{i + 1}.</td>
                <td className="pre">{d.teks}</td>
                <td />
                <td />
              </tr>
              <tr>
                <td colSpan={2} style={{ height: 90 }}>
                  <span className="b">Tanggapan:</span>
                  <div className="pre">{d.tanggapan}</div>
                </td>
                <td className="c">{ya(d.pencapaian)}</td>
                <td className="c">{tidak(d.pencapaian)}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>

      <KotakTeks judul="Umpan balik untuk asesi:" isi={isian.umpan_balik} />

      <div className="putus-sebelum">
        <BlokTtdAsesiAsesor meta={meta} asesi={info.asesi.nama} asesor={info.asesor} />
        <p className="kecil" style={{ textAlign: "justify" }}>
          Diadaptasi dari template yang disediakan di Departemen Pendidikan dan Pelatihan, Australia.Merancang instrumen asesmen untuk hasil
          yang berkualitas di VET, 2008 di VET, 2008
        </p>
      </div>
    </>
  );
}

/* ------------------------------ FR.IA.04A ------------------------------ */

export function CetakIa04a({ p }: { p: Ia04aPayload }) {
  const { isian, info, instrumen } = p;
  const meta = p.dokumen;
  const ttd = (pihak: "asesi" | "asesor") => (
    <>
      <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak={pihak} ada={meta.tanda_tangan[pihak].ada} />
      {tgl(meta.tanda_tangan[pihak].tanggal)}
    </>
  );

  return (
    <>
      <h1 style={{ display: "flex", gap: 18 }}>
        <span>FR.IA.04A.</span>
        <span>DIT – DAFTAR INSTRUKSI TERSTRUKTUR (PENJELASAN PROYEK SINGKAT/ KEGIATAN TERSTRUKTUR LAINNYA*)</span>
      </h1>
      <KepalaAk info={info} tuk={isian.tuk}>
        <BarisTanggal nilai={info.jadwal.tanggal} />
      </KepalaAk>
      <CatatanCoret kecil="coret" />

      <Panduan
        butir={[
          "Tentukan proyek singkat atau kegiatan terstruktur lainnya yang harus dipersiapkan dan dipresentasikan oleh asesi.",
          "Proyek singkat atau kegiatan terstruktur lainnya dibuat untuk keseluruhan unit kompetensi dalam Skema Sertifikasi atau untuk masing-masing kelompok pekerjaan.",
          "Kumpulkan hasil proyek singkat atau kegiatan terstruktur lainnya sesuai dengan hasil keluaran yang telah ditetapkan.",
        ]}
      />

      <div style={{ marginTop: 16 }}>
        <TabelUnit judulSkema={info.skema.judul} unit={p.unit_kompetensi} />
      </div>

      <table className="tbl" style={{ marginTop: 16 }}>
        <colgroup>
          <col style={{ width: "32%" }} />
          <col style={{ width: "8%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td>Hal yang harus disiapkan atau dilakukan atau dihasilkan untuk suatu proyek singkat/ kegiatan terstruktur lainnya</td>
            <td colSpan={2} className="pre" style={{ textAlign: "justify" }}>
              {instrumen.hal_disiapkan}
            </td>
          </tr>
          <tr>
            <td>Hal yang perlu didemonstrasikan/ dipresentasikan:</td>
            <td colSpan={2} className="pre" style={{ textAlign: "justify" }}>
              {instrumen.hal_didemonstrasikan}
            </td>
          </tr>
          <tr>
            <td rowSpan={3} />
            <td rowSpan={2} className="m">
              Waktu
            </td>
            <td className="pre">{instrumen.waktu_pengerjaan}</td>
          </tr>
          <tr>
            <td className="pre">{instrumen.waktu_tanya_jawab}</td>
          </tr>
          <tr>
            <td colSpan={2} className="pre">
              {instrumen.total_waktu}
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{ height: 100 }}>
              Umpan Balik Untuk Asesi:
              <div className="pre">{isian.umpan_balik}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="tbl" style={{ marginTop: -12 }}>
        <colgroup>
          <col style={{ width: "34%" }} />
          <col style={{ width: "31%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <th>Tanda Tangan Asesi</th>
            <th>Tanda Tangan Asesor</th>
            <th>
              Nama &amp; Tanda Tangan Supervisor
              <br />
              (Jika ada)
            </th>
          </tr>
          <tr>
            <td style={{ height: 120 }}>{ttd("asesi")}</td>
            <td>{ttd("asesor")}</td>
            <td style={{ verticalAlign: "bottom" }}>{isian.supervisor}</td>
          </tr>
        </tbody>
      </table>
      <p className="kecil" style={{ marginTop: -10, paddingLeft: 16 }}>
        *) Apabila asesi pada Level 4 ke atas, berikan tugas proyek yang meliputi tentang pemecahan masalah dan Analisa
      </p>

      <TabelPenyusun penilaianId={meta.penilaian_id} slug={meta.slug} penyusun={p.penyusun} tanggalBawaan={meta.submitted_at} formatTgl={tglPanjang} />
    </>
  );
}

/* ------------------------------ FR.IA.04B ------------------------------ */

export function CetakIa04b({ p }: { p: Ia04bPayload }) {
  const { isian, info } = p;
  const meta = p.dokumen;
  const daftar = [
    ...isian.aspek.map((a, i) => {
      const j = isian.jawaban[i] ?? { tanggapan: null, pencapaian: null, kesesuaian: null };
      return { ...a, tanggapan: j.tanggapan, pencapaian: j.pencapaian, kesesuaian: j.kesesuaian ?? a.kesesuaian };
    }),
    ...isian.tambahan,
  ];
  const rekomendasi = isian.rekomendasi;

  return (
    <>
      <h1>FR.IA.04B.&nbsp;&nbsp;PENILAIAN PROYEK SINGKAT ATAU KEGIATAN TERSTRUKTUR LAINNYA</h1>
      <KepalaAk
        info={info}
        tuk={isian.tuk}
        sebelumAsesor={
          <tr>
            <td colSpan={2}>Judul Kegiatan Terstruktur</td>
            <td className="c">:</td>
            <td>{isian.judul_kegiatan}</td>
          </tr>
        }
      >
        <BarisTanggal nilai={isian.tanggal} />
      </KepalaAk>
      <CatatanCoret kecil="coret" />

      <Panduan
        butir={[
          "Lakukan penilaian pencapaian hasil proyek singkat atau kegiatan terstruktur lainnya melalui presentasi.",
          <>
            Penilaian dilakukan sesuai dengan{" "}
            <span className="b">FR IA 04A. DIT. Daftar Instruksi Terstruktur (Penjelasan Proyek Singkat/Kegiatan Terstruktur Lainnya)</span>
          </>,
          <>
            Pertanyaan disampaikan oleh asesor <span className="b">setelah asesi melakukan presentasi proyek singkat/kegiatan terstruktur lainnya.</span>
          </>,
          "Pertanyaan dapat dikembangkan oleh asesor berdasarkan dokumen presentasi dan atau hasil presentasi",
          "Pertanyaan yang disampaikan untuk pemenuhan pencapaian 5 dimensi kompetensi.",
          "Isilah kolom lingkup penyajian proyek atau kegiatan terstruktur lainnya sesuai sektor/sub-sektor/profesi.",
          "Berikan keputusan pencapaian berdasarkan kesimpulan jawaban asesi.",
        ]}
      />

      <div style={{ marginTop: 16 }}>
        <TabelUnit judulSkema={info.skema.judul} unit={p.unit_kompetensi} />
      </div>

      <table className="tbl putus-sebelum">
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr>
            <th colSpan={4}>Aspek Penilaian</th>
            <th colSpan={2}>Pencapaian</th>
          </tr>
          <tr>
            <th colSpan={2}>Lingkup Penyajian proyek atau kegiatan terstruktur lainnya</th>
            <th>Daftar Pertanyaan</th>
            <th>Kesesuaian dengan standar kompetensi kerja (unit/elemen/KUK)</th>
            <th>Ya</th>
            <th>Tidak</th>
          </tr>
        </thead>
        <tbody>
          {daftar.map((d, i) => (
            <tr key={i}>
              <td>{i + 1}.</td>
              <td className="pre">{d.lingkup}</td>
              <td>
                {/* Teks template kadang sudah diawali "Pertanyaan:" / "Pertanyaan 2:". */}
                {!/^\s*pertanyaan\b/i.test(d.pertanyaan ?? "") && "Pertanyaan:"}
                <div className="pre">{d.pertanyaan}</div>
                <div style={{ marginTop: 6 }}>Tanggapan:</div>
                <div className="pre">{d.tanggapan}</div>
              </td>
              <td className="pre kecil">{d.kesesuaian}</td>
              <td className="c">{ya(d.pencapaian)}</td>
              <td className="c">{tidak(d.pencapaian)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl">
        <colgroup>
          <col style={{ width: "26%" }} />
          <col style={{ width: "3%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} rowSpan={3} className="b">
              Rekomendasi Asesor:
            </td>
            <td>
              Asesi telah memenuhi/belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan:
              {isian.rekomendasi_teks && <div className="pre">{isian.rekomendasi_teks}</div>}
            </td>
          </tr>
          <tr>
            <td>
              <Kotak on={rekomendasi === "kompeten"} />
              &nbsp;&nbsp;Kompeten
            </td>
          </tr>
          <tr>
            <td>
              <Kotak on={rekomendasi === "belum_kompeten"} />
              &nbsp;&nbsp;Belum Kompeten
            </td>
          </tr>
          {(["asesi", "asesor"] as const).map((pihak) => (
            <Fragment key={pihak}>
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
              <tr>
                <td className="m">Tanda Tangan/Tanggal</td>
                <td className="c m">:</td>
                <td className="ttd-sel">
                  <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak={pihak} ada={meta.tanda_tangan[pihak].ada} />
                  {tgl(meta.tanda_tangan[pihak].tanggal)}
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>

      <TabelPenyusun penilaianId={meta.penilaian_id} slug={meta.slug} penyusun={p.penyusun} tanggalBawaan={meta.submitted_at} formatTgl={tglPanjang} />
    </>
  );
}
