'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { RoleUpgradeCard } from '@/components/shared/role-upgrade-card';
import { useCancelAttendeeRsvp, useMyAttendeeRsvps } from '@/hooks/use-attendee-rsvps';
import { toast } from '@/hooks/use-toast';

export default function AttendeeDashboardPage() {
  const { data: session } = useSession();
  const myRsvpsQuery = useMyAttendeeRsvps(session?.accessToken);
  const cancelRsvpMutation = useCancelAttendeeRsvp(session?.accessToken);

  const handleCancelRsvp = async (rsvpId: string) => {
    try {
      await cancelRsvpMutation.mutateAsync(rsvpId);
      toast({
        title: 'RSVP cancelled',
        description: 'Your registration has been cancelled.',
      });
    } catch (error) {
      toast({
        title: 'Unable to cancel RSVP',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardShell requiredRole="attendee">
      <section className="w-full space-y-6">
        <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Attendee dashboard
          </p>
          <h1 className="mt-3 text-3xl font-bold">Welcome, {session?.user?.name || 'Attendee'}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Discover events, manage your registrations, or upgrade to organizer access when you are
            ready to host.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold">My RSVPs</h2>
          {myRsvpsQuery.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading your RSVPs...</p>
          ) : myRsvpsQuery.isError ? (
            <p className="mt-3 text-sm text-destructive">Unable to load RSVPs right now.</p>
          ) : myRsvpsQuery.data && myRsvpsQuery.data.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {myRsvpsQuery.data.map((rsvp) => (
                <li
                  key={rsvp._id}
                  className="rounded-xl border border-border bg-background/70 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{rsvp.event.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Status: <span className="capitalize">{rsvp.status}</span>
                        {rsvp.status === 'waitlisted' && typeof rsvp.waitlistPosition === 'number'
                          ? ` (position #${rsvp.waitlistPosition})`
                          : ''}
                      </p>
                    </div>

                    {rsvp.status !== 'cancelled' ? (
                      <div className="flex items-center gap-2">
                        {rsvp.status === 'registered' ? (
                          <Link
                            href={`/tickets/${rsvp._id}`}
                            className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-muted"
                          >
                            View ticket
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleCancelRsvp(rsvp._id)}
                          disabled={cancelRsvpMutation.isPending}
                          className="inline-flex h-8 items-center rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive transition hover:bg-destructive/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel RSVP
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              You have no RSVPs yet. Explore events and reserve your first spot.
            </p>
          )}
        </section>

        <RoleUpgradeCard
          title="Ready to host your own events?"
          description="Upgrade instantly to organizer access and start creating event pages, managing attendees, and publishing campaigns."
          buttonLabel="Upgrade to Organizer"
        />
      </section>
    </DashboardShell>
  );
}
