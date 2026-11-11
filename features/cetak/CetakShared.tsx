"use client";

/*
 * Bahan bersama halaman cetak (Admin LSP): gaya A4 potret mengikuti format dokumen asli
 * (tanpa kop surat), kotak centang, teks coret ("Laki-Laki/Wanita*"), dan gambar tanda tangan
 * yang diambil lewat endpoint ber-token. Tombol Cetak menunggu semua gambar termuat
 * (PelacakGambar), agar tanda tangan tidak hilang di hasil cetak.
 */

import { createContext, Fragment, useContext, useEffect, useState } from "react";
import { mukDokumen } from "@/lib/api/muk";
import type { MapaPenandatangan, MapaSkema, PihakTtd } from "@/types/dokumen";

/* ------------------------------ pelacak gambar ------------------------------ */

type Pelacak = { mulai: () => () => void };
const PelacakContext = createContext<Pelacak>({ mulai: () => () => {} });
export const PelacakProvider = PelacakContext.Provider;

/** Dipakai halaman cetak: jumlah gambar yang masih dimuat. */
export function usePelacakGambar(): [Pelacak, number] {
  const [tertunda, setTertunda] = useState(0);
  const [pelacak] = useState<Pelacak>(() => ({
    mulai: () => {
      setTertunda((n) => n + 1);
      let selesai = false;
      return () => {
        if (selesai) return;
        selesai = true;
        setTertunda((n) => n - 1);
      };
    },
  }));
  return [pelacak, tertunda];
}

/** Ulangi saat kena batas request (429), agar tanda tangan tidak hilang diam-diam dari hasil cetak. */
async function denganUlang(ambil: () => Promise<Blob>, sisa = 3): Promise<Blob> {
  try {
    return await ambil();
  } catch (err) {
    const res = (err as { response?: { status?: number; headers?: Record<string, string> } }).response;
    if (sisa <= 0 || res?.status !== 429) throw err;
    const detik = Math.min(Number(res.headers?.["retry-after"]) || 5, 60);
    await new Promise((r) => setTimeout(r, detik * 1000));
    return denganUlang(ambil, sisa - 1);
  }
}

function useGambarBlob(ambil: (() => Promise<Blob>) | null, kunci: string): string | null | "gagal" {
  const { mulai } = useContext(PelacakContext);
  const [url, setUrl] = useState<string | null | "gagal">(null);

  useEffect(() => {
    if (!ambil) return;
    let aktif = true;
    let objectUrl: string | null = null;
    const selesai = mulai();
    denganUlang(ambil)
      .then((blob) => {
        if (!aktif) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => aktif && setUrl("gagal"))
      .finally(selesai);
    return () => {
      aktif = false;
      selesai();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // ambil dibuat ulang tiap render; kunci mewakili identitas gambar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci, mulai]);

  return ambil ? url : null;
}

function Gambar({ url, alt }: { url: string | null | "gagal"; alt: string }) {
  if (url === "gagal") return <span className="no-print" style={{ color: "#b91c1c", fontSize: "8pt" }}>Tanda tangan gagal dimuat, muat ulang halaman.</span>;
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element -- object URL lokal dari endpoint ber-token
  return <img src={url} alt={alt} className="ttd-gambar" />;
}

/** Tanda tangan pihak dokumen (asesi / asesor / admin). */
export function TtdPihak({ penilaianId, slug, pihak, ada }: { penilaianId: number; slug: string; pihak: PihakTtd; ada: boolean }) {
  const url = useGambarBlob(ada ? () => mukDokumen.gambarTandaTangan(penilaianId, slug, pihak) : null, `${penilaianId}-${slug}-${pihak}`);
  return <Gambar url={url} alt={`Tanda tangan ${pihak}`} />;
}

/** Tanda tangan penandatangan template (MAPA: konfirmasi, penyusun & validator). */
export function TtdPenandatanganCetak({ penilaianId, slug, baris }: { penilaianId: number; slug: string; baris: MapaPenandatangan | null }) {
  const id = baris?.ada_ttd ? baris.id : null;
  const url = useGambarBlob(id !== null ? () => mukDokumen.gambarPenandatangan(penilaianId, slug, id) : null, `${penilaianId}-${slug}-p${id}`);
  return <Gambar url={url} alt={`Tanda tangan ${baris?.nama ?? ""}`} />;
}

/* ------------------------------ elemen format ------------------------------ */

/** "2026-05-04" / ISO -> "04/05/2026". */
export function tgl(nilai: string | null | undefined): string {
  if (!nilai) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(nilai);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : nilai;
}

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/** "2026-05-04" -> "Senin, 4 Mei 2026". */
export function hariTanggal(nilai: string | null | undefined): string {
  const m = nilai ? /^(\d{4})-(\d{2})-(\d{2})/.exec(nilai) : null;
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** "2026-05-04" -> "04 Mei 2026". */
export function tglPanjang(nilai: string | null | undefined): string {
  const m = nilai ? /^(\d{4})-(\d{2})-(\d{2})/.exec(nilai) : null;
  return m ? `${m[3]} ${BULAN[Number(m[2]) - 1]} ${m[1]}` : "";
}

/** Tabel "PENYUSUN DAN VALIDATOR" (penandatangan template CMS). */
export function TabelPenyusun({
  penilaianId,
  slug,
  penyusun,
  tanggalBawaan,
  formatTgl = tgl,
  judul = true,
}: {
  penilaianId: number;
  slug: string;
  penyusun: MapaPenandatangan[];
  tanggalBawaan?: string | null;
  formatTgl?: (v: string | null | undefined) => string;
  judul?: boolean;
}) {
  const grup = [
    { status: "PENYUSUN", baris: penyusun.filter((x) => x.peran === "penyusun") },
    { status: "VALIDATOR", baris: penyusun.filter((x) => x.peran === "validator") },
  ].filter((g) => g.baris.length > 0);
  if (grup.length === 0) return null;

  return (
    <>
      {judul && <p className="b">PENYUSUN DAN VALIDATOR</p>}
      <table className="tbl">
        <colgroup>
          <col style={{ width: "14%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "27%" }} />
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
          {grup.flatMap((g) =>
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
                <td>
                  <div className="ttd-sel">
                    <TtdPenandatanganCetak penilaianId={penilaianId} slug={slug} baris={row} />
                    {row.ada_ttd ? formatTgl(row.tanggal) || formatTgl(tanggalBawaan) : ""}
                  </div>
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </>
  );
}

/** Tabel unit kompetensi dengan judul skema di kolom kiri (dipakai MAPA, IA). */
export function TabelUnit({ judulSkema, unit }: { judulSkema: string | null; unit: { id: number; kode_unit: string | null; judul_unit: string }[] }) {
  return (
    <table className="tbl">
      <colgroup>
        <col style={{ width: "22%" }} />
        <col style={{ width: "6%" }} />
        <col style={{ width: "20%" }} />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th style={{ border: 0, borderRight: "1px solid #000" }}></th>
          <th>No</th>
          <th>Kode Unit</th>
          <th>Judul Unit</th>
        </tr>
      </thead>
      <tbody>
        {unit.map((u, i) => (
          <tr key={u.id}>
            {i === 0 && (
              <td rowSpan={unit.length} className="b c m">
                {(judulSkema ?? "").toUpperCase()}
              </td>
            )}
            <td className="c m">{i + 1}</td>
            <td className="c m">{u.kode_unit}</td>
            <td>{u.judul_unit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Kotak centang seperti formulir asli. */
export function Kotak({ on }: { on: boolean }) {
  return <span className="kotak">{on ? "☑" : "☐"}</span>;
}

/**
 * Pilihan dengan tanda "*": pilihan yang tidak berlaku dicoret, mis. Sewaktu/~~Tempat Kerja~~/~~Mandiri~~*.
 * Bila belum ada yang dipilih, tidak ada yang dicoret.
 */
export function Coret({ pilihan, aktif, bintang = "*" }: { pilihan: string[]; aktif: number | null; bintang?: string }) {
  return (
    <>
      {pilihan.map((p, i) => (
        <Fragment key={p}>
          {i > 0 && "/"}
          {aktif !== null && aktif !== i ? <s>{p}</s> : p}
        </Fragment>
      ))}
      {bintang}
    </>
  );
}

const JENIS_SKEMA = ["KKNI", "Okupasi", "Klaster"];

/** Tabel "Skema Sertifikasi (KKNI/Okupasi/Klaster) | Judul | Nomor" (jenis yang tidak berlaku dicoret). */
export function TabelSkema({ skema, children }: { skema: Pick<MapaSkema, "judul" | "nomor" | "jenis">; children?: React.ReactNode }) {
  const idx = JENIS_SKEMA.findIndex((j) => j.toLowerCase() === (skema.jenis ?? "").toLowerCase());
  return (
    <table className="tbl">
      <colgroup>
        <col style={{ width: "28%" }} />
        <col style={{ width: "11%" }} />
        <col style={{ width: "3%" }} />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td rowSpan={2} className="b">
            Skema Sertifikasi
            <br />(<Coret pilihan={JENIS_SKEMA} aktif={idx === -1 ? null : idx} bintang="" />)
          </td>
          <td>Judul</td>
          <td className="c">:</td>
          <td className="b">{(skema.judul ?? "").toUpperCase()}</td>
        </tr>
        <tr>
          <td>Nomor</td>
          <td className="c">:</td>
          <td className="b">{skema.nomor}</td>
        </tr>
        {children}
      </tbody>
    </table>
  );
}

/** Gaya cetak: A4 potret, font & garis tabel menyerupai formulir asli. */
export function GayaCetak() {
  return (
    <style>{`
      @page { size: A4 portrait; margin: 18mm 16mm 18mm 18mm; }
      .cetak { font-family: Calibri, Carlito, "Segoe UI", Arial, sans-serif; font-size: 10.5pt; color: #000; line-height: 1.25; }
      .cetak .halaman { background: #fff; width: 210mm; min-height: 297mm; margin: 0 auto 16px; padding: 18mm 16mm 18mm 18mm; box-sizing: border-box; box-shadow: 0 1px 6px rgba(0,0,0,.15); }
      .cetak h1 { font-size: 11pt; font-weight: 700; margin: 0 0 12px; }
      .cetak h2 { font-size: 10.5pt; font-weight: 700; margin: 14px 0 6px; }
      .cetak p { margin: 0 0 6px; }
      .cetak .tbl { width: 100%; border-collapse: collapse; margin: 0 0 12px; table-layout: fixed; }
      .cetak .tbl td, .cetak .tbl th { border: 1px solid #000; padding: 2px 5px; vertical-align: top; word-wrap: break-word; }
      .cetak .tbl th { font-weight: 700; text-align: center; vertical-align: middle; }
      .cetak .tbl.tanpa-garis td { border: 0; }
      .cetak .b { font-weight: 700; }
      .cetak .i { font-style: italic; }
      .cetak .c { text-align: center; }
      .cetak .m { vertical-align: middle !important; }
      .cetak .pre { white-space: pre-wrap; }
      .cetak .kecil { font-size: 9pt; }
      .cetak .kotak { font-size: 12pt; line-height: 1; font-family: "Segoe UI Symbol", "DejaVu Sans", sans-serif; }
      .cetak .garis-isi { border-bottom: 1px solid #000; min-height: 18px; padding: 2px 4px; }
      .cetak .ttd-gambar { max-height: 64px; max-width: 160px; object-fit: contain; display: block; }
      .cetak .ttd-sel { height: 78px; }
      .cetak .vertikal { writing-mode: vertical-rl; transform: rotate(180deg); white-space: normal; margin: 0 auto; max-height: 230px; font-size: 8pt; }
      .cetak ul.titik { margin: 0; padding-left: 18px; list-style: disc outside; }
      .cetak ol.angka { margin: 0; padding-left: 18px; list-style: decimal outside; }
      .cetak ul.titik > li, .cetak ol.angka > li { display: list-item; }
      .cetak .putus-sebelum { break-before: page; page-break-before: always; }
      .cetak tr, .cetak img { break-inside: avoid; page-break-inside: avoid; }
      @media print {
        html, body { background: #fff !important; }
        .no-print { display: none !important; }
        .cetak .halaman { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
        .cetak .halaman + .halaman { break-before: page; page-break-before: always; }
      }
    `}</style>
  );
}
