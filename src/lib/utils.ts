import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Tailwind class merge helper ─────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(new Date(date));
}

export function isEventPast(date: string | Date): boolean {
  return new Date(date) < new Date();
}

export function getCountdown(date: string | Date): string {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return 'Event has started';
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// ─── Capacity helpers ─────────────────────────────────────────────────────────
export function getCapacityStatus(
  rsvpCount: number,
  capacity: number
): 'available' | 'almost-full' | 'full' {
  const ratio = rsvpCount / capacity;
  if (ratio >= 1) return 'full';
  if (ratio >= 0.8) return 'almost-full';
  return 'available';
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}
