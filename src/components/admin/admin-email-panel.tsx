import { useState } from 'react';
import type {
  AdminEmailAudienceMode,
  AdminEmailAudienceStatus,
  AdminEmailCampaign,
  AdminEmailDeliveryLog,
  AdminEmailTemplateKey,
  AdminUser,
  AdminUserRole,
  PaginationPayload,
} from '@/types/admin';

interface AdminEmailPanelProps {
  campaigns: AdminEmailCampaign[];
  campaignsPagination: PaginationPayload | null;
  deliveryLogs: AdminEmailDeliveryLog[];
  isLoadingCampaigns: boolean;
  isLoadingDeliveryLogs: boolean;
  selectedCampaignId: string | null;
  onSelectCampaign: (campaignId: string) => void;
  onCampaignsPreviousPage: () => void;
  onCampaignsNextPage: () => void;
  onSendCampaign: (payload: {
    subject: string;
    body: string;
    templateKey: AdminEmailTemplateKey;
    audienceMode: AdminEmailAudienceMode;
    targetRoles: AdminUserRole[];
    targetStatus: AdminEmailAudienceStatus;
    selectedUserIds?: string[];
    reason: string;
  }) => Promise<void>;
  isSendingCampaign: boolean;
  manualSearchQuery: string;
  onManualSearchQueryChange: (value: string) => void;
  manualSearchResults: AdminUser[];
  isSearchingUsers: boolean;
}

const TEMPLATE_PRESETS: Record<
  Exclude<AdminEmailTemplateKey, 'custom'>,
  { subject: string; body: string }
> = {
  policy_warning: {
    subject: 'Important policy warning from EventForge',
    body: 'Hello,\n\nOur team detected activity that may violate EventForge policy. Please review your recent account activity and keep future actions aligned with platform rules.\n\nRegards,\nEventForge Support',
  },
  suspension_notice: {
    subject: 'Your EventForge account has been suspended',
    body: 'Hello,\n\nYour account is currently suspended due to a policy compliance issue. If you believe this is a mistake, please contact support for review.\n\nRegards,\nEventForge Support',
  },
  reinstatement_notice: {
    subject: 'Your EventForge access has been restored',
    body: 'Hello,\n\nYour account access has now been reinstated. Thank you for your cooperation during our review.\n\nRegards,\nEventForge Support',
  },
  policy_update: {
    subject: 'EventForge policy update',
    body: 'Hello,\n\nWe have updated EventForge policies. Please review the latest changes to stay compliant and avoid account disruptions.\n\nRegards,\nEventForge Support',
  },
};

export function AdminEmailPanel({
  campaigns,
  campaignsPagination,
  deliveryLogs,
  isLoadingCampaigns,
  isLoadingDeliveryLogs,
  selectedCampaignId,
  onSelectCampaign,
  onCampaignsPreviousPage,
  onCampaignsNextPage,
  onSendCampaign,
  isSendingCampaign,
  manualSearchQuery,
  onManualSearchQueryChange,
  manualSearchResults,
  isSearchingUsers,
}: AdminEmailPanelProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [reason, setReason] = useState('');
  const [templateKey, setTemplateKey] = useState<AdminEmailTemplateKey>('custom');
  const [audienceMode, setAudienceMode] = useState<AdminEmailAudienceMode>('segment');
  const [targetStatus, setTargetStatus] = useState<AdminEmailAudienceStatus>('all');
  const [targetRoles, setTargetRoles] = useState<AdminUserRole[]>(['attendee', 'organizer']);
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);
  const [showCampaignHistory, setShowCampaignHistory] = useState(false);

  const currentPage = campaignsPagination?.page ?? 1;
  const totalPages = campaignsPagination?.totalPages ?? 1;

  const toggleRole = (role: AdminUserRole) => {
    setTargetRoles((current) => {
      if (current.includes(role)) {
        const next = current.filter((item) => item !== role);
        return next.length > 0 ? next : current;
      }

      return [...current, role];
    });
  };

  const addSelectedUser = (user: AdminUser) => {
    setSelectedUsers((current) => {
      if (current.some((item) => item._id === user._id)) {
        return current;
      }

      return [...current, user];
    });
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((current) => current.filter((item) => item._id !== userId));
  };

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
      <h2 className="text-lg font-semibold text-foreground">Admin email center (SMTP)</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Send policy/compliance communication to attendees, organizers, or all selected roles.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select
          value={audienceMode}
          onChange={(event) => setAudienceMode(event.target.value as AdminEmailAudienceMode)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
        >
          <option value="segment">Segment mode</option>
          <option value="manual">Manual user selection</option>
        </select>

        <select
          value={templateKey}
          onChange={(event) => {
            const next = event.target.value as AdminEmailTemplateKey;
            setTemplateKey(next);

            if (next !== 'custom') {
              const preset = TEMPLATE_PRESETS[next];
              setSubject(preset.subject);
              setBody(preset.body);
            }
          }}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
        >
          <option value="custom">Custom message</option>
          <option value="policy_warning">Policy warning template</option>
          <option value="suspension_notice">Suspension notice template</option>
          <option value="reinstatement_notice">Reinstatement notice template</option>
          <option value="policy_update">Policy update template</option>
        </select>

        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Email subject"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
        />
        {audienceMode === 'segment' ? (
          <select
            value={targetStatus}
            onChange={(event) => setTargetStatus(event.target.value as AdminEmailAudienceStatus)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
          >
            <option value="all">All status</option>
            <option value="active">Active users</option>
            <option value="suspended">Suspended users</option>
          </select>
        ) : null}

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Email body"
          className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none md:col-span-2"
        />
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason (for audit log)"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none md:col-span-2"
        />

        {audienceMode === 'segment' ? (
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Target roles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['attendee', 'organizer', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    targetRoles.includes(role)
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'border-border bg-background/80 text-foreground'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
              Selected users
            </p>
            <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                value={manualSearchQuery}
                onChange={(event) => onManualSearchQueryChange(event.target.value)}
                placeholder="Search users by name or email"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
              />
              <span className="inline-flex h-10 items-center rounded-lg border border-border bg-background/80 px-3 text-xs text-muted-foreground">
                {selectedUsers.length} selected
              </span>
            </div>

            <div className="mt-2 rounded-lg border border-border bg-background/70 p-2">
              {isSearchingUsers ? (
                <p className="text-xs text-muted-foreground">Searching users...</p>
              ) : manualSearchResults.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Type at least 2 characters to search and add users.
                </p>
              ) : (
                <div className="space-y-1">
                  {manualSearchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => addSelectedUser(user)}
                      className="flex w-full items-center justify-between rounded-md border border-transparent px-2 py-1.5 text-left text-xs transition hover:border-border hover:bg-muted"
                    >
                      <span className="text-foreground">{user.name}</span>
                      <span className="text-muted-foreground">{user.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user._id}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1 text-xs text-foreground"
                >
                  {user.name}
                  <button
                    onClick={() => removeSelectedUser(user._id)}
                    className="text-muted-foreground"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={isSendingCampaign}
          onClick={async () => {
            if (audienceMode === 'manual' && selectedUsers.length === 0) {
              return;
            }

            await onSendCampaign({
              subject,
              body,
              templateKey,
              audienceMode,
              targetRoles,
              targetStatus,
              selectedUserIds:
                audienceMode === 'manual' ? selectedUsers.map((user) => user._id) : undefined,
              reason,
            });
            setSubject('');
            setBody('');
            setReason('');
            setTemplateKey('custom');
            setAudienceMode('segment');
            setSelectedUsers([]);
          }}
          className="relative z-20 h-10 cursor-pointer rounded-lg border border-border bg-background/80 px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-ring/40 hover:bg-muted active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
        >
          {isSendingCampaign ? 'Sending campaign...' : 'Send campaign now'}
        </button>

        <button
          type="button"
          onClick={() => setShowCampaignHistory((current) => !current)}
          className="h-10 rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground md:col-span-2"
        >
          {showCampaignHistory ? 'Hide campaign history' : 'View campaign history'}
        </button>
      </div>

      {showCampaignHistory ? (
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">Campaign history</h3>
            <div className="mt-3 space-y-2">
              {isLoadingCampaigns ? (
                <p className="text-sm text-muted-foreground">Loading campaigns...</p>
              ) : campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No campaigns sent yet.</p>
              ) : (
                campaigns.map((campaign) => (
                  <button
                    key={campaign._id}
                    onClick={() => onSelectCampaign(campaign._id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      selectedCampaignId === campaign._id
                        ? 'border-primary/35 bg-primary/10'
                        : 'border-border bg-background/80'
                    }`}
                  >
                    <p className="font-medium text-foreground">{campaign.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {campaign.sentCount}/{campaign.totalRecipients} sent • {campaign.status}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{`Page ${currentPage} of ${totalPages}`}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onCampaignsPreviousPage}
                  disabled={!campaignsPagination?.hasPrevPage || isLoadingCampaigns}
                  className="rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-foreground disabled:opacity-60"
                >
                  Previous
                </button>
                <button
                  onClick={onCampaignsNextPage}
                  disabled={!campaignsPagination?.hasNextPage || isLoadingCampaigns}
                  className="rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-foreground disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">Delivery logs</h3>
            <div className="mt-3 space-y-2">
              {selectedCampaignId ? (
                isLoadingDeliveryLogs ? (
                  <p className="text-sm text-muted-foreground">Loading delivery logs...</p>
                ) : deliveryLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No delivery logs for this campaign.
                  </p>
                ) : (
                  deliveryLogs.map((log) => (
                    <article
                      key={log._id}
                      className="rounded-lg border border-border bg-background/80 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-foreground">{log.recipientEmail}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {log.status}
                        {log.errorMessage ? ` • ${log.errorMessage}` : ''}
                      </p>
                    </article>
                  ))
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a campaign to view delivery logs.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
