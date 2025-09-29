#!/usr/bin/env node
// Wrapper script for TypeScript to handle ES module compatibility with Turbo
const { spawn } = require('child_process');
const path = require('path');

// Get the absolute path to the TypeScript binary
const tscPath = path.join(__dirname, '..', 'node_modules', 'typescript', 'bin', 'tsc');

// Execute TypeScript with Node.js
const child = spawn('node', [tscPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: false
});

child.on('exit', (code) => {
    process.exit(code);
});

child.on('error', (err) => {
    console.error('Failed to start TypeScript:', err);
    process.exit(1);
});