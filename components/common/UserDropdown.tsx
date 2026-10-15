"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, User, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL } from "@/types/auth";

export function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.replace("/login");
  };

  const displayName = user?.name?.split(" ")[0] || "User";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full bg-[#5C723D]/20 overflow-hidden relative border border-gray-200">
          <Image
            src={user?.avatar_url || "/images/avatar.png"}
            alt={user?.name || "Foto profil"}
            width={28}
            height={28}
            unoptimized={!!user?.avatar_url}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-semibold text-gray-700 text-xs hidden sm:inline-block">
          {displayName}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <div className="mt-1 flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F2F5E9] text-[#5A7A22] border border-[#8AA53C]/30">
                <Shield size={10} />
                {user ? ROLE_LABEL[user.role] : ""}
              </span>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User size={14} className="text-gray-400" />
              <span>Profil Saya</span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings size={14} className="text-gray-400" />
              <span>Pengaturan</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
            >
              <LogOut size={14} className="text-red-500" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
