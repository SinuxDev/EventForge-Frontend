'use client';

import { AdminGovernanceView } from '@/components/admin/admin-governance-view';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminUsersPage() {
  return (
    <DashboardShell requiredRole="admin">
      <AdminGovernanceView />
    </DashboardShell>
  );
}
