# Data Model: NEONPRO Theme + 7 UI Components

## Overview
This document defines the entities, relationships, and validation rules for the NEONPRO theme system and 7 UI components integration within the aesthetic clinic platform.

## Core Entities

### 1. Theme Configuration

#### ThemeSettings
```typescript
interface ThemeSettings {
  id: string
  name: 'NEONPRO' | 'default' | 'custom'
  colorScheme: 'light' | 'dark' | 'system'
  colors: ThemeColors
  fonts: ThemeFonts
  shadows: ThemeShadows
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  updatedAt: Date
  updatedBy: string // User ID
}
```

#### ThemeColors
```typescript
interface ThemeColors {
  primary: string      // #ac9469 - NeonPro Golden
  deepBlue: string     // #112031 - Healthcare Professional  
  accent: string       // #d4af37 - Gold Accent
  neutral: string      // #B4AC9C - Calming Light Beige
  background: string   // #D2D0C8 - Soft Gray Background
  success: string
  warning: string
  error: string
  muted: string
}
```

#### ThemeFonts
```typescript
interface ThemeFonts {
  sans: 'Inter' | 'System' | 'Custom'
  serif: 'Lora' | 'Libre Baskerville' | 'System' | 'Custom'
  mono: 'JetBrains Mono' | 'System' | 'Custom'
  customFonts?: CustomFont[]
}
```

#### CustomFont
```typescript
interface CustomFont {
  family: string
  source: 'local' | 'google' | 'custom'
  weights: number[]
  styles: string[]
  unicodeRange?: string
}
```

### 2. Component Registry

#### ComponentLibrary
```typescript
interface ComponentLibrary {
  id: string
  name: 'Magic UI' | 'Aceternity UI' | 'Kokonut UI' | 'ReactBits' | 'shadcn'
  registryUrl: string
  version: string
  components: ComponentInfo[]
  isActive: boolean
  installedAt: Date
  dependencies: Dependency[]
}
```

#### ComponentInfo
```typescript
interface ComponentInfo {
  id: string
  name: string
  type: 'atom' | 'molecule' | 'organism'
  category: 'ui' | 'form' | 'layout' | 'feedback' | 'navigation'
  path: string // Installation path in monorepo
  dependencies: string[]
  customizations: ComponentCustomization[]
  isInstalled: boolean
}
```

#### ComponentCustomization
```typescript
interface ComponentCustomization {
  componentId: string
  themeOverrides: Record<string, string>
  brandColors: boolean // Apply NEONPRO brand colors
  accessibility: AccessibilityConfig
  mobileOptimizations: MobileConfig[]
}
```

### 3. UI Component Specific Entities

#### MagicCardComponent
```typescript
interface MagicCardComponent extends ComponentInfo {
  gradientColors: string[]
  borderWidth: number
  borderRadius: number
  shadowIntensity: number
  hoverEffect: boolean
  animationDuration: string
}
```

#### GradientButtonComponent
```typescript
interface GradientButtonComponent extends ComponentInfo {
  gradientType: 'linear' | 'radial' | 'conic'
  colors: string[]
  direction: string
  hoverColors: string[]
  disabledColors: string[]
  size: 'sm' | 'md' | 'lg' | 'xl'
}
```

#### AnimatedThemeToggler
```typescript
interface AnimatedThemeToggler extends ComponentInfo {
  transitionDuration: string
  animationType: 'slide' | 'rotate' | 'fade' | 'bounce'
  showLabels: boolean
  iconOnly?: boolean
  customIcons: {
    light: string
    dark: string
  }
}
```

#### TiltedCardComponent
```typescript
interface TiltedCardComponent extends ComponentInfo {
  tiltAngle: number
  perspective: number
  transitionDuration: string
  enableGlow: boolean
  glareColor: string
  mobileOptimized: boolean
}
```

#### SidebarComponent
```typescript
interface SidebarComponent extends ComponentInfo {
  position: 'left' | 'right'
  width: string
  collapsible: boolean
  overlay: boolean
  items: SidebarItem[]
  footer?: React.ReactNode
  logoPlacement: 'top' | 'center' | 'hidden'
}
```

#### SidebarItem
```typescript
interface SidebarItem {
  id: string
  label: string
  icon: string
  href?: string
  onClick?: () => void
  badge?: BadgeConfig
  submenu?: SidebarItem[]
  isActive: boolean
}
```

#### BadgeConfig
```typescript
interface BadgeConfig {
  text: string
  color: string
  size: 'sm' | 'md' | 'lg'
  variant: 'solid' | 'outline' | 'ghost'
}
```

### 4. Validation and State Management

#### ThemeValidation
```typescript
interface ThemeValidation {
  contrastRatio: number
  wcagCompliance: 'AA' | 'AAA' | 'FAIL'
  colorBlindnessTest: boolean
  mobileReadability: boolean
  healthcareCompliance: boolean
}
```

#### ComponentInstallationState
```typescript
interface ComponentInstallationState {
  componentId: string
  status: 'pending' | 'installing' | 'installed' | 'failed' | 'updating'
  progress: number
  error?: string
  installedAt?: Date
  version: string
  conflicts?: ConflictInfo[]
}
```

#### ConflictInfo
```typescript
interface ConflictInfo {
  type: 'dependency' | 'naming' | 'version' | 'style'
  componentA: string
  componentB: string
  description: string
  resolution?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}
```

## Relationships

### Primary Relationships

```
ThemeSettings 1--* ComponentLibrary
ComponentLibrary 1--* ComponentInfo  
ComponentInfo 1--* ComponentCustomization
ComponentCustomization *--1 ThemeValidation
ComponentInstallationState 1--1 ComponentInfo
ConflictInfo *--2 ComponentInfo
```

### Entity Relationships Description

1. **ThemeSettings to ComponentLibrary**: One theme can support multiple component libraries
2. **ComponentLibrary to ComponentInfo**: Each library contains multiple components
3. **ComponentInfo to ComponentCustomization**: Components can have multiple customization configurations
4. **ComponentCustomization to ThemeValidation**: Customizations must pass validation checks
5. **ComponentInstallationState to ComponentInfo**: Tracks installation status for each component
6. **ConflictInfo between ComponentInfo**: Identifies conflicts between different components

## Validation Rules

### Theme Validation Rules

```typescript
const ThemeValidationRules = {
  // Color contrast ratios for WCAG compliance
  minContrastRatio: 4.5, // AA compliance
  enhancedMinContrastRatio: 7.0, // AAA compliance
  
  // Brazilian healthcare specific requirements
  requiresProfessionalAppearance: true,
  requiresMobileOptimization: true,
  requiresAccessibilitySupport: true,
  
  // Performance constraints
  maxFontSize: '1.5rem', // Mobile-friendly maximum
  minTouchTarget: '44px', // WCAG mobile requirements
  maxAnimationDuration: '0.3s', // Motion safety
}
```

### Component Validation Rules

```typescript
const ComponentValidationRules = {
  // Bundle size impact
  maxComponentSize: '50KB', // Individual component limit
  maxTotalBundleIncrease: '200KB', // Total allowed increase
  
  // Healthcare compliance
  requiresAuditLogging: true,
  requiresLGPDCompliance: true,
  requiresAccessibility: true,
  
  // Compatibility requirements
  requiresReactVersion: '>=19.0.0',
  requiresTypeScript: true,
  requiresStrictMode: true,
}
```

### State Transition Rules

```typescript
const InstallationStateTransitions = {
  pending: ['installing', 'failed'],
  installing: ['installed', 'failed'],
  installed: ['updating', 'failed'],
  updating: ['installed', 'failed'],
  failed: ['pending', 'installing'],
}
```

## Data Flow Patterns

### Theme Application Flow
1. User selects theme → Validate theme settings
2. Apply CSS variables → Update component styles
3. Validate contrast ratios → Confirm accessibility compliance
4. Log theme change → Audit trail for compliance

### Component Installation Flow
1. Select component → Check compatibility
2. Install via CLI/shadcn → Update registry configuration
3. Apply NEONPRO styling → Validate appearance
4. Test functionality → Confirm integration success

### Configuration Persistence Flow
1. User modifies settings → Validate changes
2. Store in localStorage → Maintain user preferences
3. Update theme context → Apply changes reactively
4. Sync across devices → Ensure consistency

## Security and Compliance Considerations

### LGPD Data Protection
- Theme preferences stored as non-sensitive user data
- No personal health information in theme configuration
- Audit trail maintained for theme changes
- User consent required for theme analytics

### Healthcare Compliance
- Professional appearance maintained across all themes
- Color schemes validated for medical environment appropriateness
- Accessibility features mandatory for healthcare compliance
- Mobile optimization required for Brazilian clinic workflows

### Performance Compliance
- Bundle size limits enforced for Brazilian infrastructure
- Animation constraints for motion sensitivity
- Loading optimization for unreliable mobile connections
- Performance budgets maintained for clinic operations

## Implementation Notes

### Monorepo Integration
- Theme configuration shared across apps via packages/ui
- Component registry maintained at monorepo level
- Consistent styling enforced through shared CSS variables
- Type safety maintained across package boundaries

### Migration Strategy
- Incremental theme rollout with feature flags
- Backward compatibility maintained during transition
- Rollback mechanisms for production safety
- User preference migration handled gracefully

### Testing Requirements
- Component rendering across all themes
- Accessibility compliance validation
- Performance impact measurement
- Healthcare compliance verification

---
*Data Model Version: 1.0*
*Created: 2025-09-30*
*Last Updated: 2025-09-30*