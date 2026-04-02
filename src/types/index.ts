// ─── Shared TypeScript interfaces & types ────────────────────────────────────
// All domain types used across the frontend live here.

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'attendee' | 'organizer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Events ───────────────────────────────────────────────────────────────────
export type EventType = 'in-person' | 'online';
export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface CustomQuestion {
  label: string;
  type: 'text' | 'select' | 'checkbox';
  options?: string[];
  required: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  eventCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: EventType;
  capacity: number;
  coverImage?: string;
  thumbnail?: string;
  category: Category | string;
  tags: string[];
  organizer: User | string;
  customQuestions: CustomQuestion[];
  status: EventStatus;
  rsvpCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── RSVPs ────────────────────────────────────────────────────────────────────
export type RsvpStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export interface FormResponse {
  question: string;
  answer: string;
}

export interface Rsvp {
  _id: string;
  event: Event | string;
  user: User | string;
  status: RsvpStatus;
  formResponses: FormResponse[];
  waitlistPosition?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Tickets ──────────────────────────────────────────────────────────────────
export interface Ticket {
  _id: string;
  rsvp: string;
  event: Event | string;
  user: User | string;
  qrCode: string;
  qrCodeImage: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Dashboard / Analytics ────────────────────────────────────────────────────
export interface OrganizerDashboard {
  events: Event[];
  totalEvents: number;
  totalRsvps: number;
  totalCheckedIn: number;
}

export interface EventAnalytics {
  attendanceRate: number;
  rsvpCount: number;
  checkedInCount: number;
  waitlistCount: number;
  demographics: Record<string, number>;
}

export interface AdminAnalytics {
  totalEvents: number;
  totalUsers: number;
  totalRsvps: number;
  topEvents: Array<{ event: Event; rsvpCount: number }>;
  categoryTrends: Array<{ category: string; count: number }>;
}
