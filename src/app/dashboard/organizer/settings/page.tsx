'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function OrganizerSettingsPage() {
  return (
    <DashboardShell requiredRole="organizer">
      <section className="w-full space-y-6">
        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Organizer settings
          </p>
          <h1 className="mt-3 text-3xl font-bold">Workspace settings</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Configure organizer profile details, notifications, and payout preferences in a future
            update.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card/80 p-5">
          <h2 className="text-lg font-semibold text-foreground">Settings roadmap</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Organizer profile and brand details</li>
            <li>Default timezone and contact preferences</li>
            <li>Notification channels and event alerts</li>
            <li>Payout and billing controls</li>
          </ul>
        </section>
      </section>
    </DashboardShell>
  );
}
