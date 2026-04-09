export type UserRole = 'attendee' | 'organizer' | 'admin';
export type AuthProvider = 'credentials' | 'google' | 'github';

export interface UserProfileSettings {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  provider: AuthProvider;
}

export interface UserPreferencesSettings {
  timezone: string;
  locale: string;
  dateFormat: 'mdy' | 'dmy' | 'ymd';
  timeFormat: '12h' | '24h';
  weekStartsOn: 'sunday' | 'monday';
  marketingOptIn: boolean;
  notifications: {
    eventReminders: boolean;
    eventAnnouncements: boolean;
    eventUpdates: boolean;
    productUpdates: boolean;
  };
}

export interface AttendeeSettings {
  interests: string[];
  preferredAttendanceModes: Array<'in_person' | 'online' | 'hybrid'>;
  directMessagesEnabled: boolean;
  showProfileToOtherAttendees: boolean;
  autoAddTicketsToWallet: boolean;
}

export interface OrganizerSettings {
  organizationName?: string;
  supportEmail?: string;
  websiteUrl?: string;
  brandPrimaryColor?: string;
  defaultEventTimezone: string;
  defaultCurrency: string;
  defaultReminderHours: number[];
  payout: {
    accountHolderName?: string;
    bankName?: string;
    accountLast4?: string;
    payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
  };
}

export interface AdminSettings {
  securityAlertsEmail?: string;
  requireMfaForAdmins: boolean;
  defaultAuditRetentionDays: number;
  strictIpLogging: boolean;
  emailCampaignApprovalRequired: boolean;
}

export interface UserSettingsSnapshot {
  profile: UserProfileSettings;
  preferences: UserPreferencesSettings;
  attendeeSettings: AttendeeSettings;
  organizerSettings: OrganizerSettings;
  adminSettings: AdminSettings;
}

export interface UserSettingsResponse {
  success: boolean;
  message: string;
  data: UserSettingsSnapshot;
}

export interface SettingsMutationResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
