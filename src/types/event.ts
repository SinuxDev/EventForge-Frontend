export type EventAttendanceMode = 'in_person' | 'online' | 'hybrid';
export type EventVisibility = 'public' | 'unlisted' | 'private';
export type EventStatus = 'draft' | 'published' | 'cancelled';
export type TicketType = 'free' | 'paid' | 'donation';
export type EventQuestionType = 'text' | 'textarea' | 'select' | 'checkbox';

export interface EventTicketInput {
  name: string;
  type: TicketType;
  quantity: number;
  price?: number;
  currency?: string;
  salesStartAt?: string;
  salesEndAt?: string;
  minPerOrder?: number;
  maxPerOrder?: number;
}

export interface EventQuestionInput {
  label: string;
  type: EventQuestionType;
  required: boolean;
  options?: string[];
}

export interface EventPayload {
  title: string;
  shortSummary: string;
  description: string;
  category: string;
  tags?: string[];
  coverImage?: string;
  attendanceMode: EventAttendanceMode;
  venueName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  onlineEventUrl?: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  registrationOpenAt?: string;
  registrationCloseAt?: string;
  capacity: number;
  visibility: EventVisibility;
  organizerName: string;
  organizerUrl?: string;
  contactEmail: string;
  refundPolicy?: string;
  tickets: EventTicketInput[];
  attendeeQuestions: EventQuestionInput[];
}

export interface EventEntity extends EventPayload {
  _id: string;
  status: EventStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
