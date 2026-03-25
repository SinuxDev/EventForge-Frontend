import { useQuery } from '@tanstack/react-query';
import { getAdminOverviewCharts } from '@/lib/api/admin';
import type { AdminOverviewChartRange } from '@/types/admin';

type AuthHeaders = Record<string, string>;

export function useAdminOverviewCharts(
  headers: AuthHeaders | null,
  range: AdminOverviewChartRange
) {
  return useQuery({
    queryKey: ['admin-overview-charts', range],
    enabled: Boolean(headers),
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return getAdminOverviewCharts({ range }, headers);
    },
  });
}
