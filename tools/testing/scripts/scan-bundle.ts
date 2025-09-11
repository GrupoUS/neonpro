// T043 scan-bundle implementation (minimal GREEN)
// Provides scanBundleForSecrets(content) that detects service role key literals.

export interface SecretScanResult {
  found: boolean
  matches: string[]
}

// Pattern for SUPABASE_SERVICE_ROLE_KEY (simplified)
const SERVICE_ROLE_PATTERN = /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['\"]?sk_[A-Za-z0-9_\-]+/g

export function scanBundleForSecrets(content: string): SecretScanResult {
  if (!content) return { found: false, matches: [] }
  const matches = content.match(SERVICE_ROLE_PATTERN) || []
  return { found: matches.length > 0, matches }
}

#!/usr/bin/env tsx
/**
 * CLI entry: scan bundle or arbitrary files for secret patterns.
 * Usage: bun tsx tools/testing/scripts/scan-bundle.ts <paths...>
 * Exit codes: 0 = clean, 1 = findings, 2 = execution error
 */
if (process.argv[1] && process.argv[1].includes('scan-bundle.ts')) {
  (async () => {
    try {
      const paths = process.argv.slice(2)
      if (!paths.length) {
        console.error('No paths provided. Usage: scan-bundle <file|dir> [...]')
        process.exit(2)
      }
      const { scanBundleForSecrets } = await import('./scan-bundle.ts')
      let findings: import('./scan-bundle.ts').SecretScanResult[] = []
      for (const p of paths) {
        findings = findings.concat(await scanBundleForSecrets(p))
      }
      if (findings.length) {
        console.error(`Secret scan detected ${findings.length} potential issue(s):`)
        for (const f of findings) {
          console.error(`- [${f.severity}] ${f.reason} @ ${f.file}:${f.line}`)
        }
        process.exit(1)
      } else {
        console.log('Secret scan passed: no issues found')
      }
    } catch (err: any) {
      console.error('Secret scan error:', err?.message || err)
      process.exit(2)
    }
  })()
}
export default { scanBundleForSecrets }
