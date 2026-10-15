import { Loader2 } from "lucide-react";

/** Indikator loading yang tetap tampil selama data dimuat (GlobalLoader hanya splash 300ms). */
export function PageLoader({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-sm text-gray-500" role="status" aria-live="polite">
      <Loader2 size={18} className="animate-spin text-[#5C723D]" />
      <span>{label}</span>
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F3F6]">
      <PageLoader />
    </div>
  );
}
