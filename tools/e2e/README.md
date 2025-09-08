# Tools E2E

- playbook: tests under tools/e2e/tests
- config uses repo root playwright.config.ts to align with CI
- set BASE_URL to point to the running app

Examples:

- BASE_URL=http://localhost:3000 bun run test:e2e
- bun run test:e2e:ui
