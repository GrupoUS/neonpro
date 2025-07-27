import type { WebFetchHeaders } from '@sentry/core';
export interface RequestAsyncStorage {
    getStore: () => {
        headers: WebFetchHeaders;
    } | undefined;
}
export declare const requestAsyncStorage: undefined;
export declare const workUnitAsyncStorage: undefined;
//# sourceMappingURL=requestAsyncStorageShim.d.ts.map