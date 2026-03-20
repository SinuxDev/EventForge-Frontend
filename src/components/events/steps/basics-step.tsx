'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_LABEL_MAP } from '@/components/events/constants';
import {
  EVENT_CATEGORY_OPTIONS,
  type EventCreateFormValues,
} from '@/lib/schemas/event-create.schema';
import { useFormContext } from 'react-hook-form';

export function BasicsStep() {
  const form = useFormContext<EventCreateFormValues>();
  const selectedCategory = form.watch('category');

  return (
    <>
      <label className="block space-y-2">
        <span className="text-sm text-white/70">Event title</span>
        <input
          {...form.register('title')}
          className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
          placeholder="e.g. EventForge Growth Summit 2026"
        />
        <p className="text-xs text-[#ff9ec9]">{form.formState.errors.title?.message}</p>
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-white/70">Short summary</span>
        <input
          {...form.register('shortSummary')}
          className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
          placeholder="One line that explains the value"
        />
        <p className="text-xs text-[#ff9ec9]">{form.formState.errors.shortSummary?.message}</p>
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-white/70">Description</span>
        <textarea
          {...form.register('description')}
          className="min-h-30 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
          placeholder="Write the full event details"
        />
        <p className="text-xs text-[#ff9ec9]">{form.formState.errors.description?.message}</p>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-white/70">Category</span>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              form.setValue('category', value as EventCreateFormValues['category'], {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {CATEGORY_LABEL_MAP[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-[#ff9ec9]">{form.formState.errors.category?.message}</p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-white/70">Tags (comma separated)</span>
          <input
            {...form.register('tagsRaw')}
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
            placeholder="growth, startup, marketing"
          />
        </label>
      </div>

      {selectedCategory === 'other' ? (
        <label className="block space-y-2">
          <span className="text-sm text-white/70">Custom category</span>
          <input
            {...form.register('customCategory')}
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm outline-none transition focus:border-[#00A896]"
            placeholder="Enter your custom category"
          />
          <p className="text-xs text-[#ff9ec9]">{form.formState.errors.customCategory?.message}</p>
        </label>
      ) : null}
    </>
  );
}
