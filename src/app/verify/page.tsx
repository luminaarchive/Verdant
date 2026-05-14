"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SearchCheck, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

type VerifyResult = {
  hash: string;
  hash_algorithm: string;
  observation_id: string | null;
  scientific_name: string | null;
  local_name: string | null;
  created_at: string | null;
  review_status: string | null;
  coordinates_protected: boolean | null;
  accessible: boolean | null;
};

export default function VerifyPage() {
  const { t } = useTranslation();
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/verify/hash?hash=${encodeURIComponent(hash)}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || t("verify.failed"));
      setResult(body.result);
      if (!body.result) setError(t("verify.notFound"));
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : t("verify.failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="text-forest-950 min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Link className="text-forest-800 text-sm font-semibold underline" href="/">
          NaLI
        </Link>
        <div className="mt-6 rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-olive-100 text-olive-800">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.08em] text-olive-700 uppercase">{t("verify.kicker")}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[0]">{t("verify.title")}</h1>
              <p className="text-forest-700 mt-3 text-sm leading-6">{t("verify.description")}</p>
            </div>
          </div>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="hash">
              {t("verify.inputLabel")}
            </label>
            <input
              className="min-h-12 flex-1 rounded-sm border border-stone-300 bg-white px-4 font-mono text-sm outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-100"
              id="hash"
              onChange={(event) => setHash(event.target.value)}
              placeholder="sha256..."
              value={hash}
            />
            <button
              className="bg-forest-900 inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-5 text-sm font-semibold text-white disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              <SearchCheck className="h-4 w-4" />
              {isLoading ? t("verify.checking") : t("verify.button")}
            </button>
          </form>

          <p className="text-forest-700 mt-4 rounded-sm border border-stone-200 bg-stone-50 p-3 text-sm leading-6">
            {t("verify.disclaimer")}
          </p>

          {error ? (
            <p className="border-conservation-orange/40 bg-conservation-orange/10 text-forest-800 mt-4 rounded-sm border p-3 text-sm">
              {error}
            </p>
          ) : null}

          {result ? (
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <VerifyField label={t("verify.fields.hash")} value={result.hash} mono />
              <VerifyField label={t("verify.fields.algorithm")} value={result.hash_algorithm} />
              <VerifyField
                label={t("verify.fields.observation")}
                value={result.observation_id || t("common.unavailable")}
              />
              <VerifyField
                label={t("verify.fields.species")}
                value={result.scientific_name || t("archive.speciesPending")}
              />
              <VerifyField
                label={t("verify.fields.commonName")}
                value={result.local_name || t("archive.commonNamePending")}
              />
              <VerifyField label={t("verify.fields.review")} value={result.review_status || t("common.pending")} />
              <VerifyField
                label={t("verify.fields.coordinates")}
                value={result.coordinates_protected ? t("verify.protected") : t("verify.notProtected")}
              />
            </dl>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function VerifyField({ label, mono, value }: { label: string; mono?: boolean; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <dt className="text-forest-600 text-xs font-semibold tracking-[0.08em] uppercase">{label}</dt>
      <dd className={`text-forest-950 mt-1 text-sm leading-5 break-all ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
