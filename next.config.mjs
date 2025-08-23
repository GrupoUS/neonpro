/** @type {import('next').NextConfig} */
// ⚠️ DEPRECATED: This next.config.mjs is now DEPRECATED after Turborepo reorganization
// All Next.js configuration should be done in apps/web/next.config.mjs
// This file exists only for compatibility and will be removed after migration is complete

const nextConfig = {
	// Legacy transpilePackages for compatibility during migration
	transpilePackages: [
		"@neonpro/ui",
		"@neonpro/domain",
		"@neonpro/types",
		"@neonpro/utils",
	],

	// Environment variables
	env: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_API_URL:
			process.env.NEXT_PUBLIC_API_URL ||
			(process.env.NODE_ENV === "production"
				? "/api/v1"
				: "http://localhost:3003"),
	},

	// API configuration - no rewrites needed in production (Vercel handles this)
	async rewrites() {
		// Only rewrite in development
		if (process.env.NODE_ENV === "development") {
			return [
				{
					source: "/api/:path*",
					destination: "http://localhost:3003/:path*",
				},
			];
		}
		return [];
	},

	// Security headers
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
				],
			},
		];
	},

	// Image configuration
	images: {
		domains: ["localhost"],
		formats: ["image/webp", "image/avif"],
	},
};

export default nextConfig;
