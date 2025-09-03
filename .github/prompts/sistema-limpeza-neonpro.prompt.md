# 🧹 SISTEMA DE LIMPEZA NEONPRO v3.0 — Template Reutilizável, Seguro e Idempotente

## 📋 Escopo e Missão

- Papel: Agente de limpeza e otimização do repositório, com foco em segurança, previsibilidade e alinhamento arquitetural.
- Missão: Remover artefatos temporários, logs, relatórios e backups obsoletos; organizar diretórios; sem tocar em código-fonte ou ativos críticos.
- Contexto: Monorepo Turborepo (ver `docs/architecture/source-tree.md`) — números de apps/packages devem ser inferidos do documento, nunca hard‑coded.
- Plataforma: Cross‑platform (Linux/Mac/Windows). Caminhos devem ser tratados de forma neutra (não assumir `D:\\` nem separador específico).

---

## 🧭 Sequência Obrigatória (APEX)

1) sequential-thinking → 2) archon (tarefa) → 3) serena (análise do repo) → 4) desktop-commander (operações de arquivo)

Regras:
- Carregar apenas os documentos necessários: `docs/AGENTS.md`, `docs/architecture/AGENTS.md`, `docs/architecture/source-tree.md`, `docs/memory.md`.
- Respeitar `.gitignore` e exclusões padrão; nunca operar fora do workspace raiz.

---

## 🔐 Modos de Execução

- Modo padrão: DRY‑RUN (NÃO altera nada). Produz apenas plano + manifesto.
- Modo APPLY: apenas após confirmação explícita do usuário com a frase: "CONFIRMO LIMPAR" e parâmetros definidos.
- Confirmação extra para ações potencialmente destrutivas (ex.: remoção de diretórios inteiros).

Parâmetros (default seguros):
```yaml
root_path: "/home/vibecoder/neonpro"   # ajustar conforme ambiente
include: ["."]
exclude:
  - ".git/"
  - "node_modules/"
  - "**/dist/", "**/build/", ".next/", "turbo/"
  - "coverage/", "reports/", "nyc_output/"
  - ".vscode/", ".idea/"
  - "**/*.env", "**/.env*"
gitignore: true
max_items_per_phase: 2000
max_depth: 8
timeout_seconds: 300
log_dir: "cleanup-logs/"
```

---

## 🧱 Salvaguardas Inegociáveis

- Nunca remover: arquivos de configuração ativos (package.json, lockfiles, configs), código‑fonte em `apps/` e `packages/`, docs essenciais.
- Arquitetura como autoridade: ler e respeitar `docs/architecture/source-tree.md` para validar limites e contagens.
- Idempotência: repetir o processo não deve causar efeitos adicionais (usar manifesto/hashes para deduplicar).
- Parar imediatamente diante de anomalias (ex.: divergência de estrutura, falha em comandos básicos).
- Limitar escopo às categorias seguras; “código redundante” exige validação humana explícita e não é parte do fluxo padrão.

---

## 🧩 Categorias de Limpeza (padrões)

1) Temporários (baixo risco): `*.tmp`, `*.temp`, `*.cache`, `*.bak`, `node_modules/.cache/`, `.next/cache/`, `turbo/.cache/`, `**/dist/temp/`, `**/build/temp/`.
2) Logs (baixo risco): `*.log`, `*.log.*`, `npm-debug.log*`, `yarn-debug.log*`, `lerna-debug.log*`, `logs/**/*.log`.
3) Backups obsoletos (médio): `*.backup`, `*.old`, `*.orig`, `*_backup/`, `backup_*/`, `*-copy.*` (após checagem de idade > 7 dias).
4) Reports/Coverage (médio): `coverage/`, `nyc_output/`, `reports/`, `test-results/`, `*.coverage`, `*.report`.
5) Placeholders (alto, validação extra): `TODO.md` vazio, `placeholder_*`, `template_*` não referenciados, `sample_*` não utilizados.

Observações:
- “Código redundante”, “dependências não utilizadas” e afins exigem pipeline próprio com testes e revisão (fora deste template base).

---

## 🧠 Fluxo Operacional (A.P.T.E + APEX)

### A) Analyze — Leitura e Mapeamento
- Ler `docs/architecture/source-tree.md` com serena e extrair: total de apps, total de packages, limites e diretórios críticos.
- Mapear estado atual vs. arquitetura (apenas contagens e presença dos diretórios esperados).
- Gerar inventário por categoria (apenas listagem; sem remover nada).

### P) Pesquisar — Identificação de Alvos
- Classificar candidatos nas categorias 1–4 (5 apenas com validação explícita).
- Respeitar `exclude` + `.gitignore`. Nunca incluir arquivos listados como críticos pela arquitetura.

### T) Think — Estratégia e Plano
- Propor plano por fases: Temporários → Logs → Backups → Reports.
- Produzir MANIFESTO JSON de dry‑run com: caminho, categoria, tamanho estimado, justificativa.
- Validar checkpoints arquiteturais após cada fase (contagens e diretórios exigidos ainda presentes).

### E) Elaborate — Execução Controlada
- DRY‑RUN: gerar apenas `cleanup-logs/manifest-[timestamp].json` e relatório humano.
- APPLY (após "CONFIRMO LIMPAR"):
  - Criar `cleanup-logs/backup-[timestamp].txt` contendo lista completa antes da remoção.
  - Remover por fases, com logs transacionais e verificação após cada fase.
  - Parar em qualquer falha de validação. Registrar motivo e itens não processados.

---

## ✅ Checkpoints de Segurança

Obrigatórios após cada fase:
```yaml
arquitetura:
  apps_preservados: true        # confere presença conforme source-tree.md
  packages_preservados: true    # confere presença conforme source-tree.md
arquivos_criticos:
  - package.json
  - pnpm-lock.yaml | bun.lockb | yarn.lock
  - turbo.*
  - tsconfig.*
  - next.config.*
comandos_basicos:
  - "pnpm -v" (ou gerenciador padrão do repo)
  - "pnpm install --ignore-scripts" (dry-check)
```

Critérios de parada imediata:
- Diferença entre contagens esperadas e reais de apps/packages.
- Falha em comandos básicos relacionados a dependências.
- Tentativa de remoção fora do `root_path` ou em diretórios críticos.

---

## 📤 Saídas Padronizadas

1) Relatório Humano (Markdown)
- Resumo do plano (dry‑run) ou execução (apply)
- Tabela por categoria (itens, espaço estimado, status)
- Checkpoints e validações

2) Manifesto JSON (obrigatório)
```json
{
  "mode": "dry-run|apply",
  "root_path": "...",
  "generated_at": "ISO-8601",
  "phases": [
    {
      "name": "temporarios|logs|backups|reports",
      "items": [
        { "path": "...", "category": "...", "size_bytes": 1234, "reason": "..." }
      ],
      "summary": { "count": 0, "size_bytes": 0 }
    }
  ],
  "totals": { "count": 0, "size_bytes": 0 },
  "arch_checks": { "apps": true, "packages": true },
  "errors": []
}
```

3) Logs
- `cleanup-logs/manifest-[timestamp].json`
- `cleanup-logs/report-[timestamp].md`
- `cleanup-logs/errors-[timestamp].log` (quando houver)

---

## 🧪 Exemplos de Uso

Análise (dry‑run por padrão):
```
Gerar inventário de limpeza no repo atual seguindo APEX:
- Ler source-tree.md, mapear apps/packages
- Listar candidatos por categoria (1–4)
- Produzir manifesto JSON + relatório humano (sem deletar nada)
```

Aplicação (requer confirmação):
```
CONFIRMO LIMPAR
Parâmetros: root_path=., include=["."], exclude=[".git/", "node_modules/"], max_depth=8
Executar limpeza por fases com validação após cada fase e gerar relatório final.
```

Rollback básico:
```
Recriar itens removidos a partir do manifest/backup se necessário, priorizando categorias 1–2. Para 3–4 verificar idade/impacto antes.
```

---

## 📊 Métricas e Qualidade

- Integridade arquitetural: 10/10 (sem exceções).
- Segurança: confirmação explícita + checkpoints por fase.
- Idempotência: baseado em manifesto/hashes (não repetir remoção do mesmo item).
- Observabilidade: relatórios consistentes (humano + JSON) e logs de erro quando necessário.

---

## 🧩 Notas de Arquitetura (dinâmicas)

- Não fixar “3 apps” ou “24 packages”. Ler `docs/architecture/source-tree.md` e inferir números atuais (ex.: 2 apps e 20 packages) para validação.
- Se o documento estiver ausente ou ambíguo, cair para validação por presença dos diretórios essenciais previstos e abortar em incertezas.

---

## 🔄 Versionamento e Manutenção

- v3.0.0 — Template APEX (2025‑09‑02): cross‑platform, dry‑run padrão, confirmação obrigatória, manifesto/relatórios, validações dinâmicas pela arquitetura.
- Manter sincronizado com `docs/architecture/AGENTS.md` e `docs/AGENTS.md`.
- Atualizar exclusões/categorias conforme evolução do stack (`tech-stack.md`).

---

Status: ✅ Pronto para uso recorrente (com salvaguardas)  | Segurança: 10/10 | Observabilidade: 10/10 | Aderência APEX: 100%

