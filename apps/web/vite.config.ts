import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { componentTagger } from 'lovable-tagger';
import path from 'path';
import { type ConfigEnv, defineConfig } from 'vite';
import { generateHealthcareSecurityHeaders } from './src/lib/security/csp';

// Subresource Integrity (SRI) Plugin for healthcare security
function subresourceIntegrityPlugin() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    name: 'healthcare-sri',
    apply: 'build' as const,
    generateBundle(options: any, bundle: any) {
      if (!isProduction) return;
      
      // Generate SRI hashes for all assets
      const sriHashes = new Map<string, string>();
      
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' || chunk.type === 'asset') {
          const content = chunk.type === 'chunk' ? chunk.code : chunk.source;
          if (typeof content === 'string') {
            // Generate SHA-384 hash for SRI
            const crypto = require('crypto');
            const hash = crypto.createHash('sha384').update(content, 'utf8').digest('base64');
            sriHashes.set(fileName, `sha384-${hash}`);
          }
        }
      });
      
      // Store SRI hashes for runtime use
      this.emitFile({
        type: 'asset',
        fileName: 'sri-hashes.json',
        source: JSON.stringify(Object.fromEntries(sriHashes), null, 2),
      });
    },
    transformIndexHtml: {
      enforce: 'post' as const,
      transform(html: string, context: any) {
        if (!isProduction) return html;
        
        // Add security headers as meta tags
        const securityHeaders = generateHealthcareSecurityHeaders();
        const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${securityHeaders['Content-Security-Policy']}">`;
        
        // Add healthcare-specific meta tags
        const healthcareMeta = `
          <meta name="healthcare-app" content="NeonPro-Platform">
          <meta name="data-classification" content="LGPD-Protected-Medical-Data">
          <meta name="compliance-standards" content="LGPD,ANVISA,CFM">
          <meta http-equiv="X-Content-Type-Options" content="nosniff">
          <meta http-equiv="X-Frame-Options" content="DENY">
          <meta http-equiv="X-XSS-Protection" content="1; mode=block">
          <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
          <meta name="robots" content="noindex, nofollow"> <!-- Healthcare data should not be indexed -->
        `;
        
        // Inject security headers and healthcare meta tags
        return html.replace(
          '<head>',
          `<head>${cspMeta}${healthcareMeta}`
        );
      },
    },
  };
}

// Healthcare asset integrity validation
function healthcareAssetValidation() {
  return {
    name: 'healthcare-asset-validation',
    apply: 'build' as const,
    generateBundle(options: any, bundle: any) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) return;
      
      // Validate that no sensitive data is included in assets
      const sensitivePatterns = [
        /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
        /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g, // RG
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
        /\bpassword\s*[:=]\s*['"]\w+['"]/gi, // Passwords
        /\bapi[_-]?key\s*[:=]\s*['"]\w+['"]/gi, // API keys
        /\bsecret\s*[:=]\s*['"]\w+['"]/gi, // Secrets
      ];
      
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        const content = chunk.type === 'chunk' ? chunk.code : chunk.source;
        
        if (typeof content === 'string') {
          sensitivePatterns.forEach(pattern => {
            if (pattern.test(content)) {
              throw new Error(`[HEALTHCARE_SECURITY_ERROR] Potential sensitive data found in ${fileName}. Build failed to prevent accidental deployment of sensitive data.`);
              // Build is aborted to prevent accidental deployment of sensitive data
            }
          });
        }
      });
    },
  };
}

// External resource integrity configuration
const EXTERNAL_RESOURCES_SRI = {
  // Google Fonts (commonly used)
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap': 
    'sha384-rD+TRJXcOQhVTJPEYpNMXq8/wCfRvdwTI1u5n3UeGbVwWrLx2GdV5QDqhbRZNzHW',
  
  // CDN resources (update hashes as needed)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css':
    'sha384-j0CNLUeiqtyaRmlzUHCPZ+Gy5fQu0dQ6eZ/xAww941Ai1SxSY+0EQqNXNE6DZiVc',
  
  // Add more external resources as needed
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePrefix: '-',
      quoteStyle: 'single',
      autoCodeSplitting: true,
    }),
    react(),
    mode === 'development' ? (componentTagger() as any) : undefined,
    subresourceIntegrityPlugin(),
    healthcareAssetValidation(),
  ].filter(Boolean) as any,
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@neonpro/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@neonpro/ui/lib/utils': path.resolve(__dirname, '../../packages/ui/src/lib/utils.ts'),
      '@neonpro/ui/theme': path.resolve(__dirname, '../../packages/ui/src/theme'),
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@neonpro/types': path.resolve(__dirname, '../../packages/types/src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  define: {
    // Vite requires these to be defined for Supabase
    global: 'globalThis',
    // Define build-time constants for healthcare security
    __HEALTHCARE_APP__: JSON.stringify(true),
    __DATA_CLASSIFICATION__: JSON.stringify('LGPD-Protected-Medical-Data'),
    __COMPLIANCE_STANDARDS__: JSON.stringify(['LGPD', 'ANVISA', 'CFM']),
  },
  server: {
    host: '::',
    port: 8080,
    open: true,
    // Add security headers for development server
    headers: mode === 'development' ? {
      'X-Healthcare-App': 'NeonPro-Platform-Dev',
      'X-Data-Classification': 'Development-Data',
      'X-Content-Type-Options': 'nosniff',
    } : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy: any, _options: any) => {
          proxy.on('error', (err: any, _req: any, _res: any) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq: any, req: any, _res: any) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        // Remove comments that might contain sensitive information
        comments: false,
      },
      mangle: {
        safari10: true,
        // Preserve specific function names for healthcare debugging
        reserved: ['healthcareError', 'lgpdCompliance', 'auditLog'],
      },
      format: {
        // Remove comments in production
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: id => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@tanstack/react-router')) {
              return 'router';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'animations';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'forms';
            }
            if (id.includes('lucide-react') || id.includes('@tabler/icons-react')) {
              return 'icons';
            }
            if (id.includes('@radix-ui')) {
              return 'radix';
            }
            // Security and monitoring libraries
            if (id.includes('@sentry') || id.includes('opentelemetry')) {
              return 'monitoring';
            }
            // Other vendor libraries
            return 'vendor-misc';
          }

          // UI package
          if (id.includes('@neonpro/ui')) {
            return 'ui';
          }
          
          // Security and compliance packages
          if (id.includes('@neonpro/security') || id.includes('/security/')) {
            return 'security';
          }

          // Route-based chunks
          if (id.includes('/routes/')) {
            const routePath = id.split('/routes/')[1];
            if (routePath.includes('patients')) return 'patients';
            if (routePath.includes('appointments')) return 'appointments';
            if (routePath.includes('services')) return 'services';
            if (routePath.includes('auth')) return 'auth';
            return 'routes-misc';
          }

          // Component-based chunks
          if (id.includes('/components/')) {
            if (id.includes('ai/') || id.includes('chat/')) return 'ai-components';
            if (id.includes('forms/')) return 'form-components';
            if (id.includes('ui/')) return 'ui-components';
            return 'components-misc';
          }
        },
        chunkFileNames: (chunkInfo) => {
          // Use content hash for better caching and security
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: assetInfo => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    // Ensure builds are reproducible for security auditing
    minify: mode === 'production' ? 'terser' : false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
    // Exclude packages that might contain sensitive data
    exclude: mode === 'production' ? ['@neonpro/security'] : [],
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    // Drop console logs and debugger statements in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));