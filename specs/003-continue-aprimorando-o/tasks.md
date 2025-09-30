# Tasks: NEONPRO Theme + UI Components Integration

**Input**: Design documents from `/specs/003-continue-aprimorando-o/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md, and UI components integration from consolidated 002 specification

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Extract: tech stack, libraries, structure
2. Load design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
   → quickstart.md: Extract installation steps → implementation tasks
3. Generate tasks by category:
   → Setup: registry configuration, dependencies, workspace setup
   → Tests: contract tests, integration tests, validation tests
   → Core: theme installation, font setup, component integration
   → Integration: theme provider, symlinks, configuration management
   → Polish: unit tests, performance, docs, troubleshooting
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/`, `packages/` at repository root
- **Theme configuration**: `packages/ui/`
- **Apps**: `apps/web/`, `apps/api/`
- **Tests**: Root level `tests/` directories

## Phase 3.1: Setup & Dependencies

- [x] T001 Setup multiple registry support in components.json for Magic UI, Aceternity UI, and Kokonut UI
- [x] T002 [P] Install Framer Motion v11.0.0 compatibility across all target UI libraries
- [x] T003 [P] Install @tabler/icons-react dependency for Aceternity UI Sidebar compatibility
- [x] T004 Configure pnpm workspace for theme and component dependency management
- [x] T005 [P] Install theme validation and testing dependencies (Vitest, Playwright)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T006 [P] Contract test theme installation API in apps/web/src/__tests__/contract/test_theme_installation.ts
- [ ] T007 [P] Contract test font installation API in apps/web/src/__tests__/contract/test_font_installation.ts
- [ ] T008 [P] Contract test theme configuration API in apps/web/src/__tests__/contract/test_theme_configuration.ts
- [ ] T009 [P] Contract test theme validation API in apps/web/src/__tests__/contract/test_theme_validation.ts
- [ ] T010 [P] Integration test theme switching workflow in apps/web/src/__tests__/integration/test_theme_switching.ts
- [ ] T011 [P] Integration test component compatibility with NEONPRO theme in apps/web/src/__tests__/integration/test_component_compatibility.ts
- [ ] T012 [P] Integration test light/dark mode across all integrated components in apps/web/src/__tests__/integration/test_theme_consistency.ts
- [ ] T013 [P] Integration test font loading performance and validation in apps/web/src/__tests__/integration/test_font_loading.ts
- [ ] T014 [P] Integration test WCAG 2.1 AA compliance across all components in apps/web/src/__tests__/integration/test_accessibility.ts

- [x] T006 [P] Contract test theme installation API in apps/web/src/**tests**/contract/test_theme_installation.ts
- [x] T007 [P] Contract test font installation API in apps/web/src/**tests**/contract/test_font_installation.ts
- [x] T008 [P] Contract test theme configuration API in apps/web/src/**tests**/contract/test_theme_configuration.ts
- [x] T009 [P] Contract test theme validation API in apps/web/src/**tests**/contract/test_theme_validation.ts
- [x] T010 [P] Integration test theme switching workflow in apps/web/src/**tests**/integration/test_theme_switching.ts
- [x] T011 [P] Integration test component compatibility with NEONPRO theme in apps/web/src/**tests**/integration/test_component_compatibility.ts
- [x] T012 [P] Integration test light/dark mode across all integrated components in apps/web/src/**tests**/integration/test_theme_consistency.ts
- [x] T013 [P] Integration test font loading performance and validation in apps/web/src/**tests**/integration/test_font_loading.ts
- [x] T014 [P] Integration test WCAG 2.1 AA compliance across all components in apps/web/src/**tests**/integration/test_accessibility.ts

## Phase 3.3: NEONPRO Theme Installation (ONLY after tests are failing)

- [x] T015 Install NEONPRO theme from tweakcn registry using shadcn CLI in packages/ui/
- [x] T016 Create theme package structure in packages/ui/ with proper package.json
- [x] T017 [P] Setup local font installation for Inter, Lora, and Libre Baskerville fonts in public/fonts/
- [x] T018 Configure Tailwind CSS with NEONPRO color variables in oklch format in packages/ui/tailwind.config.ts
- [x] T019 Create theme provider with Context API + localStorage persistence in packages/ui/src/theme-provider.tsx
- [x] T020 Create global CSS with NEONPRO theme variables in packages/ui/src/globals.css
- [x] T021 Create theme types and interfaces in packages/ui/src/types/theme.ts
- [x] T022 Configure theme validation for WCAG 2.1 AA compliance

## Phase 3.4: UI Components Integration (ONLY after theme is installed)

- [x] T023 [P] Install Magic Card component from Magic UI using shadcn CLI
- [x] T024 [P] Install Animated Theme Toggler from Magic UI with theme provider compatibility
- [x] T025 [P] Install Gradient Button from Kokonut UI using CLI installation method
- [x] T026 [P] Install Sidebar from Aceternity UI using registry JSON method
- [x] T027 Implement Tilted Card from ReactBits using manual implementation (no CLI available)
- [x] T028 [P] Install Shine Border component from Aceternity UI with enhanced styling
- [x] T029 [P] Install Hover Border Gradient Button from Aceternity UI with theme integration
- [x] T030 Create unified component exports in packages/ui/src/components/index.ts
- [x] T031 [P] Configure component inheritance of NEONPRO brand colors (neonpro-primary, neonpro-deep-blue, neonpro-accent, neonpro-neutral, neonpro-background)
- [x] T032 Verify Framer Motion v11.0.0 compatibility across all installed components

## Phase 3.5: Monorepo Integration

- [x] T033 Create symlinks from packages/ui to all apps (apps/web, apps/api, etc.)
- [x] T034 [P] Update root layouts to include ThemeProvider in apps/web/src/app/layout.tsx
- [x] T035 [P] Update root layouts to include ThemeProvider in apps/api/src/app/layout.tsx
- [x] T036 Configure theme inheritance for existing shadcn components
- [x] T037 Create theme configuration management system in packages/ui/src/config/theme.config.ts
- [x] T038 [P] Update package.json files to ensure proper dependency resolution across monorepo

## Phase 3.6: Configuration & Customization

- [x] T039 Create theme customization system for aesthetic clinic branding
- [x] T040 [P] Configure component-specific theme variants for each UI library
- [x] T041 Setup icon library coordination between Lucide React and @tabler/icons-react
- [x] T042 Create theme validation utilities for development time checks
- [x] T043 Configure performance optimization for theme switching (<500ms)
- [x] T044 Create theme migration utilities for existing components

## Phase 3.7: Validation & Testing

- [x] T045 [P] Validate theme installation success and functionality across all apps
- [x] T046 [P] Test component integration with existing monorepo structure
- [x] T047 [P] Verify no dependency conflicts between multiple UI libraries
- [x] T048 [P] Validate light/dark mode switching across all integrated components
- [x] T049 [P] Test build process completes successfully without errors
- [x] T050 [P] Measure performance impact (bundle size increase < 10%)
- [x] T051 [P] Verify WCAG 2.1 AA+ accessibility compliance for all components
- [x] T052 Test theme persistence across browser sessions

## Phase 3.8: Documentation & Polish

- [x] T053 [P] Create comprehensive installation guide in docs/theme-installation.md
- [x] T054 [P] Document component usage examples with NEONPRO theme integration
- [x] T055 [P] Create troubleshooting guide for common theme and component issues
- [x] T056 [P] Update existing documentation to reflect new theme and component availability
- [x] T057 Create performance optimization guidelines for theme usage
- [x] T058 [P] Document theme customization options for aesthetic clinic branding
- [x] T059 Create automated verification scripts for theme and component validation
- [x] T060 [P] Add unit tests for theme provider and configuration management

## Dependencies

- Tests (T006-T014) before implementation (T015-T032)
- Theme installation (T015-T022) before component integration (T023-T032)
- Component integration before monorepo integration (T033-T038)
- All implementation before validation (T045-T052)
- Validation before documentation (T053-T060)

## Parallel Execution Groups

### Group 1: Registry & Dependency Setup

```
# Launch T001-T005 together:
Task: "Setup multiple registry support in components.json for Magic UI, Aceternity UI, and Kokonut UI"
Task: "Install Framer Motion v11.0.0 compatibility across all target UI libraries"
Task: "Install @tabler/icons-react dependency for Aceternity UI Sidebar compatibility"
Task: "Configure pnpm workspace for theme and component dependency management"
Task: "Install theme validation and testing dependencies (Vitest, Playwright)"
```

### Group 2: Contract Tests (All Parallel)

```
# Launch T006-T014 together:
Task: "Contract test theme installation API in tests/contract/test_theme_installation.ts"
Task: "Contract test font installation API in tests/contract/test_font_installation.ts"
Task: "Contract test theme configuration API in tests/contract/test_theme_configuration.ts"
Task: "Contract test theme validation API in tests/contract/test_theme_validation.ts"
Task: "Integration test theme switching workflow in tests/integration/test_theme_switching.ts"
Task: "Integration test component compatibility with NEONPRO theme in tests/integration/test_component_compatibility.ts"
Task: "Integration test light/dark mode across all integrated components in tests/integration/test_theme_consistency.ts"
Task: "Integration test font loading performance and validation in tests/integration/test_font_loading.ts"
Task: "Integration test WCAG 2.1 AA compliance across all components in tests/integration/test_accessibility.ts"
```

### Group 3: Component Installation (Parallel)

```
# Launch T023-T029 together:
Task: "Install Magic Card component from Magic UI using shadcn CLI"
Task: "Install Animated Theme Toggler from Magic UI with theme provider compatibility"
Task: "Install Gradient Button from Kokonut UI using CLI installation method"
Task: "Install Sidebar from Aceternity UI using registry JSON method"
Task: "Implement Tilted Card from ReactBits using manual implementation (no CLI available)"
Task: "Install Shine Border component from Aceternity UI with enhanced styling"
Task: "Install Hover Border Gradient Button from Aceternity UI with theme integration"
```

### Group 4: App Integration (Parallel)

```
# Launch T034-T038 together:
Task: "Update root layouts to include ThemeProvider in apps/web/src/app/layout.tsx"
Task: "Update root layouts to include ThemeProvider in apps/api/src/app/layout.tsx"
Task: "Configure theme inheritance for existing shadcn components"
Task: "Create theme configuration management system in packages/ui/src/config/theme.config.ts"
Task: "Update package.json files to ensure proper dependency resolution across monorepo"
```

## Implementation Examples

### T023: Install Magic Card Component

```bash
# Use shadcn CLI to install Magic Card
pnpm dlx shadcn@latest add magic-card --registry https://magicui.registry.com
```

### T027: Implement Tilted Card (Manual)

```typescript
// packages/ui/src/components/tilted-card.tsx
export const TiltedCard: React.FC<TiltedCardProps> = ({
  children,
  className,
  tiltAmount = 15,
  scaleOnHover = true,
}) => {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
      whileHover={{
        rotateX: tiltAmount,
        rotateY: tiltAmount,
        scale: scaleOnHover ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {children}
    </motion.div>
  )
}
```

### T028: Install Shine Border Component

```typescript
// packages/ui/src/components/shine-border.tsx
export const ShineBorder: React.FC<ShineBorderProps> = ({
  children,
  className,
  borderWidth = 1,
  borderRadius = 8,
  duration = 14,
  shineColor,
  theme = 'gold',
}) => {
  return (
    <div
      className={cn(
        'relative flex overflow-hidden shine-border',
        `shine-border--${theme}`,
        className,
      )}
      style={{
        '--border-width': `${borderWidth}px`,
        '--shine-duration': `${duration}s`,
        '--shine-color': shineColor,
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
```

### T029: Install Hover Border Gradient Button

```typescript
// packages/ui/src/components/hover-border-gradient-button.tsx
export const HoverBorderGradientButton: React.FC<HoverBorderGradientButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
}) => {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-md font-medium transition-all',
        'hover:border-gradient-to-r hover:from-neonpro-primary hover:to-neonpro-accent',
        'focus:outline-none focus:ring-2 focus:ring-neonpro-primary focus:ring-offset-2',
        className,
      )}
    >
      {children}
    </button>
  )
}
```

### T033: Create Symlinks

```bash
# Create symlinks from packages/ui to all apps
cd apps/web
ln -s ../../packages/ui/src/components ./src/components/ui
ln -s ../../packages/ui/src/theme-provider.tsx ./src/theme-provider.tsx
ln -s ../../packages/ui/src/globals.css ./src/globals.css
```

## Validation Checklist

_GATE: Must pass before implementation complete_

- [ ] All contracts have corresponding tests (T006-T009)
- [ ] All integration scenarios have tests (T010-T014)
- [ ] Tests are written and failing before implementation (TDD)
- [ ] Theme installation completes successfully (T015-T022)
- [ ] All 7 UI components installed and working (T023-T032)
- [ ] Monorepo integration functional across all apps (T033-T038)
- [ ] Performance benchmarks met (<500ms theme switching, <10% bundle increase)
- [ ] WCAG 2.1 AA+ compliance validated (T051, T053)
- [ ] Documentation complete and comprehensive (T053-T060)

## Quality Gates

- [ ] Build completes successfully across all apps
- [ ] No TypeScript errors
- [ ] All tests pass (unit, integration, contract)
- [ ] Theme switching works seamlessly
- [ ] Components inherit NEONPRO styling correctly
- [ ] No dependency conflicts
- [ ] Performance within acceptable limits
- [ ] Accessibility compliance verified

## Success Criteria

The feature is complete when:

1. NEONPRO theme is installed and configured across the entire monorepo
2. All 7 UI components (Magic Card, Animated Theme Toggler, Gradient Button, Sidebar, Tilted Card, Shine Border, Hover Border Gradient Button) are working
3. NEONPRO theme colors are consistently applied across all components
4. No dependency conflicts exist between multiple UI libraries
5. Light/dark mode switching works seamlessly across all integrated components
6. All components maintain WCAG 2.1 AA+ accessibility compliance
7. Components are accessible from all apps via packages/ui
8. Build process completes successfully without errors
9. Performance impact is minimal (bundle size increase < 10%)
10. Documentation is complete with usage examples
11. A.P.T.E methodology is properly implemented throughout all phases
12. Constitutional compliance is validated for all integrated components

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing any feature
- Commit after each task completion
- Follow NeonPro constitutional requirements for healthcare compliance
- Maintain Brazilian aesthetic clinic focus throughout implementation
- Ensure mobile-first responsive design for all components
- Apply A.P.T.E methodology systematically: Analyze → Plan → Think → Execute
- Constitutional compliance includes LGPD, ANVISA, and WCAG 2.1 AA+ requirements
- All 7 UI components must be integrated: Magic Card, Animated Theme Toggler, Gradient Button, Sidebar, Tilted Card, Shine Border, Hover Border Gradient Button

