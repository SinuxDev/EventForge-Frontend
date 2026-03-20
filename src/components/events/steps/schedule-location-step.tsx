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
        <p className="rounded-xl border border-[#ff69b4]/35 bg-[#ff69b4]/12 px-3 py-2 text-xs text-[#ffb3d8]">
          Please review highlighted fields in this section. Hybrid events require in-person location
          details and an online URL.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-sm text-white/70">Start date/time</span>
          <input
            type="datetime-local"
            {...form.register('startDateTime', {
              onChange: () => {
                void form.trigger(['startDateTime', 'endDateTime']);
              },
            })}
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
          />
          <p className="text-xs text-[#ff9ec9]">{form.formState.errors.startDateTime?.message}</p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-white/70">End date/time</span>
          <input
            type="datetime-local"
            {...form.register('endDateTime', {
              onChange: () => {
                void form.trigger(['startDateTime', 'endDateTime']);
              },
            })}
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
          />
          <p className="text-xs text-[#ff9ec9]">{form.formState.errors.endDateTime?.message}</p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-white/70">Timezone</span>
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
          <p className="text-xs text-[#ff9ec9]">{form.formState.errors.timezone?.message}</p>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-white/70">Attendance mode</span>
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
          <span className="text-sm text-white/70">Online URL</span>
          <input
            disabled={!isOnlineUrlEnabled}
            {...form.register('onlineEventUrl')}
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-black/10 disabled:text-white/35"
            placeholder="https://meet.example.com/room"
          />
          <p className="text-[11px] text-white/45">Required for online or hybrid events.</p>
          <p className="text-xs text-[#ff9ec9]">{form.formState.errors.onlineEventUrl?.message}</p>
        </label>
      </div>

      {attendanceMode !== 'online' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm text-white/70">Venue name</span>
            <input
              {...form.register('venueName')}
              className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
            />
            <p className="text-xs text-[#ff9ec9]">{form.formState.errors.venueName?.message}</p>
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-white/70">Address line 1</span>
            <input
              {...form.register('addressLine1')}
              className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
            />
            <p className="text-xs text-[#ff9ec9]">{form.formState.errors.addressLine1?.message}</p>
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-white/70">City</span>
            <input
              {...form.register('city')}
              className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
            />
            <p className="text-xs text-[#ff9ec9]">{form.formState.errors.city?.message}</p>
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-white/70">Country</span>
            <input
              {...form.register('country')}
              className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
            />
            <p className="text-xs text-[#ff9ec9]">{form.formState.errors.country?.message}</p>
          </label>
        </div>
      ) : null}
    </>
  );
}
