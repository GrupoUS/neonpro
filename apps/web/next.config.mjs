/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@neonpro/ui',
    '@neonpro/utils', 
    '@neonpro/domain',
    '@neonpro/db'
  ],
  eslint: {
    // HEALTHCARE CRITICAL: Using Biome for code quality validation
    ignoreDuringBuilds: true, // Biome handles linting in CI/CD pipeline
  },
  typescript: {
    // HEALTHCARE CRITICAL: TypeScript errors MUST be fixed for patient safety
    // ignoreBuildErrors: true, // ❌ REMOVED - Patient safety requirement
  },
};

export default nextConfig;
