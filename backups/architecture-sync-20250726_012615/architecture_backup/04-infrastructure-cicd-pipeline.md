# 4 · Infraestrutura & Pipeline CI/CD

| Ambiente | Hosting | Database | Propósito |
|----------|---------|----------|-----------|
| Preview | Vercel Preview | Supabase preview | PR validation |
| Staging | `staging.neonpro.app` | Supabase staging | Beta fechado |
| Production | `neonpro.app` | Supabase prod + replica | MVP público |

## CI/CD Pipeline

**GitHub Actions:** lint → Jest 80 % cov → Playwright → dbmate migrate → build → Vercel Preview.

## Deployment Flow

- Merge main → Staging
- Canary 50 % traffic, promote 100 % se métricas OK
- Tagged release deploy production

**Infrastructure as Code:** Terraform; cost diff Infracost no PR.
