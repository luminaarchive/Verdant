"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, SearchCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

type DemoSpeciesResponse = {
  scientificName: string;
  commonNameId: string;
  iucnStatus: string;
  populationTrend: string;
  distributionId: string;
  conservationContext: string;
  reviewRecommendation: string;
  source: string;
  sourceLabel: string;
  isDemo: true;
  disclaimer: string;
};

const suggestions = ["harimau sumatera", "komodo", "jalak bali", "orangutan tapanuli", "bekantan"];

export function PublicSpeciesDemo() {
  const { language, t } = useTranslation();
  const [query, setQuery] = useState("harimau sumatera");
  const [result, setResult] = useState<DemoSpeciesResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function runLookup(nextQuery = query) {
    const trimmed = nextQuery.trim();
    setQuery(nextQuery);
    setError("");
    setResult(null);

    if (!trimmed) {
      setError(t("landing.publicDemo.empty"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/demo/species?q=${encodeURIComponent(trimmed)}&lang=${language}`);
      const body = await response.json();

      if (!response.ok) {
        setError(body.error || t("landing.publicDemo.notFound"));
        return;
      }

      setResult(body);
    } catch {
      setError(t("landing.publicDemo.failed"));
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runLookup();
  }

  return (
    <section id="demo" className="border-b border-stone-200 bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">
            {t("landing.publicDemo.kicker")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[0] text-forest-950 sm:text-4xl">
            {t("landing.publicDemo.title")}
          </h2>
          <p className="mt-4 text-base leading-7 text-forest-700">{t("landing.publicDemo.description")}</p>
          <p className="mt-5 rounded-sm border border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-forest-800">
            {t("landing.publicDemo.disclaimer")}
          </p>
        </div>

        <div className="rounded-sm border border-stone-300 bg-stone-100 p-4 sm:p-5">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="public-species-query">
              {t("landing.publicDemo.inputLabel")}
            </label>
            <input
              className="min-h-12 flex-1 rounded-sm border border-stone-300 bg-white px-4 text-base text-forest-950 outline-none transition focus:border-olive-700 focus:ring-2 focus:ring-olive-200"
              id="public-species-query"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("landing.publicDemo.placeholder")}
              value={query}
            />
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-forest-900 px-5 text-sm font-semibold text-stone-50 transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              <SearchCheck className="h-4 w-4" />
              {isLoading ? t("landing.publicDemo.loading") : t("landing.publicDemo.button")}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                className="rounded-sm border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-forest-800 transition hover:bg-stone-50"
                key={suggestion}
                onClick={() => void runLookup(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div aria-live="polite" className="mt-5">
            {error ? (
              <div className="flex items-start gap-2 rounded-sm border border-conservation-orange/50 bg-conservation-orange/10 p-4 text-sm leading-6 text-forest-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-conservation-orange" />
                <p>{error}</p>
              </div>
            ) : null}

            {result ? (
              <article className="rounded-sm border border-stone-300 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">
                      {t("landing.publicDemo.resultLabel")}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold italic text-forest-950">{result.scientificName}</h3>
                    <p className="text-sm font-medium text-forest-700">{result.commonNameId}</p>
                  </div>
                  <span
                    className={`rounded-sm px-3 py-2 text-sm font-bold ${
                      result.iucnStatus === "CR"
                        ? "bg-rare-red text-white"
                        : result.iucnStatus === "EN"
                          ? "bg-conservation-orange text-forest-950"
                          : "bg-olive-700 text-white"
                    }`}
                  >
                    {result.iucnStatus}
                  </span>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  <ResultField label={t("landing.publicDemo.populationTrend")} value={result.populationTrend} />
                  <ResultField label={t("landing.publicDemo.distribution")} value={result.distributionId} />
                  <ResultField label={t("landing.publicDemo.review")} value={result.reviewRecommendation} />
                  <ResultField label={t("landing.publicDemo.source")} value={result.source} />
                </dl>

                <p className="mt-4 rounded-sm border border-olive-300 bg-olive-50 p-3 text-sm leading-6 text-forest-800">
                  {result.conservationContext}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-forest-700">
                  {t("landing.publicDemo.demoBadge")}
                </p>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-600">{label}</dt>
      <dd className="mt-1 text-sm leading-5 text-forest-950">{value}</dd>
    </div>
  );
}
