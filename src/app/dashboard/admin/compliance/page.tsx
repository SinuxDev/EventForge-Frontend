'use client';

import { AdminComplianceView } from '@/components/admin/admin-compliance-view';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminCompliancePage() {
  return (
    <DashboardShell requiredRole="admin">
      <AdminComplianceView />
    </DashboardShell>
  );
}
