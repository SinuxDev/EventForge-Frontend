import Link from 'next/link';
import type { AdminEventItem, PaginationPayload } from '@/types/admin';

function formatDateTime(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getStatusClasses(status: AdminEventItem['status']): string {
  if (status === 'published') {
    return 'border border-primary/35 bg-primary/10 text-primary';
  }

  if (status === 'cancelled') {
    return 'border border-destructive/35 bg-destructive/10 text-destructive';
  }

  return 'border border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400';
}

interface AdminEventsTableProps {
  events: AdminEventItem[];
  pagination: PaginationPayload | null;
  isLoading: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function AdminEventsTable({
  events,
  pagination,
  isLoading,
  onPreviousPage,
  onNextPage,
}: AdminEventsTableProps) {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card/70">
        <table className="w-full min-w-240 border-collapse">
          <thead className="bg-muted/45 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Organizer</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={6}>
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={6}>
                  No events found for the selected filters.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event._id} className="border-t border-border text-sm text-foreground">
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/dashboard/admin/events/${event._id}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {event.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{event.category}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-foreground">{event.organizerName}</p>
                    <p className="text-xs text-muted-foreground">{event.contactEmail}</p>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {formatDateTime(event.startDateTime)}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {formatDateTime(event.endDateTime)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {formatDateTime(event.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
    </>
  );
}
