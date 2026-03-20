'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { OrganizerEventForm } from '@/components/events/organizer-event-form';

export default function NewEventPanelPage() {
  return (
    <DashboardShell allowedRoles={['organizer', 'admin']} navRole="organizer">
      <main className="px-1 py-1 text-white">
        <OrganizerEventForm />
      </main>
    </DashboardShell>
  );
}
