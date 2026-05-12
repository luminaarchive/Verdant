"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1f0e] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-4xl font-bold text-[#22c55e] mb-2 tracking-tight">NaLI</h1>
        <p className="text-gray-400 mb-10 text-center">Wildlife Field Intelligence</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col space-y-4">
          {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm">{error}</div>}
          
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-gray-300 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
              placeholder="ranger@example.com"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm text-gray-300 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#22c55e] text-black font-semibold py-3 rounded-lg mt-4 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#22c55e] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
