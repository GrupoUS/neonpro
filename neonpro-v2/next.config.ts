import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Handle symbolic links properly
  webpack: (config, { isServer }) => {
    // Enable symbolic link resolution
    config.resolve.symlinks = true;
    return config;
  },
  // Re-enable turbopack
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
