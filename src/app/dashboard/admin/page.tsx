'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { PublishSuccessToast } from '@/components/dashboard/publish-success-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

type UserRole = 'attendee' | 'organizer' | 'admin';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isSuspended: boolean;
  provider: 'credentials' | 'google' | 'github';
  createdAt: string;
}

interface PaginationPayload {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ListUsersResponse {
  success: boolean;
  message: string;
  data: {
    data: AdminUser[];
    pagination: PaginationPayload;
  };
}

interface UserActionResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const fetchUsers = async () => {
    if (!authHeader) {
      return;
    }

    setIsLoadingUsers(true);

    const query = new URLSearchParams();
    query.set('page', '1');
    query.set('limit', '20');

    if (searchText.trim()) {
      query.set('q', searchText.trim());
    }

    if (roleFilter !== 'all') {
      query.set('role', roleFilter);
    }

    if (statusFilter === 'active') {
      query.set('isSuspended', 'false');
    }

    if (statusFilter === 'suspended') {
      query.set('isSuspended', 'true');
    }

    try {
      const result = await apiClient.get<ListUsersResponse>(`/admin/users?${query.toString()}`, {
        headers: authHeader,
      });

      setUsers(result.data.data);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, nextRole: UserRole) => {
    if (!authHeader) {
      return;
    }

    try {
      const result = await apiClient.patch<UserActionResponse>(
        `/admin/users/${targetUserId}/role`,
        { role: nextRole },
        { headers: authHeader }
      );

      setUsers((current) =>
        current.map((user) =>
          user._id === targetUserId ? { ...user, role: result.data.role } : user
        )
      );

      toast({ title: 'User role updated' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleSuspensionToggle = async (targetUser: AdminUser) => {
    if (!authHeader) {
      return;
    }

    try {
      const result = await apiClient.patch<UserActionResponse>(
        `/admin/users/${targetUser._id}/suspension`,
        { isSuspended: !targetUser.isSuspended },
        { headers: authHeader }
      );

      setUsers((current) =>
        current.map((user) =>
          user._id === targetUser._id ? { ...user, isSuspended: result.data.isSuspended } : user
        )
      );

      toast({ title: result.data.isSuspended ? 'User suspended' : 'User unsuspended' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to update suspension',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!authHeader) {
      return;
    }

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  return (
    <DashboardShell requiredRole="admin">
      <PublishSuccessToast />
      <section className="w-full space-y-5">
        <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Admin dashboard
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">User governance</h1>
            <span className="rounded-full border border-primary/35 bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
              Least privilege enforced
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage user roles and account status with centralized controls.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search name or email"
              className="h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />

            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as 'all' | UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="attendee">Attendee</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'suspended')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={fetchUsers}
              className="h-11 rounded-xl border border-border bg-background/80 px-4 text-sm font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
            >
              Apply filters
            </button>
          </div>

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
                {isLoadingUsers ? (
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
                          onValueChange={(value) => handleRoleChange(user._id, value as UserRole)}
                        >
                          <SelectTrigger className="h-9 w-37.5">
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
                          onClick={() => handleSuspensionToggle(user)}
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
        </section>
      </section>
    </DashboardShell>
  );
}
