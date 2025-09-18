/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration to test webpack issue
  output: 'standalone',
  
  // Keep essential experimental features
  experimental: {
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@trpc/server',
      '@trpc/client',
      'zod',
    ],
  },

  // Basic server external packages
  serverExternalPackages: [
    'crypto-js',
    'jose',
    'node-forge',
  ],

  // No custom webpack configuration for now
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  eslint: {
    dirs: ['src', 'pages', 'app'],
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
