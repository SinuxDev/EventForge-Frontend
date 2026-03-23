import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { PublicEventsPanel } from '@/components/events/public-events-panel';

export default function PublicEventsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/88 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-foreground">
            EventForge
          </Link>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/events" className="hidden transition hover:text-foreground sm:inline">
              Explore Events ↗
            </Link>
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex h-9 items-center rounded-full border border-border bg-card/75 px-4 font-medium text-foreground transition hover:border-ring/35 hover:bg-muted"
            >
              Home
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PublicEventsPanel />
      </main>
    </div>
  );
}
