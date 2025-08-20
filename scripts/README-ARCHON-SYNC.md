# 🔄 Archon Sync System - Complete Guide

## 📋 Overview

Este sistema permite sincronização segura do repositório Archon com o GitHub, preservando arquivos locais críticos e oferecendo automação completa.

## 🎯 Scripts Disponíveis

### 1. **sync-archon.ps1** - Sincronização Principal
**Função**: Executa sincronização completa com backup automático
**Uso**: `powershell -ExecutionPolicy Bypass -File D:\neonpro\scripts\sync-archon.ps1`

**O que faz**:
- ✅ Backup automático de arquivos críticos
- ✅ Stash de mudanças locais antes do pull
- ✅ Pull das atualizações do GitHub
- ✅ Restauração dos arquivos críticos locais
- ✅ Log detalhado de todas as operações

### 2. **archon-status.ps1** - Verificação de Status
**Função**: Mostra status atual do repositório e arquivos críticos
**Uso**: `powershell -ExecutionPolicy Bypass -File D:\neonpro\scripts\archon-status.ps1`

**Informações mostradas**:
- 📊 Status do repositório (commits atrás)
- 📁 Arquivos modificados localmente  
- 🗂️ Stashes disponíveis
- 📋 Presença de arquivos críticos

### 3. **sync-archon-config.ps1** - Gerenciamento de Automação
**Função**: Configura e gerencia sincronização automática
**Uso**: 
```powershell
# Ver status da automação
.\sync-archon-config.ps1 status

# Configurar tarefa agendada (diária às 8:00)
.\sync-archon-config.ps1 setup

# Habilitar/desabilitar automação
.\sync-archon-config.ps1 enable
.\sync-archon-config.ps1 disable

# Executar sync agora
.\sync-archon-config.ps1 run

# Remover automação
.\sync-archon-config.ps1 remove
```

### 4. **resolve-conflicts.ps1** - Resolução de Conflitos
**Função**: Ajuda a resolver conflitos de merge de forma interativa
**Uso**: `powershell -ExecutionPolicy Bypass -File D:\neonpro\scripts\resolve-conflicts.ps1`

**Opções disponíveis**:
1. **Manter mudanças locais** - Preserva seus arquivos
2. **Aceitar mudanças remotas** - Usa versão do GitHub
3. **Merge manual** - Resolve conflitos interativamente
4. **Ver detalhes** - Mostra o que foi alterado

## 🛡️ Arquivos Protegidos

O sistema **SEMPRE** preserva estes arquivos/diretórios locais:
- `.mcp.json` - Configuração MCP local
- `.env` - Variáveis de ambiente
- `PRPs/` - Documentos PRP personalizados
- `migration/` - Scripts de migração locais
- `original_archon/` - Backup da versão original

## 🚀 Uso Recomendado

### Primeira Configuração
```powershell
# 1. Verificar status inicial
powershell -ExecutionPolicy Bypass -File D:\neonpro\scripts\archon-status.ps1

# 2. Executar primeira sincronização
powershell -ExecutionPolicy Bypass -File D:\neonpro\scripts\sync-archon.ps1

# 3. Resolver conflitos se necessário
powershell -ExecutionPolicy Bypass -File D:\neonpro\scripts\resolve-conflicts.ps1

# 4. Configurar automação
powershell -ExecutionPolicy Bypass -File D:\neonpro\scripts\sync-archon-config.ps1 setup
```

### Uso Diário
```powershell
# Verificar status
.\archon-status.ps1

# Sincronizar manualmente quando necessário
.\sync-archon.ps1

# A automação roda diariamente às 8:00 automaticamente
```

## 📝 Logs

Todos os syncs são registrados em:
- **Local**: `D:\neonpro\archon\sync.log`
- **Formato**: `[TIMESTAMP] STATUS: Descrição da operação`

## ⚠️ Troubleshooting

### Problema: "Execution Policy" 
**Solução**: Sempre use `-ExecutionPolicy Bypass` nos comandos

### Problema: Conflitos após sync
**Solução**: Execute `resolve-conflicts.ps1` e escolha a opção adequada

### Problema: Arquivos críticos sumindo
**Solução**: Os backups estão em `D:\neonpro\archon\.backup-[timestamp]/`

### Problema: Automação não funciona
**Solução**: 
1. Execute como Administrador
2. Use `sync-archon-config.ps1 setup` novamente
3. Verifique com `sync-archon-config.ps1 status`

## 🎯 Comandos Rápidos

```powershell
# Status completo
.\archon-status.ps1

# Sync manual
.\sync-archon.ps1

# Ver conflitos e resolver
.\resolve-conflicts.ps1

# Status da automação
.\sync-archon-config.ps1 status

# Executar sync agora via automação
.\sync-archon-config.ps1 run
```

## 📂 Estrutura de Arquivos

```
D:\neonpro\scripts\
├── sync-archon.ps1           # Script principal de sync
├── archon-status.ps1         # Verificação de status
├── sync-archon-config.ps1    # Gerenciamento de automação
├── resolve-conflicts.ps1     # Resolução de conflitos
└── README-ARCHON-SYNC.md     # Esta documentação

D:\neonpro\archon\
├── .backup-[timestamp]/      # Backups automáticos
├── sync.log                  # Log de operações
├── .mcp.json                # Config MCP (protegido)
├── .env                     # Environment (protegido)
├── PRPs/                    # PRPs locais (protegido)
├── migration/               # Migrações (protegido)
└── original_archon/         # Backup original (protegido)
```

---

**✅ Sistema testado e funcional!**
**🔒 Seus arquivos locais estão sempre protegidos!**
**🤖 Automação configurável e confiável!**