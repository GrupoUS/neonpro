/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // HEALTHCARE CRITICAL: Code quality errors MUST be fixed for medical accuracy
    ignoreDuringBuilds: false,
  },
  typescript: {
    // HEALTHCARE CRITICAL: TypeScript errors MUST be fixed for patient safety
    // ignoreBuildErrors: true, // ❌ REMOVED - Patient safety requirement
  },
};

export default nextConfig;
