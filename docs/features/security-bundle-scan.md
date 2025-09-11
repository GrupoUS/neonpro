# Security Bundle Scan

Status: Initial implementation (T043 GREEN)  
Last Updated: 2025-09-11

## Overview
Provides a lightweight static scan for accidental inclusion of sensitive Supabase service role keys in built bundles.

## Module
`tools/testing/scripts/scan-bundle.ts`

### API
```ts
scanBundleForSecrets(content: string): { found: boolean; matches: string[] }
```

### Detection Logic
Current pattern (simplified):
```
SUPABASE_SERVICE_ROLE_KEY\s*=\s*['\"]?sk_[A-Za-z0-9_\-]+
```
Enhance later with:
- File path filtering (dist/**/*.js)
- Parallel scanning & streaming
- Additional patterns (JWT, private keys, AWS secret keys)
- Entropy scoring for generic tokens

### Usage Example
```ts
import { scanBundleForSecrets } from './scan-bundle'
const js = await fs.promises.readFile('dist/index.js','utf-8')
const result = scanBundleForSecrets(js)
if (result.found) throw new Error('Sensitive key leaked: ' + result.matches.join(','))
```

### CI Integration (Concept)
1. Build bundles.
2. Run scan over build output.
3. Fail pipeline if `found=true`.

### Test Reference
`tools/testing/__tests__/bundle-scan.test.ts` (T043) validates presence & basic match logic.

### Roadmap
| Phase | Feature | Notes |
|-------|---------|-------|
| P1 | Directory walker | Only scan build outputs |
| P2 | Pattern registry | Configurable JSON/YAML pattern list |
| P3 | Entropy heuristic | Flag suspicious random strings |
| P4 | SARIF output | Integrate with code scanning dashboards |

### Security Notes
This is a prevention layer; still enforce .gitignore on .env and use runtime secrets injection.
