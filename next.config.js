/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir is now stable in Next.js 14+ and should be removed
  },
  images: {
    domains: ['localhost'],
  },
  typescript: {
    // Permite builds mesmo com erros de TypeScript durante desenvolvimento
    ignoreBuildErrors: false,
  },
  eslint: {
    // Permite builds mesmo com warnings do ESLint durante desenvolvimento
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig