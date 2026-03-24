import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminUser, AdminUserRole, PaginationPayload } from '@/types/admin';

interface AdminUsersTableProps {
  users: AdminUser[];
  pagination: PaginationPayload | null;
  isLoading: boolean;
  onRoleChangeRequest: (user: AdminUser, nextRole: AdminUserRole) => void;
  onSuspensionToggleRequest: (user: AdminUser) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function AdminUsersTable({
  users,
  pagination,
  isLoading,
  onRoleChangeRequest,
  onSuspensionToggleRequest,
  onPreviousPage,
  onNextPage,
}: AdminUsersTableProps) {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card/70">
        <table className="w-full min-w-195 border-collapse">
          <thead className="bg-muted/45 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={5}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={5}>
                  No users found for the selected filters.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-t border-border text-sm text-foreground">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <Select
                      value={user.role}
                      onValueChange={(value) => onRoleChangeRequest(user, value as AdminUserRole)}
                    >
                      <SelectTrigger className="h-9 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attendee">attendee</SelectItem>
                        <SelectItem value="organizer">organizer</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{user.provider}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.isSuspended
                          ? 'border border-destructive/35 bg-destructive/10 text-destructive'
                          : 'border border-primary/35 bg-primary/10 text-primary'
                      }`}
                    >
                      {user.isSuspended ? 'suspended' : 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => onSuspensionToggleRequest(user)}
                      className="rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
                    >
                      {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousPage}
            disabled={!pagination?.hasPrevPage || isLoading}
            className="rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            onClick={onNextPage}
            disabled={!pagination?.hasNextPage || isLoading}
            className="rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
