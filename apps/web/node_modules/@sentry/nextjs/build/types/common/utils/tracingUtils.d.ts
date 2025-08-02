import type { PropagationContext } from '@sentry/core';
import { Scope } from '@sentry/core';
/**
 * Takes a shared (garbage collectable) object between resources, e.g. a headers object shared between Next.js server components and returns a common propagation context.
 *
 * @param commonObject The shared object.
 * @param propagationContext The propagation context that should be shared between all the resources if no propagation context was registered yet.
 * @returns the shared propagation context.
 */
export declare function commonObjectToPropagationContext(commonObject: unknown, propagationContext: PropagationContext): PropagationContext;
/**
 * Takes a shared (garbage collectable) object between resources, e.g. a headers object shared between Next.js server components and returns a common propagation context.
 *
 * @param commonObject The shared object.
 * @param isolationScope The isolationScope that should be shared between all the resources if no isolation scope was created yet.
 * @returns the shared isolation scope.
 */
export declare function commonObjectToIsolationScope(commonObject: unknown): Scope;
/**
 * Will mark the execution context of the callback as "escaped" from Next.js internal tracing by unsetting the active
 * span and propagation context. When an execution passes through this function multiple times, it is a noop after the
 * first time.
 */
export declare function escapeNextjsTracing<T>(cb: () => T): T;
/**
 * Ideally this function never lands in the develop branch.
 *
 * Drops the entire span tree this function was called in, if it was a span tree created by Next.js.
 */
export declare function dropNextjsRootContext(): void;
//# sourceMappingURL=tracingUtils.d.ts.map