import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assignAdminDemoRequestOwner,
  sendAdminDemoRequestReply,
  updateAdminDemoRequestFollowUp,
  updateAdminDemoRequestStatus,
} from '@/lib/api/admin';
import type { DemoReplyTemplateKey, DemoRequestPriority, DemoRequestStatus } from '@/types/admin';

type AuthHeaders = Record<string, string>;

export function useAssignAdminDemoRequestOwner(headers: AuthHeaders | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; ownerAdminId: string; reason: string }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return assignAdminDemoRequestOwner(
        payload.id,
        {
          ownerAdminId: payload.ownerAdminId,
          reason: payload.reason,
        },
        headers
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-demo-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-demo-requests-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });
}

export function useUpdateAdminDemoRequestStatus(headers: AuthHeaders | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      status: DemoRequestStatus;
      reason: string;
      qualificationNotes?: string;
      scheduledAt?: string;
      nextActionAt?: string;
    }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return updateAdminDemoRequestStatus(
        payload.id,
        {
          status: payload.status,
          reason: payload.reason,
          qualificationNotes: payload.qualificationNotes,
          scheduledAt: payload.scheduledAt,
          nextActionAt: payload.nextActionAt,
        },
        headers
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-demo-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-demo-requests-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });
}

export function useUpdateAdminDemoRequestFollowUp(headers: AuthHeaders | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      reason: string;
      lastContactAt?: string;
      nextActionAt?: string;
      qualificationNotes?: string;
      priority?: DemoRequestPriority;
    }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return updateAdminDemoRequestFollowUp(
        payload.id,
        {
          reason: payload.reason,
          lastContactAt: payload.lastContactAt,
          nextActionAt: payload.nextActionAt,
          qualificationNotes: payload.qualificationNotes,
          priority: payload.priority,
        },
        headers
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-demo-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-demo-requests-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });
}

export function useSendAdminDemoRequestReply(headers: AuthHeaders | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      templateKey: DemoReplyTemplateKey;
      reason: string;
      customMessage?: string;
      scheduleLink?: string;
    }) => {
      if (!headers) {
        throw new Error('Unauthorized');
      }

      return sendAdminDemoRequestReply(
        payload.id,
        {
          templateKey: payload.templateKey,
          reason: payload.reason,
          customMessage: payload.customMessage,
          scheduleLink: payload.scheduleLink,
        },
        headers
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-demo-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-demo-requests-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });
}
