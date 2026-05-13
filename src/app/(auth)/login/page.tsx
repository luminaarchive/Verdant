"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
    <main className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center flex flex-col items-center">
          <Link href="/" className="mb-6 flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center relative bg-surface-dim">
                <img
                  alt="NaLI Logo"
                  className="w-full h-full object-cover scale-[1.3] mix-blend-screen"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSOEp6mfy7WR2FL9G5ZEWOGNB1qgpcF7_lSfK1UFAXIsC89pyWLK-P-Igko8EX6wv4xkuaDTQGTbNDUGHvw5Z5tpggzho_grJ-fAbPbNwYS2eQ3Nmj_tV8-WVK1XGHJbzqlCeN263l77sEEaN95Df46WWogNh0c7UPHqc-YgRHVpsB_ebhVqu9KhDGqieE0trr1Q96WxCoX5_2q_aOBz8JKJLK52BtBQJ9RK9c7XlKhHXMd46vxVmeaDnSDBT1FmDGVIALg4AJ4RY"
                />
             </div>
          </Link>
          <div className="font-data-sm text-data-sm text-primary mb-3 uppercase tracking-widest">
            Authentication Terminal
          </div>
          <h1 className="font-display-lg text-display-lg-mobile text-primary mb-2 font-bold">
            Sign in to NaLI
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-sm mx-auto">
            Access institutional field records and autonomous operational workflows.
          </p>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            <Field label="Institutional Email">
              <input
                autoComplete="email"
                className="w-full bg-surface-dim border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/40 font-body-md transition-colors"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ranger@institution.id"
                required
                type="email"
                value={email}
              />
            </Field>

            <Field label="Passphrase">
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="w-full bg-surface-dim border border-outline-variant/50 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/40 font-body-md transition-colors"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter secure passphrase"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </Field>

            {error ? (
              <div className="rounded-lg border border-error/40 bg-error/10 p-3 text-sm text-error font-body-md">
                {error}
              </div>
            ) : null}

            <button
              className="w-full bg-primary text-surface-container-lowest font-label-caps text-label-caps px-6 py-4 rounded-lg hover:bg-surface-container-low hover:text-primary hover:border hover:border-primary transition-all flex items-center justify-center gap-3 tracking-widest mt-4"
              disabled={loading}
              type="submit"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              INITIALIZE SESSION
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-body-md text-on-surface-variant">
            No field clearance yet?{" "}
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/register">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}
