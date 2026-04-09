import { z } from 'zod';

export const profileSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  avatar: z
    .string()
    .trim()
    .max(500, 'Avatar URL must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'New password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const preferencesSettingsSchema = z.object({
  timezone: z.string().trim().min(2).max(100),
  locale: z.string().trim().min(2).max(20),
  dateFormat: z.enum(['mdy', 'dmy', 'ymd']),
  timeFormat: z.enum(['12h', '24h']),
  weekStartsOn: z.enum(['sunday', 'monday']),
  marketingOptIn: z.boolean(),
  notifications: z.object({
    eventReminders: z.boolean(),
    eventAnnouncements: z.boolean(),
    eventUpdates: z.boolean(),
    productUpdates: z.boolean(),
  }),
});

export const attendeeSettingsSchema = z.object({
  interestsInput: z.string().max(300).optional().or(z.literal('')),
  preferredAttendanceModes: z
    .array(z.enum(['in_person', 'online', 'hybrid']))
    .min(1, 'Select at least one attendance mode'),
  directMessagesEnabled: z.boolean(),
  showProfileToOtherAttendees: z.boolean(),
  autoAddTicketsToWallet: z.boolean(),
});

export const organizerSettingsSchema = z.object({
  organizationName: z.string().trim().max(120).optional().or(z.literal('')),
  supportEmail: z.string().email('Support email is invalid').optional().or(z.literal('')),
  websiteUrl: z.string().url('Website URL is invalid').optional().or(z.literal('')),
  brandPrimaryColor: z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Brand color must be a hex code')
    .optional()
    .or(z.literal('')),
  defaultEventTimezone: z.string().trim().min(2).max(100),
  defaultCurrency: z.string().trim().length(3, 'Use a 3-letter currency code'),
  defaultReminderHoursInput: z.string().trim().max(120).optional().or(z.literal('')),
  payoutAccountHolderName: z.string().trim().max(120).optional().or(z.literal('')),
  payoutBankName: z.string().trim().max(120).optional().or(z.literal('')),
  payoutAccountLast4: z
    .string()
    .regex(/^\d{4}$/, 'Use exactly 4 digits')
    .optional()
    .or(z.literal('')),
  payoutSchedule: z.enum(['weekly', 'biweekly', 'monthly']),
});

export const adminSettingsSchema = z.object({
  securityAlertsEmail: z
    .string()
    .email('Security alerts email is invalid')
    .optional()
    .or(z.literal('')),
  requireMfaForAdmins: z.boolean(),
  defaultAuditRetentionDays: z.number().int().min(30).max(3650),
  strictIpLogging: z.boolean(),
  emailCampaignApprovalRequired: z.boolean(),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type PreferencesSettingsInput = z.infer<typeof preferencesSettingsSchema>;
export type AttendeeSettingsInput = z.infer<typeof attendeeSettingsSchema>;
export type OrganizerSettingsInput = z.infer<typeof organizerSettingsSchema>;
export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;
