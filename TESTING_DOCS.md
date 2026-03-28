# Frontend Testing Docs

## What We Use

- **Runner:** Vitest
- **UI Testing:** React Testing Library + `@testing-library/jest-dom`
- **User Interactions:** `@testing-library/user-event`
- **API Mocking:** MSW
- **Environment:** JSDOM

## Folder Structure

```text
src/
  test/
    setup.ts
    msw/
      handlers.ts
      server.ts
    unit/
      lib/
        event-draft-flow.test.ts
        api-client.test.ts
        schemas/
          event-create.schema.test.ts
    integration/
      components/
        shared/
          role-upgrade-card.test.tsx
```

## Conventions

- Use `*.test.ts` / `*.test.tsx`.
- Put pure logic in `unit/`.
- Put component + interaction flows in `integration/`.
- Keep tests **black-box**: assert user-visible behavior, not internal implementation details.

## Commands

```bash
npm run test
npm run test:watch
npm run test:coverage
npm run build
```

## Add a New Test

1. Choose `unit` or `integration`.
2. Place the file under `src/test/<type>/...` by feature/domain.
3. Reuse shared setup from `src/test/setup.ts` and MSW handlers when API mocking is needed.
4. Run `npm run test`.
