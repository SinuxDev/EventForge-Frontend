'use client';

import { AdminEventsView } from '@/components/admin/admin-events-view';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminEventsPage() {
  return (
    <DashboardShell requiredRole="admin">
      <AdminEventsView />
    </DashboardShell>
  );
}
