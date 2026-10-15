"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { fieldErrors, pesanError, statusError } from "@/lib/api/axios";
import { mukPenilaian } from "@/lib/api/muk";
import { DEFAULT_AFTER_LOGIN, safeReturnTo } from "@/lib/auth/returnTo";
import { ROLE_LABEL, type MukRole } from "@/types/auth";

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://lspp306.com";

const inputClass =
  "h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#5C723D]/20 focus:border-[#5C723D] px-4 text-sm md:text-base";

/**
 * Tujuan setelah login tanpa deep link:
 * tepat 1 penilaian yang perlu tindakan -> langsung ke penilaian itu; selain itu -> dashboard.
 */
async function tujuanSetelahLogin(): Promise<string> {
  try {
    const res = await mukPenilaian.list({ kelompok: "perlu_tindakan", per_page: 2 });
    if (res.meta.total === 1) return `/dashboard/penilaian/${res.data[0].id}`;
  } catch {
    // Abaikan: dashboard tetap bisa menampilkan daftarnya.
  }
  return DEFAULT_AFTER_LOGIN;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("redirect"));

  const { login, isAuthenticated, isLoading } = useAuth();
  const [role, setRole] = useState<MukRole>("asesi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sudah login (mis. buka /login lagi) -> langsung lanjut.
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isSubmitting) {
      router.replace(returnTo ?? DEFAULT_AFTER_LOGIN);
    }
  }, [isLoading, isAuthenticated, isSubmitting, returnTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await login(role, { email: email.trim(), password });
      toast.success("Login berhasil.");
      router.replace(returnTo ?? (await tujuanSetelahLogin()));
    } catch (err) {
      // 422 (kredensial salah) & 429 dari service login -> pesan di bawah field email.
      // 429 dari throttle per-IP tidak punya field errors -> toast.
      const fe = fieldErrors(err);
      if (Object.keys(fe).length > 0) setErrors(fe);
      else if (statusError(err) === 429) toast.error("Terlalu banyak percobaan login. Coba lagi sebentar lagi.");
      else toast.error(pesanError(err, "Gagal masuk. Periksa kembali akun Anda."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen md:h-auto md:min-h-screen overflow-hidden md:overflow-auto bg-[#F1F3F6] flex items-center justify-center p-0 sm:p-6 md:py-16">
      <div className="bg-white w-full h-full md:h-auto max-w-145 rounded-none md:rounded-[3rem] shadow-none md:shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-6 sm:p-10 md:p-16 my-0 flex flex-col items-center justify-center md:justify-start overflow-y-auto md:overflow-visible">
        <div className="mb-6 md:mb-8 flex flex-col items-center text-center">
          <div className="relative w-60 h-16 md:w-72 md:h-20 mb-4">
            <Image src="/images/logo-nav.png" alt="LSPP 306 Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Sertifikasi Paperless</h1>
          <p className="text-sm md:text-base text-gray-400">Masuk sebagai asesi atau asesor</p>
        </div>

        <div role="tablist" aria-label="Pilih peran" className="w-full grid grid-cols-2 gap-1 p-1 mb-6 bg-gray-100 rounded-xl">
          {(["asesi", "asesor"] as MukRole[]).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => {
                setRole(r);
                setErrors({});
              }}
              className={`h-10 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                role === r ? "bg-white text-[#5C723D] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-5" noValidate>
          <div className="space-y-1 md:space-y-2">
            <label htmlFor="email" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 flex items-center gap-1.5">
              <Mail size={14} className="text-gray-400" />
              <span>Email</span>
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputClass}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-600 ml-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1 md:space-y-2">
            <label htmlFor="password" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 flex items-center gap-1.5">
              <KeyRound size={14} className="text-gray-400" />
              <span>Kata Sandi</span>
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 ml-1" role="alert">{errors.password}</p>}
          </div>

          <div className="pt-2 md:pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full bg-[#5C723D] hover:bg-[#4a5c31] text-white h-12 md:h-14 rounded-xl font-bold text-base md:text-lg shadow-lg shadow-[#5C723D]/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk sebagai {ROLE_LABEL[role]}</span>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 leading-relaxed">
            {role === "asesi" ? (
              <>
                Gunakan email &amp; kata sandi akun Anda di{" "}
                <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#5C723D] hover:underline">
                  website LSPP 306
                </a>
                . Mendaftar dengan Google? Buat kata sandi terlebih dahulu di sana.
              </>
            ) : (
              <>Akun asesor dibuat oleh admin LSPP. Lupa kata sandi? Hubungi admin.</>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
