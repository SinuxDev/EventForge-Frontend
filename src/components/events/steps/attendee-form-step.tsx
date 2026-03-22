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
          <span className="text-sm text-muted-foreground">Organizer name</span>
          <input
            {...form.register('organizerName')}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none focus:border-ring"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Contact email</span>
          <input
            {...form.register('contactEmail')}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none focus:border-ring"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Refund policy</span>
        <textarea
          {...form.register('refundPolicy')}
          className="min-h-25 w-full rounded-xl border border-input bg-background/85 px-3.5 py-3 text-sm text-foreground outline-none focus:border-ring"
          placeholder="State cancellation and refund terms"
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Custom questions</h3>
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
          <div key={field.id} className="rounded-xl border border-border bg-card/65 p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_120px_44px]">
              <input
                {...form.register(`attendeeQuestions.${index}.label`)}
                className="h-10 rounded-lg border border-input bg-background/85 px-3 text-sm text-foreground"
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

              <label className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-muted/45 px-3 text-xs text-muted-foreground">
                <input type="checkbox" {...form.register(`attendeeQuestions.${index}.required`)} />
                Required
              </label>

              <button
                type="button"
                onClick={() => questionsFieldArray.remove(index)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/75 text-muted-foreground transition hover:border-ring/40 hover:text-foreground"
                title="Remove question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <input
              {...form.register(`attendeeQuestions.${index}.optionsRaw`)}
              className="mt-3 h-10 w-full rounded-lg border border-input bg-background/85 px-3 text-sm text-foreground"
              placeholder="Options (comma separated)"
            />
          </div>
        ))}
      </div>
    </>
  );
}
