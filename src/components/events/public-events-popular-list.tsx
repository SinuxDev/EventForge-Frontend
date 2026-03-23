import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { toPublicMediaUrl } from '@/lib/media-url';
import type { EventEntity } from '@/types/event';

interface PublicEventsPopularListProps {
  events: EventEntity[];
}

function formatEventDate(value: string, timezone: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);
}

function getLocationLabel(event: EventEntity): string {
  if (event.attendanceMode === 'online') {
    return 'Online';
  }

  if (event.attendanceMode === 'hybrid') {
    return event.venueName ? `${event.venueName} + Online` : 'Hybrid';
  }

  return event.venueName || event.city || 'In person';
}

export function PublicEventsPopularList({ events }: PublicEventsPopularListProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card/82 p-5 backdrop-blur md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Popular Events</h2>
          <p className="text-sm text-muted-foreground">Trending picks for this week</p>
        </div>
        <Link
          href="#all-events"
          className="inline-flex h-9 items-center rounded-lg border border-border bg-background/75 px-3 text-sm font-medium text-foreground transition hover:border-ring/35 hover:bg-muted"
        >
          View all
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {events.slice(0, 6).map((event) => (
          <Link
            key={event._id}
            href={`/events/${event._id}`}
            className="group flex items-start gap-3 rounded-xl border border-border bg-background/65 p-3 transition hover:border-ring/35 hover:bg-card"
          >
            <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted/35">
              {event.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toPublicMediaUrl(event.coverImage)}
                  alt={event.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                />
              ) : null}
            </div>

            <div className="min-w-0 space-y-1">
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatEventDate(event.startDateTime, event.timezone)}
              </p>
              <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{event.title}</h3>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {getLocationLabel(event)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
