"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
    <main className="text-forest-950 min-h-screen bg-stone-100 px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-md border border-stone-300 bg-stone-50 shadow-[0_22px_70px_rgba(19,32,24,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
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
              {t("auth.workspace")}
            </p>
            <h1 className="font-display-lg mt-3 w-full max-w-[28rem] text-3xl leading-tight sm:text-4xl">
              {t("auth.signInTitle")}
            </h1>
            <p className="mt-4 w-full max-w-[28rem] text-sm leading-6 text-stone-200">{t("auth.signInContext")}</p>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <form className="mx-auto w-full max-w-[460px] space-y-5" onSubmit={handleLogin}>
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
                    autoComplete="current-password"
                    className="field-input pr-12"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("auth.passwordPlaceholder")}
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
                {t("common.signIn")}
              </button>
            </form>

            <p className="text-forest-700 mt-6 text-center text-sm">
              {t("auth.newToNali")}{" "}
              <Link className="text-forest-950 font-semibold underline-offset-4 hover:underline" href="/register">
                {t("common.createAccount")}
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
