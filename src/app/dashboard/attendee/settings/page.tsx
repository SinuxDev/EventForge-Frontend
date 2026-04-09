'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { UserSettingsPanel } from '@/components/settings/user-settings-panel';

export default function AttendeeSettingsPage() {
  return (
    <DashboardShell requiredRole="attendee">
      <UserSettingsPanel role="attendee" />
    </DashboardShell>
  );
}
