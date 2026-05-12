"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full bg-[#051408] border-t border-gray-800 z-50">
      <div className="flex justify-around items-center h-16">
        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center justify-center w-full h-full ${pathname === "/dashboard" ? "text-[#22c55e]" : "text-gray-400 hover:text-gray-300"}`}
        >
          <Home size={24} />
          <span className="text-xs mt-1 font-medium">Dashboard</span>
        </Link>
        
        <Link 
          href="/observe" 
          className={`flex flex-col items-center justify-center w-full h-full ${pathname === "/observe" ? "text-[#22c55e]" : "text-gray-400 hover:text-gray-300"}`}
        >
          <Camera size={24} />
          <span className="text-xs mt-1 font-medium">Observe</span>
        </Link>
      </div>
    </nav>
  );
}
