"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf, Loader2, Microscope, ShieldCheck, Trees } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "@/types/common";

const roles: Array<{ value: UserRole; title: string; description: string }> = [
  {
    value: "ranger",
    title: "Ranger",
    description: "Patrol observations, protected species records, and field review workflows.",
  },
  {
    value: "researcher",
    title: "Researcher",
    description: "Survey records, ecological review, and scientific observation exports.",
  },
  {
    value: "student",
    title: "Student",
    description: "Guided field learning with scientific names and conservation context.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [institution, setInstitution] = useState("");

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signupError } = await supabase.auth.signUp({
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

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        institution: institution || null,
      });
    }

    router.replace("/archive");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-forest-950 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-md border border-stone-300 bg-stone-50 shadow-[0_22px_70px_rgba(19,32,24,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
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
              Conservation field records
            </p>
            <h1 className="mt-3 max-w-md text-3xl font-display-lg leading-tight sm:text-4xl">
              Create Account
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-stone-200">
              Set up a private workspace for field observations, ecological reasoning, and conservation monitoring.
            </p>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <form className="mx-auto w-full max-w-[620px] space-y-5" onSubmit={handleRegister}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    autoComplete="name"
                    className="field-input"
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Siti Rahma"
                    required
                    type="text"
                    value={fullName}
                  />
                </Field>
                <Field label="Institution optional">
                  <input
                    className="field-input"
                    onChange={(event) => setInstitution(event.target.value)}
                    placeholder="Park, NGO, university"
                    type="text"
                    value={institution}
                  />
                </Field>
              </div>

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
                    autoComplete="new-password"
                    className="field-input pr-12"
                    minLength={6}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
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

              <div>
                <span className="mb-3 block text-[11px] font-label-caps uppercase tracking-[0.08em] text-forest-700">
                  Role
                </span>
                <div className="grid gap-3">
                  {roles.map((item) => (
                    <button
                      className={`rounded-sm border p-4 text-left transition ${
                        role === item.value
                          ? "border-forest-800 bg-olive-100"
                          : "border-stone-300 bg-white hover:border-olive-600"
                      }`}
                      key={item.value}
                      onClick={() => setRole(item.value)}
                      type="button"
                    >
                      <div className="flex items-start gap-4">
                        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${
                          role === item.value ? "bg-forest-900 text-stone-50" : "bg-stone-100 text-forest-700"
                        }`}>
                          {item.value === "ranger" ? (
                            <Trees className="h-5 w-5" />
                          ) : item.value === "researcher" ? (
                            <Microscope className="h-5 w-5" />
                          ) : (
                            <ShieldCheck className="h-5 w-5" />
                          )}
                        </span>
                        <span>
                          <span className="block font-semibold text-forest-950">{item.title}</span>
                          <span className="mt-1 block text-sm leading-5 text-forest-700">
                            {item.description}
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

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
                Create Account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-forest-700">
              Already registered?{" "}
              <Link className="font-semibold text-forest-950 underline-offset-4 hover:underline" href="/login">
                Sign In
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
