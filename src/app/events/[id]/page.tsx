'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { CalendarClock, CircleDot, MapPin, Ticket } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { usePublicEvent } from '@/hooks/use-public-events';
import { toPublicMediaUrl } from '@/lib/media-url';
import { RsvpActionCard } from '@/components/events/rsvp-action-card';

function formatEventDate(value: string, timezone: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);
}

function getLocationLabel(attendanceMode: string, venueName?: string, city?: string): string {
  if (attendanceMode === 'online') {
    return 'Online';
  }

  if (attendanceMode === 'hybrid') {
    return venueName ? `${venueName} + Online` : 'Hybrid';
  }

  return venueName || city || 'In person';
}

export default function PublicEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventQuery = usePublicEvent(id);

  let content: ReactNode;

  if (eventQuery.isLoading) {
    content = (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card/70 p-6 text-sm text-muted-foreground">
          Loading event details...
        </div>
      </main>
    );
  } else if (eventQuery.isError || !eventQuery.data || eventQuery.data.status !== 'published') {
    content = (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-destructive/35 bg-destructive/10 p-6">
          <p className="text-sm text-destructive">Event not found or unavailable.</p>
          <Link
            href="/events"
            className="mt-4 inline-flex rounded-lg border border-border bg-background/80 px-4 py-2 text-sm font-medium text-foreground"
          >
            Back to Explore events
          </Link>
        </div>
      </main>
    );
  } else {
    const event = eventQuery.data;

    content = (
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <div className="mb-5 overflow-hidden rounded-xl border border-border bg-muted/30">
            {event.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toPublicMediaUrl(event.coverImage)}
                alt={event.title}
                className="h-58 w-full object-cover"
              />
            ) : (
              <div className="flex h-58 items-center justify-center text-sm text-muted-foreground">
                No cover image uploaded
              </div>
            )}
          </div>

          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Public / Events / Detail
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
            <span className="rounded-full border border-primary/35 bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
              {event.status}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{event.shortSummary}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" />
              {formatEventDate(event.startDateTime, event.timezone)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {getLocationLabel(event.attendanceMode, event.venueName, event.city)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CircleDot className="h-4 w-4" />
              {event.category}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-xl border border-border bg-card/70 p-5">
            <h2 className="text-lg font-semibold text-foreground">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {event.description}
            </p>
          </section>

          <section className="space-y-4">
            <article className="rounded-xl border border-border bg-card/70 p-5">
              <h3 className="text-base font-semibold text-foreground">Ticket overview</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)} / {event.capacity}{' '}
                seats configured
              </p>
              <ul className="mt-3 space-y-2">
                {event.tickets.map((ticket, index) => (
                  <li
                    key={`${event._id}-${ticket.name}-${index}`}
                    className="rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      {ticket.name}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {ticket.type === 'paid'
                        ? `${ticket.currency ?? 'USD'} ${ticket.price ?? 0}`
                        : 'Free'}{' '}
                      • {ticket.quantity} seats
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-xl border border-border bg-card/70 p-5">
              <h3 className="text-base font-semibold text-foreground">Actions</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/events"
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
                >
                  Back to Explore events
                </Link>
              </div>
            </article>

            <RsvpActionCard eventId={event._id} eventTitle={event.title} />
          </section>
        </div>
      </main>
    );
  }

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

      {content}
    </div>
  );
}
