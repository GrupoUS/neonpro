"use strict";
/// <reference types="vitest" />
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        environment: "happy-dom",
        include: [
            "src/**/*.{test,spec}.{ts,tsx}",
            "tests/**/*.{test,spec}.{ts,tsx}",
            "__tests__/**/*.{test,spec}.{ts,tsx}",
        ],
        exclude: ["node_modules/**", "dist/**", "coverage/**"],
        testTimeout: 30000, // Longer timeout for AI operations
        hookTimeout: 30000,
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/",
                "dist/",
                "**/*.test.ts",
                "**/*.spec.ts",
                "coverage/",
                "vitest.config.ts",
            ],
        },
    },
});
