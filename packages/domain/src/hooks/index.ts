// Backward-compatible hook re-exports for @neonpro/domain consumers
// Re-export hooks from the public @neonpro/ui entrypoint (no internal paths)
export {
  TranslationProvider,
  // Core UI hooks
  useDebounce,
  // Map UI's useIsMobile to legacy useMobile for backward compatibility
  useIsMobile as useMobile,
  // Layout
  useLayout,
  useLocale,
  // Domain-facing alias
  usePermissions as useHealthcarePermissions,
  useToast,
  useTranslation,
} from "@neonpro/ui";
