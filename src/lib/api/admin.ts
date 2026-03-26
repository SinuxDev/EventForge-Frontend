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
  DemoRequestAnalyticsResponse,
  DemoReplyTemplateKey,
  DemoRequestResponse,
  DemoRequestStatus,
  DemoRequestPriority,
  DemoRequestSource,
  ListDemoRequestsResponse,
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

interface ListDemoRequestsOptions {
  page: number;
  limit: number;
  q?: string;
  status?: DemoRequestStatus;
  priority?: DemoRequestPriority;
  ownerAdminId?: string;
  source?: DemoRequestSource;
  from?: string;
  to?: string;
  sla?: 'all' | 'on_time' | 'overdue';
}

export async function listAdminDemoRequests(options: ListDemoRequestsOptions, headers: AuthHeader) {
  const query = new URLSearchParams();
  query.set('page', String(options.page));
  query.set('limit', String(options.limit));

  if (options.q?.trim()) {
    query.set('q', options.q.trim());
  }

  if (options.status) {
    query.set('status', options.status);
  }

  if (options.priority) {
    query.set('priority', options.priority);
  }

  if (options.ownerAdminId) {
    query.set('ownerAdminId', options.ownerAdminId);
  }

  if (options.source) {
    query.set('source', options.source);
  }

  if (options.from) {
    query.set('from', options.from);
  }

  if (options.to) {
    query.set('to', options.to);
  }

  if (options.sla) {
    query.set('sla', options.sla);
  }

  return apiClient.get<ListDemoRequestsResponse>(`/admin/demo-requests?${query.toString()}`, {
    headers,
  });
}

export async function getAdminDemoRequestById(id: string, headers: AuthHeader) {
  return apiClient.get<DemoRequestResponse>(`/admin/demo-requests/${id}`, { headers });
}

export async function sendAdminDemoRequestReply(
  id: string,
  payload: {
    templateKey: DemoReplyTemplateKey;
    reason: string;
    customMessage?: string;
    scheduleLink?: string;
  },
  headers: AuthHeader
) {
  return apiClient.post<DemoRequestResponse>(`/admin/demo-requests/${id}/reply`, payload, {
    headers,
  });
}

export async function assignAdminDemoRequestOwner(
  id: string,
  payload: { ownerAdminId: string; reason: string },
  headers: AuthHeader
) {
  return apiClient.patch<DemoRequestResponse>(`/admin/demo-requests/${id}/assign`, payload, {
    headers,
  });
}

export async function updateAdminDemoRequestStatus(
  id: string,
  payload: {
    status: DemoRequestStatus;
    reason: string;
    qualificationNotes?: string;
    scheduledAt?: string;
    nextActionAt?: string;
  },
  headers: AuthHeader
) {
  return apiClient.patch<DemoRequestResponse>(`/admin/demo-requests/${id}/status`, payload, {
    headers,
  });
}

export async function updateAdminDemoRequestFollowUp(
  id: string,
  payload: {
    reason: string;
    lastContactAt?: string;
    nextActionAt?: string;
    qualificationNotes?: string;
    priority?: DemoRequestPriority;
  },
  headers: AuthHeader
) {
  return apiClient.patch<DemoRequestResponse>(`/admin/demo-requests/${id}/follow-up`, payload, {
    headers,
  });
}

export async function getAdminDemoRequestAnalytics(
  options: { range: '7d' | '30d' | '90d' },
  headers: AuthHeader
) {
  const query = new URLSearchParams();
  query.set('range', options.range);

  return apiClient.get<DemoRequestAnalyticsResponse>(
    `/admin/demo-requests/analytics?${query.toString()}`,
    {
      headers,
    }
  );
}
