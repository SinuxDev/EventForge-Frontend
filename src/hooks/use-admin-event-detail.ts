import { useQuery } from '@tanstack/react-query';
import { getAdminEventById } from '@/lib/api/admin';

type AuthHeaders = Record<string, string>;

interface UseAdminEventDetailParams {
  headers: AuthHeaders | null;
  eventId: string;
}

export function useAdminEventDetail({ headers, eventId }: UseAdminEventDetailParams) {
  return useQuery({
    queryKey: ['admin-event-detail', eventId],
    enabled: Boolean(headers) && Boolean(eventId),
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return getAdminEventById(eventId, headers);
    },
  });
}
