export default function LoadingAttendeeManagedEventsPage() {
  return (
    <section className="w-full space-y-6">
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="h-4 w-24 rounded bg-muted/60" />
        <p className="mt-3 h-8 w-52 rounded bg-muted/60" />
        <p className="mt-3 h-4 w-80 max-w-full rounded bg-muted/40" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <article key={index} className="rounded-xl border border-border bg-card/70 p-4">
            <p className="h-3 w-20 rounded bg-muted/50" />
            <p className="mt-3 h-8 w-16 rounded bg-muted/60" />
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <div className="grid gap-3 md:grid-cols-[1.1fr_0.75fr_0.75fr_auto]">
          <div className="h-11 rounded-xl border border-border bg-muted/35" />
          <div className="h-11 rounded-xl border border-border bg-muted/35" />
          <div className="h-11 rounded-xl border border-border bg-muted/35" />
          <div className="h-11 rounded-xl border border-border bg-muted/35" />
        </div>

        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-border bg-muted/25 p-4">
              <p className="h-5 w-48 rounded bg-muted/60" />
              <p className="mt-3 h-4 w-56 rounded bg-muted/45" />
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
