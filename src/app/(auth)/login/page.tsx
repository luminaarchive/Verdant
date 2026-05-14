"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.replace("/archive");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-forest-950 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-md border border-stone-300 bg-stone-50 shadow-[0_22px_70px_rgba(19,32,24,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-stone-300 bg-forest-950 p-6 text-stone-50 sm:p-8 lg:border-b-0 lg:border-r">
            <Link className="mb-8 inline-flex items-center gap-3" href="/">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-stone-50 text-forest-950">
                <Leaf className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-base font-semibold">NaLI</span>
                <span className="text-xs text-stone-300">Nature Life Intelligence</span>
              </span>
            </Link>
            <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-300">
              Field intelligence workspace
            </p>
            <h1 className="mt-3 w-full max-w-[28rem] text-3xl font-display-lg leading-tight sm:text-4xl">
              Sign in to NaLI
            </h1>
            <p className="mt-4 w-full max-w-[28rem] text-sm leading-6 text-stone-200">
              Access your private field observations and ecological intelligence workspace.
            </p>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <form className="mx-auto w-full max-w-[460px] space-y-5" onSubmit={handleLogin}>
              <Field label="Email">
                <input
                  autoComplete="email"
                  className="field-input"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@institution.org"
                  required
                  type="email"
                  value={email}
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    autoComplete="current-password"
                    className="field-input pr-12"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-600 hover:text-forest-950"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </Field>

              {error ? (
                <div className="rounded-sm border border-rare-red/40 bg-rare-red/10 p-3 text-sm text-rare-red">
                  {error}
                </div>
              ) : null}

              <button
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-forest-900 px-5 text-sm font-semibold text-stone-50 transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-forest-700">
              New to NaLI?{" "}
              <Link className="font-semibold text-forest-950 underline-offset-4 hover:underline" href="/register">
                Create Account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block w-full">
      <span className="mb-2 block text-[11px] font-label-caps uppercase tracking-[0.08em] text-forest-700">
        {label}
      </span>
      {children}
    </label>
  );
}
