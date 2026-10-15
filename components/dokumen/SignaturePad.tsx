"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SignaturePadLib from "signature_pad";
import { Eraser } from "lucide-react";

interface Props {
  /** Dipanggil saat user selesai menggores (untuk enable tombol simpan). */
  onChange?: (kosong: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export interface SignaturePadHandle {
  kosong: () => boolean;
  toDataUrl: () => string | null;
  bersihkan: () => void;
}

/**
 * Kanvas tanda tangan (mouse, stylus, sentuh). Ukuran kanvas mengikuti lebar
 * kontainer & devicePixelRatio agar tajam di layar HP. PNG transparan.
 */
export function SignaturePad({
  onChange,
  disabled,
  label = "Area tanda tangan",
  padRef,
}: Props & { padRef: React.RefObject<SignaturePadHandle | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padLib = useRef<SignaturePadLib | null>(null);
  const [kosong, setKosong] = useState(true);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const ubahUkuran = useCallback(() => {
    const canvas = canvasRef.current;
    const pad = padLib.current;
    if (!canvas || !pad) return;
    const rasio = Math.max(window.devicePixelRatio || 1, 1);
    const data = pad.toData();
    canvas.width = canvas.offsetWidth * rasio;
    canvas.height = canvas.offsetHeight * rasio;
    canvas.getContext("2d")?.scale(rasio, rasio);
    pad.clear();
    pad.fromData(data); // pertahankan goresan saat layar diputar
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const pad = new SignaturePadLib(canvasRef.current, {
      penColor: "#0f172a",
      minWidth: 0.8,
      maxWidth: 2.4,
    });
    padLib.current = pad;
    ubahUkuran();

    const onEnd = () => {
      setKosong(pad.isEmpty());
      onChangeRef.current?.(pad.isEmpty());
    };
    pad.addEventListener("endStroke", onEnd);
    window.addEventListener("resize", ubahUkuran);

    return () => {
      pad.removeEventListener("endStroke", onEnd);
      window.removeEventListener("resize", ubahUkuran);
      pad.off();
      padLib.current = null;
    };
  }, [ubahUkuran]);

  useEffect(() => {
    if (!padLib.current) return;
    if (disabled) padLib.current.off();
    else padLib.current.on();
  }, [disabled]);

  const bersihkan = useCallback(() => {
    padLib.current?.clear();
    setKosong(true);
    onChangeRef.current?.(true);
  }, []);

  useEffect(() => {
    padRef.current = {
      kosong: () => padLib.current?.isEmpty() ?? true,
      toDataUrl: () => (padLib.current && !padLib.current.isEmpty() ? padLib.current.toDataURL("image/png") : null),
      bersihkan,
    };
  }, [padRef, bersihkan]);

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-white">
        <canvas
          ref={canvasRef}
          aria-label={label}
          role="img"
          className="w-full h-44 sm:h-48 touch-none cursor-crosshair rounded-xl"
        />
        {kosong && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-300 select-none">
            Tanda tangan di sini
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={bersihkan}
        disabled={disabled || kosong}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-40 cursor-pointer disabled:cursor-default"
      >
        <Eraser size={14} /> Hapus goresan
      </button>
    </div>
  );
}
