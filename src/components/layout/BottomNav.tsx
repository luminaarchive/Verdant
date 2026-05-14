"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Activity } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-stone-200 bg-stone-50/95 backdrop-blur">
      <div className="flex h-16 items-center justify-around">
        <Link
          href="/dashboard"
          className={`flex h-full w-full flex-col items-center justify-center ${
            pathname === "/dashboard" ? "text-forest-900" : "text-forest-500 hover:text-forest-800"
          }`}
        >
          <Home size={24} />
          <span className="mt-1 text-xs font-medium">{t("nav.dashboard")}</span>
        </Link>

        <Link
          href="/observe"
          className={`flex h-full w-full flex-col items-center justify-center ${
            pathname === "/observe" ? "text-forest-900" : "text-forest-500 hover:text-forest-800"
          }`}
        >
          <Camera size={24} />
          <span className="mt-1 text-xs font-medium">{t("nav.observe")}</span>
        </Link>

        <Link
          href="/monitoring"
          className={`flex h-full w-full flex-col items-center justify-center ${
            pathname === "/monitoring" ? "text-forest-900" : "text-forest-500 hover:text-forest-800"
          }`}
        >
          <Activity size={24} />
          <span className="mt-1 text-xs font-medium">{t("nav.monitor")}</span>
        </Link>
      </div>
    </nav>
  );
}
