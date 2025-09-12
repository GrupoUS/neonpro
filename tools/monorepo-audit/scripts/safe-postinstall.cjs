#!/usr/bin/env node
// Cross-platform safe postinstall: run built script if present, otherwise noop
const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, '..', 'dist', 'scripts', 'postinstall.js'),
  // In case build output mirrors src structure under dist/scripts/
  path.join(__dirname, '..', 'dist', 'scripts', 'postinstall.cjs'),
  // Fallback: directly under dist/
  path.join(__dirname, '..', 'dist', 'postinstall.js')
];

const target = candidates.find((p) => fs.existsSync(p));

if (!target) {
  // Nothing to run (e.g., local dev, not built yet)
  process.exit(0);
}

try {
  require(target);
} catch (err) {
  // Do not fail installation if optional postinstall fails
  console.warn('[monorepo-audit] postinstall failed but will be ignored:', err?.message || err);
  process.exit(0);
}