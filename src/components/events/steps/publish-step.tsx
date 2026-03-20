'use client';

import { useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VISIBILITY_OPTIONS } from '@/components/events/constants';
import type { EventCreateFormValues } from '@/lib/schemas/event-create.schema';

export function PublishStep() {
  const form = useFormContext<EventCreateFormValues>();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-white/70">Visibility</span>
          <Select
            value={form.watch('visibility')}
            onValueChange={(value) => {
              form.setValue('visibility', value as EventCreateFormValues['visibility'], {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-white/70">Organizer website (optional)</span>
          <input
            {...form.register('organizerUrl')}
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm"
            placeholder="https://your-brand.com"
          />
        </label>
      </div>

      <p className="rounded-xl border border-[#00A896]/30 bg-[#00A896]/10 px-4 py-3 text-sm text-[#a7fff5]">
        Publishing checklist: valid date/time, location completeness, and at least one ticket.
      </p>
    </>
  );
}
