type RequestInfo = {
    path: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
};
type ErrorContext = {
    routerKind: string;
    routePath: string;
    routeType: string;
};
/**
 * Reports errors passed to the the Next.js `onRequestError` instrumentation hook.
 */
export declare function captureRequestError(error: unknown, request: RequestInfo, errorContext: ErrorContext): void;
/**
 * Reports errors passed to the the Next.js `onRequestError` instrumentation hook.
 *
 * @deprecated Use `captureRequestError` instead.
 */
export declare const experimental_captureRequestError: typeof captureRequestError;
export {};
//# sourceMappingURL=captureRequestError.d.ts.map
