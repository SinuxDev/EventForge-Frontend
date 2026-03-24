import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComplianceCase,
  getComplianceRiskOverview,
  listComplianceCases,
  updateComplianceCaseStatus,
} from '@/lib/api/admin';
import type { ComplianceCaseSeverity, ComplianceCaseStatus } from '@/types/admin';

type AuthHeaders = Record<string, string>;

export function useComplianceRiskOverview(headers: AuthHeaders | null) {
  return useQuery({
    queryKey: ['compliance-risk-overview'],
    enabled: Boolean(headers),
    queryFn: async () => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return getComplianceRiskOverview(headers);
    },
  });
}

export function useComplianceCases(params: {
  headers: AuthHeaders | null;
  page: number;
  status: 'all' | ComplianceCaseStatus;
  severity: 'all' | ComplianceCaseSeverity;
}) {
  return useQuery({
    queryKey: ['compliance-cases', params.page, params.status, params.severity],
    enabled: Boolean(params.headers),
    queryFn: async () => {
      if (!params.headers) {
        throw new Error('Unauthorized');
      }

      return listComplianceCases(
        {
          page: params.page,
          limit: 10,
          status: params.status === 'all' ? undefined : params.status,
          severity: params.severity === 'all' ? undefined : params.severity,
        },
        params.headers
      );
    },
  });
}

export function useCreateComplianceCase(headers: AuthHeaders | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string;
      category: 'account_abuse' | 'content_policy' | 'payment_risk' | 'policy_violation' | 'other';
      severity: 'low' | 'medium' | 'high' | 'critical';
      linkedUserId?: string;
      linkedEventId?: string;
      assignedAdminId?: string;
      dueAt?: string;
    }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return createComplianceCase(payload, headers);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['compliance-cases'] }),
        queryClient.invalidateQueries({ queryKey: ['compliance-risk-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });
}

export function useUpdateComplianceCaseStatus(headers: AuthHeaders | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      caseId: string;
      status: ComplianceCaseStatus;
      resolutionNote?: string;
      reason: string;
    }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return updateComplianceCaseStatus(
        payload.caseId,
        {
          status: payload.status,
          resolutionNote: payload.resolutionNote,
          reason: payload.reason,
        },
        headers
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['compliance-cases'] }),
        queryClient.invalidateQueries({ queryKey: ['compliance-risk-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });
}
