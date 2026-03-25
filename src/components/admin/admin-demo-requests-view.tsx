import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminDemoRequestAnalytics } from '@/components/admin/admin-demo-request-analytics';
import { AdminDemoRequestsTable } from '@/components/admin/admin-demo-requests-table';
import {
  useAdminDemoRequestAnalytics,
  useAdminDemoRequests,
} from '@/hooks/use-admin-demo-requests';
import {
  useUpdateAdminDemoRequestFollowUp,
  useUpdateAdminDemoRequestStatus,
} from '@/hooks/use-admin-demo-request-actions';
import { toast } from '@/hooks/use-toast';
import type { DemoRequestPriority, DemoRequestSource, DemoRequestStatus } from '@/types/admin';

export function AdminDemoRequestsView() {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DemoRequestStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | DemoRequestPriority>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | DemoRequestSource>('all');
  const [slaFilter, setSlaFilter] = useState<'all' | 'on_time' | 'overdue'>('all');

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const analyticsQuery = useAdminDemoRequestAnalytics(authHeader, range);
  const listQuery = useAdminDemoRequests({
    headers: authHeader,
    page,
    q: searchText,
    status: statusFilter,
    priority: priorityFilter,
    source: sourceFilter,
    sla: slaFilter,
  });

  const updateStatusMutation = useUpdateAdminDemoRequestStatus(authHeader);
  const updateFollowUpMutation = useUpdateAdminDemoRequestFollowUp(authHeader);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Admin / Demo requests
            </p>
            <h1 className="mt-3 text-2xl font-bold md:text-3xl">Demo pipeline</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Qualify inbound demo leads, enforce response SLA, and progress lifecycle outcomes.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-background/80 p-1">
            {(['7d', '30d', '90d'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setRange(item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  range === item
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search name, email, company"
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | DemoRequestStatus)}
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as 'all' | DemoRequestPriority)
            }
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as 'all' | DemoRequestSource)}
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          >
            <option value="all">All sources</option>
            <option value="public-website">Public website</option>
            <option value="authenticated-website">Authenticated website</option>
          </select>

          <select
            value={slaFilter}
            onChange={(event) => setSlaFilter(event.target.value as 'all' | 'on_time' | 'overdue')}
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          >
            <option value="all">All SLA</option>
            <option value="on_time">On-time</option>
            <option value="overdue">Overdue</option>
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
          Failed to load demo requests. Please refresh or update your filters.
        </section>
      ) : null}

      {analyticsQuery.isError ? (
        <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
          Failed to load demo analytics for this range.
        </section>
      ) : null}

      <AdminDemoRequestAnalytics
        analytics={analyticsQuery.data?.data ?? null}
        isLoading={analyticsQuery.isFetching}
      />

      <AdminDemoRequestsTable
        requests={listQuery.data?.data.data ?? []}
        pagination={listQuery.data?.data.pagination ?? null}
        isLoading={listQuery.isFetching}
        onUpdateStatus={async (payload) => {
          try {
            await updateStatusMutation.mutateAsync(payload);
            toast({ title: 'Demo status updated' });
            await Promise.all([listQuery.refetch(), analyticsQuery.refetch()]);
          } catch (error) {
            toast({
              title: error instanceof Error ? error.message : 'Unable to update demo status',
              variant: 'destructive',
            });
          }
        }}
        onUpdateFollowUp={async (payload) => {
          try {
            await updateFollowUpMutation.mutateAsync(payload);
            toast({ title: 'Demo follow-up updated' });
            await Promise.all([listQuery.refetch(), analyticsQuery.refetch()]);
          } catch (error) {
            toast({
              title: error instanceof Error ? error.message : 'Unable to update follow-up',
              variant: 'destructive',
            });
          }
        }}
        onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
        onNextPage={() => setPage((current) => current + 1)}
      />
    </div>
  );
}
