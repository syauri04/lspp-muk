"use client";

/*
 * Pengaturan akun MUK.
 * - Asesor: ubah password (akun & password awal dibuat admin di CMS).
 * - Asesi: password dikelola di website utama (akun yang sama), jadi hanya diarahkan ke sana.
 * - Admin LSP: masuk lewat CMS, tidak memakai password MUK.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mukAuth } from "@/lib/api/muk";
import { fieldErrors, pesanError } from "@/lib/api/axios";

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://lspp306.com";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7E9631]">Akun</p>
        <h2 className="text-xl font-bold text-gray-800">Pengaturan</h2>
      </div>

      {user?.role === "asesor" ? (
        <FormUbahPassword />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs text-sm text-gray-600">
          {user?.role === "asesi" ? (
            <>
              Password akun Anda sama dengan akun di website LSPP 306. Untuk mengubahnya, buka menu profil di{" "}
              <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#5A7A22] hover:underline">
                website LSPP 306
              </a>
              .
            </>
          ) : (
            "Akun admin LSP masuk melalui CMS; pengaturan akun dilakukan di CMS."
          )}
        </div>
      )}
    </div>
  );
}

type Field = "current_password" | "password" | "password_confirmation";

const ATURAN = [
  { teks: "Minimal 8 karakter", cek: (v: string) => v.length >= 8 },
  { teks: "Huruf besar & huruf kecil", cek: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { teks: "Minimal satu angka", cek: (v: string) => /\d/.test(v) },
  { teks: "Minimal satu simbol (mis. ! @ # ?)", cek: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function FormUbahPassword() {
  const [nilai, setNilai] = useState<Record<Field, string>>({ current_password: "", password: "", password_confirmation: "" });
  const [lihat, setLihat] = useState<Record<Field, boolean>>({ current_password: false, password: false, password_confirmation: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [proses, setProses] = useState(false);

  const kuat = ATURAN.every((a) => a.cek(nilai.password));
  const cocok = nilai.password !== "" && nilai.password === nilai.password_confirmation;
  const siap = nilai.current_password !== "" && kuat && cocok && !proses;

  const ubah = (f: Field, v: string) => {
    setNilai((n) => ({ ...n, [f]: v }));
    setErrors((e) => {
      const salinan = { ...e };
      delete salinan[f];
      return salinan;
    });
  };

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siap) return;
    setProses(true);
    try {
      const pesan = await mukAuth.ubahPassword(nilai);
      toast.success(pesan);
      setNilai({ current_password: "", password: "", password_confirmation: "" });
      setErrors({});
    } catch (err) {
      const fe = fieldErrors(err);
      setErrors(fe);
      if (!Object.keys(fe).length) toast.error(pesanError(err, "Gagal mengubah password."));
    } finally {
      setProses(false);
    }
  };

  const input = (f: Field, label: string, autoComplete: string) => (
    <div className="space-y-1.5">
      <label htmlFor={f} className="text-xs font-semibold text-gray-600">
        {label}
      </label>
      <div className="relative">
        <input
          id={f}
          type={lihat[f] ? "text" : "password"}
          value={nilai[f]}
          onChange={(e) => ubah(f, e.target.value)}
          autoComplete={autoComplete}
          maxLength={255}
          className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 transition-all ${
            errors[f] ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#7E9631] focus:ring-[#7E9631]/20"
          }`}
        />
        <button
          type="button"
          onClick={() => setLihat((l) => ({ ...l, [f]: !l[f] }))}
          aria-label={lihat[f] ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          {lihat[f] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[f] && <p className="text-xs font-semibold text-red-600">{errors[f]}</p>}
    </div>
  );

  return (
    <form onSubmit={kirim} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[#F2F5E9] text-[#5A7A22]">
          <KeyRound size={18} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Ubah Password</h3>
          <p className="text-xs text-gray-500">
            Password awal dibuat oleh admin LSP. Setelah diubah, sesi di perangkat lain akan otomatis keluar.
          </p>
        </div>
      </div>

      {input("current_password", "Password saat ini", "current-password")}
      {input("password", "Password baru", "new-password")}
      <ul className="grid sm:grid-cols-2 gap-1 text-xs">
        {ATURAN.map((a) => (
          <li key={a.teks} className={`flex items-center gap-1.5 ${a.cek(nilai.password) ? "text-[#5A7A22]" : "text-gray-400"}`}>
            <ShieldCheck size={12} />
            {a.teks}
          </li>
        ))}
      </ul>
      {input("password_confirmation", "Konfirmasi password baru", "new-password")}
      {nilai.password_confirmation !== "" && !cocok && <p className="text-xs font-semibold text-red-600 -mt-3">Konfirmasi password tidak cocok.</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!siap}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#5A7A22] hover:bg-[#4a6619] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          {proses && <Loader2 size={14} className="animate-spin" />}
          Simpan Password
        </button>
      </div>
    </form>
  );
}
