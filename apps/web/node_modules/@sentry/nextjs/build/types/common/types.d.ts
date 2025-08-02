import type { SentrySpan, WebFetchHeaders, WrappedFunction } from '@sentry/core';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { RequestAsyncStorage } from '../config/templates/requestAsyncStorageShim';
export type ServerComponentContext = {
    componentRoute: string;
    componentType: 'Page' | 'Layout' | 'Head' | 'Not-found' | 'Loading' | 'Unknown';
    headers?: WebFetchHeaders;
};
export type GenerationFunctionContext = {
    requestAsyncStorage?: RequestAsyncStorage;
    componentRoute: string;
    componentType: string;
    generationFunctionIdentifier: string;
};
export interface RouteHandlerContext {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    parameterizedRoute: string;
    headers?: WebFetchHeaders;
}
export type VercelCronsConfig = {
    path?: string;
    schedule?: string;
}[] | undefined;
export type NextApiHandler = {
    (req: NextApiRequest, res: NextApiResponse): void | Promise<void> | unknown | Promise<unknown>;
    __sentry_route__?: string;
};
export type WrappedNextApiHandler = {
    (req: NextApiRequest, res: NextApiResponse): Promise<void> | Promise<unknown>;
    __sentry_route__?: string;
    __sentry_wrapped__?: boolean;
};
export type AugmentedNextApiResponse = NextApiResponse & {
    __sentryTransaction?: SentrySpan;
};
export type ResponseEndMethod = AugmentedNextApiResponse['end'];
export type WrappedResponseEndMethod = AugmentedNextApiResponse['end'] & WrappedFunction;
//# sourceMappingURL=types.d.ts.map