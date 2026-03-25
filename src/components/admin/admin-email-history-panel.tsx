import type { AdminEmailCampaign, AdminEmailDeliveryLog, PaginationPayload } from '@/types/admin';

interface AdminEmailHistoryPanelProps {
  campaigns: AdminEmailCampaign[];
  campaignsPagination: PaginationPayload | null;
  deliveryLogs: AdminEmailDeliveryLog[];
  isLoadingCampaigns: boolean;
  isLoadingDeliveryLogs: boolean;
  selectedCampaignId: string | null;
  onSelectCampaign: (campaignId: string) => void;
  onCampaignsPreviousPage: () => void;
  onCampaignsNextPage: () => void;
}

const STATUS_TONE: Record<AdminEmailCampaign['status'], string> = {
  queued: 'bg-secondary text-secondary-foreground',
  processing: 'bg-primary/15 text-primary',
  completed: 'bg-primary/20 text-primary',
  failed: 'bg-destructive/15 text-destructive',
};

export function AdminEmailHistoryPanel({
  campaigns,
  campaignsPagination,
  deliveryLogs,
  isLoadingCampaigns,
  isLoadingDeliveryLogs,
  selectedCampaignId,
  onSelectCampaign,
  onCampaignsPreviousPage,
  onCampaignsNextPage,
}: AdminEmailHistoryPanelProps) {
  const currentPage = campaignsPagination?.page ?? 1;
  const totalPages = campaignsPagination?.totalPages ?? 1;
  const activeCampaign = campaigns.find((campaign) => campaign._id === selectedCampaignId) ?? null;

  return (
    <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Campaign stream
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Timeline view</h2>
          </div>
          <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {`Page ${currentPage}/${totalPages}`}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {isLoadingCampaigns ? (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-xl bg-muted" />
              <div className="h-24 animate-pulse rounded-xl bg-muted" />
            </div>
          ) : campaigns.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-background/80 p-4 text-sm text-muted-foreground">
              No campaigns yet. Send your first campaign from Email operations.
            </p>
          ) : (
            campaigns.map((campaign, index) => {
              const progress =
                campaign.totalRecipients === 0
                  ? 0
                  : Math.round((campaign.sentCount / campaign.totalRecipients) * 100);

              return (
                <button
                  key={campaign._id}
                  onClick={() => onSelectCampaign(campaign._id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedCampaignId === campaign._id
                      ? 'border-primary/35 bg-primary/10'
                      : 'border-border bg-background/80 hover:border-ring/35 hover:bg-muted/45'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="max-w-[85%] text-sm font-semibold text-foreground">
                      {campaign.subject}
                    </p>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wide ${STATUS_TONE[campaign.status]}`}
                    >
                      {campaign.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-muted-foreground">
                      #{index + 1 + (currentPage - 1) * 10}
                    </span>
                    <span>•</span>
                    <span>{campaign.sentCount} sent</span>
                    <span>•</span>
                    <span>{campaign.failedCount} failed</span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/60">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Delivery progress {progress}%
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Move between pages to inspect earlier campaigns.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onCampaignsPreviousPage}
              disabled={!campaignsPagination?.hasPrevPage || isLoadingCampaigns}
              className="h-9 rounded-md border border-border bg-background/80 px-3 font-medium text-foreground transition hover:border-ring/35 hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={onCampaignsNextPage}
              disabled={!campaignsPagination?.hasNextPage || isLoadingCampaigns}
              className="h-9 rounded-md border border-border bg-background/80 px-3 font-medium text-foreground transition hover:border-ring/35 hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Delivery inspector
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-foreground">Recipient outcomes</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {activeCampaign
            ? `Inspecting logs for: ${activeCampaign.subject}`
            : 'Select a campaign from the left timeline.'}
        </p>

        <div className="mt-5 space-y-2">
          {selectedCampaignId ? (
            isLoadingDeliveryLogs ? (
              <div className="space-y-2">
                <div className="h-16 animate-pulse rounded-lg bg-muted" />
                <div className="h-16 animate-pulse rounded-lg bg-muted" />
              </div>
            ) : deliveryLogs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-background/80 p-3 text-sm text-muted-foreground">
                No delivery logs found for this campaign.
              </p>
            ) : (
              deliveryLogs.map((log) => (
                <article
                  key={log._id}
                  className="rounded-lg border border-border bg-background/80 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{log.recipientEmail}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        log.status === 'sent'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-destructive/15 text-destructive'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {log.errorMessage ? log.errorMessage : 'Delivered successfully'}
                  </p>
                </article>
              ))
            )
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-background/80 p-3 text-sm text-muted-foreground">
              Choose a campaign in timeline view to inspect delivery details.
            </p>
          )}
        </div>
      </article>
    </section>
  );
}
