// 🛡️ NEONPRO LINT-STAGED CONFIGURATION
// Executes quality checks only on staged files for optimal performance

const _path = require("node:path");

module.exports = {
  // TypeScript and TypeScript React files
  "**/*.{ts,tsx}": [
    // 1. Biome check and fix
    "biome check --write",

    // 2. Ultracite format and analysis
    "npx ultracite format",

    // 3. TypeScript type checking - API only for performance
    () => "cd apps/neonpro-api && pnpm run type-check",
  ],

  // JavaScript and JavaScript React files
  "**/*.{js,jsx}": ["biome check --write", "npx ultracite format"],

  // CSS, SCSS, and styling files
  "**/*.{css,scss,sass}": ["biome check --write"],

  // JSON files
  "**/*.json": ["biome check --write"],

  // Markdown files
  "**/*.md": ["biome check --write"],

  // Package.json files require special handling
  "**/package.json": [
    "biome check --write",
    // Validate package.json structure
    () => "node -e \"JSON.parse(require('fs').readFileSync('package.json', 'utf8'))\"",
  ],

  // Test files get additional test running
  "**/*.test.{ts,tsx,js,jsx}": [
    "biome check --write",
    "npx ultracite format",
    // Run related tests (if needed)
    // () => 'pnpm test --passWithNoTests --findRelatedTests',
  ],

  // Configuration files
  "**/*.{yml,yaml}": ["biome check --write"],
};
