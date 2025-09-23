# NeonPro — Plano de Correção (Fases + Subtarefas Atômicas)

> Observação: este arquivo contém o passo a passo solicitado e uma lista atômica de subtarefas que descrevem os erros detectados pelo compilador/IDE (type-check/linter). Não serão aplicadas correções aqui — apenas um plano e lista de arquivos/erros a serem arrumados.

## Sumário
- Objetivo
- Resumo das categorias de problemas detectadas
- Fase 1: Análise (já concluída)
- Fase 2: Triagem de qualidade de código — subtarefas atômicas (PRIORIDADE IMEDIATA)
- Fase 3: Integração Frontend ↔ Backend — subtarefas atômicas
- Fase 4: Integração de Banco de Dados — subtarefas atômicas
- Fase 5: Limpeza final e validação — subtarefas atômicas
- Como usar este plano (checklist e critérios de aceite)

---

## Objetivo
Fornecer um plano passo-a-passo, por fases, com subtarefas atômicas listando os erros detectados (unused imports, unused variables, orphaned files candidates, catch params não usados, schemas não usados, types faltantes/errados) e especificando quais arquivos precisam ser corrigidos.

Este plano permite que desenvolvedores criem pequenos PRs (30–90 minutos cada) e atribuam tarefas em Archon/issue tracker.

---

## Resumo das categorias de problemas encontrados (diagnóstico inicial)
Fonte: varredura inicial de erros do TypeScript / linter (snapshot). Principais categorias:

- Unused imports (imports declarados e não usados)
- Unused variables (variáveis declaradas e não usadas)
- Catch parameters não utilizados (por exemplo `catch (e)` sem uso)
- Declarações de schemas/constantes não utilizadas (ex.: variáveis `z.object()` ou Valibot não utilizadas)
- Imports de módulos Node/paths não utilizados em scripts (ex.: `path`, `spawn`)
- Possíveis arquivos órfãos (detecção pendente — exige search-for-pattern para confirmar)
- Tipos faltantes/incorretos (requer `bun run type-check` completo para inventariar)

---

## Fase 1 — Análise
Status: concluída (leitura de `specify.md`, `architect-review.md`, `tech-stack.md`, `source-tree.md` e coleta inicial de erros).

Artefatos entregues nesta fase:
- `docs/features/neonpro-implementation-plan.md` (visão geral)

---

## Fase 2 — Triagem de qualidade de código (detalhada)
Status: em progresso (triagem inicial feita). Abaixo as subtarefas atômicas por categoria, contendo os arquivos detectados na varredura inicial e a ação recomendada.

Observação: cada subtarefa é intencionalmente pequena — objetivo = um PR/commit por subtarefa.

### Categoria A — Unused imports (corrigir ou remover)
- Subtarefa 2.A.01 — `apps/api/src/trpc/routers/patients.ts`
  - Problema detectado: `Identifier 'Patient' is imported but never used`.
  - Ação: remover import ou usá-lo; rodar `bun run type-check` e testes de rota.

- Subtarefa 2.A.02 — `apps/api/src/services/certificate-monitor.ts`
  - Problema detectado: `import path from 'path'` não usado.
  - Ação: remover import ou usar `path` se necessário.

- Subtarefa 2.A.03 — `smart-deployment-build.cjs`
  - Problema detectado: `const { execSync, spawn } = require("child_process");` — `spawn` não usado.
  - Ação: remover `spawn` da desestruturação ou utilizar corretamente.

- Subtarefa 2.A.04 — revisar `apps/api/src/**` (sequência)
  - Ação: buscar imports não usados em `apps/api/src` e agrupar em PRs por sub-pasta (ex.: `trpc/routers`, `services/`). Use `rg` / `tsc` output para coletar lista completa.

### Categoria B — Unused variables / unused declarations
- Subtarefa 2.B.01 — `apps/api/src/routes/ai/__tests__/models.test.ts`
  - Problema detectado: `const data = await response.json();` declarado e não usado.
  - Ação: remover variável ou usar `_data` para documentação do teste.

- Subtarefa 2.B.02 — `apps/api/src/trpc/routers/crud.ts` (várias linhas)
  - Problema detectado: variáveis (ex.: `startTime`, `confirmData`) declaradas mas não usadas.
  - Ação: remover declarações não utilizadas ou usá-las para métricas/logging; prefer `_startTime` se for intencionalmente ignorada.

- Subtarefa 2.B.03 — `apps/api/src/trpc/routers/agent.ts`
  - Problema detectado: `const context = HEALTHCARE_CONTEXTS[session.agentType];` (não usado) e `const ragContext = ragResults` (não usado) e `agentMessage` criado mas não usado.
  - Ação: revisar lógica do fluxo de criação de agentMessage; se a persistência é necessária, garantir uso posterior; senão remover/ajustar.

- Subtarefa 2.B.04 — `apps/api/src/services/permissions/agent-permissions.ts`
  - Problema detectado: variáveis `rateLimitKey`, `now`, `windowMs` declaradas e não usadas.
  - Ação: consolidar lógica de rate-limit ou remover variáveis temporárias.

### Categoria C — Catch params não usados (adotar padrão `_err` ou tratamento)
- Subtarefa 2.C.01 — `config/vercel/monitoring-config.ts`
  - Problema detectado: `catch (e)` sem uso de `e`.
  - Ação: substituir por `catch (_e)` ou adicionar `logger.error(e)`/tratamento adequado.

- Subtarefa 2.C.02 — `apps/api/src/routes/ai/models.ts` — `catch (e)` sem uso
  - Ação: adicionar logging ou substituir por `_e` se o erro for ignorado intencionalmente.

- Subtarefa 2.C.03 — `apps/api/src/services/healthcare-professional-authorization.ts` — `catch (error)` não usado em blocos específicos
  - Ação: tratar ou renomear para `_error`.

- Subtarefa 2.C.04 — `apps/api/src/trpc/routers/crud.ts` — vários `catch (error)` sem uso
  - Ação: adicionar tratamento padrão (p.ex. `logger.warn(error)`) ou `_error`.

### Categoria D — Schemas/constantes declaradas e não usadas (z/v or Valibot)
- Subtarefa 2.D.01 — `apps/api/src/services/ai-security-service.ts`
  - Problema detectado: `SensitiveDataSchema`, `MedicalTermSchema` declarados e não usados.
  - Ação: ou usar os schemas onde relevante (validação) ou removê-los se legados.

- Subtarefa 2.D.02 — `apps/api/src/services/cache/enhanced-query-cache.ts`
  - Problema detectado: `QueryCacheKeySchema`, `QueryTTLSchema`, `CacheSizeSchema` não usados.
  - Ação: reintegrar esquema ao código (validação de entradas) ou removê-los.

- Subtarefa 2.D.03 — `apps/api/src/trpc/routers/crud.ts` (crud*ResponseSchema vars não usados)
  - Ação: verificar se os schemas deveriam ser exportados/consumidos em outro lugar; caso contrário, remover/registrar.

### Categoria E — Scripts/arquivos com imports Node não usados
- Subtarefa 2.E.01 — `smart-deployment-build.cjs` (remover imports não usados: path, spawn)
- Subtarefa 2.E.02 — revisar scripts `scripts/*.cjs` e `*.sh` para imports/variáveis não usadas e normalizar (pequenos PRs)

### Categoria F — Outros pontos específicos detectados
- Subtarefa 2.F.01 — `apps/api/src/services/semantic-cache.ts` — `startTime` e `maxAgeMs` não usados. Verificar monitoramento/telemetria.
- Subtarefa 2.F.02 — `apps/api/src/services/conversation/conversation-context-service.ts` — `const { data, error } = await this.supabase` com `data` não usado.
  - Ação: tratar `error` adequadamente e usar/ignorar `data` de forma explícita.

### Categoria G — Inventariar arquivos órfãos (detectar referências)
- Subtarefa 2.G.01 — rodar busca para identificar arquivos órfãos:
  - Comando recomendado:
    ```bash
    # usa ripgrep para encontrar referencias a arquivos/exports
    rg "\b(MyComponent|SomeExportName)\b" --hidden --glob '!node_modules' || true
    ```
  - Ação: gerar `orphaned-candidates.md` com a lista; revisar manualmente antes de apagar.

---

## Fase 3 — Frontend ↔ Backend (subtarefas atômicas relacionadas a arquivos detectados)
Essas subtarefas são preparadas para depois que a fase 2 reduzir o ruído (erros de compilador), para evitar que alterações de integração sejam mascaradas por erros triviais.

- Subtarefa 3.01 — `apps/api/src/trpc/index.ts` e `apps/api/src/trpc/router.ts`
  - Ação: garantir que `AppRouter` e tipos estejam exportados corretamente; gerar clientes tRPC se houver script de geração.

- Subtarefa 3.02 — `apps/web/src/lib/trpc.ts` (ou equivalente)
  - Ação: criar/validar cliente tRPC, garantir endpoint correto e headers de auth.

- Subtarefa 3.03 — `apps/web/src/routeTree.gen.ts` + `apps/web/src/routes/*`
  - Ação: regenerar árvore de rotas se houve mudanças e validar TanStack Router; corrigir redirecionamentos.

- Subtarefa 3.04 — Auditar hooks React (globais) após limpezas de import/var:
  - Ação: revisar `apps/web/src/hooks/` e `components` para dependências de hooks quebradas; criar PRs por feature.

- Subtarefa 3.05 — TanStack Query + tRPC adapters
  - Ação: criar/adaptar wrappers `useQuery`/`useMutation` com políticas de cache para endpoints críticos (appointments/patients).

Arquivos de foco inicial (já sinalizados pelos erros):
- `apps/api/src/trpc/routers/patients.ts` — revisar e testar endpoints pacientes
- `apps/api/src/trpc/routers/agent.ts` — fluxos de agente

---

## Fase 4 — Integração Banco de Dados (subtarefas atômicas)
- Subtarefa 4.01 — Validar `packages/database/prisma/schema.prisma`
  - Ação: rodar `bun run prisma generate` e reportar erros.

- Subtarefa 4.02 — Rodar migrações em DB de desenvolvimento (branch)
  - Ação: `bun run prisma migrate dev --name verify` (em ambiente isolado); documentar resultados.

- Subtarefa 4.03 — Verificar integrações Supabase usadas pela aplicação
  - Ação: validar `packages/database` e `apps/api` chamadas a Supabase; confirmar `supabase` config.

- Subtarefa 4.04 — Escrever/atualizar testes de integração que toquem Prisma (transações) para pacientes/appointments

---

## Fase 5 — Limpeza final e validação (subtarefas atômicas)
- Subtarefa 5.01 — Arquivar ou remover arquivos órfãos (após revisão manual)
  - Ação: mover para `docs/backup/` e criar PR com lista de arquivos removidos.

- Subtarefa 5.02 — Build de produção
  - Ação: `bun run build` — corrigir erros de produção que apareçam (reportar separadamente).

- Subtarefa 5.03 — Executar matriz de testes (unit/integration/e2e)
  - Ação: Vitest + Playwright; objetivo: cobertura mínima nas áreas alteradas.

- Subtarefa 5.04 — PR de release candidate com notas de verificação e checklist de QA

---

## Arquivos e erros detectados (inventário parcial — snapshot inicial)
Abaixo, lista dos arquivos que o scanner inicial retornou como contendo erros (categoria/descrição resumida). Use isto como lista inicial de subtarefas (cada item mapeado acima em 2.*):

- `apps/api/src/routes/ai/__tests__/models.test.ts` — unused variable `data`
- `config/vercel/monitoring-config.ts` — catch param `e` não usado
- `config/vercel/performance-config.ts` — parâmetro `res` não usado na função `filter`
- `smart-deployment-build.cjs` — `spawn` e `path` declarados e não usados
- `apps/api/src/routes/ai/models.ts` — catch param `e` não usado
- `apps/api/src/services/ai-security-service.ts` — `SensitiveDataSchema`, `MedicalTermSchema` não usados
- `apps/api/src/routes/patients.ts` — `userId` declarado e não usado (diversas linhas)
- `apps/api/src/services/permissions/agent-permissions.ts` — variáveis `rateLimitKey`, `now`, `windowMs` não usadas; catch `error` não usado
- `apps/api/src/schemas/healthcare-validation-schemas.ts` — catch `error` não usado
- `apps/api/src/trpc/routers/agent.ts` — `context`, `ragContext`, `agentMessage` não usados
- `apps/api/src/services/conversation/conversation-context-service.ts` — `data` não usado ao consumir Supabase
- `apps/api/src/trpc/routers/patients.ts` — import `Patient` não usado; `digitalSignature` não usado; `result` não usado
- `apps/api/src/trpc/routers/crud.ts` — schemas `crudIntentResponseSchema`, `crudConfirmResponseSchema`, `crudExecuteResponseSchema` não usados; catch `error` não usado; `startTime`, `confirmData` não usados
- `apps/api/src/services/healthcare-professional-authorization.ts` — parâmetro `entityType` não usado; variável `role` não usada
- `apps/api/src/services/bulk-operations-service.ts` — vários `catch (_error: any)` não utilizados (usar tratamento ou marcar explicitamente)
- `apps/api/src/services/audit-service.ts` — parâmetro `filters` não usado
- `apps/api/src/services/cache/enhanced-query-cache.ts` — schemas `QueryCacheKeySchema`, `QueryTTLSchema`, `CacheSizeSchema` não usados
- `apps/api/src/services/semantic-cache.ts` — `startTime`, `maxAgeMs` não usados
- `apps/api/src/services/ai-provider/health-check.ts` — parâmetro `config` não usado
- `apps/api/src/services/circuit-breaker/integration-example.ts` — parâmetro `options` não usado
- `apps/api/src/services/certificate-monitor.ts` — `path` import não usado; vários catch `error` não usados

> Observação: este inventário é um snapshot inicial do output do TypeScript/linter. Uma rodada completa de `bun run type-check` pode fornecer entradas adicionais (especialmente para 'missing or incorrect types') — criar a subtarefa 2.G.02 para executar e registrar o log completo.

---

## Critérios de aceite para cada subtarefa
- Código compila (`bun run type-check`) sem o erro que a subtarefa descreve.
- Linter passa para a parte afetada (ou justificativa de regra relaxada documentada)
- Testes unitários/contratuais afetados passam (ou testes adicionados para cobrir correção)
- PR contém descrição concisa e referencia a subtarefa atômica (issue/Archon task)

---

## Uso prático deste arquivo
1. Copiar subtarefas atômicas para o tracker (Archon/Jira/GitHub issues) — cada subtarefa deve ter: título curto, steps, arquivos alterados, estimativa (30–90 min), review checklist.
2. Marcar e executar subtarefas em ordem de risco: primeiro remover ruído trivial (unused imports/vars, catch params), depois integração (trpc/route), por fim DB e limpeza.
3. Ao completar uma subtarefa, rodar `bun run type-check` e testes relevantes e atualizar a tarefa com logs/artefatos.

---

## Próximos passos recomendados (curto prazo)
- Executar `bun run type-check` completo e anexar log (Subtarefa 2.G.02).
- Criar issues/Archon tasks para as subtarefas enumeradas (se desejar, informo/executo a criação — preciso do `project_id` UUID do Archon).
- Executar busca de referências para identificar arquivos órfãos (Subtarefa 2.G.01).

---

Se quiser, eu já crio as issues atômicas no Archon (preciso do `project_id`) ou exporto a lista completa de arquivos com linha/coluna dos erros (CSV/Markdown) para copiar/colar no tracker.

