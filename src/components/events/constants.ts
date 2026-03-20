import type { FieldErrors } from 'react-hook-form';
import {
  EVENT_CATEGORY_OPTIONS,
  type EventCreateFormValues,
  type EventCreateInput,
} from '@/lib/schemas/event-create.schema';
import type { EventQuestionType, EventVisibility } from '@/types/event';

export const STEP_TITLES = [
  'Basics',
  'Schedule & Location',
  'Tickets & Capacity',
  'Attendee Form',
  'Publish',
] as const;

export const VISIBILITY_OPTIONS: Array<{ value: EventVisibility; label: string }> = [
  { value: 'public', label: 'Public' },
  { value: 'unlisted', label: 'Unlisted' },
  { value: 'private', label: 'Private' },
];

export const QUESTION_TYPE_OPTIONS: Array<{ value: EventQuestionType; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Single Select' },
  { value: 'checkbox', label: 'Multi Select' },
];

export const CURATED_TIMEZONE_OPTIONS = [
  'UTC',
  'Asia/Rangoon',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Bangkok',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Australia/Sydney',
] as const;

export const CATEGORY_LABEL_MAP: Record<(typeof EVENT_CATEGORY_OPTIONS)[number], string> = {
  conference: 'Conference',
  workshop: 'Workshop',
  meetup: 'Meetup',
  webinar: 'Webinar',
  networking: 'Networking',
  hackathon: 'Hackathon',
  concert: 'Concert',
  festival: 'Festival',
  sports: 'Sports',
  exhibition: 'Exhibition',
  charity: 'Charity',
  other: 'Other',
};

export const STEP_FIELD_MAP: Array<
  ReadonlyArray<keyof EventCreateInput | 'tickets' | 'attendeeQuestions'>
> = [
  ['title', 'shortSummary', 'description', 'category', 'customCategory', 'tagsRaw', 'coverImage'],
  [
    'startDateTime',
    'endDateTime',
    'timezone',
    'attendanceMode',
    'venueName',
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'country',
    'postalCode',
    'onlineEventUrl',
  ],
  ['capacity', 'registrationOpenAt', 'registrationCloseAt', 'tickets'],
  ['organizerName', 'contactEmail', 'organizerUrl', 'refundPolicy', 'attendeeQuestions'],
  ['visibility'],
];

export function getStepErrorCounts(errors: FieldErrors<EventCreateFormValues>): number[] {
  return STEP_FIELD_MAP.map((stepFields) =>
    stepFields.reduce(
      (count, fieldName) => count + (errors[fieldName as keyof EventCreateFormValues] ? 1 : 0),
      0
    )
  );
}

export function getFirstInvalidStep(errors: FieldErrors<EventCreateFormValues>): number {
  const stepErrorCounts = getStepErrorCounts(errors);
  const invalidStepIndex = stepErrorCounts.findIndex((count) => count > 0);
  return invalidStepIndex === -1 ? 0 : invalidStepIndex;
}
