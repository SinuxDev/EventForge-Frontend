'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useDeferredValue, useMemo, useState } from 'react';
import { CalendarClock, Search, Ticket } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useManagedAttendeeRsvps, useCancelAttendeeRsvp } from '@/hooks/use-attendee-rsvps';
import { toast } from '@/hooks/use-toast';
import type { ManagedRsvpSort, ManagedRsvpTab, RsvpStatus } from '@/lib/api/rsvps';

const TAB_OPTIONS: Array<{ value: ManagedRsvpTab; label: string }> = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];

const SORT_OPTIONS: Array<{ value: ManagedRsvpSort; label: string }> = [
  { value: 'eventStartAsc', label: 'Soonest first' },
  { value: 'eventStartDesc', label: 'Latest first' },
  { value: 'createdDesc', label: 'Recently added' },
];

function formatEventDate(value: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(value));
}

function getStatusClass(status: RsvpStatus): string {
  if (status === 'registered') {
    return 'border-primary/35 bg-primary/12 text-primary';
  }

  if (status === 'waitlisted') {
    return 'border-amber-500/30 bg-amber-500/12 text-amber-300';
  }

  return 'border-destructive/35 bg-destructive/12 text-destructive';
}

export default function AttendeeMyEventsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<ManagedRsvpTab>('upcoming');
  const [sort, setSort] = useState<ManagedRsvpSort>('eventStartAsc');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDeferredValue(searchInput.trim());
  const limit = 10;

  const managedRsvpsQuery = useManagedAttendeeRsvps(session?.accessToken, {
    tab,
    search,
    page,
    limit,
    sort,
  });
  const cancelRsvpMutation = useCancelAttendeeRsvp(session?.accessToken);

  const counts = managedRsvpsQuery.data?.counts;

  const totalLabel = useMemo(() => {
    if (!managedRsvpsQuery.data) {
      return '...';
    }

    return String(managedRsvpsQuery.data.pagination.total);
  }, [managedRsvpsQuery.data]);

  const handleTabChange = (nextTab: ManagedRsvpTab) => {
    setTab(nextTab);
    setPage(1);
  };

  const handleSortChange = (nextSort: ManagedRsvpSort) => {
    setSort(nextSort);
    setPage(1);
  };

  const clearFilters = () => {
    setTab('upcoming');
    setSort('eventStartAsc');
    setSearchInput('');
    setPage(1);
  };

  const handleCancelRsvp = async (rsvpId: string) => {
    try {
      const result = await cancelRsvpMutation.mutateAsync(rsvpId);
      toast({
        title: 'RSVP cancelled',
        description: result.promotedRsvpId
          ? 'Your spot was released and a waitlisted attendee was promoted.'
          : 'Your registration has been cancelled.',
      });
    } catch (error) {
      toast({
        title: 'Unable to cancel RSVP',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardShell requiredRole="attendee">
      <section className="w-full space-y-6">
        <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Attendee events
          </p>
          <h1 className="mt-3 text-3xl font-bold">My events</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Preview all your registrations and manage tickets, waitlists, and cancellations.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Results</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{totalLabel}</p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Upcoming</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{counts?.upcoming ?? 0}</p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Waitlisted</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{counts?.waitlisted ?? 0}</p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Past</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{counts?.past ?? 0}</p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Cancelled</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{counts?.cancelled ?? 0}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
          <div className="grid gap-3 md:grid-cols-[1.1fr_0.75fr_0.75fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by event title"
                className="h-11 w-full rounded-xl border border-input bg-background/85 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-ring"
              />
            </label>

            <Select value={tab} onValueChange={(value) => handleTabChange(value as ManagedRsvpTab)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAB_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value) => handleSortChange(value as ManagedRsvpSort)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              className="h-11 border-border bg-background/80 text-foreground hover:border-ring/35 hover:bg-muted"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {managedRsvpsQuery.isLoading ? (
              <div className="rounded-xl border border-border bg-muted/35 p-5 text-sm text-muted-foreground">
                Loading your events...
              </div>
            ) : managedRsvpsQuery.isError || !managedRsvpsQuery.data ? (
              <div className="rounded-xl border border-destructive/35 bg-destructive/10 p-5 text-sm text-destructive">
                Unable to load your events right now.
              </div>
            ) : managedRsvpsQuery.data.items.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/35 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No events match the active filters. Try another tab or clear search.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Link
                    href="/events"
                    className="inline-flex h-10 items-center rounded-lg border border-primary/45 bg-primary/16 px-4 text-sm font-semibold text-primary"
                  >
                    Discover events
                  </Link>
                  <Button type="button" variant="outline" className="h-10" onClick={clearFilters}>
                    Reset filters
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {managedRsvpsQuery.data.items.map((item) => (
                    <li
                      key={item.rsvpId}
                      className="rounded-xl border border-border bg-background/70 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-foreground">
                              {item.event.title}
                            </p>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(item.status)}`}
                            >
                              {item.status}
                              {item.status === 'waitlisted' && item.waitlistPosition
                                ? ` #${item.waitlistPosition}`
                                : ''}
                            </span>
                          </div>

                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {formatEventDate(item.event.startDateTime, item.event.timezone)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.event.venueName || item.event.city || 'Online / TBA'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/events/${item.event.eventId}`}
                            className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-3 text-xs font-medium text-foreground transition hover:border-ring/35 hover:bg-muted"
                          >
                            View event
                          </Link>

                          {item.actions.canViewTicket ? (
                            <Link
                              href={`/tickets/${item.rsvpId}`}
                              className="inline-flex h-9 items-center gap-1 rounded-lg border border-primary/35 bg-primary/12 px-3 text-xs font-medium text-primary transition hover:border-primary/55 hover:bg-primary/18"
                            >
                              <Ticket className="h-3.5 w-3.5" />
                              View ticket
                            </Link>
                          ) : null}

                          {item.actions.canCancel ? (
                            <button
                              type="button"
                              onClick={() => void handleCancelRsvp(item.rsvpId)}
                              disabled={cancelRsvpMutation.isPending}
                              className="inline-flex h-9 items-center rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive transition hover:bg-destructive/15 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {item.status === 'waitlisted' ? 'Leave waitlist' : 'Cancel RSVP'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    Page {managedRsvpsQuery.data.pagination.page} of{' '}
                    {Math.max(managedRsvpsQuery.data.pagination.totalPages, 1)}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-3"
                      onClick={() => setPage((current) => Math.max(current - 1, 1))}
                      disabled={!managedRsvpsQuery.data.pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-3"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={!managedRsvpsQuery.data.pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </section>
    </DashboardShell>
  );
}
