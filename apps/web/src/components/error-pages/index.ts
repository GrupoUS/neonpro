/**
 * Error Pages Index
 *
 * Centralized exports for all error page components
 */

export { ErrorBoundary, useErrorHandler } from "./ErrorBoundary";
export { NotFoundPage } from "./NotFoundPage";
export { ServerErrorPage } from "./ServerErrorPage";

// Re-export default components for convenience
export { default as ErrorBoundaryDefault } from "./ErrorBoundary";
export { default as NotFound } from "./NotFoundPage";
export { default as ServerError } from "./ServerErrorPage";
