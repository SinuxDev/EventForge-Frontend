'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import type { AppealIssueType, AppealRequestItem, AppealRequestStatus } from '@/types/admin';

interface AdminAppealDetailDrawerProps {
  isOpen: boolean;
  appeal: AppealRequestItem | null;
  isUpdating: boolean;
  onClose: () => void;
  onUpdateStatus: (payload: { id: string; status: AppealRequestStatus }) => Promise<void>;
}

function formatIssueType(issueType: AppealIssueType) {
  if (issueType === 'account_suspension') return 'Account suspension';
  if (issueType === 'policy_warning') return 'Policy warning';
  if (issueType === 'payment_restriction') return 'Payment restriction';
  if (issueType === 'content_violation') return 'Content violation';
  return 'Other';
}

export function AdminAppealDetailDrawer({
  isOpen,
  appeal,
  isUpdating,
  onClose,
  onUpdateStatus,
}: AdminAppealDetailDrawerProps) {
  const [nextStatus, setNextStatus] = useState<AppealRequestStatus>(appeal?.status ?? 'submitted');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const createdAtText = appeal?.createdAt ? new Date(appeal.createdAt).toLocaleString() : '-';

  if (!isOpen || !appeal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close details"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-190 overflow-y-auto border-l border-border bg-background shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Appeal details
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{appeal.referenceCode}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground"
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <section className="grid gap-3 rounded-xl border border-border bg-card/70 p-4 md:grid-cols-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Status:</span> {appeal.status}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Issue type:</span>{' '}
              {formatIssueType(appeal.issueType)}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Source:</span> {appeal.source}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Submitted:</span> {createdAtText}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">Submitter profile</h3>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <p>
                <span className="font-medium text-foreground">Full name:</span> {appeal.fullName}
              </p>
              <p>
                <span className="font-medium text-foreground">Company:</span> {appeal.company}
              </p>
              <p>
                <span className="font-medium text-foreground">Work email:</span> {appeal.workEmail}
              </p>
              <p>
                <span className="font-medium text-foreground">Account email:</span>{' '}
                {appeal.accountEmail}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
            <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
              {appeal.timeline}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">What happened</h3>
            <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
              {appeal.whatHappened}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">Corrective actions</h3>
            <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
              {appeal.correctiveActions}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">Evidence links</h3>
            {appeal.evidenceLinks.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No evidence links submitted.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {appeal.evidenceLinks.map((link) => (
                  <li key={link}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-sm text-primary underline-offset-2 hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">Review actions</h3>
            <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as AppealRequestStatus)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
              >
                <option value="submitted">Submitted</option>
                <option value="in_review">In review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                disabled={isUpdating || nextStatus === appeal.status}
                onClick={async () => {
                  await onUpdateStatus({ id: appeal._id, status: nextStatus });
                }}
                className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUpdating ? 'Saving...' : 'Save status'}
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(appeal.referenceCode);
                    toast({ title: 'Reference code copied' });
                  } catch {
                    toast({ title: 'Unable to copy reference', variant: 'destructive' });
                  }
                }}
                className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground"
              >
                Copy reference
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
