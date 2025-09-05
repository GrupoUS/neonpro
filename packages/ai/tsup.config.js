"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tsup_1 = require("tsup");
exports.default = (0, tsup_1.defineConfig)({
    entry: [
        "src/index.ts",
        "src/follow-up/index.ts",
        "src/chatbot/index.ts",
        "src/workflow/index.ts",
        "src/ml/index.ts",
        "src/ethics/index.ts",
    ],
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: false,
    external: ["react", "react-dom", "@supabase/supabase-js", "@tensorflow/tfjs"],
    esbuildOptions: function (options) {
        options.banner = {
            js: '"use client"',
        };
    },
});
