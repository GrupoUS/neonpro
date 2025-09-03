## Sumário executivo

- Contexto
  - Monorepo com 2 apps e ~22 packages. Objetivo: eliminar código morto, redundâncias e obsolescências sem executar remoções ainda.

- Principais achados (parciais)
  - Dependências internas bem definidas por Turbo/TypeScript. Alguns módulos legados com @deprecated (ex.: auth em @neonpro/utils).
  - Possíveis diretórios não utilizados (enterprise/api-gateway) → revisão manual necessária.

- Riscos / Dívida técnica
  - Imports/carregamentos dinâmicos podem mascarar uso real. Divergência docs vs código deve ser resolvida via decisão registrada.

- Benefícios esperados
  - Redução do tamanho do bundle e do tempo de build; base mais confiável para features de IA/healthcare.

- Estimativas
  - Conclusão das fases 0–4 (planejamento e relatórios): ~24 h; execução (Fase 5) condicionada à aprovação.

- Próximos passos (após aprovação)
  - Finalizar grafo e lista de unused com revisão manual.
  - Executar PRs pequenos conforme `tools/reports/remediation-plan.md`.
