"use client";

import type {
  Ak01Payload,
  Ak02Payload,
  Ak03Payload,
  Ak05Payload,
  Ak06Payload,
  Ak07Payload,
  Apl01Payload,
  Apl02Payload,
  Ia01Payload,
  Ia02Payload,
  Ia03Payload,
  Ia04aPayload,
  Ia04bPayload,
  Ia06aPayload,
  Ia06bPayload,
  Ia06cPayload,
  Ia08Payload,
  Ia09Payload,
  Ia10Payload,
  Mapa01Payload,
  Mapa02Payload,
} from "@/types/dokumen";
import { CetakApl01 } from "./CetakApl01";
import { CetakApl02 } from "./CetakApl02";
import { CetakMapa01 } from "./CetakMapa01";
import { CetakMapa02 } from "./CetakMapa02";
import { CetakAk01, CetakAk07 } from "./CetakAk";
import { CetakIa01, CetakIa02, CetakIa03, CetakIa04a, CetakIa04b } from "./CetakIa";
import { CetakIa06a, CetakIa06b, CetakIa06c } from "./CetakIa06";
import { CetakAk02, CetakAk03 } from "./CetakPenutup";
import { CetakAk05, CetakAk06 } from "./CetakLaporan";
import { CetakIa08, CetakIa09, CetakIa10 } from "./CetakVp";

/**
 * Format cetak per dokumen (slug -> komponen). Dokumen yang belum terdaftar di sini belum dapat dicetak
 * (menunggu format asli sebagai rujukan). Menambah dokumen = menambah satu baris.
 */
// Payload tiap dokumen berbeda; komponen menerima payload dokumennya sendiri.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FORMAT_CETAK: Record<string, (props: { p: any }) => React.ReactNode> = {
  "apl-01": ({ p }) => <CetakApl01 p={p as Apl01Payload} />,
  "apl-02": ({ p }) => <CetakApl02 p={p as Apl02Payload} />,
  "mapa-01": ({ p }) => <CetakMapa01 p={p as Mapa01Payload} />,
  "mapa-02": ({ p }) => <CetakMapa02 p={p as Mapa02Payload} />,
  "ak-07": ({ p }) => <CetakAk07 p={p as Ak07Payload} />,
  "ak-01": ({ p }) => <CetakAk01 p={p as Ak01Payload} />,
  "ia-01": ({ p }) => <CetakIa01 p={p as Ia01Payload} />,
  "ia-02": ({ p }) => <CetakIa02 p={p as Ia02Payload} />,
  "ia-03": ({ p }) => <CetakIa03 p={p as Ia03Payload} />,
  "ia-04a": ({ p }) => <CetakIa04a p={p as Ia04aPayload} />,
  "ia-04b": ({ p }) => <CetakIa04b p={p as Ia04bPayload} />,
  "ia-06a": ({ p }) => <CetakIa06a p={p as Ia06aPayload} />,
  "ia-06b": ({ p }) => <CetakIa06b p={p as Ia06bPayload} />,
  "ia-06c": ({ p }) => <CetakIa06c p={p as Ia06cPayload} />,
  "ak-02": ({ p }) => <CetakAk02 p={p as Ak02Payload} />,
  "ak-03": ({ p }) => <CetakAk03 p={p as Ak03Payload} />,
  "ak-05": ({ p }) => <CetakAk05 p={p as Ak05Payload} />,
  "ak-06": ({ p }) => <CetakAk06 p={p as Ak06Payload} />,
  "ia-08": ({ p }) => <CetakIa08 p={p as Ia08Payload} />,
  "ia-09": ({ p }) => <CetakIa09 p={p as Ia09Payload} />,
  "ia-10": ({ p }) => <CetakIa10 p={p as Ia10Payload} />,
};
