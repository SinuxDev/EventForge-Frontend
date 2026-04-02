'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { OrganizerEventSubnav } from '@/components/events/organizer-event-subnav';
import { useOrganizerEvents } from '@/hooks/use-organizer-events';

export default function OrganizerEventPromotionsPage() {
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
        <OrganizerEventSubnav eventId={id} active="promotions" />

        {eventsQuery.isLoading ? (
          <div className="rounded-xl border border-border bg-card/70 p-6 text-sm text-muted-foreground">
            Loading promotions...
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
                Organizer / Events / Promotions
              </p>
              <h1 className="mt-3 text-3xl font-bold">Promotion toolkit</h1>
              <p className="mt-2 text-sm text-muted-foreground">{event.title}</p>
            </div>

            <section className="rounded-2xl border border-border bg-card/80 p-5">
              <h2 className="text-lg font-semibold text-foreground">Share this event</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use this direct event URL in campaigns and social channels.
              </p>
              <div className="mt-3 rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-foreground">
                {`/events/${id}`}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/events/${id}`}
                  className="inline-flex h-9 items-center rounded-lg border border-primary/40 bg-primary/12 px-4 text-sm font-medium text-primary"
                >
                  Open public event page
                </Link>
                <Link
                  href={`/dashboard/organizer/events/${id}`}
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
