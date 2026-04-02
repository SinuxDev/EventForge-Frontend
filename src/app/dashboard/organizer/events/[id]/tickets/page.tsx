'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CircleDot, Ticket } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { OrganizerEventSubnav } from '@/components/events/organizer-event-subnav';
import { useOrganizerEvents } from '@/hooks/use-organizer-events';

export default function OrganizerEventTicketsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const eventsQuery = useOrganizerEvents(session?.accessToken, {
    view: 'all',
    status: 'all',
    query: '',
  });

  const event = eventsQuery.data?.data.find((item) => item._id === id);
  const configuredSeats =
    event?.tickets.reduce((sum, ticket) => {
      return sum + ticket.quantity;
    }, 0) ?? 0;

  return (
    <DashboardShell requiredRole="organizer">
      <section className="w-full space-y-6">
        <OrganizerEventSubnav eventId={id} active="tickets" />

        {eventsQuery.isLoading ? (
          <div className="rounded-xl border border-border bg-card/70 p-6 text-sm text-muted-foreground">
            Loading ticket details...
          </div>
        ) : !event ? (
          <div className="rounded-xl border border-destructive/35 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">Event not found in your organizer workspace.</p>
            <Link
              href="/dashboard/organizer/events"
              className="mt-4 inline-flex rounded-lg border border-border bg-background/80 px-4 py-2 text-sm font-medium text-foreground"
            >
              Back to My events
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Organizer / Events / Tickets
              </p>
              <h1 className="mt-3 text-3xl font-bold">Ticket inventory</h1>
              <p className="mt-2 text-sm text-muted-foreground">{event.title}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Ticket className="h-4 w-4" />
                  {event.tickets.length} ticket tiers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CircleDot className="h-4 w-4" />
                  {configuredSeats} configured seats (event capacity {event.capacity})
                </span>
              </div>
            </div>

            <section className="rounded-2xl border border-border bg-card/80 p-5">
              {event.tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No ticket tiers configured yet. Use edit event to add ticket options.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {event.tickets.map((ticket, index) => (
                    <article
                      key={`${event._id}-${ticket.name}-${index}`}
                      className="rounded-xl border border-border bg-background/70 p-4"
                    >
                      <h2 className="text-base font-semibold text-foreground">{ticket.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ticket.type === 'paid'
                          ? `${ticket.currency ?? 'USD'} ${ticket.price ?? 0}`
                          : ticket.type === 'donation'
                            ? 'Donation'
                            : 'Free'}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">{ticket.quantity} seats</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Order limits: {ticket.minPerOrder ?? 1} - {ticket.maxPerOrder ?? 10}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/events/new?draftId=${event._id}`}
                  className="inline-flex h-9 items-center rounded-lg border border-primary/40 bg-primary/12 px-4 text-sm font-medium text-primary"
                >
                  Edit ticket setup
                </Link>
                <Link
                  href={`/dashboard/organizer/events/${event._id}`}
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
                >
                  Back to event overview
                </Link>
              </div>
            </section>
          </>
        )}
      </section>
    </DashboardShell>
  );
}
