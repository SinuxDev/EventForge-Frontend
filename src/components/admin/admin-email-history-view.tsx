import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AdminEmailHistoryPanel } from '@/components/admin/admin-email-history-panel';
import { useAdminEmailCampaigns, useAdminEmailDeliveryLogs } from '@/hooks/use-admin-email';

export function AdminEmailHistoryView() {
  const { data: session } = useSession();
  const [emailCampaignsPage, setEmailCampaignsPage] = useState(1);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

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

  const campaigns = emailCampaignsQuery.data?.data.data ?? [];
  const totalCampaigns = emailCampaignsQuery.data?.data.pagination.total ?? 0;
  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0);
  const totalRecipients = campaigns.reduce((sum, campaign) => sum + campaign.totalRecipients, 0);
  const totalFailed = campaigns.reduce((sum, campaign) => sum + campaign.failedCount, 0);
  const sendRate = totalRecipients === 0 ? 0 : Math.round((totalSent / totalRecipients) * 100);
  const failRate = totalRecipients === 0 ? 0 : Math.round((totalFailed / totalRecipients) * 100);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Admin / Email center
        </p>
        <h1 className="mt-3 text-2xl font-bold md:text-3xl">Campaign history</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Track send outcomes and inspect campaign-level delivery performance.
        </p>

        <div className="mt-5 inline-flex rounded-full border border-border bg-background/80 p-1">
          <Link
            href="/dashboard/admin/email"
            className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
          >
            Operations
          </Link>
          <Link
            href="/dashboard/admin/email/history"
            className="rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary"
          >
            Campaign history
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-border bg-background/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Campaigns</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{totalCampaigns}</p>
          </article>
          <article className="rounded-xl border border-border bg-background/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Send rate</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{sendRate}%</p>
          </article>
          <article className="rounded-xl border border-border bg-background/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fail rate</p>
            <p className="mt-1 text-2xl font-semibold text-destructive">{failRate}%</p>
          </article>
          <article className="rounded-xl border border-border bg-background/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Delivered</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{totalSent}</p>
          </article>
        </div>
      </section>

      <AdminEmailHistoryPanel
        campaigns={campaigns}
        campaignsPagination={emailCampaignsQuery.data?.data.pagination ?? null}
        deliveryLogs={emailDeliveryLogsQuery.data?.data.data ?? []}
        isLoadingCampaigns={emailCampaignsQuery.isFetching}
        isLoadingDeliveryLogs={emailDeliveryLogsQuery.isFetching}
        selectedCampaignId={selectedCampaignId}
        onSelectCampaign={setSelectedCampaignId}
        onCampaignsPreviousPage={() => setEmailCampaignsPage((current) => Math.max(1, current - 1))}
        onCampaignsNextPage={() => setEmailCampaignsPage((current) => current + 1)}
      />
    </div>
  );
}
