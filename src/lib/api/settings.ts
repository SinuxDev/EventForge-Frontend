import { apiClient } from '@/lib/api-client';
import type {
  AdminSettings,
  AttendeeSettings,
  OrganizerSettings,
  SettingsMutationResponse,
  UserPreferencesSettings,
  UserProfileSettings,
  UserSettingsResponse,
} from '@/types/settings';

type AuthHeader = Record<string, string>;

export async function getUserSettings(headers: AuthHeader) {
  return apiClient.get<UserSettingsResponse>('/settings/me', { headers });
}

export async function updateUserProfile(
  payload: {
    name?: string;
    avatar?: string;
  },
  headers: AuthHeader
) {
  return apiClient.patch<SettingsMutationResponse<UserProfileSettings>>(
    '/settings/me/profile',
    payload,
    {
      headers,
    }
  );
}

export async function changeUserPassword(
  payload: {
    currentPassword: string;
    newPassword: string;
  },
  headers: AuthHeader
) {
  return apiClient.post<SettingsMutationResponse<null>>('/settings/me/change-password', payload, {
    headers,
  });
}

export async function updateUserPreferences(
  payload: Partial<UserPreferencesSettings>,
  headers: AuthHeader
) {
  return apiClient.patch<SettingsMutationResponse<UserPreferencesSettings>>(
    '/settings/me/preferences',
    payload,
    {
      headers,
    }
  );
}

export async function updateAttendeeSettings(
  payload: Partial<AttendeeSettings>,
  headers: AuthHeader
) {
  return apiClient.patch<SettingsMutationResponse<AttendeeSettings>>(
    '/settings/me/attendee',
    payload,
    {
      headers,
    }
  );
}

export async function updateOrganizerSettings(
  payload: Partial<OrganizerSettings>,
  headers: AuthHeader
) {
  return apiClient.patch<SettingsMutationResponse<OrganizerSettings>>(
    '/settings/me/organizer',
    payload,
    {
      headers,
    }
  );
}

export async function updateAdminSettings(payload: Partial<AdminSettings>, headers: AuthHeader) {
  return apiClient.patch<SettingsMutationResponse<AdminSettings>>('/settings/me/admin', payload, {
    headers,
  });
}
