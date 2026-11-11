"use client";

import { Fragment } from "react";
import type { AkInfo, AturanBukti, DokumenMeta, Ia08Payload, Ia09Payload, Ia10Payload, Pencapaian } from "@/types/dokumen";
import { KepalaAk } from "./CetakAk";
import { Coret, Kotak, TabelPenyusun, TtdPihak, tgl, tglPanjang } from "./CetakShared";

function KepalaVp({ info, tuk, tanggal }: { info: AkInfo; tuk: Ia08Payload["isian"]["tuk"]; tanggal: string | null }) {
  return (
    <>
      <KepalaAk info={info} tuk={tuk}>
        <tr>
          <td colSpan={2}>Tanggal</td>
          <td className="c">:</td>
          <td>{tgl(tanggal)}</td>
        </tr>
      </KepalaAk>
      <p className="i kecil" style={{ marginTop: -10 }}>
        *Coret yang tidak perlu
      </p>
    </>
  );
}

function Panduan({ butir }: { butir: React.ReactNode[] }) {
  return (
    <table className="tbl">
      <tbody>
        <tr>
          <td className="b">PANDUAN BAGI ASESOR</td>
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

/** "Asesi: Nama / Tanda Tangan dan Tanggal — Asesor: Nama / No. Reg / Tanda Tangan dan Tanggal". */
function TabelTtd({ info, meta }: { info: AkInfo; meta: DokumenMeta }) {
  return (
    <table className="tbl">
      <colgroup>
        <col style={{ width: "29%" }} />
        <col style={{ width: "3%" }} />
        <col />
      </colgroup>
      <tbody>
        {(["asesi", "asesor"] as const).map((pihak) => (
          <Fragment key={pihak}>
            <tr>
              <td colSpan={3} className="b">
                {pihak === "asesi" ? "Asesi" : "Asesor"}
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
              <td className="m">Tanda Tangan dan Tanggal</td>
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
  );
}

const ya = (p: Pencapaian) => <Kotak on={p === "ya"} />;
const tidak = (p: Pencapaian) => <Kotak on={p === "tidak"} />;

/* ------------------------------ FR.IA.08 ------------------------------ */

const ATURAN: { key: AturanBukti; label: string }[] = [
  { key: "valid", label: "Valid" },
  { key: "asli", label: "Asli" },
  { key: "terkini", label: "Terkini" },
  { key: "memadai", label: "Memadai" },
];

export function CetakIa08({ p }: { p: Ia08Payload }) {
  const { isian, info } = p;
  const meta = p.dokumen;
  const lanjut = isian.rekomendasi === "lanjutan";

  // Materi wawancara terpilih, dikelompokkan per unit lalu per elemen (sesuai tabel formulir).
  const terpilih = p.kuk.filter((k) => isian.materi.includes(k.kunci));
  const unitTampil = [...new Set([...terpilih.map((k) => k.unit_kunci), ...isian.klarifikasi])]
    .map((uk) => ({ uk, no: p.kuk.find((k) => k.unit_kunci === uk)?.unit_no ?? 0 }))
    .sort((a, b) => a.no - b.no);

  // Lingkup asesmen lanjutan.
  const unitLanjut = p.kuk.filter((k) => isian.lanjutan.unit.includes(k.unit_kunci));
  const noUnitLanjut = [...new Set(unitLanjut.map((k) => k.unit_no))];
  const kukLanjut = p.kuk.filter((k) => isian.lanjutan.kuk.includes(k.kunci));
  const elemenLanjut = [...new Set(kukLanjut.map((k) => `${k.unit_no}.${k.elemen_no}`))];
  const jenisLanjut = isian.lanjutan.jenis === "observasi" ? 0 : isian.lanjutan.jenis === "kegiatan_terstruktur" ? 1 : null;

  return (
    <>
      <h1>FR.IA.08.CVP.&nbsp;&nbsp;&nbsp;&nbsp;CEKLIS VERIFIKASI PORTOFOLIO</h1>
      <KepalaVp info={info} tuk={isian.tuk} tanggal={isian.tanggal} />

      <Panduan
        butir={[
          "Verifikasi portofolio dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.",
          "Isilah bukti portofolio sesuai ketentuan bukti berkualitas dan relevan dengan standar kompetensi kerja sebagaimana yang telah disepakati pada rekaman asesmen mandiri.",
          "Lakukan verifikasi portofolio berdasarkan aturan bukti.",
          "Berikan hasil verifikasi portofolio dengan memberi centang (√) pada kolom yang sesuai.",
          "Jika hasil verifikasi dokumen portofolio belum memenuhi aturan bukti maka asesor melanjutkan dengan metode tanya jawab pertanyaan wawancara dan/atau verifikasi pihak ketiga.",
        ]}
      />

      <table className="tbl" style={{ marginTop: 16 }}>
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "24%" }} />
          {ATURAN.flatMap((a) => [<col key={`${a.key}-y`} />, <col key={`${a.key}-t`} />])}
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={3} colSpan={2}>
              Bukti Portofolio
            </th>
            <th colSpan={8}>Aturan Bukti</th>
          </tr>
          <tr>
            {ATURAN.map((a) => (
              <th key={a.key} colSpan={2}>
                {a.label}
              </th>
            ))}
          </tr>
          <tr>
            {ATURAN.flatMap((a) => [<th key={`${a.key}-y`}>Ya</th>, <th key={`${a.key}-t`}>Tidak</th>])}
          </tr>
        </thead>
        <tbody>
          {isian.portofolio.map((b, i) => (
            <tr key={i}>
              <td className="m">{i + 1}.</td>
              <td className="m">{b.bukti || p.lampiran.find((l) => l.id === b.relevan_id)?.nama}</td>
              {ATURAN.flatMap((a) => [
                <td key={`${a.key}-y`} className="c m">
                  {ya(b[a.key])}
                </td>,
                <td key={`${a.key}-t`} className="c m">
                  {tidak(b[a.key])}
                </td>,
              ])}
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl">
        <colgroup>
          <col style={{ width: "6%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "29%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={4}>
              Sebagai tindak lanjut dari hasil verifikasi bukti, substansi materi dibawah ini (No Elemen yang di cek list) harus diklarifikasi
              selama wawancara
            </td>
          </tr>
          <tr>
            <th>Cek List</th>
            <th>No. Unit Kompetensi</th>
            <th>No. Elemen</th>
            <th>Materi/Substansi Wawancara/KUK</th>
          </tr>
          {unitTampil.flatMap(({ uk, no }) => {
            const kukUnit = terpilih.filter((k) => k.unit_kunci === uk);
            const baris = kukUnit.length ? kukUnit : [null];
            const elemenSpan = (idx: number) => {
              const e = baris[idx]?.elemen_no;
              let n = 1;
              while (idx + n < baris.length && baris[idx + n]?.elemen_no === e) n++;
              return n;
            };
            return baris.map((k, i) => (
              <tr key={`${uk}-${k?.kunci ?? "kosong"}`}>
                {i === 0 && (
                  <>
                    <td rowSpan={baris.length} className="c m">
                      <Kotak on={isian.klarifikasi.includes(uk)} />
                    </td>
                    <td rowSpan={baris.length} className="c m">
                      {no}
                    </td>
                  </>
                )}
                {(i === 0 || baris[i - 1]?.elemen_no !== k?.elemen_no) && (
                  <td rowSpan={elemenSpan(i)} className="c m">
                    {k?.elemen_no}
                  </td>
                )}
                <td className="kecil">{k ? `${k.nomor ?? ""} ${k.deskripsi}` : ""}</td>
              </tr>
            ));
          })}
        </tbody>
      </table>

      <table className="tbl putus-sebelum">
        <colgroup>
          <col style={{ width: "23%" }} />
          <col style={{ width: "5%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={3} style={{ height: 120 }}>
              <span className="b">Bukti tambahan diperlukan pada unit/elemen kompetensi sebagai berikut:</span>
              <div className="pre">{isian.bukti_tambahan}</div>
            </td>
          </tr>
          <tr>
            <td rowSpan={2} className="b">
              Rekomendasi Asesor
            </td>
            <td className="c">
              <Kotak on={isian.rekomendasi === "kompeten"} />
            </td>
            <td>
              Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <span className="b">KOMPETEN</span>
            </td>
          </tr>
          <tr>
            <td className="c">
              <Kotak on={lanjut} />
            </td>
            <td>
              Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan{" "}
              <span className="b">
                <Coret pilihan={["OBSERVASI LANGSUNG", "KEGIATAN TERSTRUKTUR"]} aktif={lanjut ? jenisLanjut : null} bintang="*)" />
              </span>{" "}
              pada:
              <div>Kelompok Pekerjaan</div>
              <div>
                <span style={{ display: "inline-block", width: 56 }}>Unit</span>: {lanjut ? noUnitLanjut.join(", ") : ""}
              </div>
              <div>
                <span style={{ display: "inline-block", width: 56 }}>Elemen</span>: {lanjut ? elemenLanjut.join(", ") : ""}
              </div>
              <div>
                <span style={{ display: "inline-block", width: 56 }}>KUK</span>:{" "}
                {lanjut ? (kukLanjut.length ? kukLanjut.map((k) => k.nomor).join(", ") : noUnitLanjut.length ? "Seluruh KUK unit terpilih" : "") : ""}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <TabelTtd info={info} meta={meta} />
    </>
  );
}

/* ------------------------------ FR.IA.09 ------------------------------ */

export function CetakIa09({ p }: { p: Ia09Payload }) {
  const { isian, info } = p;
  const meta = p.dokumen;
  const daftar = [
    ...isian.pertanyaan.map((teks, i) => ({ teks, ...(isian.jawaban[i] ?? { kesimpulan: null, pencapaian: null }) })),
    ...isian.tambahan.map((t) => ({ teks: t.teks ?? "", kesimpulan: t.kesimpulan, pencapaian: t.pencapaian })),
  ];

  return (
    <>
      <h1>FR.IA.09.PW - PERTANYAAN WAWANCARA</h1>
      <KepalaVp info={info} tuk={isian.tuk} tanggal={isian.tanggal} />

      <Panduan
        butir={[
          "Pertanyaan wawancara dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.",
          <>
            Isilah bukti portofolio sesuai dengan bukti yang diminta pada skema sertifikasi sebagaimana yang telah dibuat pada{" "}
            <span className="b">FR-IA.08.</span>
          </>,
          <>
            Ajukan pertanyaan verifikasi portofolio untuk semua unit/elemen kompetensi yang di checklist pada <span className="b">FR-IA.08.</span>
          </>,
          "Ajukan pertanyaan kepada asesi sebagai tindak lanjut hasil verifikasi portofolio.",
          "Jika hasil verifikasi potofolio telah memenuhi aturan bukti maka pertanyaan wawancara tidak perlu dilakukan terhadap bukti tersebut.",
          <>
            Tuliskan pencapaian atas setiap kesimpulan pertanyaan wawancara dengan cara mencentang <span className="b">(√) “Ya”</span> atau{" "}
            <span className="b">“Tidak”.</span>
          </>,
        ]}
      />

      <table className="tbl" style={{ marginTop: 16 }}>
        <colgroup>
          <col style={{ width: "6%" }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>No.</th>
            <th>Bukti Portofolio</th>
          </tr>
        </thead>
        <tbody>
          {isian.bukti.map((b, i) => (
            <tr key={i}>
              <td className="c">{i + 1}.</td>
              <td className="kecil">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl" style={{ marginTop: 16 }}>
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "34%" }} />
          <col />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2} colSpan={2}>
              Daftar Pertanyaan Wawancara
            </th>
            <th rowSpan={2}>Kesimpulan Jawaban Asesi</th>
            <th colSpan={2}>Pencapaian</th>
          </tr>
          <tr>
            <th>Ya</th>
            <th>Tidak</th>
          </tr>
        </thead>
        <tbody>
          {daftar.map((d, i) => (
            <tr key={i}>
              <td>{i + 1}.</td>
              <td className="pre">{d.teks}</td>
              <td className="pre">{d.kesimpulan}</td>
              <td className="c m">{ya(d.pencapaian)}</td>
              <td className="c m">{tidak(d.pencapaian)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <TabelTtd info={info} meta={meta} />

      <TabelPenyusun penilaianId={meta.penilaian_id} slug={meta.slug} penyusun={p.penyusun} tanggalBawaan={meta.submitted_at} formatTgl={tglPanjang} />
    </>
  );
}

/* ------------------------------ FR.IA.10 ------------------------------ */

export function CetakIa10({ p }: { p: Ia10Payload }) {
  const { isian, info } = p;
  const meta = p.dokumen;
  const isianKanan: [string, string | null][] = [
    ["Apa hubungan Anda dengan asesi?", isian.hubungan],
    ["Berapa lama Anda bekerja dengan asesi?", isian.lama_bekerja],
    ["Seberapa dekat Anda bekerja dengan asesi di area yang dinilai?", isian.kedekatan],
    ["Apa pengalaman teknis dan/atau kualifikasi Anda di bidang yang dinilai? (termasuk asesmen atau kualifikasi pelatihan)", isian.pengalaman],
  ];

  return (
    <>
      <h1>FR.IA.10.VPK - VERIFIKASI PIHAK KETIGA</h1>
      <KepalaVp info={info} tuk={isian.tuk} tanggal={isian.tanggal} />

      <p className="i" style={{ textAlign: "right", marginBottom: 2 }}>
        Informasi Rahasia
      </p>
      <Panduan
        butir={[
          "Verifikasi pihak ketiga dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.",
          "Tentukan pihak ketiga yang akan dimintai verifikasi.",
          "Ajukan pertanyaan kepada pihak ketiga.",
          "Berikan penilaian kepada asesi berdasarkan verifikasi pihak ketiga.",
          "Pertanyaan/pernyataan dapat dikembangkan sesuai dengan konteks pekerjaan dan relasi.",
        ]}
      />

      <table className="tbl" style={{ marginTop: 16 }}>
        <colgroup>
          <col style={{ width: "16%" }} />
          <col style={{ width: "3%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={3} style={{ height: 52 }}>
              Nama Pengawas/Penyelia/Atasan/Orang lain di Perusahaan:
              <div>{isian.pengawas.nama}</div>
            </td>
          </tr>
          {(
            [
              ["Tempat Kerja", isian.pengawas.tempat_kerja],
              ["Alamat", isian.pengawas.alamat],
              ["Telepon", isian.pengawas.telepon],
            ] as const
          ).map(([label, isi]) => (
            <tr key={label}>
              <td style={{ borderRight: 0 }}>{label}</td>
              <td style={{ borderLeft: 0, borderRight: 0 }}>:</td>
              <td style={{ borderLeft: 0 }}>{isi}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl" style={{ marginTop: 16 }}>
        <colgroup>
          <col />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Pertanyaan</th>
            <th>Ya</th>
            <th>Tidak</th>
          </tr>
        </thead>
        <tbody>
          {p.pertanyaan.map((q, i) => (
            <tr key={i}>
              <td style={{ textAlign: "justify", height: 40 }}>
                <ul className="titik">
                  <li>{q}</li>
                </ul>
              </td>
              <td className="c m">{ya(isian.jawaban[i] ?? null)}</td>
              <td className="c m">{tidak(isian.jawaban[i] ?? null)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl putus-sebelum">
        <colgroup>
          <col style={{ width: "47%" }} />
          <col />
        </colgroup>
        <tbody>
          {isianKanan.map(([label, isi]) => (
            <tr key={label}>
              <td className="b m" style={{ height: 80 }}>
                {label}
              </td>
              <td className="pre m">{isi}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl">
        <colgroup>
          <col style={{ width: "47%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td className="b" style={{ height: 80 }}>
              Secara keseluruhan, apakah Anda yakin asesi melakukan sesuai standar yang diminta oleh unit kompetensi secara konsisten?
            </td>
            <td className="pre">{isian.keyakinan}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ height: 100 }}>
              <span className="b">Identifikasi kebutuhan pelatihan lebih lanjut untuk asesi:</span>
              <div className="pre">{isian.kebutuhan_pelatihan}</div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ height: 100 }}>
              <span className="b">Ada komentar lain:</span>
              <div className="pre">{isian.komentar}</div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ height: 100 }}>
              <div style={{ display: "flex" }}>
                <div style={{ width: "65%" }}>
                  <span className="b">Tanda Tangan Asesor:</span>
                  <TtdPihak penilaianId={meta.penilaian_id} slug={meta.slug} pihak="asesor" ada={meta.tanda_tangan.asesor.ada} />
                </div>
                <div>
                  <span className="b">Tanggal:</span> {tgl(meta.tanda_tangan.asesor.tanggal)}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="i kecil" style={{ marginTop: -10 }}>
        Diadopsi dari tempat yang disediakan di Depratemen Pendidikan dan Pelatihan, Australia. Merancang alat asesmen untuk hasil yang
        berkualitas di VET.2008
      </p>
    </>
  );
}
