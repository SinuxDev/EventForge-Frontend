'use client';

import { AdminAuditView } from '@/components/admin/admin-audit-view';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminAuditPage() {
  return (
    <DashboardShell requiredRole="admin">
      <AdminAuditView />
    </DashboardShell>
  );
}
