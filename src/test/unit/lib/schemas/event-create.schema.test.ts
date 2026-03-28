import { describe, expect, it } from 'vitest';
import { eventCreateSchema } from '@/lib/schemas/event-create.schema';

const validEventInput = {
  title: 'Frontend Summit 2026',
  shortSummary: 'A short summary long enough',
  description: 'This is a complete event description with enough detail for validation.',
  category: 'conference',
  customCategory: '',
  tagsRaw: 'frontend,react',
  coverImage: 'https://cdn.example.com/cover.jpg',
  attendanceMode: 'online',
  venueName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  onlineEventUrl: 'https://example.com/live',
  startDateTime: '2026-10-12T10:00:00.000Z',
  endDateTime: '2026-10-12T12:00:00.000Z',
  timezone: 'UTC',
  registrationOpenAt: '2026-10-01T10:00:00.000Z',
  registrationCloseAt: '2026-10-12T09:00:00.000Z',
  capacity: 100,
  visibility: 'public',
  organizerName: 'EventForge Team',
  organizerUrl: 'https://eventforge.com',
  contactEmail: 'team@eventforge.com',
  refundPolicy: 'Refund available before event start',
  tickets: [
    {
      name: 'General',
      type: 'free',
      quantity: 100,
      minPerOrder: 1,
      maxPerOrder: 3,
    },
  ],
  attendeeQuestions: [],
};

describe('eventCreateSchema', () => {
  it('accepts a valid online event payload', () => {
    const result = eventCreateSchema.safeParse(validEventInput);

    expect(result.success).toBe(true);
  });

  it('rejects payload when ticket quantity exceeds capacity', () => {
    const result = eventCreateSchema.safeParse({
      ...validEventInput,
      capacity: 10,
      tickets: [
        {
          name: 'General',
          type: 'free',
          quantity: 11,
          minPerOrder: 1,
          maxPerOrder: 3,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    const messages = result.error.issues.map((issue) => issue.message);
    expect(messages).toContain('Total ticket quantity cannot exceed capacity');
  });
});
