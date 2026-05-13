"use client";

export default function AlertsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 text-forest-950">
      <section className="mx-auto max-w-xl rounded-md border border-stone-200 bg-white p-6">
        <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">Ecological alerts</p>
        <h1 className="mt-2 text-2xl font-headline-md">NaLI could not load this field intelligence view.</h1>
        <p className="mt-3 text-sm leading-6 text-forest-700">Alert evidence and trace links are unavailable for this request.</p>
        <button className="mt-5 rounded-sm bg-forest-900 px-4 py-2 text-sm font-semibold text-white" onClick={reset}>
          Retry
        </button>
      </section>
    </main>
  );
}
