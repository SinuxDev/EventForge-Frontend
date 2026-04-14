'use client';

import { CalendarDays, ChevronLeft, ChevronRight, Clock3, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDateTimeString = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${toDateString(date)}T${hours}:${minutes}`;
};

const parseDateInput = (value?: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const sameDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isDayOutOfRange = (day: Date, minDate?: Date | null, maxDate?: Date | null): boolean => {
  const normalized = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const min = minDate
    ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime()
    : null;
  const max = maxDate
    ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime()
    : null;

  return (min !== null && normalized < min) || (max !== null && normalized > max);
};

interface DateBaseProps {
  value?: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

interface DateTimeFieldProps extends DateBaseProps {
  mode: 'datetime';
}

interface DateOnlyFieldProps extends DateBaseProps {
  mode: 'date';
}

type DateFieldProps = DateTimeFieldProps | DateOnlyFieldProps;

function DatePickerField({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  min,
  max,
  mode,
}: DateFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedDate = useMemo(() => parseDateInput(value), [value]);
  const minDate = useMemo(() => parseDateInput(min), [min]);
  const maxDate = useMemo(() => parseDateInput(max), [max]);

  const [panelMonth, setPanelMonth] = useState<Date>(() => {
    const base = selectedDate ?? new Date();
    return startOfMonth(base);
  });

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  const formattedValue = useMemo(() => {
    if (!selectedDate) {
      return '';
    }

    if (mode === 'datetime') {
      return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(selectedDate);
    }

    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
    }).format(selectedDate);
  }, [mode, selectedDate]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(panelMonth),
    [panelMonth]
  );

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(panelMonth);
    const monthStartWeekday = monthStart.getDay();
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStartWeekday);

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return day;
    });
  }, [panelMonth]);

  const currentHours = selectedDate ? String(selectedDate.getHours()).padStart(2, '0') : '00';
  const currentMinutes = selectedDate ? String(selectedDate.getMinutes()).padStart(2, '0') : '00';

  const updateTimePart = (hours: string, minutes: string) => {
    const base = selectedDate ?? new Date();
    const next = new Date(base);
    next.setHours(Number(hours), Number(minutes), 0, 0);
    onChange(toDateTimeString(next));
  };

  const onSelectDay = (day: Date) => {
    if (isDayOutOfRange(day, minDate, maxDate)) {
      return;
    }

    if (mode === 'date') {
      onChange(toDateString(day));
      setIsOpen(false);
      return;
    }

    const base = selectedDate ?? new Date();
    const next = new Date(day);
    next.setHours(base.getHours(), base.getMinutes(), 0, 0);
    onChange(toDateTimeString(next));
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => {
            const nextState = !current;
            if (nextState) {
              const base = selectedDate ?? new Date();
              setPanelMonth(startOfMonth(base));
            }

            return nextState;
          });
        }}
        disabled={disabled}
        className={cn(
          'h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-left text-sm text-foreground outline-none transition focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
          'inline-flex items-center justify-between gap-2'
        )}
      >
        <span className={cn('truncate', !formattedValue && 'text-muted-foreground')}>
          {formattedValue ||
            placeholder ||
            (mode === 'datetime' ? 'Select date and time' : 'Select date')}
        </span>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-120 w-76 rounded-2xl border border-border bg-popover/96 p-3 text-popover-foreground shadow-[0_22px_50px_rgba(0,0,0,0.28)] backdrop-blur md:w-84">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setPanelMonth(
                  (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                )
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition hover:border-ring/45 hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold">{monthLabel}</p>
            <button
              type="button"
              onClick={() =>
                setPanelMonth(
                  (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                )
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition hover:border-ring/45 hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="inline-flex h-7 items-center justify-center text-[11px] font-medium text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {gridDays.map((day) => {
              const isCurrentMonth = day.getMonth() === panelMonth.getMonth();
              const isSelected = selectedDate ? sameDay(day, selectedDate) : false;
              const isOutOfRange = isDayOutOfRange(day, minDate, maxDate);

              return (
                <button
                  key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                  type="button"
                  onClick={() => onSelectDay(day)}
                  disabled={isOutOfRange}
                  className={cn(
                    'h-9 rounded-lg text-sm transition',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(0,168,150,0.35)]'
                      : 'text-foreground hover:bg-muted',
                    !isCurrentMonth && !isSelected && 'text-muted-foreground/65',
                    isOutOfRange && 'cursor-not-allowed opacity-30 hover:bg-transparent'
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {mode === 'datetime' ? (
            <div className="mt-3 rounded-xl border border-border bg-background/55 p-2.5">
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" /> 24-hour time
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <select
                  value={currentHours}
                  onChange={(event) => updateTimePart(event.target.value, currentMinutes)}
                  className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
                >
                  {Array.from({ length: 24 }, (_, value) => String(value).padStart(2, '0')).map(
                    (hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    )
                  )}
                </select>
                <span className="text-sm text-muted-foreground">:</span>
                <select
                  value={currentMinutes}
                  onChange={(event) => updateTimePart(currentHours, event.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
                >
                  {Array.from({ length: 60 }, (_, value) => String(value).padStart(2, '0')).map(
                    (minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DateTimeField(props: DateBaseProps) {
  return <DatePickerField {...props} mode="datetime" />;
}

export function DateField(props: DateBaseProps) {
  return <DatePickerField {...props} mode="date" />;
}
