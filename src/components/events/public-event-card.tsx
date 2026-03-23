import { CalendarClock, CalendarRange, CircleDot, Eye } from 'lucide-react';
import Link from 'next/link';
import { toPublicMediaUrl } from '@/lib/media-url';
import type { EventEntity } from '@/types/event';

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

function getLocationLabel(event: EventEntity): string {
  if (event.attendanceMode === 'online') {
    return 'Online';
  }

  if (event.attendanceMode === 'hybrid') {
    return event.venueName ? `${event.venueName} + Online` : 'Hybrid';
  }

  return event.venueName || event.city || 'In person';
}

export function PublicEventCard({ event }: { event: EventEntity }) {
  const seats = event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-ring/35 hover:shadow-[0_14px_32px_rgba(0,0,0,0.1)]">
      <div className="relative aspect-video  border-b border-border bg-muted/35">
        {event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={toPublicMediaUrl(event.coverImage)}
            alt={event.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No cover image
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3">
          <span className="rounded-full border border-primary/35 bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur">
            {event.status}
          </span>
        </div>

        <div className="absolute right-3 top-3 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-white/90 backdrop-blur">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatEventDate(event.startDateTime, event.timezone)}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-1 text-xl font-semibold text-foreground">{event.title}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {event.shortSummary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            {getLocationLabel(event)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground">
            <CircleDot className="h-3.5 w-3.5" />
            {seats}/{event.capacity} seats
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Link
            href={`/events/${event._id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/12 px-3 text-sm font-medium text-primary transition hover:border-primary/55 hover:bg-primary/18"
          >
            <Eye className="h-4 w-4" />
            View event
          </Link>

          <span className="text-xs font-medium text-muted-foreground">{event.category}</span>
        </div>
      </div>
    </article>
  );
}
