import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminEmailPanel } from '@/components/admin/admin-email-panel';
import {
  useAdminEmailCampaigns,
  useAdminEmailDeliveryLogs,
  useAdminEmailRecipientSearch,
  useSendAdminEmailCampaign,
} from '@/hooks/use-admin-email';
import { toast } from '@/hooks/use-toast';
import type {
  AdminEmailAudienceMode,
  AdminEmailAudienceStatus,
  AdminEmailTemplateKey,
  AdminUserRole,
} from '@/types/admin';

export function AdminEmailView() {
  const { data: session } = useSession();
  const [emailCampaignsPage, setEmailCampaignsPage] = useState(1);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [manualSearchQuery, setManualSearchQuery] = useState('');

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const emailCampaignsQuery = useAdminEmailCampaigns(authHeader, emailCampaignsPage);
  const emailDeliveryLogsQuery = useAdminEmailDeliveryLogs(authHeader, selectedCampaignId, 1);
  const recipientSearchQuery = useAdminEmailRecipientSearch(authHeader, manualSearchQuery);
  const sendAdminEmailCampaignMutation = useSendAdminEmailCampaign(authHeader);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Admin / Email center
        </p>
        <h1 className="mt-3 text-2xl font-bold md:text-3xl">Email operations</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Send policy communications by role segment and review delivery outcomes.
        </p>
      </section>

      <AdminEmailPanel
        campaigns={emailCampaignsQuery.data?.data.data ?? []}
        campaignsPagination={emailCampaignsQuery.data?.data.pagination ?? null}
        deliveryLogs={emailDeliveryLogsQuery.data?.data.data ?? []}
        isLoadingCampaigns={emailCampaignsQuery.isFetching}
        isLoadingDeliveryLogs={emailDeliveryLogsQuery.isFetching}
        selectedCampaignId={selectedCampaignId}
        onSelectCampaign={setSelectedCampaignId}
        onCampaignsPreviousPage={() => setEmailCampaignsPage((current) => Math.max(1, current - 1))}
        onCampaignsNextPage={() => setEmailCampaignsPage((current) => current + 1)}
        isSendingCampaign={sendAdminEmailCampaignMutation.isPending}
        manualSearchQuery={manualSearchQuery}
        onManualSearchQueryChange={setManualSearchQuery}
        manualSearchResults={recipientSearchQuery.data?.data.data ?? []}
        isSearchingUsers={recipientSearchQuery.isFetching}
        onSendCampaign={async (payload: {
          subject: string;
          body: string;
          templateKey: AdminEmailTemplateKey;
          audienceMode: AdminEmailAudienceMode;
          targetRoles: AdminUserRole[];
          targetStatus: AdminEmailAudienceStatus;
          selectedUserIds?: string[];
          reason: string;
        }) => {
          if (!payload.reason.trim()) {
            toast({
              title: 'Please enter a reason before sending',
              variant: 'destructive',
            });
            return;
          }

          toast({ title: 'Sending campaign. This can take a moment for multiple recipients.' });

          try {
            await sendAdminEmailCampaignMutation.mutateAsync(payload);
            toast({ title: 'Email campaign sent successfully' });
            await Promise.all([emailCampaignsQuery.refetch(), emailDeliveryLogsQuery.refetch()]);
          } catch (error) {
            toast({
              title: error instanceof Error ? error.message : 'Unable to send email campaign',
              variant: 'destructive',
            });
          }
        }}
      />
    </div>
  );
}
