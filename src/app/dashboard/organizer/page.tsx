'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { PublishSuccessToast } from '@/components/dashboard/publish-success-toast';

const organizerStats = [
  { label: 'Upcoming events', value: '3' },
  { label: 'Registrations (7d)', value: '428' },
  { label: 'Check-in rate', value: '81%' },
  { label: 'Revenue', value: '$12.4K' },
];

export default function OrganizerDashboardPage() {
  const { data: session } = useSession();

  return (
    <DashboardShell requiredRole="organizer">
      <PublishSuccessToast />
      <section className="w-full space-y-6">
        <div className="rounded-2xl border border-white/12 bg-white/6 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-white/55">Organizer dashboard</p>
          <h1 className="mt-3 text-3xl font-bold">
            Welcome back, {session?.user?.name || 'Organizer'}
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Manage event creation, registrations, and operations from one workspace.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/events/new"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#10121a] transition hover:bg-[#f2f2f2]"
            >
              Create Event
            </Link>
            <button className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/90">
              Import Attendees
            </button>
            <button className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/90">
              Send Announcement
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {organizerStats.map((item) => (
            <article key={item.label} className="rounded-xl border border-white/12 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-white/50">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-xl border border-white/12 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">My events</h2>
            <p className="mt-2 text-sm text-white/70">
              No events yet. Create your first event to get started.
            </p>
            <Link
              href="/events/new"
              className="mt-4 inline-flex rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white"
            >
              Create First Event
            </Link>
          </section>

          <section className="rounded-xl border border-white/12 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Next steps</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Create your first event</li>
              <li>• Configure registration settings</li>
              <li>• Publish and share your event link</li>
            </ul>
          </section>
        </div>
      </section>
    </DashboardShell>
  );
}
