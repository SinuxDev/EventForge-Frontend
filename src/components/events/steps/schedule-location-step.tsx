'use client';

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURATED_TIMEZONE_OPTIONS } from '@/components/events/constants';
import type { EventCreateFormValues } from '@/lib/schemas/event-create.schema';
import { useFormContext } from 'react-hook-form';

export function ScheduleLocationStep() {
  const form = useFormContext<EventCreateFormValues>();
  const attendanceMode = form.watch('attendanceMode');
  const timezone = form.watch('timezone');

  const timezoneOptions = useMemo(() => {
    if (
      !timezone ||
      CURATED_TIMEZONE_OPTIONS.includes(timezone as (typeof CURATED_TIMEZONE_OPTIONS)[number])
    ) {
      return CURATED_TIMEZONE_OPTIONS;
    }

    return [timezone, ...CURATED_TIMEZONE_OPTIONS] as const;
  }, [timezone]);

  const isOnlineUrlEnabled = attendanceMode === 'online' || attendanceMode === 'hybrid';

  return (
    <>
      {form.formState.errors.venueName ||
      form.formState.errors.addressLine1 ||
      form.formState.errors.city ||
      form.formState.errors.country ||
      form.formState.errors.onlineEventUrl ||
      form.formState.errors.endDateTime ||
      form.formState.errors.startDateTime ? (
        <p className="rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Please review highlighted fields in this section. Hybrid events require in-person location
          details and an online URL.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Start date/time</span>
          <input
            type="datetime-local"
            {...form.register('startDateTime', {
              onChange: () => {
                void form.trigger(['startDateTime', 'endDateTime']);
              },
            })}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
          <p className="text-xs text-destructive">{form.formState.errors.startDateTime?.message}</p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">End date/time</span>
          <input
            type="datetime-local"
            {...form.register('endDateTime', {
              onChange: () => {
                void form.trigger(['startDateTime', 'endDateTime']);
              },
            })}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
          />
          <p className="text-xs text-destructive">{form.formState.errors.endDateTime?.message}</p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Timezone</span>
          <Select
            value={timezone}
            onValueChange={(value) => {
              form.setValue('timezone', value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezoneOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-destructive">{form.formState.errors.timezone?.message}</p>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Attendance mode</span>
          <Select
            value={attendanceMode}
            onValueChange={(value) => {
              form.setValue('attendanceMode', value as EventCreateFormValues['attendanceMode'], {
                shouldDirty: true,
                shouldValidate: true,
              });

              if (value === 'in_person') {
                form.setValue('onlineEventUrl', '', {
                  shouldDirty: true,
                  shouldValidate: false,
                });
                form.clearErrors('onlineEventUrl');
              }
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select attendance mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_person">In person</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Online URL</span>
          <input
            disabled={!isOnlineUrlEnabled}
            {...form.register('onlineEventUrl')}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition focus:border-ring disabled:cursor-not-allowed disabled:border-border disabled:bg-muted/40 disabled:text-muted-foreground"
            placeholder="https://meet.example.com/room"
          />
          <p className="text-[11px] text-muted-foreground">Required for online or hybrid events.</p>
          <p className="text-xs text-destructive">
            {form.formState.errors.onlineEventUrl?.message}
          </p>
        </label>
      </div>

      {attendanceMode !== 'online' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm text-muted-foreground">Venue name</span>
            <input
              {...form.register('venueName')}
              className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />
            <p className="text-xs text-destructive">{form.formState.errors.venueName?.message}</p>
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-muted-foreground">Address line 1</span>
            <input
              {...form.register('addressLine1')}
              className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.addressLine1?.message}
            </p>
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-muted-foreground">City</span>
            <input
              {...form.register('city')}
              className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />
            <p className="text-xs text-destructive">{form.formState.errors.city?.message}</p>
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-muted-foreground">Country</span>
            <input
              {...form.register('country')}
              className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
            />
            <p className="text-xs text-destructive">{form.formState.errors.country?.message}</p>
          </label>
        </div>
      ) : null}
    </>
  );
}
