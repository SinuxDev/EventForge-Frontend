import type {
  AppealIssueType,
  AppealRequestItem,
  AppealRequestStatus,
  PaginationPayload,
} from '@/types/admin';

interface AdminAppealsTableProps {
  appeals: AppealRequestItem[];
  pagination: PaginationPayload | null;
  isLoading: boolean;
  onUpdateStatus: (payload: { id: string; status: AppealRequestStatus }) => Promise<void>;
  onOpenDetails: (appeal: AppealRequestItem) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

function formatIssueType(issueType: AppealIssueType) {
  if (issueType === 'account_suspension') return 'Account suspension';
  if (issueType === 'policy_warning') return 'Policy warning';
  if (issueType === 'payment_restriction') return 'Payment restriction';
  if (issueType === 'content_violation') return 'Content violation';
  return 'Other';
}

export function AdminAppealsTable({
  appeals,
  pagination,
  isLoading,
  onUpdateStatus,
  onOpenDetails,
  onPreviousPage,
  onNextPage,
}: AdminAppealsTableProps) {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Appeal queue</h2>
          <p className="text-sm text-muted-foreground">
            Review submitted appeals and progress status updates.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading appeals...</p>
        ) : appeals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appeals found.</p>
        ) : (
          appeals.map((appeal) => (
            <article
              key={appeal._id}
              className="rounded-xl border border-border bg-background/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{appeal.referenceCode}</p>
                  <p className="text-xs text-muted-foreground">
                    {appeal.fullName} - {appeal.workEmail}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatIssueType(appeal.issueType)} - {appeal.source}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {appeal.whatHappened}
              </p>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <select
                  value={appeal.status}
                  onChange={(event) => {
                    onUpdateStatus({
                      id: appeal._id,
                      status: event.target.value as AppealRequestStatus,
                    }).catch(() => undefined);
                  }}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none"
                >
                  <option value="submitted">Submitted</option>
                  <option value="in_review">In review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <p className="rounded-lg border border-border bg-background/80 px-3 py-2 text-xs text-muted-foreground md:col-span-2">
                  Account: {appeal.accountEmail}
                </p>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => onOpenDetails(appeal)}
                  className="rounded-md border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
                >
                  View details
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
