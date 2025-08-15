# NeonPro - Scripts de Validação e Atualização

Este diretório contém scripts automatizados para validar o status real das stories e manter o roadmap atualizado com informações precisas.

## 📋 Scripts Disponíveis

### 1. `validate-stories.js` - Validador de Stories

Script que verifica automaticamente o status real de implementação de cada story, comparando com o status declarado nos arquivos.

**Funcionalidades:**

- ✅ Verifica existência de arquivos mencionados nas stories
- ✅ Busca por implementações no código fonte
- ✅ Verifica presença de testes relacionados
- ✅ Calcula score de implementação baseado em múltiplos critérios
- ✅ Identifica discrepâncias entre status declarado e real
- ✅ Gera relatórios detalhados em JSON

**Uso:**

```bash
# Executar validação completa
node scripts/validate-stories.js

# Ou usando npm (se configurado no package.json)
npm run validate:stories
```

**Output:**

- Relatório no terminal com cores
- Arquivo JSON detalhado em `docs/validation-reports/`
- Identificação de stories que precisam de atenção

### 2. `update-roadmap.js` - Atualizador de Roadmap

Script que atualiza automaticamente o roadmap principal com base nos resultados da validação real das stories.

**Funcionalidades:**

- ✅ Cria backup automático do roadmap atual
- ✅ Atualiza status das stories com dados reais
- ✅ Inclui métricas de implementação (percentuais)
- ✅ Atualiza estatísticas gerais do projeto
- ✅ Modo dry-run para preview das alterações
- ✅ Log detalhado de todas as mudanças

**Uso:**

```bash
# Preview das alterações (não salva)
node scripts/update-roadmap.js --dry-run

# Aplicar alterações no roadmap
node scripts/update-roadmap.js

# Ou usando npm
npm run update:roadmap
npm run update:roadmap:preview
```

## 🔄 Workflow Recomendado

### Validação Regular (Semanal)

```bash
# 1. Validar status atual das stories
node scripts/validate-stories.js

# 2. Preview das alterações no roadmap
node scripts/update-roadmap.js --dry-run

# 3. Se tudo estiver correto, aplicar alterações
node scripts/update-roadmap.js
```

### Antes de Commits Importantes

```bash
# Validar antes de fazer commit de novas features
node scripts/validate-stories.js

# Atualizar roadmap se necessário
node scripts/update-roadmap.js

# Commit com roadmap atualizado
git add docs/NEONPRO_DETAILED_ROADMAP_2025.md
git commit -m "feat: update roadmap with real implementation status"
```

### Integração com CI/CD

```yaml
# .github/workflows/validate-stories.yml
name: Validate Stories

on:
  pull_request:
    paths:
      - 'src/**'
      - 'docs/shards/stories/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Validate Stories
        run: node scripts/validate-stories.js

      - name: Check Roadmap Sync
        run: |
          node scripts/update-roadmap.js --dry-run
          if [ $? -ne 0 ]; then
            echo "❌ Roadmap precisa ser atualizado"
            exit 1
          fi
```

## 📊 Critérios de Validação

### Status COMPLETED ✅

Uma story é considerada COMPLETED quando:

- **Implementação**: Score ≥ 60% (código encontrado no src/)
- **Arquivos**: Score ≥ 70% (arquivos mencionados existem)
- **Testes**: Score ≥ 30% (testes relacionados encontrados)

### Status IN_PROGRESS 🔄

Uma story é considerada IN_PROGRESS quando:

- **Implementação**: Score ≥ 30% OU **Arquivos**: Score ≥ 40%
- Não atende critérios para COMPLETED

### Status PENDING ⏳

Uma story é considerada PENDING quando:

- **Implementação**: Score < 30%
- **Arquivos**: Score < 40%
- **Testes**: Score < 20%

## 📁 Estrutura de Arquivos

```
scripts/
├── README.md                 # Este arquivo
├── validate-stories.js       # Validador principal
├── update-roadmap.js        # Atualizador de roadmap
└── package.json             # Dependências (se necessário)

docs/
├── NEONPRO_DETAILED_ROADMAP_2025.md    # Roadmap principal
├── IMPLEMENTATION_GUIDE_2025.md        # Guia de implementação
├── validation-reports/                 # Relatórios de validação
│   └── story-validation-YYYY-MM-DD.json
└── roadmap-backups/                   # Backups automáticos
    └── roadmap-backup-YYYY-MM-DD.md

docs/shards/stories/
├── 1.1.story.md             # Stories individuais
├── 1.2.story.md
└── ...
```

## 🔧 Configuração

### Dependências

Os scripts usam apenas módulos nativos do Node.js:

- `fs` - Sistema de arquivos
- `path` - Manipulação de caminhos
- `child_process` - Execução de comandos (grep, find)

### Variáveis de Ambiente

```bash
# Opcional: customizar diretórios
export NEONPRO_STORIES_DIR="docs/shards/stories"
export NEONPRO_SRC_DIR="src"
export NEONPRO_ROADMAP_FILE="docs/NEONPRO_DETAILED_ROADMAP_2025.md"
```

### Scripts NPM (package.json)

```json
{
  "scripts": {
    "validate:stories": "node scripts/validate-stories.js",
    "update:roadmap": "node scripts/update-roadmap.js",
    "update:roadmap:preview": "node scripts/update-roadmap.js --dry-run",
    "sync:roadmap": "npm run validate:stories && npm run update:roadmap"
  }
}
```

## 📈 Interpretando os Resultados

### Scores de Implementação

- **90-100%**: Implementação completa e robusta
- **70-89%**: Implementação sólida, pode precisar de refinamentos
- **50-69%**: Implementação parcial, funcionalidades básicas presentes
- **30-49%**: Implementação inicial, estrutura básica criada
- **0-29%**: Pouca ou nenhuma implementação detectada

### Scores de Arquivos

- **90-100%**: Todos os arquivos mencionados existem
- **70-89%**: Maioria dos arquivos existe, alguns podem estar faltando
- **50-69%**: Arquivos principais existem, secundários podem faltar
- **30-49%**: Alguns arquivos existem, implementação incompleta
- **0-29%**: Poucos ou nenhum arquivo mencionado existe

### Scores de Testes

- **70-100%**: Cobertura de testes excelente
- **50-69%**: Cobertura de testes boa
- **30-49%**: Cobertura de testes básica
- **10-29%**: Poucos testes encontrados
- **0-9%**: Nenhum teste relacionado encontrado

## 🚨 Troubleshooting

### Erro: "grep command not found"

**Windows:**

```bash
# Instalar Git Bash ou WSL
# Ou usar PowerShell com Select-String
```

**macOS:**

```bash
# grep já vem instalado
```

**Linux:**

```bash
sudo apt-get install grep  # Ubuntu/Debian
sudo yum install grep      # CentOS/RHEL
```

### Erro: "Permission denied"

```bash
# Dar permissão de execução
chmod +x scripts/*.js

# Ou executar com node explicitamente
node scripts/validate-stories.js
```

### Falsos Positivos/Negativos

Se o script não detectar implementações existentes:

1. **Verificar palavras-chave**: O script busca por termos do título da story
2. **Arquivos mencionados**: Certifique-se que os caminhos estão corretos
3. **Estrutura de diretórios**: Verificar se `src/` está no local correto

### Customizar Critérios

Para ajustar os critérios de validação, edite as funções:

- `calculateFinalStatus()` em `validate-stories.js`
- `getStatusInfo()` em `update-roadmap.js`

## 📞 Suporte

Para dúvidas ou problemas:

1. **Verificar logs**: Os scripts fornecem logs detalhados
2. **Modo debug**: Adicionar `console.log()` para debug
3. **Dry-run**: Sempre usar `--dry-run` primeiro
4. **Backups**: Os backups são criados automaticamente

---

**Última Atualização**: 26 de Janeiro de 2025
**Versão**: 1.0
**Compatibilidade**: Node.js 14+
