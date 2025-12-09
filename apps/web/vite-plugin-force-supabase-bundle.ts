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
      // Block commonjs-external suffix for Supabase modules
      if (source.includes('?commonjs-external') && source.includes('@supabase/')) {
        // Remove the suffix and resolve normally
        const cleanSource = source.replace('?commonjs-external', '')
        // Return false to prevent externalization
        return false
      }
      
      return null // Let other plugins handle
    },
    
    load(id) {
      // Don't try to load modules with null bytes (Rollup virtual modules)
      if (id.startsWith('\x00')) {
        return null
      }
      
      // Prevent loading of external Supabase modules
      if (id.includes('@supabase/') && id.includes('?commonjs-external')) {
        const cleanId = id.replace('?commonjs-external', '').replace(/^\x00/, '')
        // Let other plugins handle the actual loading
        return null
      }
      return null
    }
  }
}
