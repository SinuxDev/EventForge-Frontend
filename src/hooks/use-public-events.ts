import { useQuery } from '@tanstack/react-query';
import {
  getPublicEventById,
  listPublicEvents,
  type ListPublicEventsOptions,
} from '@/lib/api/events';

export type PublicDatePreset = 'today' | 'weekend' | 'week' | 'month' | 'all';
export type PublicSort = 'soonest' | 'latest';

export interface PublicEventsFilters {
  q: string;
  category: string;
  mode: 'in_person' | 'online' | 'hybrid' | '';
  date: PublicDatePreset;
  sort: PublicSort;
}

function toStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function toEndOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function toIso(value: Date): string {
  return value.toISOString();
}

function getDateRange(preset: PublicDatePreset): { startDateFrom?: string; startDateTo?: string } {
  if (preset === 'all') {
    return {};
  }

  const now = new Date();

  if (preset === 'today') {
    return {
      startDateFrom: toIso(toStartOfDay(now)),
      startDateTo: toIso(toEndOfDay(now)),
    };
  }

  if (preset === 'weekend') {
    const day = now.getDay();
    const distanceToSaturday = (6 - day + 7) % 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + distanceToSaturday);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    return {
      startDateFrom: toIso(toStartOfDay(saturday)),
      startDateTo: toIso(toEndOfDay(sunday)),
    };
  }

  if (preset === 'week') {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      startDateFrom: toIso(toStartOfDay(monday)),
      startDateTo: toIso(toEndOfDay(sunday)),
    };
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDateFrom: toIso(toStartOfDay(monthStart)),
    startDateTo: toIso(toEndOfDay(monthEnd)),
  };
}

function toApiOptions(filters: PublicEventsFilters): Omit<ListPublicEventsOptions, 'page'> {
  const dateRange = getDateRange(filters.date);

  return {
    query: filters.q.trim() || undefined,
    category: filters.category || undefined,
    attendanceMode: filters.mode || undefined,
    sort: filters.sort,
    ...dateRange,
  };
}

export function usePublicEvents(filters: PublicEventsFilters, page: number) {
  return useQuery({
    queryKey: ['public-events', filters, page],
    queryFn: () =>
      listPublicEvents({
        ...toApiOptions(filters),
        page,
        limit: 12,
      }),
  });
}

export function usePublicEvent(eventId: string) {
  return useQuery({
    queryKey: ['public-event', eventId],
    queryFn: () => getPublicEventById(eventId),
    enabled: Boolean(eventId),
  });
}
