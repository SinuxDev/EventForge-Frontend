'use client';

interface AttendeeManagedEventsErrorProps {
  error: Error;
  reset: () => void;
}

export default function AttendeeManagedEventsError({
  error,
  reset,
}: AttendeeManagedEventsErrorProps) {
  return (
    <section className="w-full rounded-2xl border border-destructive/35 bg-destructive/10 p-6">
      <h1 className="text-lg font-semibold text-destructive">Unable to load my events</h1>
      <p className="mt-2 text-sm text-destructive/90">
        {error.message || 'Please try again in a moment.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex h-9 items-center rounded-lg border border-destructive/35 bg-background/80 px-4 text-sm font-medium text-foreground transition hover:bg-muted"
      >
        Retry
      </button>
    </section>
  );
}
