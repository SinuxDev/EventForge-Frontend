'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { OrganizerOverviewPanel } from '@/components/events/organizer-overview-panel';
import { PublishSuccessToast } from '@/components/dashboard/publish-success-toast';

export default function OrganizerDashboardPage() {
  return (
    <DashboardShell requiredRole="organizer">
      <PublishSuccessToast />
      <OrganizerOverviewPanel />
    </DashboardShell>
  );
}
