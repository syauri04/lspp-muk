"use client";

import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";

export function DashboardClient() {
  return (
    <div className="space-y-8">
      <Section
        title="Daftar Instruksi Terstruktur (DIT)"
        items={[
          { label: "FR.APL", count: 3, href: "/dashboard/fr/apl-01" },
          { label: "FR.MAPA", count: 2, href: "/dashboard/fr/mapa-01" },
          { label: "FR.AK", count: 7, href: "/dashboard/fr/ak-01" },
          { label: "FR.IA", count: 7, href: "/dashboard/fr/ia-04a" },
          { label: "FR.VA", count: 1, href: "/dashboard/fr/apl-01" },
        ]}
      />
      <Section
        title="Portofolio Asesmen"
        items={[
          { label: "FR.APL", count: 3, href: "/dashboard/fr/apl-01" },
          { label: "FR.MAPA", count: 2, href: "/dashboard/fr/mapa-01" },
          { label: "FR.AK", count: 7, href: "/dashboard/fr/ak-01" },
          { label: "FR.IA", count: 7, href: "/dashboard/fr/ia-04a" },
          { label: "FR.VA", count: 1, href: "/dashboard/fr/apl-01" },
        ]}
      />
    </div>
  );
}

interface SectionItem {
  label: string;
  count: number;
  href: string;
}

function Section({ title, items }: { title: string; items: SectionItem[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">
          {title}
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          Total: {items.reduce((acc, curr) => acc + curr.count, 0)} Berkas
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group bg-white p-3.5 rounded-xl border border-gray-200 hover:border-[#8AA53C] hover:bg-[#F2F5E9]/40 transition-all duration-150 flex items-center justify-between shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-[#F2F5E9] flex items-center justify-center transition-colors">
                <FileText
                  className="text-gray-400 group-hover:text-[#5A7A22]"
                  size={16}
                />
              </div>
              <div>
                <p className="font-bold text-gray-700 group-hover:text-[#5A7A22] text-sm leading-tight">
                  {item.label}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {item.count} Dokumen
                </p>
              </div>
            </div>
            <ChevronRight
              size={14}
              className="text-gray-300 group-hover:text-[#5A7A22] group-hover:translate-x-0.5 transition-all"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardClient;
