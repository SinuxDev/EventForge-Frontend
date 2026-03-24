import { useQuery } from '@tanstack/react-query';
import { listAdminAuditLogs } from '@/lib/api/admin';
import type { AdminAuditAction } from '@/types/admin';

interface UseAdminAuditLogsParams {
  headers: { Authorization: string } | null;
  page: number;
  action: 'all' | AdminAuditAction;
}

export function useAdminAuditLogs({ headers, page, action }: UseAdminAuditLogsParams) {
  return useQuery({
    queryKey: ['admin-audit-logs', page, action],
    enabled: Boolean(headers),
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return listAdminAuditLogs(
        {
          page,
          limit: 8,
          action: action === 'all' ? undefined : action,
        },
        headers
      );
    },
  });
}
