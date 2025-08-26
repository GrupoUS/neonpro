# 🎯 NeonPro - Guia de Configuração WSL Ubuntu

## 📋 Visão Geral

Este guia documenta o processo completo de migração e configuração do ambiente de desenvolvimento NeonPro para WSL Ubuntu, incluindo todas as configurações de usuário, ferramentas e dependências necessárias.

## 🎯 Objetivos

- **Migração Completa**: Transferir todas as configurações do Windows para WSL Ubuntu
- **Ambiente Consistente**: Manter a mesma experiência de desenvolvimento
- **Zero Configuração Manual**: Automatizar todo o processo de setup
- **Compatibilidade Total**: Garantir que todas as ferramentas funcionem corretamente

## 🔍 Configurações Migradas

### 📁 VS Code Settings
- **Localização WSL**: `~/.vscode-server/data/Machine/settings.json`
- **Localização Windows**: `.vscode/settings.json`
- **Adaptações**: Terminal profile alterado para bash, paths Linux

### 🔧 Git Configuration
- **Configurações Globais**: `~/.gitconfig`
- **Configurações do Projeto**: `.gitattributes`, `.gitignore`
- **Adaptações WSL**: `core.autocrlf=input`, `core.eol=lf`

### 📦 NPM/PNPM Settings
- **PNPM Global**: `~/.pnpmrc`
- **PNPM Local**: `.npmrc` no projeto
- **Configurações de Cache**: Paths locais configurados

### 🌍 Environment Variables
- **Bashrc**: `~/.bashrc` com aliases e paths
- **Node.js**: Configurações de memory e paths
- **Aliases**: Git, PNPM, comandos úteis

## 🚀 Como Usar

### Pré-requisitos
- WSL Ubuntu instalado
- Acesso ao projeto Windows em `/mnt/d/neonpro`
- Permissões sudo no Ubuntu

### Execução do Script

```bash
# 1. Navegar para o diretório scripts do projeto Windows
cd /mnt/d/neonpro/scripts

# 2. Executar o script de setup
./setup-wsl-ubuntu.sh

# 3. Seguir as instruções interativas
# - Configurar nome e email Git
# - Aguardar instalação de dependências
# - Verificar validações finais

# 4. Aplicar configurações
source ~/.bashrc
```

### Execução Passo-a-Passo

Se preferir executar manualmente ou entender cada etapa:

```bash
# 1. Validar ambiente WSL
cat /proc/version | grep -i microsoft

# 2. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 3. Instalar dependências básicas
sudo apt install -y curl wget git build-essential

# 4. Instalar Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 5. Instalar PNPM
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 6. Copiar projeto
rsync -av --exclude=node_modules /mnt/d/neonpro/ ~/neonpro/

# 7. Configurar VS Code (executar script completo)
# 8. Configurar Git (executar script completo)
# 9. Instalar dependências do projeto
cd ~/neonpro && pnpm install
```

## 📂 Estrutura de Diretórios Criada

```
~/
├── neonpro/                          # Projeto principal
│   ├── .vscode/
│   │   ├── settings.json            # Configurações VS Code
│   │   └── tasks.json               # Tasks do projeto
│   ├── .npmrc                       # Config PNPM local
│   └── ... (todo o projeto)
├── .vscode-server/
│   └── data/Machine/
│       └── settings.json            # VS Code settings globais
├── .pnpmrc                          # Config PNPM global
├── .bashrc                          # Aliases e environment vars
├── .gitconfig                       # Configurações Git globais
├── .npm-global/                     # NPM packages globais
└── .config/
    └── neonpro-backup/              # Backups das configurações
```

## ⚙️ Configurações Específicas WSL

### Terminal Configuration
```json
{
  "terminal.integrated.defaultProfile.linux": "bash",
  "terminal.integrated.profiles.linux": {
    "bash": {
      "path": "/bin/bash",
      "args": []
    }
  }
}
```

### Git Configuration
```bash
git config --global core.autocrlf input
git config --global core.eol lf
git config --global init.defaultBranch main
git config --global pull.rebase false
```

### Environment Variables
```bash
# Node.js e NPM
export PATH="$HOME/.npm-global/bin:$PATH"
export NODE_OPTIONS="--max-old-space-size=4096"

# PNPM
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
```

## 🔧 Aliases Configurados

### Git Aliases
```bash
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias gl="git log --oneline"
alias gd="git diff"
```

### PNPM Aliases
```bash
alias pi="pnpm install"
alias pr="pnpm run"
alias pd="pnpm run dev"
alias pb="pnpm run build"
alias pt="pnpm test"
```

### Sistema Aliases
```bash
alias ll="ls -alF"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."
```

## 🧪 Validação e Testes

### Comandos de Validação
```bash
# Verificar instalações
node --version
npm --version
pnpm --version
git --version

# Testar configurações Git
git config --list | grep user

# Testar PNPM
pnpm config list

# Testar build do projeto
cd ~/neonpro
pnpm run lint
pnpm run build
```

### Checklist de Validação
- [ ] Node.js instalado e funcionando
- [ ] PNPM instalado e configurado
- [ ] Git configurado com usuário
- [ ] Projeto copiado completamente
- [ ] VS Code settings aplicados
- [ ] Dependências instaladas
- [ ] Build do projeto funcionando
- [ ] Aliases bash funcionando

## 🔍 Troubleshooting

### Problemas Comuns

#### PNPM não encontrado após instalação
```bash
# Recarregar bashrc
source ~/.bashrc

# Ou adicionar manualmente ao PATH
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
```

#### Erro de permissão com npm global
```bash
# Configurar diretório global npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### VS Code não reconhece configurações
```bash
# Verificar se diretório existe
ls -la ~/.vscode-server/data/Machine/

# Reinstalar extensões se necessário
code --install-extension biomejs.biome
```

#### Git pede credenciais constantemente
```bash
# Configurar credential helper
git config --global credential.helper store

# Ou usar SSH keys
ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"
```

### Logs e Debugging
```bash
# Verificar logs do setup
tail -f ~/neonpro-setup.log

# Verificar configurações PNPM
pnpm config list

# Verificar configurações Git
git config --list --show-origin
```

## 📈 Performance e Otimizações

### Configurações Node.js
```bash
# Aumentar memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Configurar cache PNPM local
pnpm config set store-dir ./node_modules/.pnpm-store
pnpm config set cache-dir ./node_modules/.pnpm-cache
```

### Configurações Git
```bash
# Melhorar performance Git
git config --global core.preloadindex true
git config --global core.fscache true
git config --global gc.auto 256
```

## 🔒 Segurança

### SSH Keys
```bash
# Gerar nova chave SSH
ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"

# Iniciar ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# Adicionar ao GitHub/GitLab
cat ~/.ssh/id_rsa.pub
```

### Configurações Seguras
- Não commitar chaves privadas
- Usar credential helpers apropriados
- Configurar 2FA quando possível
- Manter sistema atualizado

## 📝 Próximos Passos

Após a configuração inicial:

1. **Configurar VS Code Extensions**
   - Instalar extensões necessárias
   - Configurar workspace settings
   - Testar debugging

2. **Configurar Docker (se necessário)**
   - Instalar Docker Engine
   - Configurar Docker Compose
   - Testar containers do projeto

3. **Configurar Desenvolvimento**
   - Clonar repositórios adicionais
   - Configurar databases locais
   - Setup de testes E2E

4. **Sincronização Contínua**
   - Configurar sync de settings
   - Automatizar backups
   - Manter ambientes alinhados

## 📞 Suporte

Para problemas ou dúvidas:
- Consultar logs em `~/neonpro-setup.log`
- Verificar documentação do WSL
- Consultar documentação do projeto NeonPro
