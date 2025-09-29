# Phase 1: Data Model & Design

## NEONPRO Theme + UI Components Data Model

### A.P.T.E Methodology Integration
This data model implements the A.P.T.E (Analyze → Plan → Think → Execute) methodology with constitutional compliance for Brazilian aesthetic clinics.

### Core Entities

#### ThemeConfiguration
```typescript
interface ThemeConfiguration {
  id: string;
  name: "NEONPRO";
  version: string;
  colors: ColorScheme;
  fonts: FontConfiguration;
  spacing: SpacingConfiguration;
  borderRadius: BorderRadiusConfiguration;
  shadows: ShadowConfiguration;
  uiComponents: UIComponentRegistry;
  constitutionalCompliance: ConstitutionalCompliance;
  createdAt: Date;
  updatedAt: Date;
}
```
```typescript
interface ThemeConfiguration {
  id: string;
  name: "NEONPRO";
  version: string;
  colors: ColorScheme;
  fonts: FontConfiguration;
  spacing: SpacingConfiguration;
  borderRadius: BorderRadiusConfiguration;
  shadows: ShadowConfiguration;
  createdAt: Date;
  updatedAt: Date;
}
```

#### ColorScheme
```typescript
interface ColorScheme {
  light: LightColorPalette;
  dark: DarkColorPalette;
  oklchFormat: boolean;
  contrastRatios: Record<string, number>; // WCAG compliance validation
  neonproBrandColors: {
    primary: string;      // #AC9469
    deepBlue: string;    // #112031
    accent: string;      // #E8D5B7
    neutral: string;     // #F5F5F5
    background: string;  // #FFFFFF
  };
}
```

#### LightColorPalette
```typescript
interface LightColorPalette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}
```

#### DarkColorPalette
```typescript
interface DarkColorPalette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}
```

#### FontConfiguration
```typescript
interface FontConfiguration {
  sans: {
    family: "Inter";
    source: "local";
    weights: number[];
    fallback: string[];
  };
  serif: {
    family: "Lora";
    source: "local";
    weights: number[];
    fallback: string[];
  };
  mono: {
    family: "Libre Baskerville";
    source: "local";
    weights: number[];
    fallback: string[];
  };
}
```

#### SpacingConfiguration
```typescript
interface SpacingConfiguration {
  unit: "rem" | "px";
  scale: number[];
  breakpoints: Record<string, string>;
}
```

#### BorderRadiusConfiguration
```typescript
interface BorderRadiusConfiguration {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}
```

#### ShadowConfiguration
```typescript
interface ShadowConfiguration {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  colors: {
    light: string;
    dark: string;
  };
}
```

### Theme Provider State

#### ThemeContext
```typescript
interface ThemeContext {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  resolvedTheme: "light" | "dark";
  colors: ColorPalette;
  fonts: FontConfiguration;
}
```

#### UserPreferences
```typescript
interface UserPreferences {
  theme: "light" | "dark" | "system";
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: "sm" | "md" | "lg";
}
```

## State Transitions

### Theme Installation Process
1. **Initial State**: No theme configured
2. **CLI Installation**: Base theme files added via shadcn CLI
3. **Manual Configuration**: Monorepo-specific adjustments applied
4. **Font Integration**: Local fonts downloaded and configured
5. **Theme Provider Setup**: Context API + localStorage implementation
6. **Symlink Creation**: Shared configuration linked to all apps
7. **Validation**: All components render with correct styling

### Theme Switching Process
1. **User Action**: Theme toggle triggered
2. **Context Update**: Theme state updated in Context API
3. **LocalStorage**: Preference persisted for future sessions
4. **CSS Update**: CSS variables updated dynamically
5. **Component Re-render**: All themed components update
6. **Validation**: WCAG compliance maintained

## UI Components Integration Model

### UI Component Registry
```typescript
interface UIComponentRegistry {
  registries: ComponentRegistry[];
  components: RegisteredComponent[];
  dependencyMatrix: DependencyMatrix;
  versionConflicts: VersionConflict[];
  constitutionalCompliance: ComponentCompliance;
}

interface ComponentRegistry {
  name: "Magic UI" | "Aceternity UI" | "Kokonut UI" | "ReactBits";
  url: string;
  enabled: boolean;
  priority: number;
  compatibility: {
    framerMotion: string;
    react: string;
    typescript: string;
  };
}

interface RegisteredComponent {
  id: string;
  name: ComponentName;
  source: ComponentSource;
  registry: string;
  version: string;
  installMethod: "cli" | "manual" | "registry";
  dependencies: string[];
  themeIntegration: ThemeIntegration;
  accessibility: AccessibilityCompliance;
  constitutionalValidation: ConstitutionalValidation;
}

type ComponentName =
  | "MagicCard"
  | "AnimatedThemeToggler"
  | "GradientButton"
  | "TiltedCard"
  | "Sidebar"
  | "ShineBorder"
  | "HoverBorderGradientButton";

type ComponentSource = "Magic UI" | "Aceternity UI" | "Kokonut UI" | "ReactBits";

interface ThemeIntegration {
  inheritsColors: boolean;
  supportsDarkMode: boolean;
  customCssVariables: Record<string, string>;
  framerMotionCompatibility: "v11.0.0";
  iconLibrarySupport: "lucide-react" | "@tabler/icons-react" | "both";
}

interface DependencyMatrix {
  sharedDependencies: {
    framerMotion: {
      version: "11.0.0";
      components: string[];
    };
    react: {
      version: "19";
      components: string[];
    };
    tailwindcss: {
      version: "latest";
      components: string[];
    };
  };
  conflicts: DependencyConflict[];
  resolutions: ConflictResolution[];
}

interface VersionConflict {
  dependency: string;
  expectedVersion: string;
  actualVersion: string;
  components: string[];
  severity: "low" | "medium" | "high";
  resolution: ResolutionStrategy;
}

type ResolutionStrategy =
  | "use_expected"
  | "use_actual"
  | "upgrade_both"
  | "manual_resolution";

interface AccessibilityCompliance {
  wcag21AA: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
  colorContrast: {
    light: Record<string, number>;
    dark: Record<string, number>;
  };
  focusManagement: boolean;
}

interface ConstitutionalValidation {
  lgpdCompliant: boolean;    // Brazilian data protection
  anvisaCompliant: boolean;  // Medical device regulations
  aestheticClinic: boolean;  // Clinic-specific requirements
  mobileFirst: boolean;     // Brazilian mobile optimization
  typeSafe: boolean;        // TypeScript compliance
  privacyByDesign: boolean;  // Privacy protections
}
```

### Component-Specific Interfaces

#### Magic Card Component
```typescript
interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  border?: boolean;
  shadow?: boolean;
  theme?: "light" | "dark";
  constitutional?: {
    patientData?: boolean;
    clinicBranding?: boolean;
  };
}

interface MagicCardConfig {
  defaultGradient: string;
  borderEnabled: boolean;
  shadowIntensity: "none" | "sm" | "md" | "lg";
  animationDuration: number;
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
  };
}
```

#### Animated Theme Toggler
```typescript
interface AnimatedThemeTogglerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  animation?: "slide" | "rotate" | "bounce";
  showLabel?: boolean;
  themes: ("light" | "dark" | "system")[];
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
}

interface ThemeTogglerConfig {
  defaultSize: "md";
  animationType: "slide";
  transitionDuration: number;
  persistence: boolean;
  accessibility: {
    keyboardShortcuts: boolean;
    screenReaderLabel: string;
  };
}
```

#### Gradient Button
```typescript
interface GradientButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "accent" | "destructive";
  size?: "sm" | "md" | "lg";
  gradient?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  constitutional?: {
    patientConsent?: boolean;
    clinicAction?: boolean;
  };
}

interface GradientButtonConfig {
  defaultGradient: string;
  animationEnabled: boolean;
  loadingSpinner: boolean;
  accessibility: {
    role: "button" | "submit" | "reset";
    ariaLabel: string;
  };
}
```

#### Tilted Card
```typescript
interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
  scaleOnHover?: boolean;
  perspective?: number;
  transition?: {
    type: "spring" | "tween";
    stiffness?: number;
    damping?: number;
  };
  theme?: "light" | "dark";
}

interface TiltedCardConfig {
  defaultTilt: number;
  scaleEnabled: boolean;
  perspectiveDepth: number;
  accessibility: {
    reducedMotion: boolean;
    hoverIntent: boolean;
  };
}
```

#### Sidebar Component
```typescript
interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  position?: "left" | "right";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  width?: string;
  icons?: "lucide" | "tabler" | "both";
  theme?: "light" | "dark";
  constitutional?: {
    patientNavigation?: boolean;
    clinicWorkflow?: boolean;
  };
}

interface SidebarConfig {
  defaultPosition: "left";
  collapsibleEnabled: boolean;
  defaultWidth: string;
  iconLibrary: "tabler";
  accessibility: {
    keyboardNavigation: boolean;
    screenReader: boolean;
    focusTrap: boolean;
  };
}
```

### Constitutional Compliance Model
```typescript
interface ConstitutionalCompliance {
  aestheticClinic: AestheticClinicCompliance;
  brazilianRegulations: BrazilianRegulatoryCompliance;
  technicalStandards: TechnicalCompliance;
  validationStatus: ComplianceStatus;
}

interface AestheticClinicCompliance {
  patientDataProtection: boolean;
  clinicWorkflowOptimization: boolean;
  aestheticProcedureStandards: boolean;
  professionalCompliance: boolean;
  mobileFirstDesign: boolean;
  accessibilityCompliance: boolean;
}

interface BrazilianRegulatoryCompliance {
  lgpd: LGPDCompliance;
  anvisa: ANVISACompliance;
  professionalCouncils: ProfessionalCouncilCompliance;
}

interface LGPDCompliance {
  dataProcessing: {
    patientData: boolean;
    clinicData: boolean;
    professionalData: boolean;
  };
  consentManagement: {
    explicitConsent: boolean;
    granularControl: boolean;
    withdrawalRights: boolean;
  };
  dataRights: {
    access: boolean;
    portability: boolean;
    deletion: boolean;
    rectification: boolean;
  };
}

interface ANVISACompliance {
  medicalDeviceRegulation: boolean;
  cosmeticProductStandards: boolean;
  equipmentDocumentation: boolean;
  qualityAssurance: boolean;
}

interface ProfessionalCouncilCompliance {
  aestheticProcedures: boolean;
  patientSafety: boolean;
  professionalStandards: boolean;
  ethicalGuidelines: boolean;
}

interface TechnicalCompliance {
  typeSafety: boolean;
  performanceStandards: boolean;
  securityMeasures: boolean;
  dataIntegrity: boolean;
  interoperability: boolean;
}

type ComplianceStatus =
  | "pending"
  | "in_progress"
  | "validated"
  | "failed"
  | "exempt";
```

## Validation Rules

### Color Contrast Validation
```typescript
interface ColorValidationRule {
  minimumContrast: 4.5; // WCAG 2.1 AA
  validate: (foreground: string, background: string) => boolean;
  aestheticClinicMode: {
    minimumContrast: 7; // Higher standard for medical interfaces
    colorBlindSafe: boolean;
  };
}
```

### Font Loading Validation
```typescript
interface FontValidationRule {
  maximumLoadTime: 2000; // 2 seconds
  requiredWeights: number[];
  validate: (fontFamily: string) => Promise<boolean>;
  brazilianOptimization: {
    mobileOptimization: boolean;
    fallbackFonts: string[];
    loadingStrategy: "async" | "blocking";
  };
}
```

### Theme Configuration Validation
```typescript
interface ThemeValidationRule {
  requiredColors: string[];
  requiredFonts: string[];
  validate: (config: ThemeConfiguration) => boolean;
  constitutionalValidation: {
    lgpdCompliant: boolean;
    accessibilityCompliant: boolean;
    aestheticClinicReady: boolean;
  };
}
```

### Component Integration Validation
```typescript
interface ComponentValidationRule {
  dependencyCompatibility: boolean;
  themeInheritance: boolean;
  accessibilityCompliance: boolean;
  constitutionalAlignment: boolean;
  validate: (component: RegisteredComponent) => Promise<ValidationResult>;
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  constitutionalScore: number; // 0-100
}

interface ValidationIssue {
  severity: "critical" | "major" | "minor";
  category: "dependency" | "theme" | "accessibility" | "constitutional";
  description: string;
  resolution: string;
}

interface ValidationWarning {
  category: "performance" | "best_practice" | "maintenance";
  description: string;
  recommendation: string;
}
```

## Relationships

### Theme to Apps
- One ThemeConfiguration serves multiple applications
- Each app can have theme-specific overrides
- Shared configuration through packages/ui symlinks
- Constitutional compliance inherited across all apps

### Theme to Components
- ThemeConfiguration provides styling for all components
- Components inherit theme through Context API
- Individual components can have theme-specific variants
- NEONPRO brand colors integrated into all components

### User to Theme
- Each user has preferred theme settings
- User preferences stored in localStorage
- System preferences respected when no user preference set
- Brazilian accessibility preferences supported

### Component Dependencies
- UI Component Registry manages shared dependencies
- Framer Motion v11.0.0 shared across all components
- Icon libraries (Lucide + Tabler) coordinated
- CSS variable namespaced to prevent conflicts

### Constitutional Integration
- All components inherit LGPD compliance requirements
- ANVISA standards applied to medical interface elements
- Brazilian mobile-first optimization enforced
- Type safety maintained across component boundaries

## Data Storage

### Configuration Files
- **Location**: packages/ui/theme/
- **Format**: TypeScript + JSON
- **Version Control**: Tracked in git
- **Constitutional Documentation**: compliance/

### Runtime State
- **Theme Context**: React Context API
- **User Preferences**: localStorage
- **CSS Variables**: Document root
- **Component Registry**: components.json

### Generated Files
- **CSS Variables**: globals.css
- **Type Definitions**: theme.types.ts, components.types.ts
- **Configuration Exports**: theme.config.ts, components.config.ts
- **Compliance Documentation**: constitutional-compliance.md
- **Installation Guide**: quickstart.md

### Component Installation Data
- **Registry Configuration**: components.json
- **Dependency Lock**: pnpm-lock.yaml
- **Build Artifacts**: dist/
- **Test Results**: test-results/

### State Management
```typescript
interface InstallationState {
  phase: "theme" | "components" | "validation" | "complete";
  progress: number;
  currentComponent: string | null;
  issues: InstallationIssue[];
  constitutionalStatus: ComplianceStatus;
}

interface InstallationIssue {
  component: string;
  severity: "blocking" | "warning" | "info";
  description: string;
  resolution: string;
  constitutionalImpact: boolean;
}
```