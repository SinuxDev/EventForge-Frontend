'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { OrganizerEventsPanel } from '@/components/events/organizer-events-panel';

export default function OrganizerEventsPage() {
  return (
    <DashboardShell requiredRole="organizer">
      <OrganizerEventsPanel />
    </DashboardShell>
  );
}
