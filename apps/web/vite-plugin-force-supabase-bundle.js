/**
 * Force Supabase modules to be bundled instead of treated as external
 * This plugin runs BEFORE @rollup/plugin-commonjs and prevents it from
 * adding the ?commonjs-external suffix to Supabase imports
 * 
 * @returns {import('vite').Plugin}
 */
export function forceSupabaseBundle() {
  return {
    name: 'force-supabase-bundle',
    enforce: 'pre', // Run before other plugins including commonjs
    
    async resolveId(source, importer, options) {
      // Log ALL Supabase module resolutions
      if (source.includes('@supabase/')) {
        console.log(`[force-supabase-bundle] Resolving: ${source}`)
      }
      
      // Block commonjs-external suffix for Supabase modules
      if (source.includes('?commonjs-external') && source.includes('@supabase/')) {
        console.log(`[force-supabase-bundle] !!! FOUND COMMONJS-EXTERNAL: ${source}`)
        // Remove the suffix and force resolve
        const cleanSource = source.replace('?commonjs-external', '')
        
        // Force resolve the clean source
        const resolved = await this.resolve(cleanSource, importer, {
          skipSelf: true,
          ...options
        })
        
        if (resolved) {
          console.log(`[force-supabase-bundle] ✅ Forcing bundle of: ${cleanSource} -> ${resolved.id}`)
          // Return the resolved id WITHOUT the external flag
          return {
            id: resolved.id,
            external: false // Critical: force it to NOT be external
          }
        } else {
          console.log(`[force-supabase-bundle] ❌ Could not resolve: ${cleanSource}`)
        }
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
