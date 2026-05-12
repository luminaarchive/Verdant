"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function Header({
  title = "NaLI",
  showBack = false,
  backHref,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="flex items-center h-14 px-4 bg-[#051408] border-b border-[#1a4724] sticky top-0 z-40">
      {showBack && (
        <button
          onClick={handleBack}
          className="p-2 -ml-2 mr-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="text-xl font-bold text-[#22c55e] tracking-tight">{title}</h1>
    </header>
  );
}
