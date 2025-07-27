import type { VercelCronsConfig } from '../../common/types';
import type { LoaderThis } from './types';
export type WrappingLoaderOptions = {
    pagesDir: string | undefined;
    appDir: string | undefined;
    pageExtensionRegex: string;
    excludeServerRoutes: Array<RegExp | string>;
    wrappingTargetKind: 'page' | 'api-route' | 'middleware' | 'server-component' | 'route-handler';
    vercelCronsConfig?: VercelCronsConfig;
    nextjsRequestAsyncStorageModulePath?: string;
};
/**
 * Replace the loaded file with a wrapped version the original file. In the wrapped version, the original file is loaded,
 * any data-fetching functions (`getInitialProps`, `getStaticProps`, and `getServerSideProps`) or API routes it contains
 * are wrapped, and then everything is re-exported.
 */
export default function wrappingLoader(this: LoaderThis<WrappingLoaderOptions>, userCode: string, userModuleSourceMap: any): void;
//# sourceMappingURL=wrappingLoader.d.ts.map