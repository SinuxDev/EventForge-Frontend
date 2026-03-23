'use client';

import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PublicDatePreset, PublicEventsFilters, PublicSort } from '@/hooks/use-public-events';

interface PublicEventsFiltersProps {
  filters: PublicEventsFilters;
  onChange: (next: Partial<PublicEventsFilters>) => void;
  onClearAll: () => void;
}

const MODE_OPTIONS: Array<{ value: PublicEventsFilters['mode']; label: string }> = [
  { value: '', label: 'All modes' },
  { value: 'in_person', label: 'In person' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' },
];

const DATE_OPTIONS: Array<{ value: PublicDatePreset; label: string }> = [
  { value: 'all', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

const SORT_OPTIONS: Array<{ value: PublicSort; label: string }> = [
  { value: 'soonest', label: 'Soonest first' },
  { value: 'latest', label: 'Latest first' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'networking', label: 'Networking' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'concert', label: 'Concert' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'festival', label: 'Festival' },
  { value: 'other', label: 'Other' },
];

export function PublicEventsFilters({ filters, onChange, onClearAll }: PublicEventsFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.q ||
    filters.category ||
    filters.mode ||
    filters.date !== 'all' ||
    filters.sort !== 'soonest'
  );

  return (
    <section className="rounded-2xl border border-border bg-card/82 p-4 backdrop-blur md:p-5">
      <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_0.7fr_auto]">
        <label className="relative block md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.q}
            onChange={(event) => onChange({ q: event.target.value })}
            placeholder="Search events by title, summary, or category"
            className="h-11 w-full rounded-xl border border-input bg-background/85 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-ring"
          />
        </label>

        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => onChange({ category: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.label} value={option.value || 'all'}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.mode || 'all'}
          onValueChange={(value) =>
            onChange({ mode: value === 'all' ? '' : (value as PublicEventsFilters['mode']) })
          }
        >
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODE_OPTIONS.map((option) => (
              <SelectItem key={option.label} value={option.value || 'all'}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.date}
          onValueChange={(value) => onChange({ date: value as PublicDatePreset })}
        >
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(value) => onChange({ sort: value as PublicSort })}
        >
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="h-11 border-border bg-background/80 text-foreground hover:border-ring/35 hover:bg-muted"
          onClick={onClearAll}
          disabled={!hasActiveFilters}
        >
          Clear
        </Button>
      </div>

      {hasActiveFilters ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {filters.q ? (
            <button
              type="button"
              onClick={() => onChange({ q: '' })}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground transition hover:border-ring/35 hover:text-foreground"
            >
              {`Search: ${filters.q}`}
              <X className="h-3 w-3" />
            </button>
          ) : null}

          {filters.category ? (
            <button
              type="button"
              onClick={() => onChange({ category: '' })}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground transition hover:border-ring/35 hover:text-foreground"
            >
              {`Category: ${filters.category}`}
              <X className="h-3 w-3" />
            </button>
          ) : null}

          {filters.mode ? (
            <button
              type="button"
              onClick={() => onChange({ mode: '' })}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground transition hover:border-ring/35 hover:text-foreground"
            >
              {`Mode: ${filters.mode.replace('_', ' ')}`}
              <X className="h-3 w-3" />
            </button>
          ) : null}

          {filters.date !== 'all' ? (
            <button
              type="button"
              onClick={() => onChange({ date: 'all' })}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground transition hover:border-ring/35 hover:text-foreground"
            >
              {`Date: ${DATE_OPTIONS.find((option) => option.value === filters.date)?.label}`}
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
