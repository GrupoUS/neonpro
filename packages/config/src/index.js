"use strict";
/**
 * NeonPro Config Package
 * Shared configuration for healthcare platform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsConfig = exports.tailwindConfig = exports.prettierConfig = exports.eslintConfig = void 0;
// ESLint configuration
exports.eslintConfig = {
    extends: ['next/core-web-vitals', '@next/eslint-config-next'],
    rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        'prefer-const': 'error',
    },
};
// Prettier configuration
exports.prettierConfig = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
};
// Tailwind base configuration
exports.tailwindConfig = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                healthcare: {
                    primary: '#0070f3',
                    secondary: '#7c3aed',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                },
            },
        },
    },
    plugins: [],
};
// TypeScript configuration base
exports.tsConfig = {
    compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
    exclude: ['node_modules'],
};
