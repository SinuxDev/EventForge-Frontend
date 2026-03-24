import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listAdminEmailCampaigns,
  listAdminEmailDeliveryLogs,
  listAdminUsers,
  sendAdminEmailCampaign,
} from '@/lib/api/admin';
import type {
  AdminEmailAudienceMode,
  AdminEmailAudienceStatus,
  AdminEmailTemplateKey,
  AdminUserRole,
} from '@/types/admin';

type AuthHeaders = Record<string, string>;

export function useAdminEmailCampaigns(headers: AuthHeaders | null, page: number) {
  return useQuery({
    queryKey: ['admin-email-campaigns', page],
    enabled: Boolean(headers),
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return listAdminEmailCampaigns({ page, limit: 10 }, headers);
    },
  });
}

export function useAdminEmailDeliveryLogs(
  headers: AuthHeaders | null,
  campaignId: string | null,
  page: number
) {
  return useQuery({
    queryKey: ['admin-email-delivery-logs', campaignId, page],
    enabled: Boolean(headers && campaignId),
    queryFn: async () => {
      if (!headers || !campaignId) {
        throw new Error('Campaign is required');
      }

      return listAdminEmailDeliveryLogs(campaignId, { page, limit: 10 }, headers);
    },
  });
}

export function useSendAdminEmailCampaign(headers: AuthHeaders | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      subject: string;
      body: string;
      templateKey: AdminEmailTemplateKey;
      audienceMode: AdminEmailAudienceMode;
      targetRoles: AdminUserRole[];
      targetStatus: AdminEmailAudienceStatus;
      selectedUserIds?: string[];
      reason: string;
    }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return sendAdminEmailCampaign(payload, headers);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-email-campaigns'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });
}

export function useAdminEmailRecipientSearch(headers: AuthHeaders | null, query: string) {
  return useQuery({
    queryKey: ['admin-email-recipient-search', query],
    enabled: Boolean(headers && query.trim().length >= 2),
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return listAdminUsers(
        {
          page: 1,
          limit: 10,
          q: query.trim(),
        },
        headers
      );
    },
  });
}
