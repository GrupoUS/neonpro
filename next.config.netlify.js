/** @type {import('next').NextConfig} */

// NEONPRO Next.js Configuration for Netlify
// Optimized for static export and production deployment

const nextConfig = {
  // === OUTPUT CONFIGURATION ===
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // === STATIC OPTIMIZATION ===
  distDir: "out",

  // === IMAGE OPTIMIZATION ===
  images: {
    unoptimized: true, // Required for static export
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // === PERFORMANCE OPTIMIZATION ===
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // === TYPESCRIPT CONFIGURATION ===
  typescript: {
    ignoreBuildErrors: false,
  },

  // === ESLINT CONFIGURATION ===
  eslint: {
    ignoreDuringBuilds: false,
  },

  // === EXPERIMENTAL FEATURES ===
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-slot"],
  },

  // === WEBPACK CONFIGURATION ===
  webpack: (config, { dev, isServer }) => {
    // Otimizações para produção
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      };
    }

    return config;
  },

  // === HEADERS CONFIGURATION ===
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // === REDIRECTS CONFIGURATION ===
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/signin",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/login",
        permanent: true,
      },
    ];
  },

  // === ENVIRONMENT VARIABLES ===
  env: {
    NEXT_PUBLIC_APP_NAME: "NEONPRO",
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
    NEXT_PUBLIC_DEPLOY_PLATFORM: "netlify",
  },

  // === SASS CONFIGURATION ===
  sassOptions: {
    includePaths: ["./src/styles"],
    prependData: `
      $primary-color: #112031;
      $primary-medium-color: #294359;
      $accent-gold-color: #AC9469;
      $neutral-warm-color: #B4AC9C;
      $neutral-light-color: #D2D0C8;
      $secondary-color: #4FD1C7;
      $background-color: #FFFFFF;
      $text-color: #112031;
      $border-color: #D2D0C8;
    `,
  },

  // === REACT STRICT MODE ===
  reactStrictMode: true,
};

module.exports = nextConfig;
