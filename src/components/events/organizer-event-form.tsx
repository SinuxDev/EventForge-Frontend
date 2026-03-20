'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { AttendeeFormStep } from '@/components/events/steps/attendee-form-step';
import { BasicsStep } from '@/components/events/steps/basics-step';
import { PublishStep } from '@/components/events/steps/publish-step';
import { ScheduleLocationStep } from '@/components/events/steps/schedule-location-step';
import { StepPills } from '@/components/events/steps/step-pills';
import { TicketsCapacityStep } from '@/components/events/steps/tickets-capacity-step';
import {
  STEP_FIELD_MAP,
  STEP_TITLES,
  getFirstInvalidStep,
  getStepErrorCounts,
} from '@/components/events/constants';
import { Button } from '@/components/ui/button';
import {
  createEventDraft,
  getMyEvent,
  listMyEvents,
  publishEvent,
  updateEventDraft,
} from '@/lib/api/events';
import { getPostPublishRedirect } from '@/lib/event-draft-flow';
import {
  EVENT_CATEGORY_OPTIONS,
  eventCreateSchema,
  type EventCreateFormValues,
  type EventCreateInput,
} from '@/lib/schemas/event-create.schema';
import { toast } from '@/hooks/use-toast';
import type {
  EventEntity,
  EventPayload,
  EventQuestionInput,
  EventTicketInput,
} from '@/types/event';

const EMPTY_FORM_DEFAULTS: EventCreateFormValues = {
  title: '',
  shortSummary: '',
  description: '',
  category: 'conference',
  customCategory: '',
  tagsRaw: '',
  coverImage: '',
  attendanceMode: 'in_person',
  venueName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  onlineEventUrl: '',
  startDateTime: '',
  endDateTime: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  registrationOpenAt: '',
  registrationCloseAt: '',
  capacity: 100,
  visibility: 'public',
  organizerName: '',
  organizerUrl: '',
  contactEmail: '',
  refundPolicy: '',
  tickets: [{ name: 'General Admission', type: 'free', quantity: 100 }],
  attendeeQuestions: [],
};

function toDateTimeLocalString(value?: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function mapEventToFormValues(event: EventEntity): EventCreateFormValues {
  const normalizedCategory = event.category.toLowerCase();
  const isKnownCategory = EVENT_CATEGORY_OPTIONS.includes(
    normalizedCategory as (typeof EVENT_CATEGORY_OPTIONS)[number]
  );

  return {
    title: event.title,
    shortSummary: event.shortSummary,
    description: event.description,
    category: isKnownCategory ? (normalizedCategory as EventCreateFormValues['category']) : 'other',
    customCategory: isKnownCategory ? '' : event.category,
    tagsRaw: (event.tags ?? []).join(', '),
    coverImage: event.coverImage ?? '',
    attendanceMode: event.attendanceMode,
    venueName: event.venueName ?? '',
    addressLine1: event.addressLine1 ?? '',
    addressLine2: event.addressLine2 ?? '',
    city: event.city ?? '',
    state: event.state ?? '',
    country: event.country ?? '',
    postalCode: event.postalCode ?? '',
    onlineEventUrl: event.onlineEventUrl ?? '',
    startDateTime: toDateTimeLocalString(event.startDateTime),
    endDateTime: toDateTimeLocalString(event.endDateTime),
    timezone: event.timezone,
    registrationOpenAt: toDateTimeLocalString(event.registrationOpenAt),
    registrationCloseAt: toDateTimeLocalString(event.registrationCloseAt),
    capacity: event.capacity,
    visibility: event.visibility,
    organizerName: event.organizerName,
    organizerUrl: event.organizerUrl ?? '',
    contactEmail: event.contactEmail,
    refundPolicy: event.refundPolicy ?? '',
    tickets:
      event.tickets.length > 0
        ? event.tickets.map((ticket) => ({
            name: ticket.name,
            type: ticket.type === 'paid' ? 'paid' : 'free',
            quantity: ticket.quantity,
            price: ticket.price,
            currency: ticket.currency ?? (ticket.type === 'paid' ? 'USD' : undefined),
            salesStartAt: ticket.salesStartAt
              ? toDateTimeLocalString(ticket.salesStartAt)
              : undefined,
            salesEndAt: ticket.salesEndAt ? toDateTimeLocalString(ticket.salesEndAt) : undefined,
            minPerOrder: ticket.minPerOrder,
            maxPerOrder: ticket.maxPerOrder,
          }))
        : EMPTY_FORM_DEFAULTS.tickets,
    attendeeQuestions: event.attendeeQuestions.map((question) => ({
      label: question.label,
      type: question.type,
      required: question.required,
      optionsRaw: question.options?.join(', ') ?? '',
    })),
  };
}

function buildPayload(values: EventCreateInput): EventPayload {
  const tags = (values.tagsRaw ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const tickets: EventTicketInput[] = values.tickets.map((ticket) => ({
    name: ticket.name,
    type: ticket.type,
    quantity: ticket.quantity,
    price: ticket.price,
    currency: ticket.currency,
    salesStartAt: ticket.salesStartAt || undefined,
    salesEndAt: ticket.salesEndAt || undefined,
    minPerOrder: ticket.minPerOrder,
    maxPerOrder: ticket.maxPerOrder,
  }));

  const attendeeQuestions: EventQuestionInput[] = values.attendeeQuestions.map((question) => ({
    label: question.label,
    type: question.type,
    required: question.required,
    options: (question.optionsRaw ?? '')
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean),
  }));

  return {
    title: values.title,
    shortSummary: values.shortSummary,
    description: values.description,
    category: values.category === 'other' ? (values.customCategory ?? 'other') : values.category,
    tags,
    coverImage: values.coverImage || undefined,
    attendanceMode: values.attendanceMode,
    venueName: values.venueName || undefined,
    addressLine1: values.addressLine1 || undefined,
    addressLine2: values.addressLine2 || undefined,
    city: values.city || undefined,
    state: values.state || undefined,
    country: values.country || undefined,
    postalCode: values.postalCode || undefined,
    onlineEventUrl: values.onlineEventUrl || undefined,
    startDateTime: values.startDateTime,
    endDateTime: values.endDateTime,
    timezone: values.timezone,
    registrationOpenAt: values.registrationOpenAt || undefined,
    registrationCloseAt: values.registrationCloseAt || undefined,
    capacity: values.capacity,
    visibility: values.visibility,
    organizerName: values.organizerName,
    organizerUrl: values.organizerUrl || undefined,
    contactEmail: values.contactEmail,
    refundPolicy: values.refundPolicy,
    tickets,
    attendeeQuestions,
  };
}

export function OrganizerEventForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const hydratedDraftIdRef = useRef<string | null>(null);
  const [step, setStep] = useState(0);
  const [eventId, setEventId] = useState<string | null>(null);
  const [suppressDraftBootstrap, setSuppressDraftBootstrap] = useState(false);

  const draftIdFromUrl = searchParams.get('draftId');

  const freshFormValues = useMemo<EventCreateFormValues>(
    () => ({
      ...EMPTY_FORM_DEFAULTS,
      organizerName: session?.user?.name ?? '',
      contactEmail: session?.user?.email ?? '',
    }),
    [session?.user?.email, session?.user?.name]
  );

  const form = useForm<EventCreateFormValues, unknown, EventCreateInput>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: freshFormValues,
  });

  const ticketsFieldArray = useFieldArray({
    control: form.control,
    name: 'tickets',
  });

  const questionsFieldArray = useFieldArray({
    control: form.control,
    name: 'attendeeQuestions',
  });

  const accessToken = session?.accessToken;

  const syncDraftIdToUrl = useCallback(
    (draftId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('draftId', draftId);
      router.replace(`/events/new?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearDraftIdFromUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('draftId');
    const queryString = params.toString();
    router.replace(queryString ? `/events/new?${queryString}` : '/events/new', { scroll: false });
  }, [router, searchParams]);

  const resetForNewEvent = useCallback(() => {
    setSuppressDraftBootstrap(true);
    hydratedDraftIdRef.current = null;
    setEventId(null);
    setStep(0);
    form.reset(freshFormValues);
    clearDraftIdFromUrl();
  }, [clearDraftIdFromUrl, form, freshFormValues]);

  const draftBootstrapQuery = useQuery({
    queryKey: ['events', 'bootstrap-draft', accessToken, draftIdFromUrl],
    enabled: Boolean(accessToken) && !suppressDraftBootstrap,
    staleTime: 60_000,
    queryFn: async () => {
      if (!accessToken) {
        return null;
      }

      if (draftIdFromUrl) {
        return getMyEvent(draftIdFromUrl, accessToken);
      }

      const eventsResult = await listMyEvents(accessToken);
      const latestDraft = eventsResult.data.find((event) => event.status === 'draft');
      return latestDraft ?? null;
    },
  });

  useEffect(() => {
    const loadedDraft = draftBootstrapQuery.data;
    if (!loadedDraft) {
      return;
    }

    if (hydratedDraftIdRef.current === loadedDraft._id) {
      return;
    }

    hydratedDraftIdRef.current = loadedDraft._id;
    form.reset(mapEventToFormValues(loadedDraft));

    if (draftIdFromUrl !== loadedDraft._id) {
      syncDraftIdToUrl(loadedDraft._id);
    }
  }, [draftBootstrapQuery.data, draftIdFromUrl, form, syncDraftIdToUrl]);

  const saveDraftMutation = useMutation({
    mutationFn: async (payload: EventPayload) => {
      if (!accessToken) {
        throw new Error('Session expired, please sign in again');
      }

      const currentDraftId = eventId ?? draftIdFromUrl ?? hydratedDraftIdRef.current;

      if (currentDraftId) {
        return updateEventDraft(currentDraftId, payload, accessToken);
      }

      return createEventDraft(payload, accessToken);
    },
    onSuccess: (event) => {
      setSuppressDraftBootstrap(false);

      if (!eventId && !draftIdFromUrl) {
        setEventId(event._id);
        hydratedDraftIdRef.current = event._id;
        if (draftIdFromUrl !== event._id) {
          syncDraftIdToUrl(event._id);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const publishEventMutation = useMutation({
    mutationFn: async (payload: EventPayload) => {
      if (!accessToken) {
        throw new Error('Session expired, please sign in again');
      }

      const currentDraftId = eventId ?? draftIdFromUrl ?? hydratedDraftIdRef.current;

      const resolvedEventId = currentDraftId ?? (await createEventDraft(payload, accessToken))._id;

      if (!currentDraftId) {
        setEventId(resolvedEventId);
        hydratedDraftIdRef.current = resolvedEventId;
        if (draftIdFromUrl !== resolvedEventId) {
          syncDraftIdToUrl(resolvedEventId);
        }
      }

      await updateEventDraft(resolvedEventId, payload, accessToken);
      return publishEvent(resolvedEventId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    form.setValue('organizerName', session.user.name ?? 'Organizer');
    form.setValue('contactEmail', session.user.email ?? '');
  }, [form, session?.user]);

  const saveDraft = async (): Promise<void> => {
    const isValid = await form.trigger();
    if (!isValid) {
      const firstInvalidStep = getFirstInvalidStep(form.formState.errors);
      setStep(firstInvalidStep);
      toast({
        title: `Please fix errors in ${STEP_TITLES[firstInvalidStep]}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const currentDraftId = eventId ?? draftIdFromUrl ?? hydratedDraftIdRef.current;
      const parsedValues = eventCreateSchema.parse(form.getValues());
      const payload = buildPayload(parsedValues);

      await saveDraftMutation.mutateAsync(payload);
      toast({ title: currentDraftId ? 'Draft updated' : 'Draft saved' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to save draft',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      const firstInvalidStep = getFirstInvalidStep(form.formState.errors);
      setStep(firstInvalidStep);
      toast({
        title: `Please fix errors in ${STEP_TITLES[firstInvalidStep]} before publishing`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const parsedValues = eventCreateSchema.parse(form.getValues());
      const payload = buildPayload(parsedValues);
      await publishEventMutation.mutateAsync(payload);

      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'bootstrap-draft'] });
      resetForNewEvent();

      const redirectPath = getPostPublishRedirect(session?.user?.role);
      router.replace(`${redirectPath}?published=1`);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to publish event',
        variant: 'destructive',
      });
    }
  };

  const isSaving = saveDraftMutation.isPending;
  const isPublishing = publishEventMutation.isPending;
  const watchedValues = useWatch({
    control: form.control,
  });
  const stepErrorCounts = useMemo(
    () => getStepErrorCounts(form.formState.errors),
    [form.formState.errors]
  );

  const renderCurrentStep = () => {
    if (step === 0) {
      return <BasicsStep />;
    }

    if (step === 1) {
      return <ScheduleLocationStep />;
    }

    if (step === 2) {
      return <TicketsCapacityStep ticketsFieldArray={ticketsFieldArray} />;
    }

    if (step === 3) {
      return <AttendeeFormStep questionsFieldArray={questionsFieldArray} />;
    }

    return <PublishStep />;
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
      <div className="rounded-2xl border border-white/12 bg-white/6 p-5 backdrop-blur md:p-6">
        {draftBootstrapQuery.isLoading ? (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
            Loading your latest draft...
          </div>
        ) : null}

        <div className="mb-5 rounded-xl border border-white/12 bg-white/4 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">
            Organizer / Events / Create
          </p>
          <p className="mt-1 text-sm text-white/70">
            Build a single-date event with ticketing, attendee questions, and publish controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">Event creation</p>
            <h1 className="mt-2 text-2xl font-bold">Organizer Event Panel</h1>
          </div>

          <span className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs text-white/75">
            Single-date flow
          </span>
        </div>

        <StepPills
          stepTitles={STEP_TITLES}
          currentStep={step}
          stepErrorCounts={stepErrorCounts}
          onStepSelect={setStep}
        />

        <FormProvider {...form}>
          <form className="mt-6 space-y-5">{renderCurrentStep()}</form>
        </FormProvider>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 border-white/25 bg-white/10 px-4 text-white/90 hover:border-white/40 hover:bg-white/16 disabled:border-white/12 disabled:bg-white/6 disabled:text-white/35"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 border-[#00A896]/45 bg-[#00A896]/18 px-4 text-[#b8fff8] hover:border-[#00A896]/65 hover:bg-[#00A896]/25 disabled:border-white/12 disabled:bg-white/6 disabled:text-white/35"
              onClick={async () => {
                const fieldsToValidate = STEP_FIELD_MAP[step] as Array<keyof EventCreateFormValues>;
                const isStepValid = await form.trigger(fieldsToValidate, {
                  shouldFocus: true,
                });

                if (!isStepValid) {
                  return;
                }

                setStep((current) => Math.min(STEP_TITLES.length - 1, current + 1));
              }}
              disabled={step === STEP_TITLES.length - 1}
            >
              Next
            </Button>
            <span className="ml-1 text-xs text-white/55">
              Step {step + 1} of {STEP_TITLES.length}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={saveDraft}
              disabled={isSaving || isPublishing}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button type="button" onClick={handlePublish} disabled={isSaving || isPublishing}>
              {isPublishing ? 'Publishing...' : 'Publish Event'}
            </Button>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-white/12 bg-white/6 p-5 backdrop-blur md:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-white/55">Live preview</p>
        <h2 className="mt-2 text-xl font-semibold">{watchedValues.title || 'Untitled event'}</h2>
        <p className="mt-3 text-sm text-white/70">
          {watchedValues.shortSummary ||
            'Add a concise summary so attendees understand your event quickly.'}
        </p>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/60">Category</dt>
            <dd className="font-medium text-white">
              {watchedValues.category === 'other'
                ? watchedValues.customCategory || 'other'
                : watchedValues.category || '-'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/60">Mode</dt>
            <dd className="font-medium text-white">
              {String(watchedValues.attendanceMode ?? '-')}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/60">Capacity</dt>
            <dd className="font-medium text-white">{String(watchedValues.capacity ?? '-')}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/60">Tickets</dt>
            <dd className="font-medium text-white">
              {Array.isArray(watchedValues.tickets) ? watchedValues.tickets.length : 0}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/60">Draft ID</dt>
            <dd className="truncate font-medium text-white">{eventId ?? 'Not saved yet'}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
