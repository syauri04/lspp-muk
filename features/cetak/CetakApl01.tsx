"use client";

import type { Apl01Payload } from "@/types/dokumen";
import { Coret, Kotak, TabelSkema, TtdPihak, tgl } from "./CetakShared";

const SLUG = "apl-01";

function Baris({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <tr>
      <td style={{ width: "28%" }}>{label}</td>
      <td style={{ width: "3%" }}>:</td>
      <td>
        <div className="garis-isi">{children}</div>
      </td>
    </tr>
  );
}

/** Dua isian sebaris, mis. "Rumah : …   Kantor : …". */
function BarisGanda({ label, kiri, kanan }: { label?: string; kiri: [string, React.ReactNode]; kanan: [string, React.ReactNode] }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{label ? ":" : ""}</td>
      <td>
        <div className="garis-isi" style={{ display: "flex", gap: 12 }}>
          <span style={{ flex: 1 }}>
            {kiri[0] && (
              <>
                <span style={{ display: "inline-block", width: 52 }}>{kiri[0]}</span>: {kiri[1]}
              </>
            )}
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: "inline-block", width: 60 }}>{kanan[0]}</span>: {kanan[1]}
          </span>
        </div>
      </td>
    </tr>
  );
}

export function CetakApl01({ p }: { p: Apl01Payload }) {
  const meta = p.dokumen;
  const { pribadi, pekerjaan } = p.isian;
  const tempatTgl = [pribadi.tempat_lahir, tgl(pribadi.tanggal_lahir)].filter(Boolean).join(", ");
  const jk = pribadi.jenis_kelamin === "laki_laki" ? 0 : pribadi.jenis_kelamin === "perempuan" ? 1 : null;
  const rekomendasi = meta.hasil_rekomendasi_admin === "diterima" ? 0 : meta.hasil_rekomendasi_admin === "ditolak" ? 1 : null;
  const units = p.unit_kompetensi;

  return (
    <>
      <h1>FR.APL.01. PERMOHONAN SERTIFIKASI KOMPETENSI</h1>

      <h2 style={{ marginTop: 0 }}>Bagian 1: Rincian Data Pemohon Sertifikasi</h2>
      <p style={{ textAlign: "justify" }}>
        Pada bagian ini, cantumkan data pribadi, data pendidikan formal, serta data pekerjaan anda pada saat ini.
      </p>

      <h2>a.&nbsp;&nbsp;Data Pribadi</h2>
      <table className="tbl tanpa-garis">
        <tbody>
          <Baris label="Nama Lengkap">{pribadi.nama_lengkap}</Baris>
          <Baris label="No. KTP/NIK/Paspor">{pribadi.nik}</Baris>
          <Baris label="Tempat/Tgl Lahir">{tempatTgl}</Baris>
          <Baris label="Jenis Kelamin">
            <Coret pilihan={["Laki-Laki", "Wanita"]} aktif={jk} />
          </Baris>
          <Baris label="Kebangsaan">{pribadi.kebangsaan}</Baris>
          <Baris label="Alamat Rumah">{pribadi.alamat_rumah}</Baris>
          <BarisGanda kiri={["", null]} kanan={["Kode Pos", pribadi.kode_pos]} />
          <BarisGanda label="No. Telepon/E-Mail" kiri={["Rumah", pribadi.telp_rumah]} kanan={["Kantor", pribadi.telp_kantor]} />
          <BarisGanda kiri={["HP", pribadi.hp]} kanan={["E-Mail", pribadi.email]} />
          <Baris label="Kualifikasi Pendidikan">{pribadi.kualifikasi_pendidikan}</Baris>
        </tbody>
      </table>
      <p className="b i kecil">*Coret yang tidak perlu</p>

      <h2>b.&nbsp;&nbsp;Data Pekerjaan Sekarang</h2>
      <table className="tbl tanpa-garis">
        <tbody>
          <Baris label="Nama Institusi/ Perusahaan">{pekerjaan.nama_institusi}</Baris>
          <Baris label="Jabatan">{pekerjaan.jabatan}</Baris>
          <Baris label="Alamat Kantor">{pekerjaan.alamat_kantor}</Baris>
          <BarisGanda kiri={["", null]} kanan={["Kode Pos", pekerjaan.kode_pos]} />
          <BarisGanda label="No. Telp/Fax/E-Mail" kiri={["Telp", pekerjaan.telp]} kanan={["Fax", pekerjaan.fax]} />
          <BarisGanda kiri={["E-Mail", pekerjaan.email]} kanan={["", null]} />
        </tbody>
      </table>

      <h2 className="putus-sebelum">Bagian 2: Data Sertifikasi</h2>
      <p style={{ textAlign: "justify" }}>
        Tuliskan Judul dan Nomor Skema Sertifikasi yang anda ajukan berikut Daftar Unit Kompetensi sesuai kemasan pada Skema Sertifikasi
        untuk mendapatkan pengakuan sesuai dengan latar belakang pendidikan, pelatihan serta pengalaman kerja yang anda miliki.
      </p>
      <TabelSkema skema={p.skema}>
        {p.opsi.tujuan_asesmen.map((o, i) => (
          <tr key={o.value}>
            {i === 0 && (
              <td colSpan={2} rowSpan={p.opsi.tujuan_asesmen.length}>
                Tujuan Asesmen
              </td>
            )}
            {i === 0 && (
              <td rowSpan={p.opsi.tujuan_asesmen.length} className="c">
                :
              </td>
            )}
            <td>
              <Kotak on={p.isian.tujuan_asesmen === o.value} /> {o.label}
              {o.value === "lainnya" && p.isian.tujuan_asesmen === "lainnya" && p.isian.tujuan_lainnya ? `: ${p.isian.tujuan_lainnya}` : ""}
            </td>
          </tr>
        ))}
      </TabelSkema>

      <p className="b">Daftar Unit Kompetensi sesuai kemasan:</p>
      <table className="tbl">
        <colgroup>
          <col style={{ width: "7%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "40%" }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>No.</th>
            <th>Kode Unit</th>
            <th>Judul Unit</th>
            <th>Standar Kompetensi Kerja</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u, i) => (
            <tr key={u.id}>
              <td className="c m">{i + 1}.</td>
              <td className="c m">{u.kode_unit}</td>
              <td className="m">{u.judul_unit}</td>
              {i === 0 && (
                <td rowSpan={units.length} className="pre kecil" style={{ textAlign: "justify" }}>
                  {p.skema.standar_kompetensi_kerja}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="putus-sebelum">Bagian 3: Bukti Kelengkapan Pemohon</h2>
      <p className="b">3.1&nbsp;&nbsp;Bukti Persayaratan Dasar Pemohon</p>
      <TabelVerifikasi
        judul="Bukti Persayaratan Dasar"
        baris={p.bukti_persyaratan.map((b) => ({
          kunci: String(b.id),
          label: b.deskripsi,
          nilai: b.ada === false ? "tidak_ada" : b.ada && b.memenuhi_syarat === true ? "memenuhi" : b.ada && b.memenuhi_syarat === false ? "tidak_memenuhi" : null,
        }))}
      />

      <p className="b">3.2&nbsp;&nbsp;Bukti Administratif</p>
      <TabelVerifikasi
        judul="Bukti Administratif"
        baris={p.bukti_administratif.map((b) => ({ kunci: b.jenis, label: b.label, nilai: b.verifikasi }))}
      />

      {p.bukti_relevan.length > 0 && (
        <>
          <p className="b">3.3&nbsp;&nbsp;Lampiran Bukti yang Relevan</p>
          <table className="tbl">
            <colgroup>
              <col style={{ width: "7%" }} />
              <col style={{ width: "50%" }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>No</th>
                <th>Bukti</th>
                <th>Lampiran</th>
              </tr>
            </thead>
            <tbody>
              {p.bukti_relevan.map((b, i) => (
                <tr key={b.id}>
                  <td className="c">{i + 1}.</td>
                  <td>{b.nama}</td>
                  <td className="kecil" style={{ wordBreak: "break-all" }}>
                    {b.file?.nama ?? b.link ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <table className="tbl putus-sebelum">
        <colgroup>
          <col style={{ width: "44%" }} />
          <col style={{ width: "24%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td rowSpan={3}>
              <span className="b">Rekomendasi (diisi oleh LSP):</span>
              <br />
              Berdasarkan ketentuan persyaratan dasar, maka pemohon:
              <br />
              <span className="b">
                <Coret pilihan={["Diterima", "Tidak diterima"]} aktif={rekomendasi} bintang="*)" />
              </span>{" "}
              sebagai peserta sertifikasi
              <br />
              <br />
              <span className="i kecil">*Coret yang tidak sesuai</span>
            </td>
            <td colSpan={2} className="b">
              Pemohon/Kandidat
            </td>
          </tr>
          <tr>
            <td>Nama</td>
            <td>{pribadi.nama_lengkap}</td>
          </tr>
          <tr>
            <td className="m">Tanda Tangan/Tanggal</td>
            <td className="ttd-sel">
              <TtdPihak penilaianId={meta.penilaian_id} slug={SLUG} pihak="asesi" ada={meta.tanda_tangan.asesi.ada} />
              {tgl(meta.tanda_tangan.asesi.tanggal)}
            </td>
          </tr>
          <tr>
            <td rowSpan={3}>
              <span className="b">Catatan:</span>
              <div className="pre">{meta.catatan_admin}</div>
            </td>
            <td colSpan={2} className="b">
              Admin LSP
            </td>
          </tr>
          <tr>
            <td>Nama</td>
            <td>{p.admin.nama}</td>
          </tr>
          <tr>
            <td className="m">Tanda Tangan/Tanggal</td>
            <td className="ttd-sel">
              <TtdPihak penilaianId={meta.penilaian_id} slug={SLUG} pihak="admin" ada={meta.tanda_tangan.admin.ada} />
              {tgl(meta.tanda_tangan.admin.tanggal)}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

type NilaiVerifikasi = "memenuhi" | "tidak_memenuhi" | "tidak_ada" | null;

/** Tabel verifikasi bukti: Ada (Memenuhi Syarat / Tidak Memenuhi Syarat) | Tidak Ada. */
function TabelVerifikasi({ judul, baris }: { judul: string; baris: { kunci: string; label: string; nilai: NilaiVerifikasi }[] }) {
  return (
    <table className="tbl">
      <colgroup>
        <col style={{ width: "6%" }} />
        <col style={{ width: "52%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "14%" }} />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th rowSpan={2}>No</th>
          <th rowSpan={2}>{judul}</th>
          <th colSpan={2}>Ada</th>
          <th rowSpan={2}>Tidak Ada</th>
        </tr>
        <tr>
          <th>Memenuhi Syarat</th>
          <th>Tidak Memenuhi Sayarat</th>
        </tr>
      </thead>
      <tbody>
        {baris.map((b, i) => (
          <tr key={b.kunci}>
            <td className="c">{i + 1}.</td>
            <td>{b.label}</td>
            <td className="c m">
              <Kotak on={b.nilai === "memenuhi"} />
            </td>
            <td className="c m">
              <Kotak on={b.nilai === "tidak_memenuhi"} />
            </td>
            <td className="c m">{b.nilai === "tidak_ada" ? "✓" : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
