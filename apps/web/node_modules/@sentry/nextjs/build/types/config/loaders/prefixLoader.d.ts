import type { LoaderThis } from './types';
type LoaderOptions = {
    templatePrefix: string;
    replacements: Array<[string, string]>;
};
/**
 * Inject templated code into the beginning of a module.
 *
 * Options:
 *   - `templatePrefix`: The XXX in `XXXPrefixLoaderTemplate.ts`, to specify which template to use
 *   - `replacements`: An array of tuples of the form `[<placeholder>, <replacementValue>]`, used for doing global
 *        string replacement in the template. Note: The replacement is done sequentially, in the order in which the
 *        replacement values are given. If any placeholder is a substring of any replacement value besides its own, make
 *        sure to order the tuples in such a way as to avoid over-replacement.
 */
export default function prefixLoader(this: LoaderThis<LoaderOptions>, userCode: string): string;
export {};
//# sourceMappingURL=prefixLoader.d.ts.map