'use client';

import { AdminAppealsView } from '@/components/admin/admin-appeals-view';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminAppealsPage() {
  return (
    <DashboardShell requiredRole="admin">
      <AdminAppealsView />
    </DashboardShell>
  );
}
