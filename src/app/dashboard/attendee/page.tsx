'use client';

import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { RoleUpgradeCard } from '@/components/shared/role-upgrade-card';

export default function AttendeeDashboardPage() {
  const { data: session } = useSession();

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

        <RoleUpgradeCard
          title="Ready to host your own events?"
          description="Upgrade instantly to organizer access and start creating event pages, managing attendees, and publishing campaigns."
          buttonLabel="Upgrade to Organizer"
        />
      </section>
    </DashboardShell>
  );
}
