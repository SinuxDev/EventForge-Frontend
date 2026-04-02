'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { OrganizerEventSubnav } from '@/components/events/organizer-event-subnav';
import { useEventAttendance } from '@/hooks/use-event-checkin';
import { useOrganizerEvents } from '@/hooks/use-organizer-events';

export default function OrganizerEventAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const eventsQuery = useOrganizerEvents(session?.accessToken, {
    view: 'all',
    status: 'all',
    query: '',
  });

  const attendanceQuery = useEventAttendance(id, session?.accessToken);
  const event = eventsQuery.data?.data.find((item) => item._id === id);

  return (
    <DashboardShell requiredRole="organizer">
      <section className="w-full space-y-6">
        <OrganizerEventSubnav eventId={id} active="analytics" />

        {eventsQuery.isLoading ? (
          <div className="rounded-xl border border-border bg-card/70 p-6 text-sm text-muted-foreground">
            Loading analytics...
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
                Organizer / Events / Analytics
              </p>
              <h1 className="mt-3 text-3xl font-bold">Performance snapshot</h1>
              <p className="mt-2 text-sm text-muted-foreground">{event.title}</p>
            </div>

            <section className="grid gap-4 md:grid-cols-4">
              <article className="rounded-xl border border-border bg-card/70 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Capacity
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{event.capacity}</p>
              </article>
              <article className="rounded-xl border border-border bg-card/70 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Registered
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {attendanceQuery.data?.registeredCount ?? 0}
                </p>
              </article>
              <article className="rounded-xl border border-border bg-card/70 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Checked in
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {attendanceQuery.data?.checkedInCount ?? 0}
                </p>
              </article>
              <article className="rounded-xl border border-border bg-card/70 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Attendance rate
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {attendanceQuery.data?.attendanceRate ?? 0}%
                </p>
              </article>
            </section>

            <section className="rounded-2xl border border-border bg-card/80 p-5">
              <h2 className="text-lg font-semibold text-foreground">Next analytics upgrades</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Registration trend over time</li>
                <li>Ticket tier conversion and mix</li>
                <li>Traffic-to-registration conversion funnel</li>
                <li>Referral and campaign source performance</li>
              </ul>
            </section>
          </>
        )}
      </section>
    </DashboardShell>
  );
}
