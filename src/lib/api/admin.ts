import { apiClient } from '@/lib/api-client';
import type {
  AdminEmailAudienceMode,
  AdminEmailAudienceStatus,
  AdminEmailTemplateKey,
  AdminEmailCampaignResponse,
  AdminEmailCampaignsResponse,
  AdminEmailDeliveryLogsResponse,
  AdminOverviewChartRange,
  AdminOverviewChartsResponse,
  AdminAuditAction,
  AdminUserActionResponse,
  AdminUserRole,
  ComplianceCaseResponse,
  ComplianceRiskOverviewResponse,
  ListComplianceCasesResponse,
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

interface ListComplianceCasesOptions {
  page: number;
  limit: number;
  status?: 'open' | 'in_review' | 'actioned' | 'resolved';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export async function getComplianceRiskOverview(headers: AuthHeader) {
  return apiClient.get<ComplianceRiskOverviewResponse>('/admin/compliance/risk-overview', {
    headers,
  });
}

export async function listComplianceCases(
  options: ListComplianceCasesOptions,
  headers: AuthHeader
) {
  const query = new URLSearchParams();
  query.set('page', String(options.page));
  query.set('limit', String(options.limit));

  if (options.status) {
    query.set('status', options.status);
  }

  if (options.severity) {
    query.set('severity', options.severity);
  }

  return apiClient.get<ListComplianceCasesResponse>(`/admin/compliance/cases?${query.toString()}`, {
    headers,
  });
}

export async function createComplianceCase(
  payload: {
    title: string;
    description: string;
    category: 'account_abuse' | 'content_policy' | 'payment_risk' | 'policy_violation' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    linkedUserId?: string;
    linkedEventId?: string;
    assignedAdminId?: string;
    dueAt?: string;
  },
  headers: AuthHeader
) {
  return apiClient.post<ComplianceCaseResponse>('/admin/compliance/cases', payload, { headers });
}

export async function updateComplianceCaseStatus(
  caseId: string,
  payload: {
    status: 'open' | 'in_review' | 'actioned' | 'resolved';
    resolutionNote?: string;
    reason: string;
  },
  headers: AuthHeader
) {
  return apiClient.patch<ComplianceCaseResponse>(
    `/admin/compliance/cases/${caseId}/status`,
    payload,
    {
      headers,
    }
  );
}

export async function sendAdminEmailCampaign(
  payload: {
    subject: string;
    body: string;
    templateKey: AdminEmailTemplateKey;
    audienceMode: AdminEmailAudienceMode;
    targetRoles: AdminUserRole[];
    targetStatus: AdminEmailAudienceStatus;
    selectedUserIds?: string[];
    reason: string;
  },
  headers: AuthHeader
) {
  return apiClient.post<AdminEmailCampaignResponse>('/admin/email/campaigns/send', payload, {
    headers,
  });
}

export async function listAdminEmailCampaigns(
  options: { page: number; limit: number },
  headers: AuthHeader
) {
  const query = new URLSearchParams();
  query.set('page', String(options.page));
  query.set('limit', String(options.limit));

  return apiClient.get<AdminEmailCampaignsResponse>(`/admin/email/campaigns?${query.toString()}`, {
    headers,
  });
}

export async function listAdminEmailDeliveryLogs(
  campaignId: string,
  options: { page: number; limit: number },
  headers: AuthHeader
) {
  const query = new URLSearchParams();
  query.set('page', String(options.page));
  query.set('limit', String(options.limit));

  return apiClient.get<AdminEmailDeliveryLogsResponse>(
    `/admin/email/campaigns/${campaignId}/logs?${query.toString()}`,
    {
      headers,
    }
  );
}

export async function getAdminOverviewCharts(
  options: { range: AdminOverviewChartRange },
  headers: AuthHeader
) {
  const query = new URLSearchParams();
  query.set('range', options.range);

  return apiClient.get<AdminOverviewChartsResponse>(`/admin/overview/charts?${query.toString()}`, {
    headers,
  });
}
