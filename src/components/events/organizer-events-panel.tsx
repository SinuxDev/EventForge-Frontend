'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  CalendarRange,
  CircleDot,
  Eye,
  FilePenLine,
  Megaphone,
  Plus,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrganizerEvents, type OrganizerEventsView } from '@/hooks/use-organizer-events';
import { toast } from '@/hooks/use-toast';
import { publishEvent } from '@/lib/api/events';
import { toPublicMediaUrl } from '@/lib/media-url';
import type { EventEntity, EventStatus } from '@/types/event';

type StatusFilter = 'all' | EventStatus;

const VIEW_OPTIONS: Array<{ value: OrganizerEventsView; label: string }> = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'all', label: 'All' },
  { value: 'past', label: 'Past' },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getStatusChipClass(status: EventStatus): string {
  if (status === 'published') {
    return 'border-primary/35 bg-primary/12 text-primary';
  }

  if (status === 'draft') {
    return 'border-border bg-muted/60 text-foreground';
  }

  return 'border-destructive/35 bg-destructive/12 text-destructive';
}

function formatEventDate(value: string, timezone: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);
}

function getLocationLabel(event: EventEntity): string {
  if (event.attendanceMode === 'online') {
    return 'Online';
  }

  if (event.attendanceMode === 'hybrid') {
    return event.venueName ? `${event.venueName} + Online` : 'Hybrid';
  }

  return event.venueName || event.city || 'In-person';
}

export function OrganizerEventsPanel() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [view, setView] = useState<OrganizerEventsView>('upcoming');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [nowDate] = useState(() => new Date());

  const eventsQuery = useOrganizerEvents(session?.accessToken, {
    view,
    status,
    query: search,
  });

  const publishMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!session?.accessToken) {
        throw new Error('Session expired, please sign in again');
      }

      return publishEvent(eventId, session.accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event published successfully' });
    },
    onError: (error) => {
      toast({
        title: error instanceof Error ? error.message : 'Unable to publish event',
        variant: 'destructive',
      });
    },
  });

  const metrics = useMemo(() => {
    const all = eventsQuery.data?.data ?? [];
    const now = nowDate.getTime();

    return {
      total: all.length,
      draft: all.filter((event) => event.status === 'draft').length,
      published: all.filter((event) => event.status === 'published').length,
      upcoming: all.filter((event) => new Date(event.startDateTime).getTime() >= now).length,
    };
  }, [eventsQuery.data?.data, nowDate]);

  const filteredEvents = eventsQuery.data?.filtered ?? [];

  const clearFilters = () => {
    setView('upcoming');
    setStatus('all');
    setSearch('');
  };

  return (
    <section className="w-full space-y-6">
      <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Organizer events
            </p>
            <h1 className="mt-3 text-3xl font-bold">My events</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Track your created events, publish drafts, and jump to edits fast.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/events/new"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary/45 bg-primary/16 px-4 text-sm font-semibold text-primary transition hover:border-primary/65 hover:bg-primary/24"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
              Upcoming default
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Total events</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{metrics.total}</p>
        </article>
        <article className="rounded-xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Draft</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{metrics.draft}</p>
        </article>
        <article className="rounded-xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Published</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{metrics.published}</p>
        </article>
        <article className="rounded-xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Upcoming</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{metrics.upcoming}</p>
        </article>
      </div>

      <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, summary, category"
              className="h-11 w-full rounded-xl border border-input bg-background/85 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-ring"
            />
          </label>

          <Select value={view} onValueChange={(value) => setView(value as OrganizerEventsView)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
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
          {eventsQuery.isLoading ? (
            <div className="rounded-xl border border-border bg-muted/35 p-5 text-sm text-muted-foreground">
              Loading your events...
            </div>
          ) : eventsQuery.isError ? (
            <div className="rounded-xl border border-destructive/35 bg-destructive/10 p-5 text-sm text-destructive">
              Unable to load events. Please retry.
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/35 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                {metrics.total === 0
                  ? 'No events created yet. Create your first event to get started.'
                  : 'No events match the active filters.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Link
                  href="/events/new"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/45 bg-primary/16 px-4 text-sm font-semibold text-primary"
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </Link>
                {metrics.total > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 border-border bg-background/80 text-foreground"
                    onClick={clearFilters}
                  >
                    Reset filters
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredEvents.map((event) => {
                const isPublishing =
                  publishMutation.isPending && publishMutation.variables === event._id;
                const seats = event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

                return (
                  <article
                    key={event._id}
                    className="group overflow-hidden rounded-2xl border border-border bg-card/85 transition hover:border-ring/30"
                  >
                    <div className="relative h-44 border-b border-border bg-muted/35">
                      {event.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={toPublicMediaUrl(event.coverImage)}
                          alt={event.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No cover image
                        </div>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/10 to-transparent dark:from-[#070a11]/90 dark:via-[#070a11]/25" />

                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur ${getStatusChipClass(event.status)}`}
                        >
                          {event.status}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-xs text-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 backdrop-blur dark:border-white/20 dark:bg-black/45 dark:text-white/90">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {formatEventDate(event.startDateTime, event.timezone)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      <div className="space-y-1.5">
                        <h3 className="line-clamp-1 text-lg font-semibold text-foreground">
                          {event.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {event.shortSummary}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-muted-foreground">
                          <CalendarRange className="h-3.5 w-3.5" />
                          {getLocationLabel(event)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-muted-foreground">
                          <CircleDot className="h-3.5 w-3.5" />
                          {seats}/{event.capacity} seats
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                        <Link
                          href={`/dashboard/organizer/events/${event._id}`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/12 px-3 text-sm font-medium text-primary transition hover:border-primary/55 hover:bg-primary/18"
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Link>

                        <Link
                          href={`/events/new?draftId=${event._id}`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background/80 px-3 text-sm font-medium text-foreground transition hover:border-ring/35 hover:bg-muted"
                        >
                          <FilePenLine className="h-4 w-4" />
                          Edit
                        </Link>

                        {event.status === 'draft' ? (
                          <Button
                            type="button"
                            className="h-9 gap-1.5"
                            disabled={isPublishing}
                            onClick={() => publishMutation.mutate(event._id)}
                          >
                            <Megaphone className="h-4 w-4" />
                            {isPublishing ? 'Publishing...' : 'Publish'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
