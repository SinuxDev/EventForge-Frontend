'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type {
  AdminSettingsInput,
  AttendeeSettingsInput,
  OrganizerSettingsInput,
  PasswordChangeInput,
  PreferencesSettingsInput,
  ProfileSettingsInput,
} from '@/lib/schemas/settings.schema';

type SubmitHandler = (event?: React.BaseSyntheticEvent) => Promise<void>;

interface SettingsIntroSectionProps {
  role: 'attendee' | 'organizer' | 'admin';
}

export function SettingsIntroSection({ role }: SettingsIntroSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Settings</p>
      <h1 className="mt-3 text-3xl font-bold">Workspace settings</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Manage your profile, security, and {role}-specific defaults.
      </p>
    </section>
  );
}

interface ProfileSettingsSectionProps {
  form: UseFormReturn<ProfileSettingsInput>;
  onSubmit: SubmitHandler;
  isPending: boolean;
  email: string;
  provider: string;
}

export function ProfileSettingsSection({
  form,
  onSubmit,
  isPending,
  email,
  provider,
}: ProfileSettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-5">
      <h2 className="text-lg font-semibold">Profile</h2>
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Name
          </label>
          <input
            {...form.register('name')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
          {form.formState.errors.name ? (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Avatar URL
          </label>
          <input
            {...form.register('avatar')}
            placeholder="https://..."
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div className="rounded-xl border border-border bg-background/70 p-3 text-sm text-muted-foreground md:col-span-2">
          Signed in as {email} ({provider})
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={!form.formState.isDirty || isPending}>
            {isPending ? 'Saving...' : 'Save profile'}
          </Button>
        </div>
      </form>
    </section>
  );
}

interface PreferencesSettingsSectionProps {
  form: UseFormReturn<PreferencesSettingsInput>;
  onSubmit: SubmitHandler;
  isPending: boolean;
}

export function PreferencesSettingsSection({
  form,
  onSubmit,
  isPending,
}: PreferencesSettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-5">
      <h2 className="text-lg font-semibold">Preferences</h2>
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Timezone
          </label>
          <input
            {...form.register('timezone')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Locale
          </label>
          <input
            {...form.register('locale')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Date format
          </label>
          <Controller
            control={form.control}
            name="dateFormat"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Time format
          </label>
          <Controller
            control={form.control}
            name="timeFormat"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="md:col-span-2 space-y-2 rounded-xl border border-border bg-background/70 p-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('marketingOptIn')} />
            <span>Allow product and marketing emails</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('notifications.eventReminders')} />
            <span>Event reminders</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('notifications.eventAnnouncements')} />
            <span>Event announcements</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('notifications.eventUpdates')} />
            <span>Event updates</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={!form.formState.isDirty || isPending}>
            {isPending ? 'Saving...' : 'Save preferences'}
          </Button>
        </div>
      </form>
    </section>
  );
}

interface SecuritySettingsSectionProps {
  form: UseFormReturn<PasswordChangeInput>;
  onSubmit: SubmitHandler;
  isPending: boolean;
  provider: string;
}

export function SecuritySettingsSection({
  form,
  onSubmit,
  isPending,
  provider,
}: SecuritySettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-5">
      <h2 className="text-lg font-semibold">Account security</h2>
      {provider !== 'credentials' ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Password changes are managed by your {provider} account.
        </p>
      ) : (
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Current password
            </label>
            <input
              type="password"
              {...form.register('currentPassword')}
              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
              New password
            </label>
            <input
              type="password"
              {...form.register('newPassword')}
              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Confirm password
            </label>
            <input
              type="password"
              {...form.register('confirmPassword')}
              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />
          </div>

          <div className="md:col-span-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Change password'}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

interface AttendeeSettingsSectionProps {
  form: UseFormReturn<AttendeeSettingsInput>;
  onSubmit: SubmitHandler;
  isPending: boolean;
  preferredAttendanceModes: Array<'in_person' | 'online' | 'hybrid'>;
  onToggleAttendanceMode: (mode: 'in_person' | 'online' | 'hybrid', checked: boolean) => void;
}

export function AttendeeSettingsSection({
  form,
  onSubmit,
  isPending,
  preferredAttendanceModes,
  onToggleAttendanceMode,
}: AttendeeSettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-5">
      <h2 className="text-lg font-semibold">Attendee settings</h2>
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Interests (comma separated)
          </label>
          <input
            {...form.register('interestsInput')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div className="md:col-span-2 rounded-xl border border-border bg-background/70 p-3 text-sm space-y-2">
          <p className="font-medium text-foreground">Preferred attendance modes</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferredAttendanceModes.includes('in_person')}
              onChange={(event) => onToggleAttendanceMode('in_person', event.target.checked)}
            />
            <span>In person</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferredAttendanceModes.includes('online')}
              onChange={(event) => onToggleAttendanceMode('online', event.target.checked)}
            />
            <span>Online</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferredAttendanceModes.includes('hybrid')}
              onChange={(event) => onToggleAttendanceMode('hybrid', event.target.checked)}
            />
            <span>Hybrid</span>
          </label>
        </div>

        <div className="md:col-span-2 rounded-xl border border-border bg-background/70 p-3 text-sm space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('directMessagesEnabled')} />
            <span>Allow direct messages</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('showProfileToOtherAttendees')} />
            <span>Show my profile to other attendees</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('autoAddTicketsToWallet')} />
            <span>Auto-add tickets to wallet</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={!form.formState.isDirty || isPending}>
            {isPending ? 'Saving...' : 'Save attendee settings'}
          </Button>
        </div>
      </form>
    </section>
  );
}

interface OrganizerSettingsSectionProps {
  form: UseFormReturn<OrganizerSettingsInput>;
  onSubmit: SubmitHandler;
  isPending: boolean;
}

export function OrganizerSettingsSection({
  form,
  onSubmit,
  isPending,
}: OrganizerSettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-5">
      <h2 className="text-lg font-semibold">Organizer settings</h2>
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Organization name
          </label>
          <input
            {...form.register('organizationName')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Support email
          </label>
          <input
            {...form.register('supportEmail')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Website URL
          </label>
          <input
            {...form.register('websiteUrl')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Brand color
          </label>
          <input
            {...form.register('brandPrimaryColor')}
            placeholder="#00A896"
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Default timezone
          </label>
          <input
            {...form.register('defaultEventTimezone')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Currency
          </label>
          <input
            {...form.register('defaultCurrency')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Reminder hours (comma separated)
          </label>
          <input
            {...form.register('defaultReminderHoursInput')}
            placeholder="24, 1"
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Payout account holder
          </label>
          <input
            {...form.register('payoutAccountHolderName')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Bank name
          </label>
          <input
            {...form.register('payoutBankName')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Account last 4
          </label>
          <input
            {...form.register('payoutAccountLast4')}
            maxLength={4}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Payout schedule
          </label>
          <Controller
            control={form.control}
            name="payoutSchedule"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={!form.formState.isDirty || isPending}>
            {isPending ? 'Saving...' : 'Save organizer settings'}
          </Button>
        </div>
      </form>
    </section>
  );
}

interface AdminSettingsSectionProps {
  form: UseFormReturn<AdminSettingsInput>;
  onSubmit: SubmitHandler;
  isPending: boolean;
}

export function AdminSettingsSection({ form, onSubmit, isPending }: AdminSettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-5">
      <h2 className="text-lg font-semibold">Admin settings</h2>
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Security alerts email
          </label>
          <input
            {...form.register('securityAlertsEmail')}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Audit retention days
          </label>
          <input
            type="number"
            {...form.register('defaultAuditRetentionDays', { valueAsNumber: true })}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </div>

        <div className="md:col-span-2 rounded-xl border border-border bg-background/70 p-3 text-sm space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('requireMfaForAdmins')} />
            <span>Require MFA for admin accounts</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('strictIpLogging')} />
            <span>Enable strict IP logging for sensitive actions</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('emailCampaignApprovalRequired')} />
            <span>Require approval before sending email campaigns</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={!form.formState.isDirty || isPending}>
            {isPending ? 'Saving...' : 'Save admin settings'}
          </Button>
        </div>
      </form>
    </section>
  );
}
