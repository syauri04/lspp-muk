"use client";

import { Fragment } from "react";
import type { Mapa02Payload, MapaPenandatangan } from "@/types/dokumen";
import { Kotak, TabelSkema, TtdPenandatanganCetak, tgl } from "./CetakShared";

const SLUG = "mapa-02";
const POTENSI = [1, 2, 3, 4, 5];

export function CetakMapa02({ p }: { p: Mapa02Payload }) {
  const meta = p.dokumen;
  // "4.a" / "4.b" -> nomor induk 4 (digabung) dengan sub "a." / "b.".
  const baris = p.instrumen.map((ins) => {
    const [induk, sub] = ins.nomor.replace(/\.$/, "").split(".");
    return { ...ins, induk, sub: sub ? `${sub}. ` : "" };
  });
  const jumlahInduk = (induk: string) => baris.filter((b) => b.induk === induk).length;

  const penandatangan = [
    ...p.penyusun.filter((x) => x.peran === "penyusun").map((x) => ({ judul: "Penyusun", x })),
    ...p.penyusun.filter((x) => x.peran === "validator").map((x) => ({ judul: "Validator", x })),
  ];

  const blokTtd = (judul: string, x: MapaPenandatangan) => (
    <Fragment key={x.id}>
      <tr>
        <td>Nama {judul}</td>
        <td className="c">:</td>
        <td>{x.nama}</td>
      </tr>
      <tr>
        <td>No. Reg</td>
        <td className="c">:</td>
        <td>{x.no_reg}</td>
      </tr>
      <tr>
        <td className="m">Tanda Tangan dan Tanggal</td>
        <td className="c m">:</td>
        <td className="ttd-sel">
          <TtdPenandatanganCetak penilaianId={meta.penilaian_id} slug={SLUG} baris={x} />
          {x.ada_ttd ? tgl(x.tanggal) || tgl(meta.submitted_at) : ""}
        </td>
      </tr>
    </Fragment>
  );

  return (
    <>
      <h1 style={{ display: "flex", gap: 16 }}>
        <span>FR.MAPA.02</span>
        <span>PETA INSTRUMEN ASESMEN HASIL PENDEKATAN ASESMEN DAN PERENCANAAN ASESMEN</span>
      </h1>
      <TabelSkema skema={p.skema} />

      <table className="tbl">
        <colgroup>
          <col style={{ width: "24%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "22%" }} />
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
          {p.unit_kompetensi.map((u, i) => (
            <tr key={u.id}>
              {i === 0 && (
                <td rowSpan={p.unit_kompetensi.length} className="b c m">
                  {(p.skema.judul ?? "").toUpperCase()}
                </td>
              )}
              <td className="c m">{i + 1}</td>
              <td className="c m">{u.kode_unit}</td>
              <td>{u.judul_unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="tbl" style={{ marginBottom: 2 }}>
        <colgroup>
          <col style={{ width: "6%" }} />
          <col />
          {POTENSI.map((n) => (
            <col key={n} style={{ width: "5.5%" }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>No</th>
            <th rowSpan={2}>INSTRUMEN ASESMEN</th>
            <th colSpan={5}>POTENSI ASESI**</th>
          </tr>
          <tr>
            {POTENSI.map((n) => (
              <th key={n}>{n}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {baris.map((b, i) => (
            <tr key={b.kunci}>
              {(i === 0 || baris[i - 1].induk !== b.induk) && (
                <td rowSpan={jumlahInduk(b.induk)} className="c m">
                  {b.induk}
                </td>
              )}
              <td>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="b" style={{ minWidth: "36%" }}>
                    {b.sub}
                    {b.kode}
                  </span>
                  <span>- {b.label}</span>
                </div>
              </td>
              {POTENSI.map((n) => (
                <td key={n} className="c m">
                  <Kotak on={(p.isian.potensi[b.kunci] ?? []).includes(n)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="i kecil">*) diisi berdasarkan hasil penentuan pendekatan asesmen dan perencanaan asesmen</p>

      {penandatangan.length > 0 && (
        <>
          <p className="b" style={{ marginTop: 12 }}>
            Penyusun dan Validator
          </p>
          <table className="tbl" style={{ width: "76%" }}>
            <colgroup>
              <col style={{ width: "38%" }} />
              <col style={{ width: "4%" }} />
              <col />
            </colgroup>
            <tbody>{penandatangan.map(({ judul, x }) => blokTtd(judul, x))}</tbody>
          </table>
        </>
      )}

      <p className="b" style={{ marginBottom: 2 }}>
        **) Keterangan
      </p>
      <ol className="angka" style={{ paddingLeft: 40, textAlign: "justify" }}>
        {p.keterangan_potensi.map((k, i) => (
          <li key={i}>{k}</li>
        ))}
      </ol>
    </>
  );
}
