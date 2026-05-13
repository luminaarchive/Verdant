"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-stone-300 bg-white px-3 text-sm font-semibold text-forest-900"
      onClick={handleLogout}
      type="button"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
