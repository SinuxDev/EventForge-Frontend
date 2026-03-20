'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { OrganizerEventsPanel } from '@/components/events/organizer-events-panel';
import { PublishSuccessToast } from '@/components/dashboard/publish-success-toast';

export default function OrganizerDashboardPage() {
  return (
    <DashboardShell requiredRole="organizer">
      <PublishSuccessToast />
      <OrganizerEventsPanel />
    </DashboardShell>
  );
}
