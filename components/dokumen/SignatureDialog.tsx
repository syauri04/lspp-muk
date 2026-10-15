"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { SignaturePad, type SignaturePadHandle } from "@/components/dokumen/SignaturePad";

/** Dialog kanvas tanda tangan; onSimpan menerima PNG data URL. */
export function SignatureDialog({
  open,
  onOpenChange,
  title = "Tanda Tangan",
  keterangan,
  onSimpan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  keterangan?: React.ReactNode;
  onSimpan: (dataUrl: string) => Promise<void>;
}) {
  const padRef = useRef<SignaturePadHandle | null>(null);
  const [kosong, setKosong] = useState(true);
  const [proses, setProses] = useState(false);

  const simpan = async () => {
    const dataUrl = padRef.current?.toDataUrl();
    if (!dataUrl) return;
    setProses(true);
    try {
      await onSimpan(dataUrl);
      onOpenChange(false);
    } finally {
      setProses(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !proses && onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="text-base font-bold text-gray-800">{title}</Dialog.Title>
            <Dialog.Close className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer" aria-label="Tutup">
              <X size={18} />
            </Dialog.Close>
          </div>
          <Dialog.Description asChild>
            <div className="text-xs text-gray-500">{keterangan}</div>
          </Dialog.Description>

          {open && <SignaturePad padRef={padRef} onChange={setKosong} disabled={proses} />}

          <div className="flex justify-end gap-2">
            <Dialog.Close
              disabled={proses}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Batal
            </Dialog.Close>
            <button
              type="button"
              onClick={simpan}
              disabled={kosong || proses}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#7E9631] hover:bg-[#6C8229] disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >
              {proses && <Loader2 size={13} className="animate-spin" />}
              Simpan Tanda Tangan
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
