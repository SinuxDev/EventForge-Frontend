'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useFormContext, type UseFieldArrayReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QUESTION_TYPE_OPTIONS } from '@/components/events/constants';
import type { EventCreateFormValues } from '@/lib/schemas/event-create.schema';

interface AttendeeFormStepProps {
  questionsFieldArray: UseFieldArrayReturn<EventCreateFormValues, 'attendeeQuestions', 'id'>;
}

export function AttendeeFormStep({ questionsFieldArray }: AttendeeFormStepProps) {
  const form = useFormContext<EventCreateFormValues>();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-white/70">Organizer name</span>
          <input
            {...form.register('organizerName')}
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-white/70">Contact email</span>
          <input
            {...form.register('contactEmail')}
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-sm"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-white/70">Refund policy</span>
        <textarea
          {...form.register('refundPolicy')}
          className="min-h-25 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 py-3 text-sm"
          placeholder="State cancellation and refund terms"
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/85">Custom questions</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              questionsFieldArray.append({
                label: 'New question',
                type: 'text',
                required: false,
                optionsRaw: '',
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add question
          </Button>
        </div>

        {questionsFieldArray.fields.map((field, index) => (
          <div key={field.id} className="rounded-xl border border-white/12 bg-white/4 p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_120px_44px]">
              <input
                {...form.register(`attendeeQuestions.${index}.label`)}
                className="h-10 rounded-lg border border-white/15 bg-black/25 px-3 text-sm"
                placeholder="Question label"
              />

              <Select
                value={form.watch(`attendeeQuestions.${index}.type`) ?? 'text'}
                onValueChange={(value) => {
                  form.setValue(
                    `attendeeQuestions.${index}.type`,
                    value as EventCreateFormValues['attendeeQuestions'][number]['type'],
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    }
                  );
                }}
              >
                <SelectTrigger className="h-10 rounded-lg px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-black/25 px-3 text-xs text-white/75">
                <input type="checkbox" {...form.register(`attendeeQuestions.${index}.required`)} />
                Required
              </label>

              <button
                type="button"
                onClick={() => questionsFieldArray.remove(index)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/8 text-white/75 hover:text-white"
                title="Remove question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <input
              {...form.register(`attendeeQuestions.${index}.optionsRaw`)}
              className="mt-3 h-10 w-full rounded-lg border border-white/15 bg-black/25 px-3 text-sm"
              placeholder="Options (comma separated)"
            />
          </div>
        ))}
      </div>
    </>
  );
}
