# Test Organization Conventions

- Unit tests: colocated alongside modules or under tools/tests/<module>/tests
- Integration tests: tools/tests/integration/<module>
- E2E tests and test-only pages: tools/e2e/** (pages under tools/e2e/pages)
- Never add test files under repository root
- Never add Next.js test pages under apps/*/app or standalone-deployment/app
- Disable any temporary API routes by moving them under apps/*/disabled-api-routes/**

Naming:

- Unit: *.test.ts(x)
- Integration: *.integration.test.ts(x)
- E2E specs: *.e2e.ts(x)
- Test-only pages: <feature>.page.tsx in tools/e2e/pages/(web|standalone)
