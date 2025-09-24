---
title: "Calendar Testing Essentials"
last_updated: 2025-09-24
form: how-to
tags: [calendar, testing, components, essential]
related:
  - ../testing/AGENTS.md
  - ./calendar-integration.md
---

# Calendar Testing Essentials — How-to

## Goal

Test calendar components effectively with minimal complexity.

## Prerequisites

- Vitest setup
- Testing Library configured
- Calendar components built

## Basic Tests

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import { EventCalendar } from './EventCalendar'

test('renders calendar events', () => {
  render(<EventCalendar events={mockEvents} />)
  expect(screen.getByText('Patient Consultation')).toBeInTheDocument()
})
```

### Integration Tests

```typescript
test('creates new appointment', async () => {
  render(<EventCalendar />)
  fireEvent.click(screen.getByText('New Appointment'))
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test' } })
  fireEvent.click(screen.getByText('Save'))

  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## E2E Tests

```typescript
test('complete appointment flow', async ({ page }) => {
  await page.goto('/calendar')
  await page.click('[data-testid=new-appointment]')
  await page.fill('[name=title]', 'E2E Test Appointment')
  await page.click('[data-testid=save-appointment]')

  await expect(page.locator('text=E2E Test Appointment')).toBeVisible()
})
```

## Key Scenarios

1. **Create Appointment**: User creates new appointment
2. **Edit Appointment**: User modifies existing appointment
3. **Delete Appointment**: User removes appointment
4. **View Switching**: User changes calendar views (day/week/month)
5. **LGPD Compliance**: Data privacy maintained

## Performance Tests

```bash
# Test calendar loading performance
pnpm test:performance calendar

# Check memory usage
pnpm test:memory calendar
```

## See Also

- [Testing Strategy](../testing/AGENTS.md)
- [Calendar Integration](./calendar-integration.md)
