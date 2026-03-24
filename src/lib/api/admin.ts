import { apiClient } from '@/lib/api-client';
import type {
  AdminAuditAction,
  AdminUserActionResponse,
  AdminUserRole,
  ListAdminAuditLogsResponse,
  ListAdminUsersResponse,
} from '@/types/admin';

type AuthHeader = Record<string, string>;

interface ListAdminUsersOptions {
  page: number;
  limit: number;
  q?: string;
  role?: AdminUserRole;
  isSuspended?: boolean;
}

interface ListAdminAuditLogsOptions {
  page: number;
  limit: number;
  action?: AdminAuditAction;
}

export async function listAdminUsers(options: ListAdminUsersOptions, headers: AuthHeader) {
  const query = new URLSearchParams();
  query.set('page', String(options.page));
  query.set('limit', String(options.limit));

  if (options.q?.trim()) {
    query.set('q', options.q.trim());
  }

  if (options.role) {
    query.set('role', options.role);
  }

  if (typeof options.isSuspended === 'boolean') {
    query.set('isSuspended', String(options.isSuspended));
  }

  return apiClient.get<ListAdminUsersResponse>(`/admin/users?${query.toString()}`, { headers });
}

export async function listAdminAuditLogs(options: ListAdminAuditLogsOptions, headers: AuthHeader) {
  const query = new URLSearchParams();
  query.set('page', String(options.page));
  query.set('limit', String(options.limit));

  if (options.action) {
    query.set('action', options.action);
  }

  return apiClient.get<ListAdminAuditLogsResponse>(`/admin/audit-logs?${query.toString()}`, {
    headers,
  });
}

export async function updateAdminUserRole(
  userId: string,
  payload: { role: AdminUserRole; reason: string },
  headers: AuthHeader
) {
  return apiClient.patch<AdminUserActionResponse>(`/admin/users/${userId}/role`, payload, {
    headers,
  });
}

export async function updateAdminUserSuspension(
  userId: string,
  payload: { isSuspended: boolean; reason: string },
  headers: AuthHeader
) {
  return apiClient.patch<AdminUserActionResponse>(`/admin/users/${userId}/suspension`, payload, {
    headers,
  });
}
