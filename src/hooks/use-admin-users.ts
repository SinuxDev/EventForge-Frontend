import { useQuery } from '@tanstack/react-query';
import { listAdminUsers } from '@/lib/api/admin';
import type { AdminUserRole } from '@/types/admin';

interface AdminUsersFilters {
  q: string;
  role: 'all' | AdminUserRole;
  status: 'all' | 'active' | 'suspended';
}

interface UseAdminUsersParams {
  headers: { Authorization: string } | null;
  page: number;
  filters: AdminUsersFilters;
}

export function useAdminUsers({ headers, page, filters }: UseAdminUsersParams) {
  return useQuery({
    queryKey: ['admin-users', page, filters],
    enabled: Boolean(headers),
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      const isSuspended =
        filters.status === 'all' ? undefined : filters.status === 'suspended' ? true : false;

      return listAdminUsers(
        {
          page,
          limit: 20,
          q: filters.q,
          role: filters.role === 'all' ? undefined : filters.role,
          isSuspended,
        },
        headers
      );
    },
  });
}
