export default function AlertsLoading() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 text-forest-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">Ecological alerts</p>
        <h1 className="mt-2 text-3xl font-display-lg">Loading ecological alert evidence</h1>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-56 animate-pulse rounded-md border border-stone-200 bg-white" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
