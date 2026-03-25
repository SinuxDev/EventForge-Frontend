import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminAuditLogList } from '@/components/admin/admin-audit-log-list';
import { useAdminAuditLogs } from '@/hooks/use-admin-audit-logs';
import type { AdminAuditAction } from '@/types/admin';

export function AdminAuditView() {
  const { data: session } = useSession();
  const [auditActionFilter, setAuditActionFilter] = useState<'all' | AdminAuditAction>('all');
  const [auditPage, setAuditPage] = useState(1);

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const auditLogsQuery = useAdminAuditLogs({
    headers: authHeader,
    page: auditPage,
    action: auditActionFilter,
  });

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Admin / Audit logs
        </p>
        <h1 className="mt-3 text-2xl font-bold md:text-3xl">Audit timeline</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Review all governance actions for accountability and compliance reporting.
        </p>
      </section>

      <AdminAuditLogList
        logs={auditLogsQuery.data?.data.data ?? []}
        pagination={auditLogsQuery.data?.data.pagination ?? null}
        isLoading={auditLogsQuery.isFetching}
        actionFilter={auditActionFilter}
        onActionFilterChange={setAuditActionFilter}
        onApplyFilter={() => {
          setAuditPage(1);
          auditLogsQuery.refetch();
        }}
        onPreviousPage={() => setAuditPage((current) => Math.max(1, current - 1))}
        onNextPage={() => setAuditPage((current) => current + 1)}
      />
    </div>
  );
}
