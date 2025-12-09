import type { Plugin } from 'vite'

/**
 * Force Supabase modules to be bundled instead of treated as external
 * This plugin runs BEFORE @rollup/plugin-commonjs and prevents it from
 * adding the ?commonjs-external suffix to Supabase imports
 */
export function forceSupabaseBundle(): Plugin {
  return {
    name: 'force-supabase-bundle',
    enforce: 'pre', // Run before other plugins including commonjs
    
    resolveId(source, importer, options) {
      // Intercept Supabase module resolution
      if (source.includes('@supabase/')) {
        // Don't let it be treated as external
        return null // Let Vite handle normal resolution
      }
      
      // Block commonjs-external suffix
      if (source.includes('?commonjs-external')) {
        const cleanSource = source.replace('?commonjs-external', '')
        if (cleanSource.includes('@supabase/')) {
          // Force resolve without the suffix
          return this.resolve(cleanSource, importer, { skipSelf: true, ...options })
        }
      }
      
      return null // Let other plugins handle
    },
    
    load(id) {
      // Prevent loading of external Supabase modules
      if (id.includes('@supabase/') && id.includes('?commonjs-external')) {
        const cleanId = id.replace('?commonjs-external', '')
        return this.load({ id: cleanId })
      }
      return null
    }
  }
}
