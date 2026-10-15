import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export function ErrorState({
  title,
  description,
  onRetry,
  backHref = "/dashboard",
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
  backHref?: string | null;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3" role="alert">
      <AlertCircle className="mx-auto text-gray-400" size={32} />
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
      {description && <p className="text-sm text-gray-500 max-w-md mx-auto">{description}</p>}
      <div className="flex justify-center gap-3 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#5C723D] text-white hover:bg-[#4a5c31] cursor-pointer"
          >
            Coba lagi
          </button>
        )}
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#5A7A22] hover:bg-[#F2F5E9]"
          >
            <ArrowLeft size={14} /> Kembali ke dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
