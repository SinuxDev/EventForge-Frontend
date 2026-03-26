import type {
  DemoRequestItem,
  DemoRequestPriority,
  DemoRequestStatus,
  PaginationPayload,
} from '@/types/admin';

interface AdminDemoRequestsTableProps {
  requests: DemoRequestItem[];
  pagination: PaginationPayload | null;
  isLoading: boolean;
  onUpdateStatus: (payload: {
    id: string;
    status: DemoRequestStatus;
    reason: string;
    qualificationNotes?: string;
  }) => Promise<void>;
  onUpdateFollowUp: (payload: {
    id: string;
    reason: string;
    priority?: DemoRequestPriority;
  }) => Promise<void>;
  onOpenReplyDialog: (request: DemoRequestItem) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function AdminDemoRequestsTable({
  requests,
  pagination,
  isLoading,
  onUpdateStatus,
  onUpdateFollowUp,
  onOpenReplyDialog,
  onPreviousPage,
  onNextPage,
}: AdminDemoRequestsTableProps) {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
      <h2 className="text-lg font-semibold text-foreground">Demo requests queue</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Review incoming demo requests and move them through the lifecycle.
      </p>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-border bg-background/70 px-4 py-5 text-sm text-muted-foreground">
            Loading demo requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-border bg-background/70 px-4 py-5 text-sm text-muted-foreground">
            No demo requests found for this filter.
          </div>
        ) : (
          requests.map((request) => (
            <article
              key={request._id}
              className="rounded-xl border border-border bg-background/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{request.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.workEmail} • {request.company}
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {request.status.replace('_', ' ')} • {request.priority}
                </p>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">Use case: {request.useCase}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateStatus({
                      id: request._id,
                      status: 'contacted',
                      reason: 'Initial outreach completed by admin team',
                    })
                  }
                  className="h-8 rounded-md border border-border bg-background/80 px-2.5 text-xs font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
                >
                  Mark contacted
                </button>

                <button
                  onClick={() =>
                    onUpdateStatus({
                      id: request._id,
                      status: 'scheduled',
                      reason: 'Demo session scheduled with prospect',
                    })
                  }
                  className="h-8 rounded-md border border-border bg-background/80 px-2.5 text-xs font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
                >
                  Mark scheduled
                </button>

                <button
                  onClick={() => onOpenReplyDialog(request)}
                  className="h-8 rounded-md border border-primary/40 bg-primary/15 px-2.5 text-xs font-semibold text-primary transition hover:border-primary/60 hover:bg-primary/20"
                >
                  Send reply
                </button>

                <button
                  onClick={() =>
                    onUpdateFollowUp({
                      id: request._id,
                      reason: 'Escalated priority due to high-fit account signals',
                      priority: 'high',
                    })
                  }
                  className="h-8 rounded-md border border-border bg-background/80 px-2.5 text-xs font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
                >
                  Set high priority
                </button>
              </div>
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
