import { format, parseISO, isValid } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function formatTanggal(value: string | null | undefined, pola = "d MMMM yyyy"): string {
  if (!value) return "-";
  const d = parseISO(value);
  return isValid(d) ? format(d, pola, { locale: localeId }) : value;
}

/** "08:00:00" -> "08.00" */
export function formatJam(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 5).replace(":", ".");
}

export function formatWaktuJadwal(mulai: string | null | undefined, selesai: string | null | undefined): string {
  const m = formatJam(mulai);
  const s = formatJam(selesai);
  if (!m) return "-";
  return s ? `${m} – ${s} WIB` : `${m} WIB`;
}
