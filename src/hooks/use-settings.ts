import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeUserPassword,
  getUserSettings,
  updateAdminSettings,
  updateAttendeeSettings,
  updateOrganizerSettings,
  updateUserPreferences,
  updateUserProfile,
} from '@/lib/api/settings';
import type {
  AdminSettings,
  AttendeeSettings,
  OrganizerSettings,
  UserPreferencesSettings,
} from '@/types/settings';

const settingsKeys = {
  all: ['settings'] as const,
  me: (accessToken?: string) => [...settingsKeys.all, 'me', accessToken] as const,
};

export function useUserSettings(accessToken?: string) {
  return useQuery({
    queryKey: settingsKeys.me(accessToken),
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('You must be signed in to view settings');
      }

      return getUserSettings({ Authorization: `Bearer ${accessToken}` });
    },
  });
}

export function useUpdateUserProfile(accessToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name?: string; avatar?: string }) => {
      if (!accessToken) {
        throw new Error('You must be signed in to update profile');
      }

      return updateUserProfile(payload, { Authorization: `Bearer ${accessToken}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useChangeUserPassword(accessToken?: string) {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      if (!accessToken) {
        throw new Error('You must be signed in to change password');
      }

      return changeUserPassword(payload, { Authorization: `Bearer ${accessToken}` });
    },
  });
}

export function useUpdateUserPreferences(accessToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<UserPreferencesSettings>) => {
      if (!accessToken) {
        throw new Error('You must be signed in to update preferences');
      }

      return updateUserPreferences(payload, { Authorization: `Bearer ${accessToken}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useUpdateAttendeeSettings(accessToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<AttendeeSettings>) => {
      if (!accessToken) {
        throw new Error('You must be signed in to update attendee settings');
      }

      return updateAttendeeSettings(payload, { Authorization: `Bearer ${accessToken}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useUpdateOrganizerSettings(accessToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<OrganizerSettings>) => {
      if (!accessToken) {
        throw new Error('You must be signed in to update organizer settings');
      }

      return updateOrganizerSettings(payload, { Authorization: `Bearer ${accessToken}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useUpdateAdminSettings(accessToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<AdminSettings>) => {
      if (!accessToken) {
        throw new Error('You must be signed in to update admin settings');
      }

      return updateAdminSettings(payload, { Authorization: `Bearer ${accessToken}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
