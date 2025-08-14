/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
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