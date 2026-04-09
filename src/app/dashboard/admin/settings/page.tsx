'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { UserSettingsPanel } from '@/components/settings/user-settings-panel';

export default function AdminSettingsPage() {
  return (
    <DashboardShell requiredRole="admin">
      <UserSettingsPanel role="admin" />
    </DashboardShell>
  );
}
