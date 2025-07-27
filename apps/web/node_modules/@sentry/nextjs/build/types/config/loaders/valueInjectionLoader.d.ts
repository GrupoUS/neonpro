import type { LoaderThis } from './types';
export type ValueInjectionLoaderOptions = {
    values: Record<string, unknown>;
};
/**
 * Set values on the global/window object at the start of a module.
 *
 * Options:
 *   - `values`: An object where the keys correspond to the keys of the global values to set and the values
 *        correspond to the values of the values on the global object. Values must be JSON serializable.
 */
export default function valueInjectionLoader(this: LoaderThis<ValueInjectionLoaderOptions>, userCode: string): string;
//# sourceMappingURL=valueInjectionLoader.d.ts.map