import type { StackFrame } from '@sentry/core';
type StackFrameIteratee = (frame: StackFrame) => StackFrame;
interface RewriteFramesOptions {
    root?: string;
    prefix?: string;
    iteratee?: StackFrameIteratee;
}
export declare const customRewriteFramesIntegration: (options?: RewriteFramesOptions) => import("@sentry/core").Integration;
export declare const rewriteFramesIntegration: (options?: RewriteFramesOptions | undefined) => import("@sentry/core").Integration;
export {};
//# sourceMappingURL=rewriteFramesIntegration.d.ts.map