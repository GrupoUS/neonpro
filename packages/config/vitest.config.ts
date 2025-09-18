import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Exit gracefully if no test files are found
    passWithNoTests: true,
    // Don't include any plugins that might interfere
    globals: false,
    environment: 'node',
  },
  // Explicitly exclude any vite plugins that might be inherited
  plugins: [],
})