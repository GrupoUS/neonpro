import type { GenerationFunctionContext } from '../common/types';
/**
 * Wraps a generation function (e.g. generateMetadata) with Sentry error and performance instrumentation.
 */
export declare function wrapGenerationFunctionWithSentry<F extends (...args: any[]) => any>(generationFunction: F, context: GenerationFunctionContext): F;
//# sourceMappingURL=wrapGenerationFunctionWithSentry.d.ts.map