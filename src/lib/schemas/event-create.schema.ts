import { z } from 'zod';

export const EVENT_CATEGORY_OPTIONS = [
  'conference',
  'workshop',
  'meetup',
  'webinar',
  'networking',
  'hackathon',
  'concert',
  'festival',
  'sports',
  'exhibition',
  'charity',
  'other',
] as const;

const ticketSchema = z
  .object({
    name: z.string().min(2, 'Ticket name is required'),
    type: z.enum(['free', 'paid']),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    price: z.coerce.number().min(0).optional(),
    currency: z.string().length(3, 'Currency must be a 3-letter code').optional(),
    salesStartAt: z.string().optional(),
    salesEndAt: z.string().optional(),
    minPerOrder: z.coerce.number().int().min(1).optional(),
    maxPerOrder: z.coerce.number().int().min(1).optional(),
  })
  .superRefine((ticket, ctx) => {
    if (ticket.type === 'paid') {
      if (typeof ticket.price !== 'number' || ticket.price <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: 'Paid ticket requires a valid price',
        });
      }

      if (!ticket.currency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['currency'],
          message: 'Paid ticket requires a currency',
        });
      }
    }

    if (ticket.salesStartAt && ticket.salesEndAt && ticket.salesEndAt <= ticket.salesStartAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['salesEndAt'],
        message: 'Sales end must be after sales start',
      });
    }

    if (
      typeof ticket.minPerOrder === 'number' &&
      typeof ticket.maxPerOrder === 'number' &&
      ticket.minPerOrder > ticket.maxPerOrder
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxPerOrder'],
        message: 'maxPerOrder must be greater than or equal to minPerOrder',
      });
    }
  });

const questionSchema = z
  .object({
    label: z.string().min(2, 'Question label is required'),
    type: z.enum(['text', 'textarea', 'select', 'checkbox']),
    required: z.boolean(),
    optionsRaw: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const needsOptions = value.type === 'select' || value.type === 'checkbox';

    if (needsOptions) {
      const optionCount = (value.optionsRaw ?? '')
        .split(',')
        .map((option) => option.trim())
        .filter(Boolean).length;

      if (optionCount < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['optionsRaw'],
          message: 'Select or checkbox question requires at least two options',
        });
      }
    }
  });

export const eventCreateSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(140),
    shortSummary: z.string().min(10, 'Summary must be at least 10 characters').max(160),
    description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
    category: z.enum(EVENT_CATEGORY_OPTIONS),
    customCategory: z.string().max(60).optional(),
    tagsRaw: z.string().optional(),
    coverImage: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (value) => {
          if (!value) {
            return true;
          }

          if (value.startsWith('/uploads/')) {
            return true;
          }

          return /^https?:\/\//i.test(value);
        },
        {
          message: 'Cover image must be a valid uploaded path or URL',
        }
      ),
    attendanceMode: z.enum(['in_person', 'online', 'hybrid']),
    venueName: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    onlineEventUrl: z.string().url('Online URL must be a valid URL').optional().or(z.literal('')),
    startDateTime: z.string().min(1, 'Start date is required'),
    endDateTime: z.string().min(1, 'End date is required'),
    timezone: z.string().min(2, 'Timezone is required').max(100),
    registrationOpenAt: z.string().optional(),
    registrationCloseAt: z.string().optional(),
    capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
    visibility: z.enum(['public', 'unlisted', 'private']),
    organizerName: z.string().min(2, 'Organizer name is required').max(120),
    organizerUrl: z.string().url('Organizer URL must be valid').optional().or(z.literal('')),
    contactEmail: z.string().email('Contact email must be valid'),
    refundPolicy: z.string().max(2000).optional(),
    tickets: z.array(ticketSchema).min(1, 'At least one ticket is required'),
    attendeeQuestions: z.array(questionSchema).max(20),
  })
  .superRefine((value, ctx) => {
    if (value.endDateTime <= value.startDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDateTime'],
        message: 'End date must be after start date',
      });
    }

    if (value.registrationCloseAt && value.registrationCloseAt > value.startDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['registrationCloseAt'],
        message: 'Registration close must be before or at event start',
      });
    }

    if (value.registrationOpenAt && value.registrationOpenAt > value.startDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['registrationOpenAt'],
        message: 'Registration open must be before or at event start',
      });
    }

    if (
      value.registrationOpenAt &&
      value.registrationCloseAt &&
      value.registrationOpenAt > value.registrationCloseAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['registrationCloseAt'],
        message: 'Registration close must be after registration open',
      });
    }

    if (
      (value.attendanceMode === 'in_person' || value.attendanceMode === 'hybrid') &&
      (!value.venueName || !value.addressLine1 || !value.city || !value.country)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['venueName'],
        message:
          'Venue name, address, city, and country are required for in-person or hybrid events',
      });
    }

    if (
      (value.attendanceMode === 'online' || value.attendanceMode === 'hybrid') &&
      !value.onlineEventUrl
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['onlineEventUrl'],
        message: 'Online event URL is required for online or hybrid events',
      });
    }

    const totalQuantity = value.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    if (totalQuantity > value.capacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tickets'],
        message: 'Total ticket quantity cannot exceed capacity',
      });
    }

    value.tickets.forEach((ticket, index) => {
      if (ticket.quantity > value.capacity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tickets', index, 'quantity'],
          message: 'Ticket quantity cannot exceed event capacity',
        });
      }
    });

    if (value.category === 'other') {
      if (!value.customCategory || value.customCategory.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customCategory'],
          message: 'Please provide a custom category',
        });
      }
    }
  });

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventCreateFormValues = z.input<typeof eventCreateSchema>;
