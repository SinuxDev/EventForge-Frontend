import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminAppealDetailDrawer } from '@/components/admin/admin-appeal-detail-drawer';
import { AdminAppealsTable } from '@/components/admin/admin-appeals-table';
import { useAdminAppeals } from '@/hooks/use-admin-appeals';
import { useUpdateAdminAppealStatus } from '@/hooks/use-admin-appeal-actions';
import { toast } from '@/hooks/use-toast';
import type {
  AppealIssueType,
  AppealRequestItem,
  AppealRequestSource,
  AppealRequestStatus,
} from '@/types/admin';

export function AdminAppealsView() {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppealRequestStatus>('all');
  const [issueTypeFilter, setIssueTypeFilter] = useState<'all' | AppealIssueType>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | AppealRequestSource>('all');
  const [selectedAppeal, setSelectedAppeal] = useState<AppealRequestItem | null>(null);

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const listQuery = useAdminAppeals({
    headers: authHeader,
    page,
    q: searchText,
    status: statusFilter,
    issueType: issueTypeFilter,
    source: sourceFilter,
  });

  const updateStatusMutation = useUpdateAdminAppealStatus(authHeader);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Admin / Appeals</p>
        <h1 className="mt-3 text-2xl font-bold md:text-3xl">Appeal requests</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Review enforcement appeals submitted from the public form and update case status.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search reference, name, email"
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | AppealRequestStatus)}
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          >
            <option value="all">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">In review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={issueTypeFilter}
            onChange={(event) => setIssueTypeFilter(event.target.value as 'all' | AppealIssueType)}
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          >
            <option value="all">All issue types</option>
            <option value="account_suspension">Account suspension</option>
            <option value="policy_warning">Policy warning</option>
            <option value="payment_restriction">Payment restriction</option>
            <option value="content_violation">Content violation</option>
            <option value="other">Other</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as 'all' | AppealRequestSource)}
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          >
            <option value="all">All sources</option>
            <option value="public-website">Public website</option>
            <option value="authenticated-website">Authenticated website</option>
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              setPage(1);
              listQuery.refetch();
            }}
            className="h-9 rounded-lg border border-border bg-background/80 px-3 text-xs font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
          >
            Apply filters
          </button>
        </div>
      </section>

      {listQuery.isError ? (
        <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
          Failed to load appeals. Please refresh or update your filters.
        </section>
      ) : null}

      <AdminAppealsTable
        appeals={listQuery.data?.data.data ?? []}
        pagination={listQuery.data?.data.pagination ?? null}
        isLoading={listQuery.isFetching}
        onUpdateStatus={async (payload) => {
          try {
            await updateStatusMutation.mutateAsync(payload);
            toast({ title: 'Appeal status updated' });
            await listQuery.refetch();
          } catch (error) {
            toast({
              title: error instanceof Error ? error.message : 'Unable to update appeal status',
              variant: 'destructive',
            });
          }
        }}
        onOpenDetails={(appeal) => setSelectedAppeal(appeal)}
        onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
        onNextPage={() => setPage((current) => current + 1)}
      />

      <AdminAppealDetailDrawer
        key={selectedAppeal?._id ?? 'none'}
        isOpen={Boolean(selectedAppeal)}
        appeal={selectedAppeal}
        isUpdating={updateStatusMutation.isPending}
        onClose={() => setSelectedAppeal(null)}
        onUpdateStatus={async (payload) => {
          try {
            const response = await updateStatusMutation.mutateAsync(payload);
            const updatedAppeal = response.data;

            toast({ title: 'Appeal status updated' });

            setSelectedAppeal((current) =>
              current && current._id === updatedAppeal._id ? updatedAppeal : current
            );

            await listQuery.refetch();
          } catch (error) {
            toast({
              title: error instanceof Error ? error.message : 'Unable to update appeal status',
              variant: 'destructive',
            });
          }
        }}
      />
    </div>
  );
}
