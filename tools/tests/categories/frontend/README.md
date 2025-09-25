# Frontend Tests

## React Component Tests
- Component rendering and behavior
- Props validation
- State management
- Accessibility (WCAG 2.1 AA+)
- Responsive design testing

## E2E Tests  
- User journey validation
- Cross-browser compatibility
- Mobile responsiveness
- Performance validation
- Healthcare workflow validation

## Accessibility Tests
- WCAG 2.1 AA+ compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast validation
- Healthcare accessibility requirements

## Test Commands
```bash
# Run all frontend tests
cd tools/tests && bun run test:frontend

# Run React component tests
cd tools/tests && bun run test:react

# Run E2E tests  
cd tools/tests && bun run test:e2e

# Run accessibility tests
cd tools/tests && bun run test:accessibility
```