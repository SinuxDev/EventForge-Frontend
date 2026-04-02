import { useQuery } from '@tanstack/react-query';
import { listMyEvents } from '@/lib/api/events';
import type { EventEntity, EventStatus } from '@/types/event';

export type OrganizerEventsView = 'upcoming' | 'all' | 'past';

export interface OrganizerEventsFilters {
  view: OrganizerEventsView;
  status: 'all' | EventStatus;
  query: string;
}

function sortByStartDateDesc(events: EventEntity[]): EventEntity[] {
  return [...events].sort(
    (a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime()
  );
}

function applyClientFilters(events: EventEntity[], filters: OrganizerEventsFilters): EventEntity[] {
  const now = Date.now();
  const normalizedQuery = filters.query.trim().toLowerCase();

  return sortByStartDateDesc(events).filter((event) => {
    const startAt = new Date(event.startDateTime).getTime();

    if (filters.view === 'upcoming' && startAt < now) {
      return false;
    }

    if (filters.view === 'past' && startAt >= now) {
      return false;
    }

    if (filters.status !== 'all' && event.status !== filters.status) {
      return false;
    }

    if (normalizedQuery) {
      const haystack = [event.title, event.shortSummary, event.category].join(' ').toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

export function useOrganizerEvents(accessToken?: string, filters?: OrganizerEventsFilters) {
  const resolvedFilters: OrganizerEventsFilters = filters ?? {
    view: 'all',
    status: 'all',
    query: '',
  };

  return useQuery({
    queryKey: ['organizer-events', resolvedFilters],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        return {
          data: [] as EventEntity[],
          filtered: [] as EventEntity[],
        };
      }

      const response = await listMyEvents(accessToken, { page: 1, limit: 100 });
      const data = response.data;

      return {
        data,
        filtered: applyClientFilters(data, resolvedFilters),
      };
    },
  });
}
