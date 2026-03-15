# AI Agent Development Guide — Frontend

This document provides comprehensive guidance for AI assistants (Cursor, GitHub Copilot, ChatGPT, etc.) working on the EventForge frontend.

## Your Role: Senior Software Engineer & Frontend Architect

When working on this project, **think and act as a Senior Software Engineer and Frontend Architect**:

### Mindset

- Think deeply about component design and its long-term implications
- Design for maintainability, not just functionality
- Consider re-usability from the start — build components once, use them everywhere
- Anticipate edge cases: loading states, empty states, error states
- Write clean, readable code that other developers will understand
- Refactor when needed, don't accumulate technical debt
- Document complex logic, but let code be self-documenting when possible

### Core Principles

#### 1. SOLID Principles (MANDATORY)

**S — Single Responsibility**

- Each component, hook, or utility has ONE reason to change
- A page component composes smaller components; it does not own business logic
- A TanStack Query hook fetches data; it does not render UI

```typescript
// Good: single responsibility
function EventCard({ event }: { event: Event }) {
  return <div>{event.title}</div>; // only renders
}

// Bad: mixed concerns
function EventCard({ eventId }: { eventId: string }) {
  const { data } = useQuery(...); // fetching + rendering mixed
  return <div>{data?.title}</div>;
}
```

**O — Open/Closed**

- Extend components via props/composition, not by modifying internals
- Use `variant` props on base components rather than duplicating them

```typescript
// Good: extend via props
<Button variant="destructive">Delete</Button>

// Bad: copy-paste a new DestructiveButton component
```

**I — Interface Segregation**

- Pass only the props a component actually needs
- Don't pass the entire API response object when the component only needs two fields

```typescript
// Good: minimal props
function EventBadge({ status }: { status: EventStatus }) {}

// Bad: entire object passed when only one field is needed
function EventBadge({ event }: { event: Event }) {}
```

**D — Dependency Inversion**

- Components depend on prop interfaces (abstractions), not on concrete API shapes
- Keep API types in `src/types/`; transform in hooks before passing to components

#### 2. DRY (Don't Repeat Yourself)

- Extract shared UI into `src/components/shared/` or `src/components/ui/`
- Extract shared data-fetching logic into `src/hooks/`
- Extract shared Zod schemas into `src/lib/schemas/`
- Extract API call functions into `src/lib/api/`

```typescript
// Good: reusable query hook
export function useEvent(id: string) {
  return useQuery({ queryKey: ['event', id], queryFn: () => getEvent(id) });
}

// Bad: repeating the same useQuery call across multiple components
```

#### 3. KISS (Keep It Simple)

- Prefer simple composition over clever abstractions
- Don't build a generic form engine when a specific form works fine
- Avoid unnecessary wrapper components

```typescript
// Good: simple and direct
const isEventFull = event.rsvpCount >= event.capacity;

// Bad: over-engineered
const isEventFull = checkCapacityThreshold(event, CAPACITY_THRESHOLD_FACTOR);
```

#### 4. YAGNI (You Aren't Gonna Need It)

- Don't add props "just in case"
- Don't build features the BRD doesn't require
- Don't add global state for data that only one component uses

```typescript
// Good: only what's needed now
interface EventCardProps {
  title: string;
  date: string;
  status: EventStatus;
}

// Bad: speculative props
interface EventCardProps {
  title: string;
  date: string;
  status: EventStatus;
  futureAnalyticsId?: string; // not needed
}
```

#### 5. Separation of Concerns

| Layer          | Responsibility                                              |
| -------------- | ----------------------------------------------------------- |
| `app/` pages   | Compose layouts and feature components; no direct API calls |
| `components/`  | Render UI from props; no direct API calls                   |
| `hooks/`       | Data fetching and server state via TanStack Query           |
| `stores/`      | Client-only global UI state via Zustand                     |
| `lib/api/`     | Raw API call functions (fetch wrappers)                     |
| `lib/schemas/` | Zod validation schemas                                      |
| `types/`       | Shared TypeScript interfaces                                |

#### 6. Composition Over Inheritance

- Build complex UI by composing small components, not by extending base classes
- Use React children and render props patterns for flexible layouts

```typescript
// Good: composition
<Card>
  <CardHeader><CardTitle>{event.title}</CardTitle></CardHeader>
  <CardContent><EventMeta event={event} /></CardContent>
  <CardFooter><RsvpButton eventId={event.id} /></CardFooter>
</Card>

// Bad: monolithic component that does everything
<EventMegaCard event={event} showTitle showMeta showRsvp showFooter />
```

#### 7. Fail Fast — Validate at the Boundary

- Validate all form inputs with Zod before submitting to the API
- Never let invalid data reach an API call
- Use React Hook Form's `handleSubmit` — it only calls the handler when validation passes

```typescript
// Good: validate early with Zod + RHF
const form = useForm<RegisterInput>({
  resolver: zodResolver(registerSchema),
});

// Bad: validate inside the submit handler after the fact
const onSubmit = async (data: unknown) => {
  if (!data.email) return; // too late
};
```

#### 8. Consistency Is More Important Than Perfection

- Follow existing patterns in the codebase
- Use the same naming conventions throughout
- Handle loading/error/empty states the same way everywhere

---

## Project Overview

**Tech Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui
**State**: TanStack Query v5 (server state) + Zustand v5 (UI state)
**Forms**: React Hook Form v7 + Zod v4
**Auth**: Next-Auth v4 (credentials provider)
**Path alias**: `@/*` maps to `src/*`

---

## IMPORTANT: Always Verify Your Changes

After making ANY changes, always run:

```bash
# 1. TypeScript check + production build
npm run build

# 2. Development server (catch runtime errors)
npm run dev

# 3. Lint (optional but recommended)
npm run lint
```

### When to Run These Commands

Run after every time you:

- Add or modify a component
- Add or modify a hook, store, or utility
- Add new imports or dependencies
- Change a TypeScript type or interface
- Modify `next.config.ts`, `tsconfig.json`, or `tailwind.config`

### Expected Output

```bash
npm run build
# ✅ Compiled successfully
# ✅ Generating static pages

npm run dev
# ✅ Ready on http://localhost:3000

npm run lint
# ✅ (no output = clean)
```

### Common Build Errors and Fixes

**"Module not found"**

```typescript
// Check the path alias — @/ maps to src/
import { Button } from '@/components/ui/button'; // correct
import { Button } from '../../../components/ui/button'; // avoid
```

**"Type X is not assignable to type Y"**

```typescript
// Check your interface matches the API response shape in src/types/
```

**"useSession must be wrapped in SessionProvider"**

```typescript
// Ensure the component is inside <SessionProvider> in the root layout
```

**"Cannot read properties of undefined"**

```typescript
// Always handle the loading/undefined state from useQuery
if (isLoading) return <Skeleton />;
if (!data) return null;
```

---

## Architecture

### Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (providers go here)
│   ├── (auth)/                 # Auth group: login, register, reset-password
│   ├── (attendee)/             # Attendee group: event discovery, RSVP, tickets
│   ├── (organizer)/            # Organizer group: create/edit events, dashboard
│   └── (admin)/                # Admin group: platform analytics, user management
│
├── components/
│   ├── ui/                     # shadcn/ui base components (do not edit directly)
│   ├── events/                 # Event cards, event detail, event forms
│   ├── dashboard/              # Organizer dashboard widgets and charts
│   ├── admin/                  # Admin panel tables, user management
│   └── shared/                 # Navbar, footer, layout wrappers, loading states
│
├── hooks/                      # TanStack Query hooks (data fetching only)
├── stores/                     # Zustand stores (UI state only)
├── lib/
│   ├── api/                    # Raw API call functions (fetch wrappers)
│   ├── schemas/                # Zod validation schemas
│   └── utils.ts                # cn() and other utilities
└── types/                      # Shared TypeScript interfaces
```

### Route Group Conventions

Each route group has its own layout that applies only to that group:

```
app/(auth)/layout.tsx        → Unauthenticated layout (centred card)
app/(attendee)/layout.tsx    → Attendee layout (navbar + footer)
app/(organizer)/layout.tsx   → Organizer layout (sidebar dashboard)
app/(admin)/layout.tsx       → Admin layout (admin sidebar)
```

Pages within a group do not need to repeat the layout wrapper.

---

## Code Standards

### TypeScript

- Strict mode is enabled — never use `any`; use `unknown` and narrow it
- Define interfaces for all API response shapes in `src/types/`
- Use `type` for unions and intersections; use `interface` for object shapes
- Always type component props explicitly — no implicit `{}` prop types

```typescript
// Good
interface EventCardProps {
  title: string;
  date: string;
  status: 'draft' | 'published' | 'cancelled';
}

// Bad
const EventCard = (props: any) => { ... }
```

### Naming Conventions

```typescript
// Files: kebab-case
event-card.tsx
use-events.ts
event-store.ts
event.schema.ts

// Components: PascalCase
function EventCard() {}
function RsvpButton() {}

// Hooks: camelCase, prefixed with 'use'
function useEvents() {}
function useRsvp(eventId: string) {}

// Zustand stores: camelCase, suffixed with 'Store'
const useAuthStore = create(...)
const useModalStore = create(...)

// Zod schemas: camelCase, suffixed with 'Schema'
const registerSchema = z.object(...)
const createEventSchema = z.object(...)

// Inferred Zod types: PascalCase, suffixed with 'Input'
type RegisterInput = z.infer<typeof registerSchema>
type CreateEventInput = z.infer<typeof createEventSchema>

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
```

### Component Structure

Every component file follows this order:

```typescript
// 1. Imports (external → internal → types)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/hooks/use-events';
import type { Event } from '@/types';

// 2. Types / interfaces (local to this file)
interface EventCardProps {
  event: Event;
  onRsvp?: (id: string) => void;
}

// 3. Component
export function EventCard({ event, onRsvp }: EventCardProps) {
  // 3a. Hooks first
  const [isExpanded, setIsExpanded] = useState(false);

  // 3b. Derived state / memos
  const isEventFull = event.rsvpCount >= event.capacity;

  // 3c. Handlers
  const handleRsvp = () => onRsvp?.(event.id);

  // 3d. Render
  return (
    <div>...</div>
  );
}
```

### Path Aliases

Always use the `@/` alias — never use relative `../` paths:

```typescript
// Good
import { cn } from '@/lib/utils';
import { useEvents } from '@/hooks/use-events';
import type { Event } from '@/types';

// Bad
import { cn } from '../../lib/utils';
```

---

## Adding New Features — Step-by-Step

### 1. Define the Type (`src/types/index.ts` or `src/types/event.ts`)

```typescript
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'in-person' | 'online';
  capacity: number;
  rsvpCount: number;
  status: 'draft' | 'published' | 'cancelled';
  coverImage?: string;
  organizer: {
    id: string;
    name: string;
  };
}
```

### 2. Define the Zod Schema (`src/lib/schemas/event.schema.ts`)

```typescript
import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description is too short'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['in-person', 'online']),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
```

### 3. Create the API Function (`src/lib/api/events.ts`)

```typescript
import type { Event, CreateEventInput } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getEvents(): Promise<Event[]> {
  const res = await fetch(`${API_URL}/api/v1/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  const json = await res.json();
  return json.data;
}

export async function createEvent(data: CreateEventInput): Promise<Event> {
  const res = await fetch(`${API_URL}/api/v1/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create event');
  const json = await res.json();
  return json.data;
}
```

### 4. Create the TanStack Query Hook (`src/hooks/use-events.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, createEvent } from '@/lib/api/events';
import type { CreateEventInput } from '@/types';

// Query keys are centralised to avoid typos
export const eventKeys = {
  all: ['events'] as const,
  detail: (id: string) => ['events', id] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.all,
    queryFn: getEvents,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventInput) => createEvent(data),
    onSuccess: () => {
      // Invalidate the list so it refetches
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
```

### 5. Build the Component (`src/components/events/event-card.tsx`)

```typescript
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isEventFull = event.rsvpCount >= event.capacity;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <Badge variant={isEventFull ? 'destructive' : 'default'}>
          {isEventFull ? 'Full' : event.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{event.date}</p>
        <p className="text-sm">{event.location}</p>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">
          {event.rsvpCount} / {event.capacity} attending
        </span>
      </CardFooter>
    </Card>
  );
}
```

### 6. Build the Form Component (`src/components/events/create-event-form.tsx`)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createEventSchema, type CreateEventInput } from '@/lib/schemas/event.schema';
import { useCreateEvent } from '@/hooks/use-events';

export function CreateEventForm() {
  const { mutate: createEvent, isPending } = useCreateEvent();

  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'in-person',
      capacity: 50,
    },
  });

  const onSubmit = (data: CreateEventInput) => {
    createEvent(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ...other fields */}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Event'}
        </Button>
      </form>
    </Form>
  );
}
```

### 7. Use It in a Page (`src/app/(organizer)/events/new/page.tsx`)

```typescript
import { CreateEventForm } from '@/components/events/create-event-form';

export default function NewEventPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Create Event</h1>
      <CreateEventForm />
    </main>
  );
}
```

### 8. Verify

```bash
npm run build   # must pass with no errors
npm run lint    # must produce no output
```

---

## Patterns Reference

### Always Handle All Query States

Never render data without handling loading and error:

```typescript
// Good
const { data: events, isLoading, isError } = useEvents();

if (isLoading) return <EventListSkeleton />;
if (isError) return <ErrorMessage message="Failed to load events" />;
if (!events?.length) return <EmptyState message="No events found" />;

return <EventList events={events} />;

// Bad — crashes when data is undefined
return <EventList events={events} />;
```

### Zustand Store Pattern

Stores hold **UI-only state** — modals, theme, sidebar open state, etc. Never store server data in Zustand; that belongs in TanStack Query.

```typescript
// src/stores/modal-store.ts
import { create } from 'zustand';

interface ModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
```

### shadcn/ui Components

- Use `npx shadcn add <component>` to install new components — never copy-paste manually
- Do not edit files inside `src/components/ui/` directly; extend them via props or wrap them
- The path alias for ui components is `@/components/ui/<component>`

```typescript
// Adding a new shadcn component
npx shadcn add dialog
npx shadcn add data-table
```

### Server Components vs Client Components

Use Server Components by default. Only add `'use client'` when the component needs:

- React hooks (`useState`, `useEffect`, etc.)
- Browser APIs
- Event listeners
- TanStack Query or Zustand

```typescript
// Server Component (default) — no directive needed
export default async function EventsPage() {
  return <EventList />;
}

// Client Component — add directive at the top
'use client';

export function RsvpButton({ eventId }: { eventId: string }) {
  const { mutate } = useRsvp(eventId);
  return <Button onClick={() => mutate()}>RSVP</Button>;
}
```

### Environment Variables

- Public variables (accessible in browser): prefix with `NEXT_PUBLIC_`
- Server-only variables (API secrets, etc.): no prefix

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

```typescript
// Accessing in code
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // client-safe
const secret = process.env.NEXTAUTH_SECRET; // server-only
```

---

## What NOT to Do

### Component Anti-Patterns

```typescript
// BAD: fetching directly in a component
export function EventList() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents);
  }, []);
}

// GOOD: use a hook
export function EventList() {
  const { data: events, isLoading } = useEvents();
}

// BAD: putting server data in Zustand
const useEventStore = create((set) => ({
  events: [],
  fetchEvents: async () => { /* direct fetch */ },
}));

// GOOD: server data lives in TanStack Query, only UI state in Zustand

// BAD: giant page component with all logic inline
export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { data } = useQuery(...);
  // 200 lines of JSX ...
}

// GOOD: compose focused sub-components
export default function EventsPage() {
  return (
    <>
      <EventSearchBar />
      <EventFilters />
      <EventGrid />
    </>
  );
}
```

### TypeScript Anti-Patterns

```typescript
// BAD
const handleData = (data: any) => { ... }
// @ts-ignore
const result = someFunction();

// GOOD
const handleData = (data: unknown) => {
  if (typeof data === 'string') { ... }
}
```

### Styling Anti-Patterns

```typescript
// BAD: inline styles
<div style={{ marginTop: '16px', color: 'red' }}>

// GOOD: Tailwind classes
<div className="mt-4 text-destructive">

// BAD: magic className strings scattered everywhere
<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">

// GOOD: use shadcn Card component (already has those styles)
<Card className="hover:shadow-md transition-shadow">
```

---

## Senior Engineer Checklist

Before considering any work complete:

### Design Quality

- [ ] Does each component/hook have a single responsibility?
- [ ] Is this the simplest solution (KISS)?
- [ ] Am I repeating code (DRY)?
- [ ] Am I building only what's needed (YAGNI)?

### Code Quality

- [ ] All TypeScript types are explicit — no `any`
- [ ] Props interfaces are defined and minimal
- [ ] Naming follows project conventions (kebab-case files, PascalCase components)
- [ ] Path alias `@/` used everywhere — no relative `../` imports

### Component Quality

- [ ] Loading state handled
- [ ] Error state handled
- [ ] Empty state handled
- [ ] Mobile-responsive (mobile-first Tailwind classes)
- [ ] Accessible (using shadcn/ui which is built on Radix UI)

### Data Layer

- [ ] Server state uses TanStack Query — not `useState` + `useEffect`
- [ ] UI state uses Zustand — not prop drilling
- [ ] Forms use React Hook Form + Zod — not manual validation
- [ ] API functions are in `src/lib/api/` — not inline in components or hooks

### Verification

- [ ] `npm run build` completes with no errors
- [ ] `npm run lint` produces no output
- [ ] `npm run dev` starts without errors
- [ ] No console errors or warnings in the browser

---

## Git Workflow & Commit Guidelines

### Commit Message Format (MANDATORY)

This project uses **Conventional Commits** enforced by commitlint.

#### Format

```
<type>(<scope>): <subject>
```

#### Rules

- Type and subject must be **lowercase**
- Subject must not end with a period
- Header max **72 characters**
- Use imperative mood: "add" not "added"

#### Types

| Type       | When to Use                          | Example                                             |
| ---------- | ------------------------------------ | --------------------------------------------------- |
| `feat`     | New feature or page                  | `feat(events): add event discovery page`            |
| `fix`      | Bug fix                              | `fix(rsvp): resolve capacity check on full events`  |
| `docs`     | Documentation only                   | `docs: update agents guide`                         |
| `style`    | Formatting, no logic change          | `style: format with prettier`                       |
| `refactor` | Restructure without behaviour change | `refactor(events): extract event card to component` |
| `perf`     | Performance improvement              | `perf(events): memoize event list filter`           |
| `test`     | Adding or updating tests             | `test(rsvp): add form validation tests`             |
| `build`    | Build system or dependencies         | `build: upgrade tanstack query to v5`               |
| `ci`       | CI/CD configuration                  | `ci: add build check workflow`                      |
| `chore`    | Maintenance                          | `chore: update eslint config`                       |
| `revert`   | Revert a previous commit             | `revert: revert feat(events)`                       |

#### Examples

```bash
# Good
git commit -m "feat(auth): add login page with next-auth"
git commit -m "fix(events): resolve empty state not showing"
git commit -m "refactor(dashboard): extract stats card component"
git commit -m "chore: upgrade dependencies"

# Bad — rejected by commitlint
git commit -m "Added login page"      # no type, past tense
git commit -m "Fix bug."              # period at end, past tense
git commit -m "FEAT: add page"        # uppercase
git commit -m "updates"               # no type, vague
```

### Git Hooks

| Hook         | What It Does                                                |
| ------------ | ----------------------------------------------------------- |
| `pre-commit` | Runs lint-staged: ESLint --fix + Prettier on staged files   |
| `commit-msg` | Validates commit message against commitlint rules           |
| `pre-push`   | Runs `eslint src` then `next build`; blocks push on failure |

---

## Resources

- [README.md](README.md) — Project overview and quick start
- [Next.js App Router docs](https://nextjs.org/docs/app) — Routing, layouts, Server Components
- [shadcn/ui docs](https://ui.shadcn.com) — Component library reference
- [TanStack Query docs](https://tanstack.com/query/latest) — Data fetching patterns
- [Zod docs](https://zod.dev) — Schema validation reference
- [Zustand docs](https://zustand.dev) — State management reference
