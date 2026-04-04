import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listAdminEvents } from '@/lib/api/admin';

type AuthHeaders = Record<string, string>;

interface AdminEventsFilters {
  q: string;
  organizer: string;
  organizerId: string;
  status: 'all' | 'draft' | 'published' | 'cancelled';
  startDateFrom: string;
  startDateTo: string;
  sort: 'start_desc' | 'start_asc' | 'created_desc';
}

interface UseAdminEventsParams {
  headers: AuthHeaders | null;
  page: number;
  filters: AdminEventsFilters;
}

export function useAdminEvents({ headers, page, filters }: UseAdminEventsParams) {
  return useQuery({
    queryKey: ['admin-events', page, filters],
    enabled: Boolean(headers),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return listAdminEvents(
        {
          page,
          limit: 10,
          q: filters.q,
          organizer: filters.organizer,
          organizerId: filters.organizerId || undefined,
          status: filters.status === 'all' ? undefined : filters.status,
          startDateFrom: filters.startDateFrom || undefined,
          startDateTo: filters.startDateTo || undefined,
          sort: filters.sort,
        },
        headers
      );
    },
  });
}
