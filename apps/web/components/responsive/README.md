# NEONPRO Healthcare Responsive Design System

## Overview

Mobile-first responsive design system optimized for healthcare workflows with context-aware adaptations following KISS/YAGNI constitutional principles.

## Healthcare-Optimized Breakpoints

| Breakpoint | Size | Context | Usage |
|------------|------|---------|--------|
| **Mobile Small** | 320px | Emergency interface only | Critical actions, minimal UI |
| **Mobile Standard** | 375px | Full patient interface | Complete mobile functionality |
| **Tablet** | 768px | Dual pane layouts | Efficient workflow views |
| **Desktop** | 1024px | Full dashboard with sidebar | Complete healthcare management |

## Touch Optimization

### Touch Target Sizes

- **Normal Context**: 44px minimum (WCAG AA compliance)
- **Emergency Context**: 56px enhanced targets for stress situations  
- **Post-Procedure**: 60px maximum accessibility for bandaged hands

### Healthcare Context Adaptations

```tsx
// Automatic context detection and manual switching
<ResponsiveProvider defaultHealthcareContext="normal">
  <HealthcareContextSwitcher />
  <ResponsiveLayout>
    {/* Your app content */}
  </ResponsiveLayout>
</ResponsiveProvider>
```

## Components

### ResponsiveLayout

Context-aware layout system that adapts to screen size and healthcare context.

```tsx
import { ResponsiveLayout, useResponsive } from '@/components/responsive';

function PatientDashboard() {
  return (
    <ResponsiveLayout 
      sidebar={<PatientSidebar />}
      header={<DashboardHeader />}
    >
      <PatientList />
    </ResponsiveLayout>
  );
}
```

### Touch-Optimized Controls

Form controls optimized for medical environments:

```tsx
import { TouchButton, TouchInput, TouchSelect } from '@/components/responsive';

<TouchButton priority="emergency" hapticFeedback>
  Emergency Call
</TouchButton>

<TouchInput 
  label="Patient Name" 
  required 
  helperText="Enter full legal name"
/>

<TouchSelect
  label="Priority Level"
  options={[
    { value: 'routine', label: 'Routine' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' }
  ]}
/>
```

### Gesture Navigation

Swipe-based navigation with healthcare context sensitivity:

```tsx
import { GestureNavigation, SwipeIndicators } from '@/components/responsive';

<GestureNavigation
  onNavigate={(direction) => handleNavigation(direction)}
  enableSwipe={true}
  enableLongPress={true}
>
  <PatientRecord />
  <SwipeIndicators 
    showPrevious={canGoBack}
    showNext={canGoForward}
  />
</GestureNavigation>
```

## Healthcare Context Types

### Normal
Standard consultation mode with default accessibility settings.

### Emergency  
- Larger touch targets (56px)
- Higher contrast colors
- Haptic feedback for critical actions
- Simplified interface to reduce cognitive load

### Post-Procedure
- Maximum touch targets (60px) for bandaged hands
- Enhanced visual feedback
- Simplified interaction patterns
- Voice-only alternatives where possible

### One-Handed
- Optimized for single-hand operation
- Thumb-friendly navigation zones
- Reduced reach requirements
- Enhanced gesture support

### High Contrast
- Enhanced visibility for visual impairments
- Stronger border definitions
- Improved color contrast ratios (7:1)
- Clear focus indicators

## Progressive Enhancement

Core functionality works without JavaScript:

```css
/* Base styles work without JS */
.no-js .enhanced-only { display: none; }
.no-js .core-functionality { display: block; }
```

## Accessibility Features

### WCAG 2.1 AA+ Compliance
- Minimum 44px touch targets
- 4.5:1 color contrast ratios (7:1 for critical elements)
- Keyboard navigation support
- Screen reader optimization

### Motor Accessibility
- Switch navigation support
- One-handed operation modes
- Tremor-friendly interfaces
- Customizable touch sensitivity

### Cognitive Accessibility  
- Simplified modes for reduced cognitive load
- Clear navigation patterns
- Consistent interaction models
- Memory aids and breadcrumbs

## Performance Optimizations

### CSS Container Queries
Component-level responsive behavior without global breakpoint dependencies.

### Intersection Observer
Lazy loading of non-critical responsive features.

### ResizeObserver
Dynamic layout adjustments for optimal performance.

## Usage Examples

### Basic Setup

```tsx
import { ResponsiveProvider } from '@/components/responsive';

function App() {
  return (
    <ResponsiveProvider defaultHealthcareContext="normal">
      <YourAppContent />
    </ResponsiveProvider>
  );
}
```

### Emergency Mode

```tsx
const { setHealthcareContext } = useResponsive();

// Switch to emergency mode
setHealthcareContext('emergency');
```

### Custom Healthcare Context

```tsx
<ResponsiveProvider defaultHealthcareContext="post-procedure">
  <PostSurgeryInterface />
</ResponsiveProvider>
```

## Browser Support

- **iOS Safari**: 12+
- **Android Chrome**: 80+
- **Desktop Chrome/Firefox/Safari**: Latest 2 versions
- **Progressive enhancement** for older browsers

## Testing

### Accessibility Testing
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast mode validation
- Touch target size verification

### Device Testing
- iPhone SE (320px width)
- Standard smartphones (375px width)
- Tablets (768px width)
- Desktop displays (1024px+ width)

### Healthcare Context Testing
- Post-procedure simulation (limited dexterity)
- Emergency stress testing (time pressure)
- One-handed operation validation
- High contrast visual testing

## Best Practices

1. **Mobile-First**: Always design for smallest screen first
2. **Context-Aware**: Consider healthcare context in all interactions
3. **Touch-Friendly**: Maintain adequate spacing and target sizes
4. **Progressive**: Layer enhancements without breaking core functionality
5. **Accessible**: Test with assistive technologies regularly

## Performance Metrics

- **First Contentful Paint**: <1.5s on 3G
- **Largest Contentful Paint**: <2.5s on 3G  
- **Touch Response Time**: <100ms for critical actions
- **Gesture Recognition**: <150ms latency
- **Layout Shift**: <0.1 CLS score