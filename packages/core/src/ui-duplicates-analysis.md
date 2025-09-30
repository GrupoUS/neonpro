# UI Component Duplicates Analysis

## Duplicated Components Found

### High Priority Duplicates (Exist in both locations):
1. **Button** - `apps/web/src/components/ui/button.tsx` and `packages/ui/src/components/ui/button.tsx`
2. **Card** - `apps/web/src/components/ui/card.tsx` and `packages/ui/src/components/ui/card.tsx`  
3. **Input** - `apps/web/src/components/ui/input.tsx` and `packages/ui/src/components/ui/input.tsx`
4. **Badge** - `apps/web/src/components/ui/badge.tsx` and `packages/ui/src/components/ui/badge.tsx`
5. **Alert** - `apps/web/src/components/ui/alert.tsx` and `packages/ui/src/components/ui/alert.tsx`

### Apps/web Only Components (Should be moved to packages/ui):
- accessibility-label.tsx
- accessibility-input.tsx
- accessibility-button.tsx
- accessibility-provider.tsx
- keyboard-navigation.tsx
- healthcare-form-group.tsx
- healthcare-loading.tsx
- healthcare-error-boundary.tsx
- label.tsx
- screen-reader-announcer.tsx
- slider.tsx
- separator.tsx
- tabs.tsx
- textarea.tsx
- select.tsx
- progress.tsx
- lgpd-privacy-controls.tsx
- mobile-healthcare-button.tsx (exists in both but different)

### Packages/ui Only Components:
- heading.tsx

## Consolidation Strategy:

1. **Use packages/ui as single source of truth**
2. **Move unique components from apps/web to packages/ui**
3. **Update all imports to use @neonpro/ui**
4. **Remove duplicate components from apps/web**
5. **Update component index files**

## Components to Keep in packages/ui:
- All healthcare-specific accessibility components
- LGPD compliance components  
- Mobile-optimized components
- Brazilian clinic-specific components

## Next Steps:
1. Move unique components from apps/web to packages/ui
2. Update apps/web imports to use @neonpro/ui
3. Remove duplicates from apps/web
4. Test all components still work