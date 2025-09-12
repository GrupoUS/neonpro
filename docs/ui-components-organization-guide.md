# 🎨 UI Components Organization Guide

**Generated:** January 11, 2025  
**Purpose:** Comprehensive guide for organizing and using UI components from multiple libraries

## 📚 Component Library Overview

### **Current Libraries in NeonPro**
1. **shadcn/ui** - Base design system components
2. **Aceternity UI** - Advanced animated components  
3. **Kokonut UI** - Interactive effect components
4. **Custom Components** - NeonPro-specific implementations

## 🗂️ Component Categories & Usage Guidelines

### **1. Button Components**

#### **When to Use Each Button Type:**

| Component | Use Case | Best For | Example Usage |
|-----------|----------|----------|---------------|
| `Button` (shadcn) | Standard interactions | Forms, navigation, basic actions | "Save", "Cancel", "Submit" |
| `AceternityButton` | Hero sections | Landing pages, marketing CTAs | "Get Started", "Learn More" |
| `GradientButton` | Premium features | Paid services, premium actions | "Upgrade to Pro", "Book Premium" |
| `ParticleButton` | Success states | Confirmations, celebrations | "Payment Complete", "Booking Confirmed" |
| `ShimmerButton` | Loading/Processing | Async operations, special CTAs | "Processing...", "Agendar Consulta" |

#### **Import Patterns:**
```typescript
// Standard shadcn button
import { Button } from '@/components/ui/button';

// Aceternity UI button
import { AceternityButton } from '@/components/ui/aceternity-button';

// Kokonut UI buttons (default exports)
import GradientButton from '@/components/ui/gradient-button';
import ParticleButton from '@/components/ui/particle-button';

// Custom shimmer button
import { ShimmerButton } from '@/components/ui/shimmer-button';
```

### **2. Card Components**

#### **Card Selection Guide:**

| Component | Purpose | Visual Style | Best Use Case |
|-----------|---------|--------------|---------------|
| `Card` (shadcn) | Standard content containers | Clean, minimal | Data display, forms, content blocks |
| `LiquidGlassCard` (Kokonut) | Premium content | Glass morphism, animated | Hero sections, featured content |

#### **Usage Examples:**
```typescript
// Standard card for data display
<Card>
  <CardHeader>
    <CardTitle>Patient Information</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Patient data */}
  </CardContent>
</Card>

// Premium glass card for hero sections
<LiquidGlassCard variant="default" size="xl">
  <h2>Premium Aesthetic Services</h2>
  <p>Experience luxury treatments...</p>
</LiquidGlassCard>
```

### **3. Layout & Background Components**

#### **Background Effects:**

| Component | Effect | Performance | Use Case |
|-----------|--------|-------------|----------|
| `BackgroundGradient` | Animated gradient border | Medium | Hero sections, featured cards |
| `Sidebar` | Collapsible navigation | High | Main navigation, admin panels |

## 🎯 Component Selection Decision Tree

### **For Buttons:**
```
Need a button? 
├── Standard form/navigation action? → Button (shadcn)
├── Hero/marketing section? → AceternityButton
├── Premium/paid feature? → GradientButton
├── Success/celebration? → ParticleButton
└── Loading/processing state? → ShimmerButton
```

### **For Cards:**
```
Need a card?
├── Standard data display? → Card (shadcn)
├── Premium/hero content? → LiquidGlassCard
└── Complex layout needs? → Custom card composition
```

## 🔧 Implementation Best Practices

### **1. Consistent Import Patterns**
```typescript
// Group imports by library
// shadcn/ui components (named exports)
import { Button, Card, CardHeader, CardContent } from '@/components/ui/...';

// Aceternity UI components (named exports)
import { AceternityButton } from '@/components/ui/aceternity-button';

// Kokonut UI components (default exports)
import GradientButton from '@/components/ui/gradient-button';
import ParticleButton from '@/components/ui/particle-button';
```

### **2. Component Composition Patterns**
```typescript
// Good: Compose components for complex UIs
function PremiumServiceCard() {
  return (
    <LiquidGlassCard>
      <h3>Premium Service</h3>
      <p>Description...</p>
      <GradientButton>Book Now</GradientButton>
    </LiquidGlassCard>
  );
}

// Good: Use standard components for forms
function BookingForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          {/* Form fields */}
          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### **3. Styling Consistency**
```typescript
// Use consistent className patterns
<Button className="w-full">Standard Action</Button>
<GradientButton className="w-full">Premium Action</GradientButton>
<ParticleButton className="w-full">Success Action</ParticleButton>
```

## 🚨 Common Pitfalls to Avoid

### **1. Import Confusion**
```typescript
// ❌ Wrong: Mixing import styles
import Button from '@/components/ui/button'; // Wrong - it's named export
import { GradientButton } from '@/components/ui/gradient-button'; // Wrong - it's default export

// ✅ Correct: Use proper import patterns
import { Button } from '@/components/ui/button';
import GradientButton from '@/components/ui/gradient-button';
```

### **2. Component Overuse**
```typescript
// ❌ Wrong: Using animated components everywhere
<ParticleButton>Save</ParticleButton>
<GradientButton>Cancel</GradientButton>
<AceternityButton>Delete</AceternityButton>

// ✅ Correct: Use appropriate components
<Button>Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

### **3. Styling Conflicts**
```typescript
// ❌ Wrong: Conflicting animations
<div className="animate-shimmer">
  <ShimmerButton>Click me</ShimmerButton> {/* Double shimmer effect */}
</div>

// ✅ Correct: Single animation source
<ShimmerButton>Click me</ShimmerButton>
```

## 📱 Responsive Design Guidelines

### **Mobile-First Approach**
```typescript
// Use responsive sizing
<Button size="sm" className="md:size-default lg:size-lg">
  Responsive Button
</Button>

// Adjust complex components for mobile
<GradientButton className="text-sm md:text-base px-4 md:px-6">
  Mobile-Friendly Gradient
</GradientButton>
```

## 🎨 Theme Integration

### **Color Consistency**
All components use CSS custom properties from the NeonPro theme:
```css
/* Components automatically use theme colors */
--primary: /* NeonPro brand color */
--secondary: /* Secondary brand color */
--accent: /* Accent color for highlights */
--muted: /* Muted text and backgrounds */
```

### **Dark Mode Support**
All components support automatic dark mode switching through CSS custom properties.

## 🧪 Testing Recommendations

### **Component Testing Strategy**
```typescript
// Test component combinations
describe('Button Components', () => {
  it('should render all button types without conflicts', () => {
    render(
      <div>
        <Button>Standard</Button>
        <AceternityButton>Aceternity</AceternityButton>
        <GradientButton>Gradient</GradientButton>
        <ParticleButton>Particle</ParticleButton>
        <ShimmerButton>Shimmer</ShimmerButton>
      </div>
    );
    // Assert no conflicts
  });
});
```

## 📈 Performance Considerations

### **Bundle Size Optimization**
- Use tree-shaking friendly imports
- Lazy load heavy animation components
- Consider component splitting for large pages

### **Animation Performance**
- Limit simultaneous animations
- Use `will-change` CSS property sparingly
- Test on lower-end devices

## 🔄 Migration Path

### **From Conflicting Components**
If you find components that conflict:
1. Identify the root cause (CSS, imports, functionality)
2. Choose the most appropriate component for the use case
3. Update imports and usage patterns
4. Test thoroughly in different contexts
5. Document the decision for team reference

This guide ensures consistent, conflict-free usage of all UI components in the NeonPro project.


## MagicUI shine-border and magic-card usage (scoped)

We integrated lightweight equivalents of MagicUI's ShineBorder and MagicCard in `apps/web/src/components/ui/shine-border.tsx` and `apps/web/src/components/ui/magic-card.tsx`.

To avoid page-wide application, the base `Card` component is now opt-in for these effects via a `magic` prop.

- File: `apps/web/src/components/molecules/card.tsx`
- Prop: `magic?: boolean` (default: false)
- Optional: `magicDisabled?: boolean` to force-disable when needed

Usage examples:

```tsx
// With animated border + hover highlight
<Card magic>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>

// Default card (no MagicUI effects)
<Card>...</Card>
```

Current application:
- Dashboard stat cards opt-in: see `apps/web/src/routes/dashboard.tsx` (4 KPI cards use `<Card magic>`)
- All other cards remain plain by default for focus and performance.

Customization notes:
- `ShineBorder` supports `radius`, `borderWidth`, and `glow` props if you need custom wrappers.
- `MagicCard` supports `intensity` and responds to pointer move; keep it off on highly interactive forms.

Accessibility/performance:
- Effects are disabled under `MODE=test` to keep unit tests deterministic.
- Prefer opt-in on small, decorative KPI tiles; avoid on long scrolling lists or forms.
