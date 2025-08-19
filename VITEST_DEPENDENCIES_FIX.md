# Instalação de Dependências Críticas para Vitest

## Dependências faltando que causam erros nos testes:

### 1. @tanstack/react-query
```bash
pnpm add @tanstack/react-query --filter=@neonpro/web
```

### 2. web-vitals
```bash
pnpm add web-vitals --filter=@neonpro/web
```

### 3. Verificar se as dependências já estão no apps/web
As seguintes já estão em apps/web/package.json:
- ✅ zod
- ✅ lucide-react
- ✅ next (que inclui next/server)

### 4. Comando de instalação completo
```bash
cd d:\neonpro
pnpm add @tanstack/react-query web-vitals --filter=@neonpro/web
```

### 5. Verificar se resolveu
```bash
pnpm vitest list --reporter=verbose
```

## Status das correções aplicadas:
✅ vitest.config.ts: Excludes .spec.* files (Playwright)
✅ vitest.workspace.ts: Only includes .test.* files  
⏳ Dependências: Precisam ser instaladas
⏳ Teste final: Aguardando instalação