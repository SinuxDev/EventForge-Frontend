'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { OrganizerEventSubnav } from '@/components/events/organizer-event-subnav';
import { toast } from '@/hooks/use-toast';
import { useEventAttendees } from '@/hooks/use-event-checkin';
import type {
  EventAttendeeCheckInFilter,
  EventAttendeeStatusFilter,
} from '@/lib/api/event-checkin';
import { downloadEventAttendeesCsv } from '@/lib/api/event-checkin';

const STATUS_OPTIONS: Array<{ value: EventAttendeeStatusFilter; label: string }> = [
  { value: 'all', label: 'All status' },
  { value: 'registered', label: 'Registered' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'cancelled', label: 'Cancelled' },
];

const CHECK_IN_OPTIONS: Array<{ value: EventAttendeeCheckInFilter; label: string }> = [
  { value: 'all', label: 'All check-in' },
  { value: 'checked_in', label: 'Checked in' },
  { value: 'not_checked_in', label: 'Not checked in' },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function OrganizerEventAttendeesPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [status, setStatus] = useState<EventAttendeeStatusFilter>('all');
  const [checkIn, setCheckIn] = useState<EventAttendeeCheckInFilter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const filters = useMemo(
    () => ({
      status,
      checkIn,
      query,
      page,
      limit: 20,
    }),
    [checkIn, page, query, status]
  );

  const attendeesQuery = useEventAttendees(id, session?.accessToken, filters);

  const clearFilters = () => {
    setStatus('all');
    setCheckIn('all');
    setQuery('');
    setPage(1);
  };

  const handleExportCsv = async () => {
    if (!session?.accessToken) {
      toast({
        title: 'Session expired',
        description: 'Please sign in again to export attendees.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsExporting(true);
      const blob = await downloadEventAttendeesCsv(id, session.accessToken, {
        status,
        checkIn,
        query,
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `event-attendees-${id}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: 'Export started',
        description: 'Your attendees CSV has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unable to export attendees.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const pagination = attendeesQuery.data?.pagination;
  const attendees = attendeesQuery.data?.items ?? [];

  return (
    <DashboardShell requiredRole="organizer">
      <section className="w-full space-y-6">
        <OrganizerEventSubnav eventId={id} active="attendees" />

        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Organizer / Events / Attendees
          </p>
          <h1 className="mt-3 text-3xl font-bold">Attendee management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Filter, search, and monitor check-in state.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/organizer/events/${id}`}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
            >
              Back to event overview
            </Link>
            <Link
              href={`/dashboard/organizer/events/${id}/check-in`}
              className="inline-flex h-9 items-center rounded-lg border border-primary/40 bg-primary/12 px-4 text-sm font-medium text-primary"
            >
              Open check-in
            </Link>
            <button
              type="button"
              onClick={() => void handleExportCsv()}
              disabled={isExporting}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground transition hover:border-ring/35 hover:bg-muted disabled:opacity-60"
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card/80 p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[1.1fr_0.6fr_0.6fr_auto]">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search attendee name or email"
              className="h-10 w-full rounded-xl border border-input bg-background/85 px-3 text-sm text-foreground outline-none transition focus:border-ring"
            />

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as EventAttendeeStatusFilter);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-input bg-background/85 px-3 text-sm text-foreground outline-none transition focus:border-ring"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={checkIn}
              onChange={(event) => {
                setCheckIn(event.target.value as EventAttendeeCheckInFilter);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-input bg-background/85 px-3 text-sm text-foreground outline-none transition focus:border-ring"
            >
              {CHECK_IN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background/80 px-4 text-sm font-medium text-foreground transition hover:border-ring/35 hover:bg-muted"
            >
              Clear
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-muted/35 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Attendee</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Status</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Check-in</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {attendeesQuery.isLoading ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                      Loading attendees...
                    </td>
                  </tr>
                ) : attendeesQuery.isError ? (
                  <tr>
                    <td className="px-3 py-4 text-destructive" colSpan={4}>
                      Unable to load attendees right now.
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                      No attendees match the current filters.
                    </td>
                  </tr>
                ) : (
                  attendees.map((item) => (
                    <tr key={item.rsvpId} className="border-t border-border/70">
                      <td className="px-3 py-3">
                        <p className="font-medium text-foreground">{item.attendee.name}</p>
                        <p className="text-xs text-muted-foreground">{item.attendee.email}</p>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {item.status === 'waitlisted' && item.waitlistPosition
                          ? `Waitlisted #${item.waitlistPosition}`
                          : item.status}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {item.ticket?.isCheckedIn
                          ? `Checked in at ${formatDate(item.ticket.checkedInAt ?? item.joinedAt)}`
                          : 'Not checked in'}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {formatDate(item.joinedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Total attendees: {pagination?.total ?? 0}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!pagination?.hasPrevPage}
                className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">Page {pagination?.page ?? 1}</span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!pagination?.hasNextPage}
                className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </section>
    </DashboardShell>
  );
}
