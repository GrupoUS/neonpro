import type { Plugin } from 'vite';

/**
 * Vite plugin to fix tRPC v11 import issues with @trpc/server/unstable-core-do-not-import
 * 
 * This plugin resolves the issue where @trpc/react-query tries to import from
 * @trpc/server/unstable-core-do-not-import, which doesn't export the required symbols.
 * 
 * The fix redirects these imports to the main @trpc/server package.
 */
export function trpcFix(): Plugin {
  return {
    name: 'vite-plugin-trpc-fix',
    enforce: 'pre',
    resolveId(id) {
      if (id === '@trpc/server/unstable-core-do-not-import') {
        return '@trpc/server';
      }
      return null;
    },
  };
}

