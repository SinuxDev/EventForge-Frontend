import { useQuery } from '@tanstack/react-query';
import { listAdminUsers } from '@/lib/api/admin';

type AuthHeaders = Record<string, string>;

interface UseAdminOrganizersParams {
  headers: AuthHeaders | null;
  q: string;
}

export function useAdminOrganizers({ headers, q }: UseAdminOrganizersParams) {
  return useQuery({
    queryKey: ['admin-organizers', q],
    enabled: Boolean(headers),
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return listAdminUsers(
        {
          page: 1,
          limit: 50,
          q,
          role: 'organizer',
        },
        headers
      );
    },
  });
}
