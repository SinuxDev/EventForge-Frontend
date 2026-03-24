'use client';

import { AdminEmailView } from '@/components/admin/admin-email-view';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminEmailPage() {
  return (
    <DashboardShell requiredRole="admin">
      <AdminEmailView />
    </DashboardShell>
  );
}
