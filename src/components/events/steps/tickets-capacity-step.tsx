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
import type { EventCreateFormValues } from '@/lib/schemas/event-create.schema';

const CURRENCY_OPTIONS = ['USD', 'SGD', 'MMK', 'EUR'] as const;

interface TicketsCapacityStepProps {
  ticketsFieldArray: UseFieldArrayReturn<EventCreateFormValues, 'tickets', 'id'>;
}

export function TicketsCapacityStep({ ticketsFieldArray }: TicketsCapacityStepProps) {
  const form = useFormContext<EventCreateFormValues>();
  const eventStartDateTime = form.watch('startDateTime');
  const capacity = Number(form.watch('capacity') ?? 0);
  const ticketValues = form.watch('tickets') ?? [];
  const totalTicketQuantity = ticketValues.reduce(
    (sum, ticket) => sum + Number(ticket?.quantity ?? 0),
    0
  );
  const remainingSeats = Math.max(0, capacity - totalTicketQuantity);
  const canAddTicket = remainingSeats > 0;

  const validateRegistrationDates = () => {
    void form.trigger(['registrationOpenAt', 'registrationCloseAt', 'startDateTime']);
  };

  const validateTicketCapacity = () => {
    void form.trigger(['capacity', 'tickets']);
  };

  const handleTicketTypeChange = (
    index: number,
    value: EventCreateFormValues['tickets'][number]['type']
  ) => {
    form.setValue(`tickets.${index}.type`, value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (value === 'paid') {
      const currentCurrency = form.getValues(`tickets.${index}.currency`);
      if (!currentCurrency) {
        form.setValue(`tickets.${index}.currency`, 'USD', {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      return;
    }

    form.setValue(`tickets.${index}.price`, undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`tickets.${index}.currency`, undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Capacity</span>
          <input
            type="number"
            {...form.register('capacity', {
              onChange: validateTicketCapacity,
            })}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none focus:border-ring"
          />
          <p className="text-xs text-destructive">{form.formState.errors.capacity?.message}</p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Registration opens</span>
          <input
            type="datetime-local"
            {...form.register('registrationOpenAt', {
              onChange: validateRegistrationDates,
            })}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none focus:border-ring"
            max={eventStartDateTime || undefined}
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.registrationOpenAt?.message}
          </p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Registration closes</span>
          <input
            type="datetime-local"
            {...form.register('registrationCloseAt', {
              onChange: validateRegistrationDates,
            })}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none focus:border-ring"
            max={eventStartDateTime || undefined}
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.registrationCloseAt?.message}
          </p>
        </label>
      </div>

      {form.formState.errors.registrationOpenAt || form.formState.errors.registrationCloseAt ? (
        <p className="rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Registration open and close must be before the event start time.
        </p>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ticket types</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Capacity: {capacity || 0} • Assigned: {totalTicketQuantity} • Remaining:{' '}
              {remainingSeats}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="h-10 border-primary/45 bg-primary/16 px-4 text-primary hover:border-primary/65 hover:bg-primary/24"
            disabled={!canAddTicket}
            onClick={() =>
              ticketsFieldArray.append({
                name: 'New Ticket',
                type: 'free',
                quantity: Math.min(10, Math.max(1, remainingSeats)),
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add ticket
          </Button>
        </div>

        {ticketsFieldArray.fields.map((field, index) => (
          <div key={field.id} className="rounded-xl border border-border bg-card/65 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex rounded-lg border border-border bg-muted/55 p-1">
                {(['free', 'paid'] as const).map((typeOption) => {
                  const isSelected = (form.watch(`tickets.${index}.type`) ?? 'free') === typeOption;

                  return (
                    <button
                      key={typeOption}
                      type="button"
                      onClick={() => handleTicketTypeChange(index, typeOption)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                        isSelected
                          ? 'bg-primary/18 text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {typeOption}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => ticketsFieldArray.remove(index)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/75 text-muted-foreground transition hover:border-ring/40 hover:text-foreground"
                title="Remove ticket"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <input
                {...form.register(`tickets.${index}.name`)}
                className="h-10 rounded-lg border border-input bg-background/85 px-3 text-sm text-foreground"
                placeholder="Ticket name"
              />

              <input
                type="number"
                max={Math.max(0, capacity)}
                {...form.register(`tickets.${index}.quantity`, {
                  onChange: validateTicketCapacity,
                })}
                className="h-10 rounded-lg border border-input bg-background/85 px-3 text-sm text-foreground"
                placeholder="Qty"
              />

              {(form.watch(`tickets.${index}.type`) ?? 'free') === 'paid' ? (
                <input
                  type="number"
                  step="0.01"
                  {...form.register(`tickets.${index}.price`, {
                    onChange: () => {
                      void form.trigger(`tickets.${index}.price`);
                    },
                  })}
                  className="h-10 rounded-lg border border-input bg-background/85 px-3 text-sm text-foreground"
                  placeholder="Price"
                />
              ) : (
                <div className="inline-flex h-10 items-center rounded-lg border border-primary/35 bg-primary/10 px-3 text-sm text-primary">
                  Free ticket
                </div>
              )}

              {(form.watch(`tickets.${index}.type`) ?? 'free') === 'paid' ? (
                <Select
                  value={form.watch(`tickets.${index}.currency`) ?? 'USD'}
                  onValueChange={(value) => {
                    form.setValue(`tickets.${index}.currency`, value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger className="h-10 rounded-lg px-3">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="inline-flex h-10 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                  Currency not required
                </div>
              )}
            </div>

            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <p className="text-xs text-destructive">
                {form.formState.errors.tickets?.[index]?.quantity?.message as string | undefined}
              </p>
              <p className="text-xs text-destructive">
                {(form.formState.errors.tickets?.[index]?.price?.message as string | undefined) ??
                  (form.formState.errors.tickets?.[index]?.currency?.message as string | undefined)}
              </p>
            </div>
          </div>
        ))}

        <p className="text-xs text-destructive">
          {form.formState.errors.tickets?.message as string | undefined}
        </p>
      </div>
    </>
  );
}
