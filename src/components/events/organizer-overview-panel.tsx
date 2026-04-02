'use client';

import Link from 'next/link';
import { CalendarClock, CircleDot, Plus, Ticket } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { useOrganizerEvents } from '@/hooks/use-organizer-events';

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

export function OrganizerOverviewPanel() {
  const { data: session } = useSession();
  const [now] = useState(() => Date.now());
  const eventsQuery = useOrganizerEvents(session?.accessToken, {
    view: 'all',
    status: 'all',
    query: '',
  });

  const overview = useMemo(() => {
    const events = eventsQuery.data?.data ?? [];

    const upcoming = events
      .filter((event) => new Date(event.startDateTime).getTime() >= now)
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

    const recentDrafts = events
      .filter((event) => event.status === 'draft')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    const totalConfiguredSeats = events.reduce((sum, event) => {
      return sum + event.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0);
    }, 0);

    return {
      total: events.length,
      published: events.filter((event) => event.status === 'published').length,
      drafts: events.filter((event) => event.status === 'draft').length,
      upcomingCount: upcoming.length,
      nextEvent: upcoming[0] ?? null,
      recentDrafts,
      totalConfiguredSeats,
    };
  }, [eventsQuery.data?.data, now]);

  return (
    <section className="w-full space-y-6">
      <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Organizer overview
            </p>
            <h1 className="mt-3 text-3xl font-bold">Workspace overview</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Monitor your event pipeline, review upcoming sessions, and jump into event operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/events/new"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary/45 bg-primary/16 px-4 text-sm font-semibold text-primary transition hover:border-primary/65 hover:bg-primary/24"
            >
              <Plus className="h-4 w-4" />
              Create event
            </Link>
            <Link
              href="/dashboard/organizer/events"
              className="inline-flex h-10 items-center rounded-xl border border-border bg-background/80 px-4 text-sm font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
            >
              Open My events
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Total events</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{overview.total}</p>
        </article>
        <article className="rounded-xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Published</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{overview.published}</p>
        </article>
        <article className="rounded-xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Drafts</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{overview.drafts}</p>
        </article>
        <article className="rounded-xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Upcoming</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{overview.upcomingCount}</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-border bg-card/80 p-5">
          <h2 className="text-lg font-semibold text-foreground">Next upcoming event</h2>
          {eventsQuery.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading overview...</p>
          ) : !overview.nextEvent ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No upcoming events found. Publish an event to see it here.
            </p>
          ) : (
            <div className="mt-4 rounded-xl border border-border bg-background/70 p-4">
              <p className="text-base font-semibold text-foreground">{overview.nextEvent.title}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                {formatEventDate(overview.nextEvent.startDateTime, overview.nextEvent.timezone)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/organizer/events/${overview.nextEvent._id}`}
                  className="inline-flex h-9 items-center rounded-lg border border-primary/40 bg-primary/12 px-4 text-sm font-medium text-primary"
                >
                  Open details
                </Link>
                <Link
                  href={`/dashboard/organizer/events/${overview.nextEvent._id}/check-in`}
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
                >
                  Open check-in
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <article className="rounded-2xl border border-border bg-card/80 p-5">
            <h3 className="text-base font-semibold text-foreground">Capacity snapshot</h3>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Ticket className="h-4 w-4" />
              {overview.totalConfiguredSeats} configured ticket seats
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card/80 p-5">
            <h3 className="text-base font-semibold text-foreground">Recent drafts</h3>
            {overview.recentDrafts.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No draft events right now.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {overview.recentDrafts.map((event) => (
                  <Link
                    key={event._id}
                    href={`/events/new?draftId=${event._id}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-background/70 px-3 py-2 text-sm transition hover:border-ring/30"
                  >
                    <span className="line-clamp-1 text-foreground">{event.title}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CircleDot className="h-3.5 w-3.5" />
                      Draft
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
    </section>
  );
}
