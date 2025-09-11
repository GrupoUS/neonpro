# Supabase RLS Testing Guide (NeonPro)

Purpose: Ensure Row Level Security is enforced for sensitive data in clinic contexts.

## Setup
- Use separate test schema or ephemeral DB
- Seed minimal data with service-role key for setup only
- Use anon key for user-context tests

## Positive & Negative Cases
- Positive: Authorized user can access only their clinic's rows
- Negative: Unauthorized user receives 401/403 or empty results

```ts
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
})

describe('patients RLS', () => {
  it('denies cross-clinic access', async () => {
    const { data, error } = await anon.from('patients').select('*').eq('clinic_id', 'OTHER')
    expect(error?.code === 'PGRST116' || (data && data.length === 0)).toBeTruthy()
  })
})
```

## Audit Logging
- Assert audit log rows are created for sensitive access

## Tips
- Avoid real PII; use anonymized fixtures (LGPD)
- Document exemptions and cleanup

