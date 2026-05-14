"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf, Loader2, Microscope, ShieldCheck, Trees } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "@/types/common";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

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
  const { t } = useTranslation();
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
    <main className="text-forest-950 min-h-screen bg-stone-100 px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-md border border-stone-300 bg-stone-50 shadow-[0_22px_70px_rgba(19,32,24,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-forest-950 border-b border-stone-300 p-6 text-stone-50 sm:p-8 lg:border-r lg:border-b-0">
            <Link className="mb-8 inline-flex items-center gap-3" href="/">
              <span className="text-forest-950 flex h-10 w-10 items-center justify-center rounded-sm bg-stone-50">
                <Leaf className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-base font-semibold">NaLI</span>
                <span className="text-xs text-stone-300">Nature Life Intelligence</span>
              </span>
            </Link>
            <div className="mb-6">
              <LanguageSwitcher />
            </div>
            <p className="font-label-caps text-[11px] tracking-[0.08em] text-olive-300 uppercase">
              {t("auth.registerEyebrow")}
            </p>
            <h1 className="font-display-lg mt-3 w-full max-w-[28rem] text-3xl leading-tight sm:text-4xl">
              {t("auth.registerTitle")}
            </h1>
            <p className="mt-4 w-full max-w-[28rem] text-sm leading-6 text-stone-200">{t("auth.registerContext")}</p>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <form className="mx-auto w-full max-w-[620px] space-y-5" onSubmit={handleRegister}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("auth.fullName")}>
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
                <Field label={t("auth.institutionOptional")}>
                  <input
                    className="field-input"
                    onChange={(event) => setInstitution(event.target.value)}
                    placeholder={t("auth.institutionPlaceholder")}
                    type="text"
                    value={institution}
                  />
                </Field>
              </div>

              <Field label={t("auth.email")}>
                <input
                  autoComplete="email"
                  className="field-input"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  required
                  type="email"
                  value={email}
                />
              </Field>

              <Field label={t("auth.password")}>
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    className="field-input pr-12"
                    minLength={6}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("auth.passwordMinimum")}
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                    className="text-forest-600 hover:text-forest-950 absolute top-1/2 right-4 -translate-y-1/2"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </Field>

              <div>
                <span className="font-label-caps text-forest-700 mb-3 block text-[11px] tracking-[0.08em] uppercase">
                  {t("auth.role")}
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
                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${
                            role === item.value ? "bg-forest-900 text-stone-50" : "text-forest-700 bg-stone-100"
                          }`}
                        >
                          {item.value === "ranger" ? (
                            <Trees className="h-5 w-5" />
                          ) : item.value === "researcher" ? (
                            <Microscope className="h-5 w-5" />
                          ) : (
                            <ShieldCheck className="h-5 w-5" />
                          )}
                        </span>
                        <span>
                          <span className="text-forest-950 block font-semibold">{t(`auth.roles.${item.value}`)}</span>
                          <span className="text-forest-700 mt-1 block text-sm leading-5">
                            {t(`auth.roles.${item.value}Description`, item.description)}
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error ? (
                <div className="border-rare-red/40 bg-rare-red/10 text-rare-red rounded-sm border p-3 text-sm">
                  {error}
                </div>
              ) : null}

              <button
                className="bg-forest-900 hover:bg-forest-800 flex min-h-12 w-full items-center justify-center gap-3 rounded-sm px-5 text-sm font-semibold text-stone-50 transition disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("common.createAccount")}
              </button>
            </form>

            <p className="text-forest-700 mt-6 text-center text-sm">
              {t("auth.alreadyRegistered")}{" "}
              <Link className="text-forest-950 font-semibold underline-offset-4 hover:underline" href="/login">
                {t("common.signIn")}
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
      <span className="font-label-caps text-forest-700 mb-2 block text-[11px] tracking-[0.08em] uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
