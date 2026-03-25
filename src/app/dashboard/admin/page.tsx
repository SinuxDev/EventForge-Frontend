'use client';

import { AdminOverviewView } from '@/components/admin/admin-overview-view';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminOverviewPage() {
  return (
    <DashboardShell requiredRole="admin">
      <AdminOverviewView />
    </DashboardShell>
  );
}
