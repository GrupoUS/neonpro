# 9 · Extensibilidade & Roadmap Técnico

Feature flags com ciclo **PROPOSED → EXPERIMENT → ROLLOUT → SUNSET**; flag de emergência `emergency_readonly`.

Expansion packs versionados semver + GPG; ADR‑bot controla decisões (#001‒006).

## Conclusão

Arquitetura alinhada ao PRD; cobre metas de performance, segurança LGPD, custo OPEX inicial < US$ 300/mês, escala até 1000 clínicas. Extensível via packs, segura via RLS + Edge.

## Próximos passos

1. Revisão DevOps → `terraform apply`.
2. PO shard docs & arquitetura.
3. SM iniciar stories P0 (Financeiro, Portal Paciente).

---

*Gerado automaticamente pela BMad‑Method – Arquitetura Neon Pro.*
