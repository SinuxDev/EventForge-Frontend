'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { CalendarDays, Compass, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicEventCard } from '@/components/events/public-event-card';
import { PublicEventsFilters } from '@/components/events/public-events-filters';
import { PublicEventsPopularList } from '@/components/events/public-events-popular-list';
import {
  usePublicEvents,
  type PublicDatePreset,
  type PublicEventsFilters as PublicEventsFiltersState,
  type PublicSort,
} from '@/hooks/use-public-events';

const DEFAULT_FILTERS: PublicEventsFiltersState = {
  q: '',
  category: '',
  mode: '',
  date: 'all',
  sort: 'soonest',
};

const DEFAULT_PAGE = 1;

function parseFilters(params: URLSearchParams): PublicEventsFiltersState {
  const mode = params.get('mode');
  const date = params.get('date');
  const sort = params.get('sort');

  return {
    q: params.get('q') || '',
    category: params.get('category') || '',
    mode: mode === 'in_person' || mode === 'online' || mode === 'hybrid' ? mode : '',
    date:
      date === 'today' ||
      date === 'weekend' ||
      date === 'week' ||
      date === 'month' ||
      date === 'all'
        ? (date as PublicDatePreset)
        : DEFAULT_FILTERS.date,
    sort: sort === 'latest' || sort === 'soonest' ? (sort as PublicSort) : DEFAULT_FILTERS.sort,
  };
}

function parsePage(params: URLSearchParams): number {
  const value = Number(params.get('page'));

  if (!Number.isInteger(value) || value < 1) {
    return DEFAULT_PAGE;
  }

  return value;
}

function buildSearchParams(filters: PublicEventsFiltersState): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set('q', filters.q);
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  if (filters.mode) {
    params.set('mode', filters.mode);
  }

  if (filters.date !== DEFAULT_FILTERS.date) {
    params.set('date', filters.date);
  }

  if (filters.sort !== DEFAULT_FILTERS.sort) {
    params.set('sort', filters.sort);
  }

  return params.toString();
}

export function PublicEventsPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const page = useMemo(
    () => parsePage(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const eventsQuery = usePublicEvents(filters, page);

  const pushFilters = (next: PublicEventsFiltersState, nextPage: number = DEFAULT_PAGE) => {
    const query = buildSearchParams(next);
    const params = new URLSearchParams(query);

    if (nextPage > DEFAULT_PAGE) {
      params.set('page', String(nextPage));
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const handleFilterChange = (partial: Partial<PublicEventsFiltersState>) => {
    pushFilters({ ...filters, ...partial });
  };

  const handleClearAll = () => {
    pushFilters(DEFAULT_FILTERS);
  };

  const handlePageChange = (nextPage: number) => {
    pushFilters(filters, nextPage);
  };

  const events = useMemo(() => eventsQuery.data?.data ?? [], [eventsQuery.data?.data]);
  const pagination = eventsQuery.data?.pagination;
  const total = pagination?.total ?? events.length;
  const totalPages = pagination?.totalPages ?? 1;

  const popularEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        const aSeats = a.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
        const bSeats = b.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
        const aRatio = a.capacity > 0 ? aSeats / a.capacity : 0;
        const bRatio = b.capacity > 0 ? bSeats / b.capacity : 0;
        return bRatio - aRatio;
      })
      .slice(0, 6);
  }, [events]);

  return (
    <section className="w-full space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/82 p-6 backdrop-blur md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-18 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-44 w-44 rounded-full bg-accent/12 blur-3xl" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Discover events
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Explore live and upcoming events
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Explore popular events near you, browse by category, and discover communities worth
              joining.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-border bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              {`${total} live results`}
            </span>
            <Link
              href="/events/new"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary/45 bg-primary/16 px-4 text-sm font-semibold text-primary transition hover:border-primary/65 hover:bg-primary/24"
            >
              <Plus className="h-4 w-4" />
              Host event
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2.5 py-1">
            <Compass className="h-3.5 w-3.5" />
            Public by default
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2.5 py-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Curated weekly
          </span>
        </div>
      </div>

      <PublicEventsPopularList events={popularEvents} />

      <PublicEventsFilters
        filters={filters}
        onChange={handleFilterChange}
        onClearAll={handleClearAll}
      />

      <section id="all-events" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">All Events</h2>
          <p className="text-sm text-muted-foreground">{`Page ${page} of ${totalPages} • ${total} total`}</p>
        </div>

        {eventsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-card/75"
              >
                <div className="aspect-video animate-pulse bg-muted/60" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-4/5 animate-pulse rounded bg-muted/60" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted/50" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        ) : eventsQuery.isError ? (
          <div className="rounded-xl border border-destructive/35 bg-destructive/10 p-5 text-sm text-destructive">
            Unable to load events. Please refresh and try again.
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/35 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No events match your current filters. Try broadening your search.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button type="button" variant="outline" onClick={handleClearAll}>
                Reset filters
              </Button>
              <Link
                href="/events/new"
                className="inline-flex h-9 items-center rounded-lg border border-primary/35 bg-primary/12 px-4 text-sm font-medium text-primary"
              >
                Create event
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <PublicEventCard key={event._id} event={event} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 border-border bg-background/80 px-4 text-foreground hover:border-ring/35 hover:bg-muted"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || eventsQuery.isFetching}
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">{`${page} / ${totalPages}`}</span>

                <Button
                  type="button"
                  variant="outline"
                  className="h-10 border-border bg-background/80 px-4 text-foreground hover:border-ring/35 hover:bg-muted"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || eventsQuery.isFetching}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </section>
  );
}
