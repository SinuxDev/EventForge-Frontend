'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  useChangeUserPassword,
  useUpdateAdminSettings,
  useUpdateAttendeeSettings,
  useUpdateOrganizerSettings,
  useUpdateUserPreferences,
  useUpdateUserProfile,
  useUserSettings,
} from '@/hooks/use-settings';
import { toast } from '@/hooks/use-toast';
import {
  adminSettingsSchema,
  attendeeSettingsSchema,
  organizerSettingsSchema,
  passwordChangeSchema,
  preferencesSettingsSchema,
  profileSettingsSchema,
  type AdminSettingsInput,
  type AttendeeSettingsInput,
  type OrganizerSettingsInput,
  type PasswordChangeInput,
  type PreferencesSettingsInput,
  type ProfileSettingsInput,
} from '@/lib/schemas/settings.schema';
import {
  AdminSettingsSection,
  AttendeeSettingsSection,
  OrganizerSettingsSection,
  PreferencesSettingsSection,
  ProfileSettingsSection,
  SecuritySettingsSection,
  SettingsIntroSection,
} from '@/components/settings/settings-sections';

interface UserSettingsPanelProps {
  role: 'attendee' | 'organizer' | 'admin';
}

function splitCsvList(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function parseReminderHours(input: string): number[] {
  const parsed = Array.from(
    new Set(
      input
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= 720)
    )
  );

  return parsed.length > 0 ? parsed : [24, 1];
}

export function UserSettingsPanel({ role }: UserSettingsPanelProps) {
  const { data: session, update } = useSession();
  const accessToken = session?.accessToken;
  const settingsQuery = useUserSettings(accessToken);
  const snapshot = settingsQuery.data?.data;

  const updateProfileMutation = useUpdateUserProfile(accessToken);
  const updatePreferencesMutation = useUpdateUserPreferences(accessToken);
  const changePasswordMutation = useChangeUserPassword(accessToken);
  const updateAttendeeMutation = useUpdateAttendeeSettings(accessToken);
  const updateOrganizerMutation = useUpdateOrganizerSettings(accessToken);
  const updateAdminMutation = useUpdateAdminSettings(accessToken);

  const profileForm = useForm<ProfileSettingsInput>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: { name: '', avatar: '' },
  });

  const passwordForm = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const preferencesForm = useForm<PreferencesSettingsInput>({
    resolver: zodResolver(preferencesSettingsSchema),
    defaultValues: {
      timezone: 'UTC',
      locale: 'en-US',
      dateFormat: 'mdy',
      timeFormat: '12h',
      weekStartsOn: 'monday',
      marketingOptIn: false,
      notifications: {
        eventReminders: true,
        eventAnnouncements: true,
        eventUpdates: true,
        productUpdates: false,
      },
    },
  });

  const attendeeForm = useForm<AttendeeSettingsInput>({
    resolver: zodResolver(attendeeSettingsSchema),
    defaultValues: {
      interestsInput: '',
      preferredAttendanceModes: ['in_person', 'online'],
      directMessagesEnabled: true,
      showProfileToOtherAttendees: false,
      autoAddTicketsToWallet: false,
    },
  });

  const organizerForm = useForm<OrganizerSettingsInput>({
    resolver: zodResolver(organizerSettingsSchema),
    defaultValues: {
      organizationName: '',
      supportEmail: '',
      websiteUrl: '',
      brandPrimaryColor: '',
      defaultEventTimezone: 'UTC',
      defaultCurrency: 'USD',
      defaultReminderHoursInput: '24, 1',
      payoutAccountHolderName: '',
      payoutBankName: '',
      payoutAccountLast4: '',
      payoutSchedule: 'biweekly',
    },
  });

  const adminForm = useForm<AdminSettingsInput>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      securityAlertsEmail: '',
      requireMfaForAdmins: false,
      defaultAuditRetentionDays: 365,
      strictIpLogging: true,
      emailCampaignApprovalRequired: false,
    },
  });

  const preferredAttendanceModes =
    useWatch({ control: attendeeForm.control, name: 'preferredAttendanceModes' }) ?? [];

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    profileForm.reset({
      name: snapshot.profile.name,
      avatar: snapshot.profile.avatar || '',
    });

    preferencesForm.reset(snapshot.preferences);

    attendeeForm.reset({
      interestsInput: snapshot.attendeeSettings.interests.join(', '),
      preferredAttendanceModes: snapshot.attendeeSettings.preferredAttendanceModes,
      directMessagesEnabled: snapshot.attendeeSettings.directMessagesEnabled,
      showProfileToOtherAttendees: snapshot.attendeeSettings.showProfileToOtherAttendees,
      autoAddTicketsToWallet: snapshot.attendeeSettings.autoAddTicketsToWallet,
    });

    organizerForm.reset({
      organizationName: snapshot.organizerSettings.organizationName || '',
      supportEmail: snapshot.organizerSettings.supportEmail || '',
      websiteUrl: snapshot.organizerSettings.websiteUrl || '',
      brandPrimaryColor: snapshot.organizerSettings.brandPrimaryColor || '',
      defaultEventTimezone: snapshot.organizerSettings.defaultEventTimezone,
      defaultCurrency: snapshot.organizerSettings.defaultCurrency,
      defaultReminderHoursInput: snapshot.organizerSettings.defaultReminderHours.join(', '),
      payoutAccountHolderName: snapshot.organizerSettings.payout.accountHolderName || '',
      payoutBankName: snapshot.organizerSettings.payout.bankName || '',
      payoutAccountLast4: snapshot.organizerSettings.payout.accountLast4 || '',
      payoutSchedule: snapshot.organizerSettings.payout.payoutSchedule,
    });

    adminForm.reset({
      securityAlertsEmail: snapshot.adminSettings.securityAlertsEmail || '',
      requireMfaForAdmins: snapshot.adminSettings.requireMfaForAdmins,
      defaultAuditRetentionDays: snapshot.adminSettings.defaultAuditRetentionDays,
      strictIpLogging: snapshot.adminSettings.strictIpLogging,
      emailCampaignApprovalRequired: snapshot.adminSettings.emailCampaignApprovalRequired,
    });
  }, [adminForm, attendeeForm, organizerForm, preferencesForm, profileForm, snapshot]);

  const handleProfileSave = profileForm.handleSubmit(async (values) => {
    try {
      const result = await updateProfileMutation.mutateAsync({
        name: values.name,
        avatar: values.avatar || undefined,
      });

      await update({
        user: {
          name: result.data.name,
          image: result.data.avatar ?? null,
        },
      });

      toast({ title: 'Profile updated' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to update profile',
        variant: 'destructive',
      });
    }
  });

  const handlePasswordSave = passwordForm.handleSubmit(async (values) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      toast({ title: 'Password changed successfully' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to change password',
        variant: 'destructive',
      });
    }
  });

  const handlePreferencesSave = preferencesForm.handleSubmit(async (values) => {
    try {
      await updatePreferencesMutation.mutateAsync(values);
      toast({ title: 'Preferences updated' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to update preferences',
        variant: 'destructive',
      });
    }
  });

  const handleAttendeeSave = attendeeForm.handleSubmit(async (values) => {
    try {
      await updateAttendeeMutation.mutateAsync({
        interests: splitCsvList(values.interestsInput || ''),
        preferredAttendanceModes: values.preferredAttendanceModes,
        directMessagesEnabled: values.directMessagesEnabled,
        showProfileToOtherAttendees: values.showProfileToOtherAttendees,
        autoAddTicketsToWallet: values.autoAddTicketsToWallet,
      });
      toast({ title: 'Attendee settings updated' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to update attendee settings',
        variant: 'destructive',
      });
    }
  });

  const handleOrganizerSave = organizerForm.handleSubmit(async (values) => {
    try {
      await updateOrganizerMutation.mutateAsync({
        organizationName: values.organizationName || undefined,
        supportEmail: values.supportEmail || undefined,
        websiteUrl: values.websiteUrl || undefined,
        brandPrimaryColor: values.brandPrimaryColor || undefined,
        defaultEventTimezone: values.defaultEventTimezone,
        defaultCurrency: values.defaultCurrency.toUpperCase(),
        defaultReminderHours: parseReminderHours(values.defaultReminderHoursInput || ''),
        payout: {
          accountHolderName: values.payoutAccountHolderName || undefined,
          bankName: values.payoutBankName || undefined,
          accountLast4: values.payoutAccountLast4 || undefined,
          payoutSchedule: values.payoutSchedule,
        },
      });
      toast({ title: 'Organizer settings updated' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to update organizer settings',
        variant: 'destructive',
      });
    }
  });

  const handleAdminSave = adminForm.handleSubmit(async (values) => {
    try {
      await updateAdminMutation.mutateAsync({
        securityAlertsEmail: values.securityAlertsEmail || undefined,
        requireMfaForAdmins: values.requireMfaForAdmins,
        defaultAuditRetentionDays: values.defaultAuditRetentionDays,
        strictIpLogging: values.strictIpLogging,
        emailCampaignApprovalRequired: values.emailCampaignApprovalRequired,
      });
      toast({ title: 'Admin settings updated' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to update admin settings',
        variant: 'destructive',
      });
    }
  });

  const toggleAttendanceMode = (mode: 'in_person' | 'online' | 'hybrid', checked: boolean) => {
    const current = attendeeForm.getValues('preferredAttendanceModes');
    attendeeForm.setValue(
      'preferredAttendanceModes',
      checked ? Array.from(new Set([...current, mode])) : current.filter((item) => item !== mode),
      { shouldDirty: true }
    );
  };

  if (settingsQuery.isLoading || !snapshot) {
    return (
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-sm text-muted-foreground">Loading your settings...</p>
      </section>
    );
  }

  if (settingsQuery.isError) {
    return (
      <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6">
        <p className="text-sm text-destructive">Unable to load settings right now.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsIntroSection role={role} />

      <ProfileSettingsSection
        form={profileForm}
        onSubmit={handleProfileSave}
        isPending={updateProfileMutation.isPending}
        email={snapshot.profile.email}
        provider={snapshot.profile.provider}
      />

      <PreferencesSettingsSection
        form={preferencesForm}
        onSubmit={handlePreferencesSave}
        isPending={updatePreferencesMutation.isPending}
      />

      <SecuritySettingsSection
        form={passwordForm}
        onSubmit={handlePasswordSave}
        isPending={changePasswordMutation.isPending}
        provider={snapshot.profile.provider}
      />

      {role === 'attendee' ? (
        <AttendeeSettingsSection
          form={attendeeForm}
          onSubmit={handleAttendeeSave}
          isPending={updateAttendeeMutation.isPending}
          preferredAttendanceModes={preferredAttendanceModes}
          onToggleAttendanceMode={toggleAttendanceMode}
        />
      ) : null}

      {role === 'organizer' ? (
        <OrganizerSettingsSection
          form={organizerForm}
          onSubmit={handleOrganizerSave}
          isPending={updateOrganizerMutation.isPending}
        />
      ) : null}

      {role === 'admin' ? (
        <AdminSettingsSection
          form={adminForm}
          onSubmit={handleAdminSave}
          isPending={updateAdminMutation.isPending}
        />
      ) : null}
    </div>
  );
}
