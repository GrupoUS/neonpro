// Enhanced Accessibility Components for Healthcare Applications
// WCAG 2.1 AA+ Compliance

export { HighContrastProvider, useHighContrast, HighContrastToggle, highContrastStyles } from './high-contrast-provider'
export type { HighContrastProviderProps, HighContrastToggleProps } from './high-contrast-provider'

export { ReducedMotionProvider, useReducedMotion, ReducedMotionToggle, MotionLevelSelector, reducedMotionStyles } from './reduced-motion-provider'
export type { ReducedMotionProviderProps, ReducedMotionToggleProps, MotionLevelSelectorProps } from './reduced-motion-provider'

export { ScreenReaderAnnouncer, HealthcareAnnouncer, useAnnouncer } from './screen-reader-announcer'
export type { ScreenReaderAnnouncerProps, AnnouncerMessage, HealthcareAnnouncerProps } from './screen-reader-announcer'

export { AriaLiveRegion, HealthcareLiveRegions, LiveRegionManager, useLiveRegion, useLiveRegionManager } from './aria-live-region'
export type { AriaLiveRegionProps, LiveRegionMessage, LiveRegionManagerProps } from './aria-live-region'

// Enhanced accessibility provider that combines all features
export { AccessibilityProvider } from './accessibility-provider'