'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CalendarClock, CircleDot, MapPin, Ticket } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
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

  const eventsQuery = useOrganizerEvents(session?.accessToken, {
    view: 'all',
    status: 'all',
    query: '',
  });

  const event = eventsQuery.data?.data.find((item) => item._id === id);

  return (
    <DashboardShell requiredRole="organizer">
      <section className="w-full space-y-6">
        {eventsQuery.isLoading ? (
          <div className="rounded-xl border border-white/12 bg-white/5 p-6 text-sm text-white/70">
            Loading event details...
          </div>
        ) : !event ? (
          <div className="rounded-xl border border-[#ff69b4]/35 bg-[#ff69b4]/12 p-6">
            <p className="text-sm text-[#ffc2df]">Event not found in your organizer workspace.</p>
            <Link
              href="/dashboard/organizer"
              className="mt-4 inline-flex rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white"
            >
              Back to My events
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/12 bg-white/6 p-6 backdrop-blur">
              <div className="mb-5 overflow-hidden rounded-xl border border-white/12 bg-black/25">
                {event.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={toPublicMediaUrl(event.coverImage)}
                    alt={event.title}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center text-sm text-white/45">
                    No cover image uploaded
                  </div>
                )}
              </div>

              <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                Organizer / Events / Detail
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                <span className="rounded-full border border-[#00A896]/35 bg-[#00A896]/12 px-3 py-1 text-xs font-medium text-[#9ef0e6]">
                  {event.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/70">{event.shortSummary}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/65">
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
              <section className="rounded-xl border border-white/12 bg-white/5 p-5">
                <h2 className="text-lg font-semibold text-white">Description</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/75">
                  {event.description}
                </p>
              </section>

              <section className="space-y-4">
                <article className="rounded-xl border border-white/12 bg-white/5 p-5">
                  <h3 className="text-base font-semibold text-white">Ticket overview</h3>
                  <p className="mt-2 text-sm text-white/65">
                    {event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)} /{' '}
                    {event.capacity} seats configured
                  </p>
                  <ul className="mt-3 space-y-2">
                    {event.tickets.map((ticket, index) => (
                      <li
                        key={`${event._id}-${ticket.name}-${index}`}
                        className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/78"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-white/60" />
                          {ticket.name}
                        </span>
                        <span className="ml-2 text-xs text-white/55">
                          {ticket.type === 'paid'
                            ? `${ticket.currency ?? 'USD'} ${ticket.price ?? 0}`
                            : 'Free'}{' '}
                          • {ticket.quantity} seats
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-xl border border-white/12 bg-white/5 p-5">
                  <h3 className="text-base font-semibold text-white">Actions</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/events/new?draftId=${event._id}`}
                      className="inline-flex h-9 items-center rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-medium text-white/90"
                    >
                      Edit event
                    </Link>
                    <Link
                      href="/dashboard/organizer"
                      className="inline-flex h-9 items-center rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-medium text-white/90"
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
