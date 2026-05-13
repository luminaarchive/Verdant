"use client";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <OperationalErrorView reset={reset} scope="NaLI could not load this field intelligence view." />;
}

function OperationalErrorView({ reset, scope }: { reset: () => void; scope: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 text-forest-950">
      <section className="w-full max-w-xl rounded-md border border-stone-200 bg-white p-6">
        <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">Operational error</p>
        <h1 className="mt-2 text-2xl font-headline-md">{scope}</h1>
        <p className="mt-3 text-sm leading-6 text-forest-700">
          The view did not finish loading. Retry the request, then check system readiness if the issue continues.
        </p>
        <button className="mt-5 rounded-sm bg-forest-900 px-4 py-2 text-sm font-semibold text-white" onClick={reset}>
          Retry
        </button>
      </section>
    </main>
  );
}
