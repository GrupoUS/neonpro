/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint enabled for production builds to catch errors early
    // ignoreDuringBuilds: false, // Default value - ESLint will run during builds
    dirs: [
      "app",
      "components",
      "lib",
      "hooks",
      "middleware",
      "contexts",
      "types",
    ],
  },
  typescript: {
    // TypeScript type checking enabled for production builds
    // This ensures type safety in production deployments
    // ignoreBuildErrors: false, // Default value - TypeScript errors will fail the build
  },
  // Optimize for Vercel deployment
  experimental: {
    // Enable optimizations for better performance
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },
  // Next.js 15 compiler optimizations (swcMinify is default in 15+)
  compiler: {
    // Remove console.log in production builds
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  // Output configuration for Vercel
  output: "standalone",
};

module.exports = nextConfig;
