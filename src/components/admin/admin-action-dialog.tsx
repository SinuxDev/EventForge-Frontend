import type { AdminUser, AdminUserRole } from '@/types/admin';

export type RoleActionDialogState = {
  kind: 'role';
  targetUser: AdminUser;
  nextRole: AdminUserRole;
};

export type SuspensionActionDialogState = {
  kind: 'suspension';
  targetUser: AdminUser;
  nextSuspendedState: boolean;
};

export type ActionDialogState = RoleActionDialogState | SuspensionActionDialogState;

function getDialogHeading(state: ActionDialogState): string {
  if (state.kind === 'role') {
    return `Change role to ${state.nextRole}?`;
  }

  return state.nextSuspendedState ? 'Suspend user account?' : 'Unsuspend user account?';
}

function getDialogSummary(state: ActionDialogState): string {
  if (state.kind === 'role') {
    return `This will update ${state.targetUser.name}'s permissions immediately.`;
  }

  return state.nextSuspendedState
    ? `This will block ${state.targetUser.name} from accessing the platform until unsuspended.`
    : `This will restore ${state.targetUser.name}'s access immediately.`;
}

interface AdminActionDialogProps {
  state: ActionDialogState | null;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminActionDialog({
  state,
  reason,
  isSubmitting,
  onReasonChange,
  onClose,
  onConfirm,
}: AdminActionDialogProps) {
  if (!state) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-foreground">{getDialogHeading(state)}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{getDialogSummary(state)}</p>

        <div className="mt-4 space-y-2">
          <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Reason</label>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            className="min-h-24 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-ring"
            placeholder="Required for audit trail (e.g. repeated abuse reports, role correction, security policy)"
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
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-9 rounded-lg border border-primary/40 bg-primary/15 px-4 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Confirm change'}
          </button>
        </div>
      </div>
    </div>
  );
}
