import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminEventsTable } from '@/components/admin/admin-events-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminEvents } from '@/hooks/use-admin-events';
import { useAdminOrganizers } from '@/hooks/use-admin-organizers';

export function AdminEventsView() {
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState('');
  const [organizerQuery, setOrganizerQuery] = useState('');
  const [selectedOrganizerId, setSelectedOrganizerId] = useState('');
  const [isOrganizerMenuOpen, setIsOrganizerMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'cancelled'>(
    'all'
  );
  const [sortFilter, setSortFilter] = useState<'start_desc' | 'start_asc' | 'created_desc'>(
    'start_desc'
  );
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  const [eventsPage, setEventsPage] = useState(1);

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const organizersQuery = useAdminOrganizers({
    headers: authHeader,
    q: organizerQuery,
  });
  const organizers = organizersQuery.data?.data.data ?? [];
  const organizerOptions = organizers.map((organizer) => ({
    id: organizer._id,
    label: `${organizer.name} (${organizer.email})`,
  }));
  const normalizedOrganizerQuery = organizerQuery.trim().toLowerCase();
  const visibleOrganizerOptions = organizerOptions.filter((option) =>
    option.label.toLowerCase().includes(normalizedOrganizerQuery)
  );

  const filteredEventsQuery = useAdminEvents({
    headers: authHeader,
    page: eventsPage,
    filters: {
      q: searchText,
      organizer: selectedOrganizerId ? '' : organizerQuery,
      organizerId: selectedOrganizerId,
      status: statusFilter,
      startDateFrom,
      startDateTo,
      sort: sortFilter,
    },
  });

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Admin / Events</p>
        <h1 className="mt-3 text-2xl font-bold md:text-3xl">Events oversight</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Monitor platform events with date and organizer filters for faster governance checks.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search title or category"
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />

          <div className="relative">
            <input
              value={organizerQuery}
              onChange={(event) => {
                setOrganizerQuery(event.target.value);
                setSelectedOrganizerId('');
                setIsOrganizerMenuOpen(true);
              }}
              onFocus={() => setIsOrganizerMenuOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setIsOrganizerMenuOpen(false), 120);
              }}
              placeholder="Type or select organizer"
              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />

            {isOrganizerMenuOpen ? (
              <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-xl">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSelectedOrganizerId('');
                    setOrganizerQuery('');
                    setIsOrganizerMenuOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted"
                >
                  All organizers
                </button>

                {visibleOrganizerOptions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">No organizers found.</p>
                ) : (
                  visibleOrganizerOptions.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setSelectedOrganizerId(option.id);
                        setOrganizerQuery(option.label);
                        setIsOrganizerMenuOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted"
                    >
                      {option.label}
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as 'all' | 'draft' | 'published' | 'cancelled')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortFilter}
            onValueChange={(value) =>
              setSortFilter(value as 'start_desc' | 'start_asc' | 'created_desc')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start_desc">Start date (latest)</SelectItem>
              <SelectItem value="start_asc">Start date (soonest)</SelectItem>
              <SelectItem value="created_desc">Created (latest)</SelectItem>
            </SelectContent>
          </Select>

          <input
            value={startDateFrom}
            onChange={(event) => setStartDateFrom(event.target.value)}
            type="date"
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />

          <input
            value={startDateTo}
            onChange={(event) => setStartDateTo(event.target.value)}
            type="date"
            className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEventsPage(1);
              filteredEventsQuery.refetch();
            }}
            className="h-10 rounded-xl border border-border bg-background/80 px-4 text-sm font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
          >
            Apply filters
          </button>

          <button
            onClick={() => {
              setSearchText('');
              setOrganizerQuery('');
              setSelectedOrganizerId('');
              setStatusFilter('all');
              setSortFilter('start_desc');
              setStartDateFrom('');
              setStartDateTo('');
              setEventsPage(1);
            }}
            className="h-10 rounded-xl border border-border bg-background/80 px-4 text-sm font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
          >
            Clear filters
          </button>
        </div>

        <AdminEventsTable
          events={filteredEventsQuery.data?.data.data ?? []}
          pagination={filteredEventsQuery.data?.data.pagination ?? null}
          isLoading={filteredEventsQuery.isFetching}
          onPreviousPage={() => setEventsPage((current) => Math.max(1, current - 1))}
          onNextPage={() => setEventsPage((current) => current + 1)}
        />
      </section>
    </div>
  );
}
