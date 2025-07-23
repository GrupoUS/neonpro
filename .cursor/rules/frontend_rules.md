# NeonPro Frontend Development Rules

## Component Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   ├── dashboard/       # Dashboard-specific components
│   └── charts/          # Data visualization components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── types/               # TypeScript type definitions
└── styles/              # Global styles and themes
```

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow single responsibility principle
- Use composition over inheritance
- Implement proper error boundaries

### Naming Conventions
```typescript
// Components: PascalCase
export const DashboardCard = () => {}

// Hooks: camelCase starting with 'use'
export const useAnalytics = () => {}

// Types: PascalCase with descriptive names
export interface UserDashboard {}

// Constants: UPPER_SNAKE_CASE
export const API_ENDPOINTS = {}
```

## State Management

### Local State
- Use useState for simple component state
- Use useReducer for complex state logic
- Use useContext for shared state across components

### Server State
- Use React Query for API data fetching
- Implement proper caching strategies
- Handle loading and error states consistently

### Form State
- Use React Hook Form for form management
- Implement proper validation schemas
- Handle form submission and error states

## Styling Guidelines

### Tailwind CSS Usage
```typescript
// Use semantic class groupings
const buttonClasses = cn(
  // Layout
  "flex items-center justify-center",
  // Spacing
  "px-4 py-2 gap-2",
  // Appearance
  "bg-blue-600 text-white rounded-lg",
  // Interactions
  "hover:bg-blue-700 focus:ring-2 focus:ring-blue-500",
  // Responsive
  "sm:px-6 md:py-3"
);
```

### Design System
- Use consistent color palette
- Implement proper typography scale
- Follow spacing and sizing conventions
- Maintain consistent component variants

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const DashboardAnalytics = lazy(() => import('./DashboardAnalytics'));

// Use dynamic imports for routes
const Dashboard = dynamic(() => import('../pages/dashboard'));
```

### Optimization Techniques
- Implement React.memo for expensive components
- Use useMemo and useCallback appropriately
- Optimize bundle size with tree shaking
- Implement proper image optimization

## Accessibility Standards

### ARIA Implementation
- Use semantic HTML elements
- Implement proper ARIA labels and roles
- Ensure keyboard navigation support
- Provide screen reader announcements

### Testing Requirements
- Test with screen readers
- Verify keyboard navigation
- Check color contrast ratios
- Test with various assistive technologies

## Error Handling

### Error Boundaries
```typescript
class DashboardErrorBoundary extends Component {
  // Implement proper error boundary for dashboard
}
```

### User Feedback
- Show loading states for async operations
- Display clear error messages
- Implement retry mechanisms
- Provide fallback UI for errors