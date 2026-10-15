import type React from "react";
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import GlobalLoader from "../components/ui/loader";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LSPP 306 - Sertifikasi Pariwisata Global",
  description:
    "Mempersiapkan tenaga kerja pariwisata yang kompeten, kompetitif, dan beretika untuk menjawab tantangan industri pariwisata di tingkat nasional maupun internasional.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} ${openSans.variable} antialiased`}
    >
      <body>
        <AuthProvider>
          <Suspense fallback={<GlobalLoader />}>{children}</Suspense>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

