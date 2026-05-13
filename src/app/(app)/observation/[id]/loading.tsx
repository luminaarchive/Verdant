export default function ObservationLoading() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 text-forest-950 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] font-label-caps uppercase tracking-[0.08em] text-olive-700">Observation audit</p>
          <h1 className="mt-2 text-3xl font-display-lg">Loading observation reasoning record</h1>
          <div className="mt-6 aspect-video animate-pulse rounded-md border border-stone-200 bg-white" />
        </div>
        <div className="space-y-4 pt-10">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-32 animate-pulse rounded-md border border-stone-200 bg-white" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
