import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // REMOVER output standalone - incompatível com Vercel
  // output: "standalone", // ❌ REMOVER

  // === WEBPACK CONFIGURATION ===
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // SOLUÇÃO 1: Configuração Global de Polyfills (sem condicionais)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: require.resolve("process/browser"),
      buffer: require.resolve("buffer"),
      util: require.resolve("util"),
      url: require.resolve("url"),
      querystring: require.resolve("querystring-es3"),
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      crypto: false,
      stream: false,
      path: false,
      os: false,
    };

    // SOLUÇÃO 2: ProvidePlugin Global
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );

    // SOLUÇÃO 3: Alias direto para resolver módulos
    config.resolve.alias = {
      ...config.resolve.alias,
      "process/browser": require.resolve("process/browser"),
    };

    // SOLUÇÃO 4: Ignorar warnings específicos
    config.ignoreWarnings = [
      { module: /node_modules\/process\// },
      { module: /node_modules\/buffer\// },
    ];

    return config;
  },

  // === EXPERIMENTAL FEATURES ===
  experimental: {
    // Desabilitar features experimentais que podem causar conflitos
    webpackBuildWorker: false,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
  },
};

export default nextConfig;