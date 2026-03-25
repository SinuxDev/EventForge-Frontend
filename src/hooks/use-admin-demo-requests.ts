import { useQuery } from '@tanstack/react-query';
import { getAdminDemoRequestAnalytics, listAdminDemoRequests } from '@/lib/api/admin';
import type { DemoRequestPriority, DemoRequestSource, DemoRequestStatus } from '@/types/admin';

type AuthHeaders = Record<string, string>;

interface UseAdminDemoRequestsParams {
  headers: AuthHeaders | null;
  page: number;
  q: string;
  status: 'all' | DemoRequestStatus;
  priority: 'all' | DemoRequestPriority;
  source: 'all' | DemoRequestSource;
  sla: 'all' | 'on_time' | 'overdue';
}

export function useAdminDemoRequests(params: UseAdminDemoRequestsParams) {
  return useQuery({
    queryKey: [
      'admin-demo-requests',
      params.page,
      params.q,
      params.status,
      params.priority,
      params.source,
      params.sla,
    ],
    enabled: Boolean(params.headers),
    queryFn: async () => {
      if (!params.headers) {
        throw new Error('Unauthorized');
      }

      return listAdminDemoRequests(
        {
          page: params.page,
          limit: 10,
          q: params.q,
          status: params.status === 'all' ? undefined : params.status,
          priority: params.priority === 'all' ? undefined : params.priority,
          source: params.source === 'all' ? undefined : params.source,
          sla: params.sla,
        },
        params.headers
      );
    },
  });
}

export function useAdminDemoRequestAnalytics(
  headers: AuthHeaders | null,
  range: '7d' | '30d' | '90d'
) {
  return useQuery({
    queryKey: ['admin-demo-requests-analytics', range],
    enabled: Boolean(headers),
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return getAdminDemoRequestAnalytics({ range }, headers);
    },
  });
}
