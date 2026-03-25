'use client';

import { AdminEmailHistoryView } from '@/components/admin/admin-email-history-view';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminEmailHistoryPage() {
  return (
    <DashboardShell requiredRole="admin">
      <AdminEmailHistoryView />
    </DashboardShell>
  );
}
