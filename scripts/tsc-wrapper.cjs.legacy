#!/usr/bin/env node
// Wrapper script for TypeScript to handle ES module compatibility with Turbo
const { spawn } = require('child_process')

let tscPath
try {
  tscPath = require.resolve('typescript/bin/tsc', { paths: [process.cwd(), __dirname] })
} catch (error) {
  console.error('Unable to resolve TypeScript binary. Did you run `bun install`?', error)
  process.exit(1)
}

const child = spawn(process.execPath, [tscPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: false,
})

child.on('exit', (code) => {
  process.exit(code)
})

child.on('error', (err) => {
  console.error('Failed to start TypeScript:', err)
  process.exit(1)
})
