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

    // 3. TypeScript type checking
    () => "pnpm tsc --noEmit",

    // 4. Add formatted files back to staging
    "git add",
  ],

  // JavaScript and JavaScript React files
  "**/*.{js,jsx}": ["biome check --write", "npx ultracite format", "git add"],

  // CSS, SCSS, and styling files
  "**/*.{css,scss,sass}": ["biome check --write", "git add"],

  // JSON files
  "**/*.json": ["biome check --write", "git add"],

  // Markdown files
  "**/*.md": ["biome check --write", "git add"],

  // Package.json files require special handling
  "**/package.json": [
    "biome check --write",
    // Validate package.json structure
    () => "node -e \"JSON.parse(require('fs').readFileSync('package.json', 'utf8'))\"",
    "git add",
  ],

  // Test files get additional test running
  "**/*.test.{ts,tsx,js,jsx}": [
    "biome check --write",
    "npx ultracite format",
    // Run related tests (if needed)
    // () => 'pnpm test --passWithNoTests --findRelatedTests',
    "git add",
  ],

  // Configuration files
  "**/*.{yml,yaml}": ["biome check --write", "git add"],
};
