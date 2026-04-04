'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CalendarClock, CircleDot, MapPin, Ticket } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAdminEventDetail } from '@/hooks/use-admin-event-detail';
import { toPublicMediaUrl } from '@/lib/media-url';

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

  return venueName || city || 'In-person';
}

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const authHeader = session?.accessToken
    ? {
        Authorization: `Bearer ${session.accessToken}`,
      }
    : null;

  const eventQuery = useAdminEventDetail({
    headers: authHeader,
    eventId: id,
  });

  const event = eventQuery.data?.data;

  return (
    <DashboardShell requiredRole="admin">
      <section className="w-full space-y-6">
        {eventQuery.isLoading ? (
          <div className="rounded-xl border border-border bg-card/70 p-6 text-sm text-muted-foreground">
            Loading event details...
          </div>
        ) : !event ? (
          <div className="rounded-xl border border-destructive/35 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">Event not found.</p>
            <Link
              href="/dashboard/admin/events"
              className="mt-4 inline-flex rounded-lg border border-border bg-background/80 px-4 py-2 text-sm font-medium text-foreground"
            >
              Back to Events
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
              <div className="mb-5 overflow-hidden rounded-xl border border-border bg-muted/30">
                {event.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={toPublicMediaUrl(event.coverImage)}
                    alt={event.title}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
                    No cover image uploaded
                  </div>
                )}
              </div>

              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Admin / Events / Detail
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
                  <h3 className="text-base font-semibold text-foreground">Organizer</h3>
                  <p className="mt-2 text-sm text-foreground">{event.organizerName}</p>
                  <p className="text-xs text-muted-foreground">{event.contactEmail}</p>
                </article>

                <article className="rounded-xl border border-border bg-card/70 p-5">
                  <h3 className="text-base font-semibold text-foreground">Ticket overview</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)} /{' '}
                    {event.capacity} seats configured
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
                            : ticket.type === 'donation'
                              ? 'Donation'
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
                      href={`/events/${event._id}`}
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
                    >
                      View public page
                    </Link>
                    <Link
                      href="/dashboard/admin/events"
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
                    >
                      Back to Events
                    </Link>
                  </div>
                </article>
              </section>
            </div>
          </>
        )}
      </section>
    </DashboardShell>
  );
}
