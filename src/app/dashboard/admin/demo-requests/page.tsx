'use client';

import { AdminDemoRequestsView } from '@/components/admin/admin-demo-requests-view';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminDemoRequestsPage() {
  return (
    <DashboardShell requiredRole="admin">
      <AdminDemoRequestsView />
    </DashboardShell>
  );
}
