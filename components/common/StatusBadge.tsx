import type { StatusDokumen, StatusPenilaian } from "@/types/penilaian";

type Tone = "gray" | "amber" | "blue" | "green" | "red";

const TONE_CLASS: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  green: "bg-[#F2F5E9] text-[#5A7A22] border-[#8AA53C]/40",
  red: "bg-red-50 text-red-700 border-red-200",
};

export const STATUS_PENILAIAN: Record<StatusPenilaian, { label: string; tone: Tone }> = {
  menunggu_pengisian_apl: { label: "Menunggu pengisian APL", tone: "amber" },
  menunggu_review: { label: "Menunggu review", tone: "blue" },
  berlangsung: { label: "Berlangsung", tone: "blue" },
  selesai_kompeten: { label: "Kompeten", tone: "green" },
  selesai_belum_kompeten: { label: "Belum kompeten", tone: "red" },
};

export const STATUS_DOKUMEN: Record<StatusDokumen, { label: string; tone: Tone }> = {
  belum_diisi: { label: "Belum diisi", tone: "gray" },
  draft: { label: "Draft", tone: "amber" },
  menunggu_review: { label: "Menunggu review", tone: "blue" },
  selesai: { label: "Selesai", tone: "green" },
};

function Badge({ label, tone, className = "" }: { label: string; tone: Tone; className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${TONE_CLASS[tone]} ${className}`}
    >
      {label}
    </span>
  );
}

export function PenilaianStatusBadge({ status }: { status: StatusPenilaian }) {
  const s = STATUS_PENILAIAN[status] ?? { label: status, tone: "gray" as Tone };
  return <Badge {...s} />;
}

export function DokumenStatusBadge({ status, className }: { status: StatusDokumen; className?: string }) {
  const s = STATUS_DOKUMEN[status] ?? { label: status, tone: "gray" as Tone };
  return <Badge {...s} className={className} />;
}
