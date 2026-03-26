import { useMemo, useState } from 'react';
import type { DemoReplyTemplateKey, DemoRequestItem } from '@/types/admin';

interface AdminDemoReplyDialogProps {
  request: DemoRequestItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    id: string;
    templateKey: DemoReplyTemplateKey;
    reason: string;
    customMessage?: string;
    scheduleLink?: string;
  }) => Promise<void>;
}

function getTemplateLabel(templateKey: DemoReplyTemplateKey): string {
  if (templateKey === 'qualified_next_steps') {
    return 'Qualified next steps';
  }

  if (templateKey === 'not_a_fit_polite') {
    return 'Not a fit (polite)';
  }

  if (templateKey === 'reschedule_no_show') {
    return 'Reschedule no-show';
  }

  return 'Acknowledgement';
}

function getTemplatePreview(templateKey: DemoReplyTemplateKey): string {
  if (templateKey === 'qualified_next_steps') {
    return 'Confirms fit and directs the prospect to book a guided demo call.';
  }

  if (templateKey === 'not_a_fit_polite') {
    return 'Shares a respectful decline while keeping the door open for future alignment.';
  }

  if (templateKey === 'reschedule_no_show') {
    return 'Re-engages no-show leads with a clear rescheduling call to action.';
  }

  return 'Sends a formal confirmation that the demo request was received and reviewed.';
}

export function AdminDemoReplyDialog({
  request,
  isSubmitting,
  onClose,
  onSubmit,
}: AdminDemoReplyDialogProps) {
  const [templateKey, setTemplateKey] = useState<DemoReplyTemplateKey>('acknowledgement');
  const [reason, setReason] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [scheduleLink, setScheduleLink] = useState('');

  const needsScheduleLink =
    templateKey === 'qualified_next_steps' || templateKey === 'reschedule_no_show';

  const canSubmit = useMemo(() => {
    if (!request || reason.trim().length < 3) {
      return false;
    }

    if (needsScheduleLink && scheduleLink.trim().length === 0) {
      return false;
    }

    return true;
  }, [needsScheduleLink, reason, request, scheduleLink]);

  if (!request) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Send demo reply</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Compose a formal response for {request.fullName} ({request.workEmail}).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md border border-border bg-background/80 px-2.5 text-xs font-semibold text-foreground"
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Template
            </label>
            <select
              value={templateKey}
              onChange={(event) => setTemplateKey(event.target.value as DemoReplyTemplateKey)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
            >
              <option value="acknowledgement">Acknowledgement</option>
              <option value="qualified_next_steps">Qualified next steps</option>
              <option value="not_a_fit_polite">Not a fit (polite)</option>
              <option value="reschedule_no_show">Reschedule no-show</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Reason
            </label>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Required for audit trail"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
            />
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-border bg-background/80 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{getTemplateLabel(templateKey)}:</span>{' '}
          {getTemplatePreview(templateKey)}
        </div>

        <div className="mt-3 space-y-1.5">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">
            Schedule link {needsScheduleLink ? '(required for this template)' : '(optional)'}
          </label>
          <input
            value={scheduleLink}
            onChange={(event) => setScheduleLink(event.target.value)}
            placeholder="https://calendly.com/your-team/demo"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div className="mt-3 space-y-1.5">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">
            Custom message (optional)
          </label>
          <textarea
            value={customMessage}
            onChange={(event) => setCustomMessage(event.target.value)}
            placeholder="Add account-specific context, timeline details, or next steps."
            className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !canSubmit}
            onClick={async () => {
              await onSubmit({
                id: request._id,
                templateKey,
                reason,
                customMessage: customMessage.trim() || undefined,
                scheduleLink: scheduleLink.trim() || undefined,
              });

              setReason('');
              setCustomMessage('');
              setScheduleLink('');
              setTemplateKey('acknowledgement');
            }}
            className="h-9 rounded-lg border border-primary/40 bg-primary/15 px-4 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send reply'}
          </button>
        </div>
      </div>
    </div>
  );
}
