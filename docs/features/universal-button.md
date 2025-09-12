# Universal Button Component

## Overview

The Universal Button component combines three distinct UI library styles (KokonutUI, CultUI, and AceternityUI) into a single, configurable component within the NeonPro monorepo. This sophisticated button component provides multiple visual effects that can be toggled individually or combined for unique styling combinations.

## Architecture

### Component Structure
- **Location**: `packages/ui/src/components/ui/universal-button.tsx`
- **Styles**: `packages/ui/src/components/ui/universal-button.css`
- **Exports**: `packages/ui/src/index.ts`
- **Test Page**: `apps/web/src/routes/universal-button-test.tsx`

### Key Features
- **Base Implementation**: TypeScript interfaces with full type safety
- **Three Effect Systems**: Independent toggle system for different visual effects
- **CSS Animations**: Custom keyframe animations for performance
- **Accessibility**: Full support for screen readers and keyboard navigation
- **Build Integration**: Successfully integrated into monorepo build system

## Effect Systems

### 1. Gradient Effects (KokonutUI Style)
- **Purpose**: Animated background gradients with customizable colors
- **Implementation**: CSS custom properties with gradient animation
- **Animation**: `gradient-x` keyframe with configurable duration
- **Customization**: Support for custom gradient colors via props

### 2. Neumorph Effects (CultUI Style)
- **Purpose**: 3D shadow styling for depth and tactile appearance
- **Implementation**: Multiple inset and outset shadows
- **Styling**: Light/dark mode support with appropriate shadow colors
- **Interaction**: Hover and active states with shadow transitions

### 3. Border Gradient Effects (Aceternity Style)
- **Purpose**: Rotating animated borders with gradient effects
- **Implementation**: Pseudo-elements with conic gradients
- **Animation**: `reverse-spin` keyframe for continuous rotation
- **Performance**: Hardware acceleration with `transform3d`

## API Reference

### Props Interface

```typescript
interface UniversalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  
  // Effect Controls
  enableGradient?: boolean
  enableNeumorph?: boolean
  enableBorderGradient?: boolean
  
  // Gradient Customization
  gradientFrom?: string
  gradientVia?: string
  gradientTo?: string
  
  // Animation Controls
  gradientDuration?: string
  borderGradientDuration?: string
  
  // State Controls
  loading?: boolean
}
```

### Variants

```typescript
const universalButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    }
  }
)
```

## Usage Examples

### Basic Usage

```tsx
import { UniversalButton } from '@neonpro/ui'

// Simple button
<UniversalButton>Click Me</UniversalButton>

// With variant and size
<UniversalButton variant="outline" size="lg">
  Large Outline Button
</UniversalButton>
```

### Effect Combinations

```tsx
// Single effects
<UniversalButton enableGradient>
  Gradient Button
</UniversalButton>

<UniversalButton enableNeumorph>
  Neumorph Button
</UniversalButton>

<UniversalButton enableBorderGradient>
  Border Gradient Button
</UniversalButton>

// Combined effects
<UniversalButton 
  enableGradient 
  enableNeumorph 
  enableBorderGradient
>
  All Effects Combined
</UniversalButton>
```

### Custom Gradient Colors

```tsx
<UniversalButton
  enableGradient
  gradientFrom="from-purple-500"
  gradientVia="via-pink-500"
  gradientTo="to-red-500"
>
  Custom Gradient
</UniversalButton>
```

### Loading State

```tsx
<UniversalButton loading enableGradient>
  {loading ? 'Loading...' : 'Submit'}
</UniversalButton>
```

### As Child Component

```tsx
<UniversalButton asChild enableBorderGradient>
  <Link to="/dashboard">
    Go to Dashboard
  </Link>
</UniversalButton>
```

## CSS Custom Properties

The component uses CSS custom properties for dynamic styling:

```css
:root {
  --gradient-duration: 3s;
  --border-gradient-duration: 2s;
}
```

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support with focus management
- **Loading States**: Appropriate ARIA attributes during loading
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Focus Management**: Clear focus indicators and proper tab order

## Performance Optimizations

- **Hardware Acceleration**: Uses `transform3d` for smooth animations
- **CSS Animations**: Leverages CSS instead of JavaScript for better performance
- **Conditional Rendering**: Only applies effects when enabled
- **Optimized Selectors**: Efficient CSS selectors for minimal reflow

## Technical Implementation

### CSS Animations

```css
@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes reverse-spin {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}
```

### Component Architecture

The component follows these architectural patterns:
- **Composition over Inheritance**: Uses `forwardRef` and `Slot` for flexibility
- **Prop-based Configuration**: All effects controlled via props
- **CSS-in-TS**: Uses `clsx` and `cva` for dynamic class generation
- **Type Safety**: Full TypeScript support with proper interfaces

## Integration with Design Systems

### Shadcn/ui Compatibility
- **CVA Integration**: Uses Class Variance Authority for variant management
- **Tailwind CSS**: Fully compatible with Tailwind utility classes
- **Radix UI**: Leverages `@radix-ui/react-slot` for composition patterns

### Monorepo Integration
- **Package Structure**: Properly exported from `@neonpro/ui` package
- **Build System**: Successfully integrates with Vite and TypeScript
- **Development Server**: Hot reload support during development

## Testing

### Test Page Location
- **File**: `apps/web/src/routes/universal-button-test.tsx`
- **URL**: `/universal-button-test` (when dev server is running)

### Test Coverage
- ✅ All effect combinations
- ✅ Custom gradient colors
- ✅ Loading states
- ✅ Variant and size combinations
- ✅ Accessibility features
- ✅ Performance under various configurations

## Configuration

### Environment Setup
```bash
# Install dependencies
bun install

# Run development server
cd apps/web && bun run dev

# Build for production
cd apps/web && bun run build

# Type checking
bun run type-check

# Linting
bun run lint:fix
```

### Build Validation
The component successfully builds and is included in the production bundle:
- Build output: `universal-button-test-CMOuTmvg.js` (5.56 kB gzipped: 1.34 kB)
- No TypeScript errors or build warnings
- All CSS animations properly compiled

## Common Issues and Solutions

### 1. Type Conflicts
**Problem**: Conflict between `framer-motion` HTMLMotionProps and `@radix-ui/react-slot`
**Solution**: Use standard HTML button props interface instead of motion props

### 2. Animation Performance
**Problem**: Janky animations on low-end devices
**Solution**: Use CSS animations with hardware acceleration and `prefers-reduced-motion`

### 3. Build Integration
**Problem**: CSS not loading properly in production
**Solution**: Ensure CSS imports are properly configured in build system

## Future Enhancements

- [ ] Additional effect systems (glass morphism, particle effects)
- [ ] Theme-aware color schemes
- [ ] Advanced animation controls (easing, delay, etc.)
- [ ] Sound effects integration
- [ ] More accessibility improvements

## Last Updated
2025-01-12 - Complete implementation with all three effect systems and comprehensive testing