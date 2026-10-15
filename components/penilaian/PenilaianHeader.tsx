import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { PenilaianStatusBadge } from "@/components/common/StatusBadge";
import { formatTanggal, formatWaktuJadwal } from "@/lib/format";
import type { MukRole } from "@/types/auth";
import type { Penilaian } from "@/types/penilaian";

export function PenilaianHeader({ penilaian: p, role }: { penilaian: Penilaian; role: MukRole | null }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <PenilaianStatusBadge status={p.status} />
        {p.skema.jenis && <span className="text-xs font-semibold text-gray-500">{p.skema.jenis}</span>}
        {p.skema.nomor && <span className="text-xs text-gray-400">· {p.skema.nomor}</span>}
        {p.metode_asesmen && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-[#8AA53C]/40 bg-[#F2F5E9] text-[11px] font-bold text-[#5A7A22]">
            Metode {p.metode_asesmen.toUpperCase()}
          </span>
        )}
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug">{p.skema.judul ?? "-"}</h2>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex gap-2.5">
          <CalendarDays size={16} className="text-[#8AA53C] mt-0.5 shrink-0" />
          <div>
            <dt className="text-xs text-gray-400">Jadwal</dt>
            <dd className="font-medium text-gray-700">{formatTanggal(p.jadwal?.tanggal, "EEEE, d MMMM yyyy")}</dd>
            <dd className="text-xs text-gray-500">{formatWaktuJadwal(p.jadwal?.waktu_mulai, p.jadwal?.waktu_selesai)}</dd>
          </div>
        </div>
        <div className="flex gap-2.5">
          <MapPin size={16} className="text-[#8AA53C] mt-0.5 shrink-0" />
          <div>
            <dt className="text-xs text-gray-400">TUK</dt>
            <dd className="font-medium text-gray-700">{p.jadwal?.tuk?.nama ?? "-"}</dd>
            {p.jadwal?.tuk && <dd className="text-xs text-gray-500">{p.jadwal.tuk.alamat}</dd>}
          </div>
        </div>
        <div className="flex gap-2.5">
          <UserRound size={16} className="text-[#8AA53C] mt-0.5 shrink-0" />
          <div>
            {role === "asesor" ? (
              <>
                <dt className="text-xs text-gray-400">Asesi</dt>
                <dd className="font-medium text-gray-700">{p.asesi.nama}</dd>
              </>
            ) : (
              <>
                <dt className="text-xs text-gray-400">Asesor</dt>
                <dd className="font-medium text-gray-700">{p.asesor?.nama ?? "-"}</dd>
                {p.asesor?.nomor_registrasi && <dd className="text-xs text-gray-500">{p.asesor.nomor_registrasi}</dd>}
              </>
            )}
          </div>
        </div>
      </dl>
    </div>
  );
}
