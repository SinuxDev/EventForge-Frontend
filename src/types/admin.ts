export type AdminUserRole = 'attendee' | 'organizer' | 'admin';
export type AdminAuditAction =
  | 'user.role.updated'
  | 'user.suspension.updated'
  | 'compliance.case.created'
  | 'compliance.case.status.updated'
  | 'admin.email.campaign.sent';

export type ComplianceCaseSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceCaseStatus = 'open' | 'in_review' | 'actioned' | 'resolved';
export type ComplianceCaseCategory =
  | 'account_abuse'
  | 'content_policy'
  | 'payment_risk'
  | 'policy_violation'
  | 'other';

export type AdminEmailAudienceStatus = 'all' | 'active' | 'suspended';
export type AdminEmailAudienceMode = 'segment' | 'manual';
export type AdminEmailTemplateKey =
  | 'custom'
  | 'policy_warning'
  | 'suspension_notice'
  | 'reinstatement_notice'
  | 'policy_update';

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

export interface ComplianceCase {
  _id: string;
  title: string;
  description: string;
  category: ComplianceCaseCategory;
  severity: ComplianceCaseSeverity;
  status: ComplianceCaseStatus;
  linkedUserId?: {
    _id: string;
    name: string;
    email: string;
    role: AdminUserRole;
    isSuspended: boolean;
  };
  linkedEventId?: {
    _id: string;
    title: string;
    status: string;
    startDateTime: string;
  };
  assignedAdminId?: {
    _id: string;
    name: string;
    email: string;
    role: AdminUserRole;
  };
  createdByAdminId?: {
    _id: string;
    name: string;
    email: string;
    role: AdminUserRole;
  };
  dueAt?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListComplianceCasesResponse {
  success: boolean;
  message: string;
  data: {
    data: ComplianceCase[];
    pagination: PaginationPayload;
  };
}

export interface ComplianceRiskOverview {
  totalOpenCases: number;
  totalHighSeverityCases: number;
  totalCriticalCases: number;
  totalSuspendedUsers: number;
  resolutionRate: number;
  recentCases: Array<{
    _id: string;
    title: string;
    severity: ComplianceCaseSeverity;
    status: ComplianceCaseStatus;
    category: ComplianceCaseCategory;
    createdAt: string;
  }>;
}

export interface ComplianceRiskOverviewResponse {
  success: boolean;
  message: string;
  data: ComplianceRiskOverview;
}

export interface ComplianceCaseResponse {
  success: boolean;
  message: string;
  data: ComplianceCase;
}

export interface AdminEmailCampaign {
  _id: string;
  subject: string;
  body: string;
  audienceMode: AdminEmailAudienceMode;
  targetRoles: AdminUserRole[];
  targetStatus: AdminEmailAudienceStatus;
  selectedUserIds?: string[];
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface AdminEmailCampaignsResponse {
  success: boolean;
  message: string;
  data: {
    data: AdminEmailCampaign[];
    pagination: PaginationPayload;
  };
}

export interface AdminEmailCampaignResponse {
  success: boolean;
  message: string;
  data: AdminEmailCampaign;
}

export interface AdminEmailDeliveryLog {
  _id: string;
  campaignId: string;
  recipientEmail: string;
  status: 'sent' | 'failed';
  providerMessageId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEmailDeliveryLogsResponse {
  success: boolean;
  message: string;
  data: {
    data: AdminEmailDeliveryLog[];
    pagination: PaginationPayload;
  };
}
