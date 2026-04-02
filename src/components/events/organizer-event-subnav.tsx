'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface OrganizerEventSubnavProps {
  eventId: string;
  active: 'overview' | 'attendees' | 'tickets' | 'analytics' | 'check-in' | 'promotions';
}

const EVENT_NAV_ITEMS: Array<{
  key: OrganizerEventSubnavProps['active'];
  label: string;
  getHref: (eventId: string) => string;
}> = [
  {
    key: 'overview',
    label: 'Overview',
    getHref: (eventId) => `/dashboard/organizer/events/${eventId}`,
  },
  {
    key: 'attendees',
    label: 'Attendees',
    getHref: (eventId) => `/dashboard/organizer/events/${eventId}/attendees`,
  },
  {
    key: 'tickets',
    label: 'Tickets',
    getHref: (eventId) => `/dashboard/organizer/events/${eventId}/tickets`,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    getHref: (eventId) => `/dashboard/organizer/events/${eventId}/analytics`,
  },
  {
    key: 'check-in',
    label: 'Check-in',
    getHref: (eventId) => `/dashboard/organizer/events/${eventId}/check-in`,
  },
  {
    key: 'promotions',
    label: 'Promotions',
    getHref: (eventId) => `/dashboard/organizer/events/${eventId}/promotions`,
  },
];

export function OrganizerEventSubnav({ eventId, active }: OrganizerEventSubnavProps) {
  return (
    <nav className="rounded-xl border border-border bg-card/70 p-2">
      <div className="flex flex-wrap gap-2">
        {EVENT_NAV_ITEMS.map((item) => {
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.getHref(eventId)}
              className={cn(
                'inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium transition',
                isActive
                  ? 'border-primary/45 bg-primary/12 text-primary'
                  : 'border-border bg-background/80 text-foreground hover:border-ring/35 hover:bg-muted'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
