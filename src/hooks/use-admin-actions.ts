import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminUserRole, updateAdminUserSuspension } from '@/lib/api/admin';
import type { AdminUserRole } from '@/types/admin';

export function useAdminRoleUpdate(headers: { Authorization: string } | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { userId: string; role: AdminUserRole; reason: string }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return updateAdminUserRole(
        payload.userId,
        { role: payload.role, reason: payload.reason },
        headers
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });
}

export function useAdminSuspensionUpdate(headers: { Authorization: string } | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { userId: string; isSuspended: boolean; reason: string }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return updateAdminUserSuspension(
        payload.userId,
        {
          isSuspended: payload.isSuspended,
          reason: payload.reason,
        },
        headers
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });
}
