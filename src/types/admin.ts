export type AdminUserRole = 'attendee' | 'organizer' | 'admin';
export type AdminAuditAction = 'user.role.updated' | 'user.suspension.updated';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  isSuspended: boolean;
  provider: 'credentials' | 'google' | 'github';
  createdAt: string;
}

export interface PaginationPayload {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AuditUserSummary {
  _id: string;
  name: string;
  email: string;
  role: AdminUserRole;
}

export interface AdminAuditLog {
  _id: string;
  actorUserId: AuditUserSummary;
  targetUserId: AuditUserSummary;
  action: AdminAuditAction;
  reason: string;
  metadata?: {
    previousRole?: AdminUserRole;
    nextRole?: AdminUserRole;
    previousSuspendedState?: boolean;
    nextSuspendedState?: boolean;
  };
  createdAt: string;
}

export interface ListAdminUsersResponse {
  success: boolean;
  message: string;
  data: {
    data: AdminUser[];
    pagination: PaginationPayload;
  };
}

export interface AdminUserActionResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

export interface ListAdminAuditLogsResponse {
  success: boolean;
  message: string;
  data: {
    data: AdminAuditLog[];
    pagination: PaginationPayload;
  };
}
