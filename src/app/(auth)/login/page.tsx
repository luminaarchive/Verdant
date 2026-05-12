"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="min-h-screen flex text-white font-sans selection:bg-green-500/30">
      {/* LEFT PANEL */}
      <div 
        className="hidden lg:flex lg:w-[60%] flex-col justify-between p-12 relative"
        style={{ background: 'radial-gradient(circle at top left, #0d2b12 0%, #060f08 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        
        <div className="z-10 relative">
          <Link href="/" className="text-2xl font-bold tracking-widest text-[#22c55e]">NaLI</Link>
        </div>

        <div className="z-10 relative max-w-2xl">
          <h1 className="text-5xl font-serif italic font-medium text-white mb-8 leading-tight">
            "The forest speaks to those who listen."
          </h1>
        </div>

        <div className="z-10 relative text-sm text-green-900/70 font-medium">
          NaLI Wildlife Field Intelligence
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[40%] bg-[#060f08] flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-12">
            <Link href="/" className="text-2xl font-bold tracking-widest text-[#22c55e]">NaLI</Link>
          </div>

          <h2 className="text-3xl font-semibold text-white mb-2">Welcome back</h2>
          <p className="text-[#9ca3af] mb-10 text-sm leading-relaxed">
            Sign in to your field account
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-green-300/70 block">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ranger@example.com"
                className={`w-full bg-[#0f2214] border ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border-green-900/50 focus:border-green-500 focus:ring-green-500/30'} text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-shadow placeholder:text-green-900/50`}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-green-300/70 block">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-[#0f2214] border ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border-green-900/50 focus:border-green-500 focus:ring-green-500/30'} text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-shadow placeholder:text-green-900/50`}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#4ade80] text-black font-bold rounded-xl py-3 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#9ca3af]">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#22c55e] hover:text-[#4ade80] font-medium transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
