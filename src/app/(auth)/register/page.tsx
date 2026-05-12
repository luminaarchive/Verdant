"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react";
import * as Select from "@radix-ui/react-select";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [institution, setInstitution] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          institution: institution || null,
        },
      },
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
            "Every observation matters."
          </h1>
          <div className="flex flex-wrap gap-4">
            <span className="px-4 py-2 rounded-full border border-green-900/50 bg-[#0f2214]/50 text-sm text-green-300">2,000+ species documented</span>
            <span className="px-4 py-2 rounded-full border border-green-900/50 bg-[#0f2214]/50 text-sm text-green-300">Active in 5 provinces</span>
            <span className="px-4 py-2 rounded-full border border-green-900/50 bg-[#0f2214]/50 text-sm text-green-300">Trusted by researchers</span>
          </div>
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

          <h2 className="text-3xl font-semibold text-white mb-2">Create your field account</h2>
          <p className="text-[#9ca3af] mb-10 text-sm leading-relaxed">
            Join rangers and researchers protecting Indonesia's wildlife
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-green-300/70 block">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                className={`w-full bg-[#0f2214] border ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border-green-900/50 focus:border-green-500 focus:ring-green-500/30'} text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-shadow placeholder:text-green-900/50`}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-green-300/70 block">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
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
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-sm font-medium text-green-300/70 block">Role</label>
              <Select.Root value={role} onValueChange={setRole}>
                <Select.Trigger className="w-full bg-[#0f2214] border border-green-900/50 text-white rounded-xl px-4 py-3 flex items-center justify-between focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition-shadow data-[placeholder]:text-green-900/50">
                  <Select.Value placeholder="Select a role" />
                  <Select.Icon>
                    <ChevronDown size={18} className="text-green-700" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content className="bg-[#0f2214] border border-green-900/50 rounded-xl overflow-hidden shadow-2xl z-50 mt-2">
                    <Select.Viewport className="p-1">
                      <Select.Item value="ranger" className="relative flex items-center px-8 py-3 text-sm text-white hover:bg-green-900/30 focus:bg-green-900/30 rounded-lg cursor-pointer outline-none select-none data-[highlighted]:bg-green-900/30">
                        <Select.ItemText>Ranger 🌿</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="researcher" className="relative flex items-center px-8 py-3 text-sm text-white hover:bg-green-900/30 focus:bg-green-900/30 rounded-lg cursor-pointer outline-none select-none data-[highlighted]:bg-green-900/30">
                        <Select.ItemText>Researcher 🔬</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="student" className="relative flex items-center px-8 py-3 text-sm text-white hover:bg-green-900/30 focus:bg-green-900/30 rounded-lg cursor-pointer outline-none select-none data-[highlighted]:bg-green-900/30">
                        <Select.ItemText>Student 🎓</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-green-300/70 block">Institution <span className="text-green-900/50">(Optional)</span></label>
              <input 
                type="text" 
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="University or Park Name"
                className="w-full bg-[#0f2214] border border-green-900/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition-shadow placeholder:text-green-900/50"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#4ade80] text-black font-bold rounded-xl py-3 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#9ca3af]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#22c55e] hover:text-[#4ade80] font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
