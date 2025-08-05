"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tsup_1 = require("tsup");
exports.default = (0, tsup_1.defineConfig)({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: {
        compilerOptions: {
            incremental: false,
        },
    },
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    banner: {
        js: '"use client";',
    },
});
