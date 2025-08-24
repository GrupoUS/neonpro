import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	external: ["@supabase/supabase-js", "@neonpro/types", "@neonpro/config", "@neonpro/security"],
	esbuildOptions: (options) => {
		options.banner = {
			js: '"use strict";',
		};
	},
});
