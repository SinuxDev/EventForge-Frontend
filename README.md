# EventForge — Frontend

Next.js frontend for EventForge, a modern knowledge-sharing event platform. Attendees discover and RSVP to events; organizers create and manage them; admins oversee the platform.

## Tech Stack

| Technology          | Version             | Purpose                               |
| ------------------- | ------------------- | ------------------------------------- |
| **Next.js**         | 16.1.6 (App Router) | SSR, routing, React Server Components |
| **TypeScript**      | 5.x                 | End-to-end type safety                |
| **shadcn/ui**       | Latest              | Accessible UI component library       |
| **Tailwind CSS**    | 4.x                 | Utility-first responsive styling      |
| **TanStack Query**  | v5                  | Server state, caching, auto-refetch   |
| **Zustand**         | v5                  | Global UI state (theme, modals, auth) |
| **React Hook Form** | v7                  | Performant form handling              |
| **Zod**             | v4                  | Runtime schema validation             |
| **Chart.js**        | v4                  | Analytics charts for dashboards       |
| **Next-Auth**       | v4 (stable)         | Credentials-based authentication      |
| **Lucide React**    | Latest              | Icon library                          |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, password reset pages
│   ├── (attendee)/      # Event discovery and RSVP pages
│   ├── (organizer)/     # Event creation and organizer dashboard
│   └── (admin)/         # Admin panel pages
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── events/          # Event cards, forms, detail views
│   ├── dashboard/       # Organizer dashboard widgets and charts
│   ├── admin/           # Admin panel tables and management views
│   └── shared/          # Layout, nav, loading states, error boundaries
├── hooks/               # TanStack Query hooks for API data fetching
├── stores/              # Zustand stores
├── lib/                 # API client, utility functions, Zod schemas
└── types/               # Shared TypeScript interfaces
```

## Quick Start

### Prerequisites

- Node.js 20+
- EventForge backend running on `http://localhost:5000`

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set NEXTAUTH_URL, NEXTAUTH_SECRET, NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

The app runs on `http://localhost:3000`.

## Available Scripts

| Script                 | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Development server with hot reload |
| `npm run build`        | Production build                   |
| `npm start`            | Start production build             |
| `npm run lint`         | Run ESLint                         |
| `npm run lint:fix`     | Auto-fix ESLint issues             |
| `npm run format`       | Format source with Prettier        |
| `npm run format:check` | Check formatting without writing   |

## Git Hooks

Husky enforces quality gates automatically:

- **pre-commit**: ESLint + Prettier on staged files via lint-staged
- **commit-msg**: Validates Conventional Commits format
- **pre-push**: Full ESLint check + Next.js production build

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(events): add event discovery page
fix(rsvp): resolve capacity validation edge case
chore: update dependencies
```

## Backend

See the [backend repository](https://github.com/SinuxDev/EventForge) for the API source and setup instructions.
