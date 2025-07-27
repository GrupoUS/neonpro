interface Options {
    formData?: FormData;
    /**
     * Headers as returned from `headers()`.
     *
     * Currently accepts both a plain `Headers` object and `Promise<ReadonlyHeaders>` to be compatible with async APIs introduced in Next.js 15: https://github.com/vercel/next.js/pull/68812
     */
    headers?: Headers | Promise<any>;
    /**
     * Whether the server action response should be included in any events captured within the server action.
     */
    recordResponse?: boolean;
}
export declare function withServerActionInstrumentation<A extends (...args: any[]) => any>(serverActionName: string, callback: A): Promise<ReturnType<A>>;
export declare function withServerActionInstrumentation<A extends (...args: any[]) => any>(serverActionName: string, options: Options, callback: A): Promise<ReturnType<A>>;
export {};
//# sourceMappingURL=withServerActionInstrumentation.d.ts.map