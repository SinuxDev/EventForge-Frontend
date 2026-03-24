'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminActionDialog, type ActionDialogState } from '@/components/admin/admin-action-dialog';
import { AdminAuditLogList } from '@/components/admin/admin-audit-log-list';
import { AdminUsersTable } from '@/components/admin/admin-users-table';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { PublishSuccessToast } from '@/components/dashboard/publish-success-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminRoleUpdate, useAdminSuspensionUpdate } from '@/hooks/use-admin-actions';
import { useAdminAuditLogs } from '@/hooks/use-admin-audit-logs';
import { useAdminUsers } from '@/hooks/use-admin-users';
import { toast } from '@/hooks/use-toast';
import type { AdminAuditAction, AdminUser, AdminUserRole } from '@/types/admin';

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminUserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [usersPage, setUsersPage] = useState(1);

  const [auditActionFilter, setAuditActionFilter] = useState<'all' | AdminAuditAction>('all');
  const [auditPage, setAuditPage] = useState(1);

  const [actionDialogState, setActionDialogState] = useState<ActionDialogState | null>(null);
  const [actionReason, setActionReason] = useState('');

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const usersQuery = useAdminUsers({
    headers: authHeader,
    page: usersPage,
    filters: {
      q: searchText,
      role: roleFilter,
      status: statusFilter,
    },
  });

  const auditLogsQuery = useAdminAuditLogs({
    headers: authHeader,
    page: auditPage,
    action: auditActionFilter,
  });

  const roleMutation = useAdminRoleUpdate(authHeader);
  const suspensionMutation = useAdminSuspensionUpdate(authHeader);

  const isSubmittingAction = roleMutation.isPending || suspensionMutation.isPending;

  const openRoleDialog = (targetUser: AdminUser, nextRole: AdminUserRole) => {
    if (targetUser.role === nextRole) {
      return;
    }

    setActionDialogState({
      kind: 'role',
      targetUser,
      nextRole,
    });
    setActionReason('');
  };

  const openSuspensionDialog = (targetUser: AdminUser) => {
    setActionDialogState({
      kind: 'suspension',
      targetUser,
      nextSuspendedState: !targetUser.isSuspended,
    });
    setActionReason('');
  };

  const handleApplyUsersFilters = () => {
    setUsersPage(1);
    usersQuery.refetch();
  };

  const handleApplyAuditFilter = () => {
    setAuditPage(1);
    auditLogsQuery.refetch();
  };

  const closeActionDialog = () => {
    if (isSubmittingAction) {
      return;
    }

    setActionDialogState(null);
    setActionReason('');
  };

  const submitAction = async () => {
    if (!actionDialogState) {
      return;
    }

    if (actionReason.trim().length < 3) {
      toast({
        title: 'Please provide a reason (minimum 3 characters)',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (actionDialogState.kind === 'role') {
        await roleMutation.mutateAsync({
          userId: actionDialogState.targetUser._id,
          role: actionDialogState.nextRole,
          reason: actionReason.trim(),
        });

        toast({ title: 'User role updated' });
      } else {
        const result = await suspensionMutation.mutateAsync({
          userId: actionDialogState.targetUser._id,
          isSuspended: actionDialogState.nextSuspendedState,
          reason: actionReason.trim(),
        });

        toast({
          title: result.data.isSuspended ? 'User suspended' : 'User unsuspended',
        });
      }

      setActionDialogState(null);
      setActionReason('');
      await Promise.all([usersQuery.refetch(), auditLogsQuery.refetch()]);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to complete admin action',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardShell requiredRole="admin">
      <PublishSuccessToast />

      <section className="w-full space-y-5">
        <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Admin dashboard
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">User governance</h1>
            <span className="rounded-full border border-primary/35 bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
              Least privilege enforced
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage user access with safer controls, reason tracking, and admin audit trails.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search name or email"
              className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />

            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as 'all' | AdminUserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="attendee">Attendee</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'suspended')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={handleApplyUsersFilters}
              className="h-11 rounded-xl border border-border bg-background/80 px-4 text-sm font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
            >
              Apply filters
            </button>
          </div>

          <AdminUsersTable
            users={usersQuery.data?.data.data ?? []}
            pagination={usersQuery.data?.data.pagination ?? null}
            isLoading={usersQuery.isFetching}
            onRoleChangeRequest={openRoleDialog}
            onSuspensionToggleRequest={openSuspensionDialog}
            onPreviousPage={() => setUsersPage((current) => Math.max(1, current - 1))}
            onNextPage={() => setUsersPage((current) => current + 1)}
          />
        </section>

        <AdminAuditLogList
          logs={auditLogsQuery.data?.data.data ?? []}
          pagination={auditLogsQuery.data?.data.pagination ?? null}
          isLoading={auditLogsQuery.isFetching}
          actionFilter={auditActionFilter}
          onActionFilterChange={setAuditActionFilter}
          onApplyFilter={handleApplyAuditFilter}
          onPreviousPage={() => setAuditPage((current) => Math.max(1, current - 1))}
          onNextPage={() => setAuditPage((current) => current + 1)}
        />
      </section>

      <AdminActionDialog
        state={actionDialogState}
        reason={actionReason}
        isSubmitting={isSubmittingAction}
        onReasonChange={setActionReason}
        onClose={closeActionDialog}
        onConfirm={submitAction}
      />
    </DashboardShell>
  );
}
