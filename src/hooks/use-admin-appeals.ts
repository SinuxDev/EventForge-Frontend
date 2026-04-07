import { useQuery } from '@tanstack/react-query';
import { listAdminAppealRequests } from '@/lib/api/admin';
import type { AppealIssueType, AppealRequestSource, AppealRequestStatus } from '@/types/admin';

type AuthHeaders = Record<string, string>;

interface UseAdminAppealsParams {
  headers: AuthHeaders | null;
  page: number;
  q: string;
  status: 'all' | AppealRequestStatus;
  issueType: 'all' | AppealIssueType;
  source: 'all' | AppealRequestSource;
}

export function useAdminAppeals(params: UseAdminAppealsParams) {
  return useQuery({
    queryKey: [
      'admin-appeals',
      params.page,
      params.q,
      params.status,
      params.issueType,
      params.source,
    ],
    enabled: Boolean(params.headers),
    queryFn: async () => {
      if (!params.headers) {
        throw new Error('Unauthorized');
      }

      return listAdminAppealRequests(
        {
          page: params.page,
          limit: 10,
          q: params.q,
          status: params.status === 'all' ? undefined : params.status,
          issueType: params.issueType === 'all' ? undefined : params.issueType,
          source: params.source === 'all' ? undefined : params.source,
        },
        params.headers
      );
    },
  });
}
