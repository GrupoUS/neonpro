// Proxy re-exports to consolidate domain hooks inside @neonpro/ui
// Keeps backward compatibility for imports from "@neonpro/domain"
export * from "@neonpro/ui";

// Legacy placeholders retained for compatibility
export type DomainPlaceholder = unknown;
export const domainReady = true;
