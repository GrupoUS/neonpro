// Minimal shim for '@sentry/react' to bypass bundling during deploy
// Provides no-op components and functions to satisfy imports

import React from 'react';

export const ErrorBoundary: React.FC<{ fallback?: React.ReactNode; children?: React.ReactNode }> = (
  { children },
) => <>{children}</>;

export const withErrorBoundary = <P extends object>(Component: React.ComponentType<P>) => Component;

export const init = (..._args: any[]) => {};
export const captureException = (..._args: any[]) => {};
export const captureMessage = (..._args: any[]) => {};
export const setUser = (..._args: any[]) => {};
export const setTag = (..._args: any[]) => {};
export const setContext = (..._args: any[]) => {};

export default {
  ErrorBoundary,
  withErrorBoundary,
  init,
  captureException,
  captureMessage,
  setUser,
  setTag,
  setContext,
};
