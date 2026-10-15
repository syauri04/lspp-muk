import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Origin API (mis. http://localhost:8000) untuk connect-src & img-src (foto asesor dari BE).
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").origin;
  } catch {
    return "";
  }
})();

/*
 * CSP dasar tanpa nonce (lihat node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md).
 * Mitigasi XSS untuk token di localStorage: script hanya dari origin sendiri, request
 * hanya ke API, tidak boleh di-embed di iframe.
 * - 'unsafe-eval' hanya di dev (dibutuhkan React untuk debugging).
 * - upgrade-insecure-requests hanya di produksi (dev memakai http://localhost).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: https: ${apiOrigin}`,
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin}${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Deep link dari email: /penilaian/{id}. Link tidak memberi akses; halaman tujuan
  // dijaga AuthGuard (belum login -> /login?redirect=...) dan API membatasi ke pemilik.
  async redirects() {
    return [
      { source: "/penilaian/:id(\\d+)", destination: "/dashboard/penilaian/:id", permanent: false },
      { source: "/penilaian/:path*", destination: "/dashboard", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
