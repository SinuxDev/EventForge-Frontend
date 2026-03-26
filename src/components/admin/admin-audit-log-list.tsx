import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminAuditAction, AdminAuditLog, PaginationPayload } from '@/types/admin';

function formatDateTime(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getActionLabel(action: AdminAuditAction): string {
  if (action === 'user.role.updated') {
    return 'Role changed';
  }

  if (action === 'compliance.case.created') {
    return 'Compliance case created';
  }

  if (action === 'compliance.case.status.updated') {
    return 'Compliance case status changed';
  }

  if (action === 'admin.email.campaign.sent') {
    return 'Admin email campaign sent';
  }

  if (action === 'demo.request.assigned') {
    return 'Demo request assigned';
  }

  if (action === 'demo.request.status.updated') {
    return 'Demo request status changed';
  }

  if (action === 'demo.request.followup.updated') {
    return 'Demo request follow-up updated';
  }

  if (action === 'demo.request.reply.sent') {
    return 'Demo request reply sent';
  }

  return 'Suspension updated';
}

interface AdminAuditLogListProps {
  logs: AdminAuditLog[];
  pagination: PaginationPayload | null;
  isLoading: boolean;
  actionFilter: 'all' | AdminAuditAction;
  onActionFilterChange: (value: 'all' | AdminAuditAction) => void;
  onApplyFilter: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function AdminAuditLogList({
  logs,
  pagination,
  isLoading,
  actionFilter,
  onActionFilterChange,
  onApplyFilter,
  onPreviousPage,
  onNextPage,
}: AdminAuditLogListProps) {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Admin audit logs</h2>
          <p className="text-sm text-muted-foreground">
            Every high-risk change includes actor, target, timestamp, and reason.
          </p>
        </div>

        <Select
          value={actionFilter}
          onValueChange={(value) => onActionFilterChange(value as 'all' | AdminAuditAction)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="user.role.updated">Role changed</SelectItem>
            <SelectItem value="user.suspension.updated">Suspension updated</SelectItem>
            <SelectItem value="compliance.case.created">Compliance case created</SelectItem>
            <SelectItem value="compliance.case.status.updated">
              Compliance case status changed
            </SelectItem>
            <SelectItem value="admin.email.campaign.sent">Admin email campaign sent</SelectItem>
            <SelectItem value="demo.request.assigned">Demo request assigned</SelectItem>
            <SelectItem value="demo.request.status.updated">Demo request status changed</SelectItem>
            <SelectItem value="demo.request.followup.updated">
              Demo request follow-up updated
            </SelectItem>
            <SelectItem value="demo.request.reply.sent">Demo request reply sent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={onApplyFilter}
          className="h-9 rounded-lg border border-border bg-background/80 px-3 text-xs font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
        >
          Apply audit filter
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-border bg-background/70 px-4 py-5 text-sm text-muted-foreground">
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border border-border bg-background/70 px-4 py-5 text-sm text-muted-foreground">
            No audit logs found for this filter.
          </div>
        ) : (
          logs.map((log) => (
            <article key={log._id} className="rounded-xl border border-border bg-background/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {getActionLabel(log.action)}
                </p>
                <p className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</p>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                <span className="text-foreground">{log.actorUserId?.name ?? 'Unknown admin'}</span>
                {' updated '}
                <span className="text-foreground">{log.targetUserId?.name ?? 'Unknown user'}</span>
              </p>

              {log.metadata?.previousRole && log.metadata?.nextRole ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Role: {log.metadata.previousRole} → {log.metadata.nextRole}
                </p>
              ) : null}

              {typeof log.metadata?.previousSuspendedState === 'boolean' &&
              typeof log.metadata?.nextSuspendedState === 'boolean' ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Suspension: {log.metadata.previousSuspendedState ? 'suspended' : 'active'} →{' '}
                  {log.metadata.nextSuspendedState ? 'suspended' : 'active'}
                </p>
              ) : null}

              <p className="mt-2 text-xs text-muted-foreground">Reason: {log.reason}</p>
            </article>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousPage}
            disabled={!pagination?.hasPrevPage || isLoading}
            className="rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            onClick={onNextPage}
            disabled={!pagination?.hasNextPage || isLoading}
            className="rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
