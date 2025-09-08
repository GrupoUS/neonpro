/**
 * Central export for all TypeScript types used in NeonPro
 *
 * @description Barrel export que centraliza todos os tipos para
 * facilitar importação em componentes e hooks.
 */

// Base type modules
// Do not re-export placeholders to avoid TS2308 collisions
// export * from "./analytics";
// export * from "./notifications";  // placeholder
// export * from "./patients";       // placeholder
// export * from "./professionals";  // placeholder
// export * from "./reports";        // placeholder
export * from "./appointments";
export * from "./auth";
export * from "./billing";
// export * from "./common"; // disabled for MVP to avoid ambient conflicts
export * from "./consultations";
export * from "./database";
export * from "./financial";
export * from "./supabase";

// Re-export all hook types in one statement to avoid duplication
export * from "./hooks";
