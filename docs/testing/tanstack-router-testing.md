# TanStack Router Testing Guide (NeonPro)

Purpose: Patterns for testing routes, loaders, actions, and navigation in `apps/web` with React 19.

## Locations & Setup

- App: `apps/web`
- Tests: `apps/web/src/test` and alongside components/routes
- Runner: Vitest + Testing Library; optional MSW for HTTP

## Route Component Testing

```ts
// apps/web/src/routes/patients/$patientId.test.tsx
import { render, screen } from '@/test';
import { Route } from './$patientId';

test('renders patient detail data', async () => {
  render(<Route.component />);
  expect(await screen.findByText(/Paciente/)).toBeInTheDocument();
});
```

## Loader/Action Testing

- Test loaders by mocking data-fetch functions and asserting render
- Validate search params schemas and error boundaries

## Navigation & Links

- Use `getByRole('link')` and assert target routes (type-safe params)
- Test protected routes with mocked auth context

## React 19 Considerations

- Use `useTransition` assertions for pending UIs
- Wrap `use()` usage with Suspense in tests when applicable

## Accessibility

- Prefer roles/labels; include WCAG checks for critical pages
