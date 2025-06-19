/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático para Netlify
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Desabilitar otimização de imagens para export estático
  images: {
    unoptimized: true,
  },
  
  // Configurações de performance
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // TypeScript (ignorar erros temporariamente)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint (ignorar durante build)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Variáveis de ambiente
  env: {
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
  },
};

module.exports = nextConfig;
