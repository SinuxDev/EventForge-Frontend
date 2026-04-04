'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { CalendarClock, CircleDot, MapPin, Ticket } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { OrganizerEventSubnav } from '@/components/events/organizer-event-subnav';
import { toast } from '@/hooks/use-toast';
import { downloadEventAttendeesCsv } from '@/lib/api/event-checkin';
import { useOrganizerEvents } from '@/hooks/use-organizer-events';
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

export default function OrganizerEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [isExporting, setIsExporting] = useState(false);

  const eventsQuery = useOrganizerEvents(session?.accessToken, {
    view: 'all',
    status: 'all',
    query: '',
  });

  const event = eventsQuery.data?.data.find((item) => item._id === id);

  const handleExportCsv = async () => {
    if (!session?.accessToken) {
      toast({
        title: 'Session expired',
        description: 'Please sign in again to export attendees.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsExporting(true);
      const blob = await downloadEventAttendeesCsv(id, session.accessToken, {
        status: 'all',
        checkIn: 'all',
        query: '',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `event-attendees-${id}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: 'Export started',
        description: 'Your attendees CSV has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unable to export attendees.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardShell requiredRole="organizer">
      <section className="w-full space-y-6">
        <OrganizerEventSubnav eventId={id} active="overview" />

        {eventsQuery.isLoading ? (
          <div className="rounded-xl border border-border bg-card/70 p-6 text-sm text-muted-foreground">
            Loading event details...
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
                Organizer / Events / Detail
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
                      href={`/events/new?draftId=${event._id}`}
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
                    >
                      Edit event
                    </Link>
                    <Link
                      href={`/dashboard/organizer/events/${event._id}/check-in`}
                      className="inline-flex h-9 items-center rounded-lg border border-primary/40 bg-primary/12 px-4 text-sm font-medium text-primary"
                    >
                      Open check-in scanner
                    </Link>
                    <Link
                      href={`/dashboard/organizer/events/${event._id}/tickets`}
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
                    >
                      Open tickets
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleExportCsv()}
                      disabled={isExporting}
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground transition hover:border-ring/35 hover:bg-muted disabled:opacity-60"
                    >
                      {isExporting ? 'Exporting...' : 'Export attendees CSV'}
                    </button>
                    <Link
                      href="/dashboard/organizer/events"
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
                    >
                      Back to My events
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
