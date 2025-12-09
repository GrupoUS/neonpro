/**
 * Disable commonjs plugin for Supabase modules
 * This prevents the ?commonjs-external suffix from being added
 */
export function disableCommonjsForSupabase() {
  return {
    name: 'disable-commonjs-for-supabase',
    enforce: 'pre',
    
    options(opts) {
      // Intercept Rollup options and modify commonjs plugin behavior
      if (!opts.plugins) return opts
      
      // Find and disable commonjs for Supabase
      const plugins = Array.isArray(opts.plugins) ? opts.plugins : [opts.plugins]
      
      plugins.forEach(plugin => {
        if (plugin && plugin.name === 'commonjs') {
          console.log('[disable-commonjs-for-supabase] Found commonjs plugin, patching...')
          
          // Override the resolveId to skip Supabase modules
          const originalResolveId = plugin.resolveId
          plugin.resolveId = function(source, importer, options) {
            if (source.includes('@supabase/')) {
              return null // Skip commonjs handling
            }
            return originalResolveId?.call(this, source, importer, options)
          }
        }
      })
      
      return opts
    }
  }
}
