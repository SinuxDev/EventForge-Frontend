import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminAppealRequestStatus } from '@/lib/api/admin';
import type { AppealRequestStatus } from '@/types/admin';

type AuthHeaders = Record<string, string>;

export function useUpdateAdminAppealStatus(headers: AuthHeaders | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; status: AppealRequestStatus }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return updateAdminAppealRequestStatus(
        payload.id,
        {
          status: payload.status,
        },
        headers
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-appeals'] });
    },
  });
}
