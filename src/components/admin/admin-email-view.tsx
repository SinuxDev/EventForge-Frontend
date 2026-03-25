import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AdminEmailPanel } from '@/components/admin/admin-email-panel';
import { useAdminEmailRecipientSearch, useSendAdminEmailCampaign } from '@/hooks/use-admin-email';
import { toast } from '@/hooks/use-toast';
import type {
  AdminEmailAudienceMode,
  AdminEmailAudienceStatus,
  AdminEmailTemplateKey,
  AdminUserRole,
} from '@/types/admin';

export function AdminEmailView() {
  const { data: session } = useSession();
  const [manualSearchQuery, setManualSearchQuery] = useState('');

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const recipientSearchQuery = useAdminEmailRecipientSearch(authHeader, manualSearchQuery);
  const sendAdminEmailCampaignMutation = useSendAdminEmailCampaign(authHeader);

  const recipientCount = recipientSearchQuery.data?.data.pagination.total ?? 0;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Admin / Email center
        </p>
        <h1 className="mt-3 text-2xl font-bold md:text-3xl">Email operations</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Compose targeted campaigns in a dedicated operations studio, then monitor performance in a
          separate history cockpit.
        </p>

        <div className="mt-5 inline-flex rounded-full border border-border bg-background/80 p-1">
          <Link
            href="/dashboard/admin/email"
            className="rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary"
          >
            Operations
          </Link>
          <Link
            href="/dashboard/admin/email/history"
            className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
          >
            Campaign history
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-border bg-background/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Mode</p>
            <p className="mt-1 text-lg font-semibold text-foreground">Campaign composer</p>
          </article>
          <article className="rounded-xl border border-border bg-background/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Search results
            </p>
            <p className="mt-1 text-lg font-semibold text-primary">{recipientCount}</p>
          </article>
          <article className="rounded-xl border border-border bg-background/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Transport</p>
            <p className="mt-1 text-lg font-semibold text-foreground">SMTP pipeline</p>
          </article>
        </div>
      </section>

      <AdminEmailPanel
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
