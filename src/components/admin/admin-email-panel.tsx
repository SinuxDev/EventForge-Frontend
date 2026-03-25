import { useMemo, useState } from 'react';
import type {
  AdminEmailAudienceMode,
  AdminEmailAudienceStatus,
  AdminEmailTemplateKey,
  AdminUser,
  AdminUserRole,
} from '@/types/admin';

interface AdminEmailPanelProps {
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

  const roleLabel = targetRoles.length === 3 ? 'All roles' : `${targetRoles.length} roles selected`;
  const recipientModeCopy =
    audienceMode === 'segment'
      ? 'You are targeting role segments with status filters.'
      : 'Manual mode sends only to users you select below.';

  const estimatedRecipients = useMemo(() => {
    if (audienceMode === 'manual') {
      return selectedUsers.length;
    }

    return null;
  }, [audienceMode, selectedUsers.length]);

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

  const resetForm = () => {
    setSubject('');
    setBody('');
    setReason('');
    setTemplateKey('custom');
    setAudienceMode('segment');
    setTargetStatus('all');
    setTargetRoles(['attendee', 'organizer']);
    setSelectedUsers([]);
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
      <article className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Compose</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Campaign builder</h2>
          </div>
          <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-primary">
            SMTP
          </span>
        </div>

        <div className="mt-5 space-y-5">
          <section className="rounded-xl border border-border bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Step 1 - Audience
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Audience mode
                </span>
                <select
                  value={audienceMode}
                  onChange={(event) =>
                    setAudienceMode(event.target.value as AdminEmailAudienceMode)
                  }
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="segment">Segment mode</option>
                  <option value="manual">Manual user selection</option>
                </select>
              </label>

              {audienceMode === 'segment' ? (
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    User status
                  </span>
                  <select
                    value={targetStatus}
                    onChange={(event) =>
                      setTargetStatus(event.target.value as AdminEmailAudienceStatus)
                    }
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="all">All status</option>
                    <option value="active">Active users</option>
                    <option value="suspended">Suspended users</option>
                  </select>
                </label>
              ) : (
                <div className="rounded-lg border border-border bg-background/80 px-3 py-2.5 text-sm text-muted-foreground">
                  Suspended users are selectable in manual mode.
                </div>
              )}
            </div>

            {audienceMode === 'segment' ? (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Target roles
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['attendee', 'organizer', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition ${
                        targetRoles.includes(role)
                          ? 'border-primary/45 bg-primary/15 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Search recipients
                  </span>
                  <input
                    value={manualSearchQuery}
                    onChange={(event) => onManualSearchQueryChange(event.target.value)}
                    placeholder="Search users by name or email"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50"
                  />
                </label>

                <div className="rounded-lg border border-border bg-background/80 p-2">
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
                          className="flex w-full items-center justify-between rounded-lg border border-transparent px-2 py-1.5 text-left text-xs transition hover:border-primary/35 hover:bg-primary/10"
                        >
                          <span className="text-foreground">{user.name}</span>
                          <span className="text-muted-foreground">{user.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <span
                      key={user._id}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary"
                    >
                      {user.name}
                      <button
                        onClick={() => removeSelectedUser(user._id)}
                        className="text-primary/80 hover:text-primary"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Step 2 - Message
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Template
                </span>
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
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="custom">Custom message</option>
                  <option value="policy_warning">Policy warning template</option>
                  <option value="suspension_notice">Suspension notice template</option>
                  <option value="reinstatement_notice">Reinstatement notice template</option>
                  <option value="policy_update">Policy update template</option>
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Subject line
                </span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Email subject"
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Message body
                </span>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Email body"
                  className="min-h-32 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Audit reason
                </span>
                <input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Reason (for audit log)"
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
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
                  resetForm();
                }}
                className="h-11 rounded-xl border border-border bg-background/80 px-4 text-sm font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingCampaign ? 'Sending campaign...' : 'Send campaign now'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="h-11 rounded-xl border border-border bg-background/80 px-4 text-sm font-medium text-foreground transition hover:border-ring/35 hover:bg-muted"
              >
                Reset draft
              </button>
            </div>
          </section>
        </div>
      </article>

      <article className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live brief</p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">Campaign preview</h3>
        <p className="mt-2 text-sm text-muted-foreground">{recipientModeCopy}</p>

        <div className="mt-5 space-y-3">
          <section className="rounded-xl border border-border bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Audience snapshot
            </p>
            <div className="mt-2 space-y-1 text-sm text-foreground">
              <p>Mode: {audienceMode}</p>
              <p>Status filter: {audienceMode === 'segment' ? targetStatus : 'manual selection'}</p>
              <p>Roles: {audienceMode === 'segment' ? roleLabel : 'manual recipients'}</p>
              {estimatedRecipients !== null ? <p>Selected users: {estimatedRecipients}</p> : null}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Message preview
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {subject.trim() || 'No subject yet'}
            </p>
            <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-muted-foreground">
              {body.trim() || 'Your campaign body will appear here.'}
            </p>
          </section>

          <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-destructive">
              Operational checks
            </p>
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              <li>- Include clear reason for audit compliance.</li>
              <li>- Verify subject before sending to all roles.</li>
              <li>- Use manual mode for incident-specific outreach.</li>
            </ul>
          </section>
        </div>
      </article>
    </section>
  );
}
