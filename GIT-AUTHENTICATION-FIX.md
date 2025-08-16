# 🔐 SOLUÇÃO: Erro de Autenticação Git/GitHub - NeonPro

## ⚠️ PROBLEMA IDENTIFICADO
```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/GrupoUS/neonpro.git/'
```

## 🔍 DIAGNÓSTICO REALIZADO
- **Repositório:** https://github.com/GrupoUS/neonpro.git (HTTPS)
- **Git Credential Manager:** Configurado mas com credenciais inválidas
- **Causa:** GitHub não aceita mais autenticação por senha (removido em 2021)
- **Solução:** Personal Access Token (PAT) obrigatório

## 🛠️ SOLUÇÕES IMPLEMENTADAS

### PASSO 1: 🧹 Limpeza de Credenciais Antigas
```powershell
# Remover credenciais antigas do Windows Credential Manager
cmdkey /list | findstr git
cmdkey /delete:git:https://github.com
```

### PASSO 2: 🔑 Criar Personal Access Token (PAT)
1. Acesse: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Configure:
   - **Name:** `NeonPro-Development-Token`
   - **Expiration:** 90 days (ou sem expiração)
   - **Scopes necessários:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Actions workflows)
     - ✅ `write:packages` (Upload packages)
     - ✅ `read:org` (Read org memberships)

4. Click "Generate token" e **COPIE O TOKEN** (só aparece uma vez!)

### PASSO 3: 🔧 Configurar Git com Token
```powershell
# Limpar configurações antigas
git config --global --unset credential.helper
git config --global credential.helper manager

# Configurar provider para GitHub
git config --global credential.github.com.provider auto

# Configurar username (importante!)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@grupoUS.com"
```

### PASSO 4: ✅ Testar Configuração
```powershell
cd E:\neonpro
git push origin main
```
**Quando solicitar credenciais:**
- **Username:** Seu username do GitHub
- **Password:** Cole o Personal Access Token (não a senha!)

## 🚀 ALTERNATIVA: SSH (Mais Segura)# ALTERNATIVA SSH: Configuração para Máxima Segurança

Se preferir usar SSH (mais seguro que tokens):

## 1. Gerar Chave SSH
```powershell
ssh-keygen -t ed25519 -C "seu.email@grupoUS.com" -f ~/.ssh/neonpro_github
```

## 2. Adicionar Chave ao SSH Agent
```powershell
Start-Service ssh-agent
ssh-add ~/.ssh/neonpro_github
```

## 3. Copiar Chave Pública
```powershell
Get-Content ~/.ssh/neonpro_github.pub | Set-Clipboard
```

## 4. Adicionar no GitHub
- Acesse: https://github.com/settings/keys
- Click "New SSH key"
- Cole a chave pública

## 5. Alterar Remote para SSH
```powershell
cd E:\neonpro
git remote set-url origin git@github.com:GrupoUS/neonpro.git
```

## 6. Testar SSH
```powershell
ssh -T git@github.com
git push origin main
```

## ✅ Vantagens SSH:
- ✅ Mais seguro que tokens
- ✅ Não expira
- ✅ Não precisa inserir credenciais
- ✅ Suporte nativo no Git