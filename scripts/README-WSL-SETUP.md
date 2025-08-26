# 🎯 NeonPro - Scripts de Configuração WSL Ubuntu

## 📋 Visão Geral

Este diretório contém scripts para migrar e configurar o ambiente de desenvolvimento NeonPro no WSL
Ubuntu, copiando todas as configurações de usuário do Windows.

## 📜 Scripts Disponíveis

### 1. `setup-wsl-ubuntu.sh` - Setup Completo

**Uso**: Setup completo do ambiente WSL Ubuntu

```bash
./setup-wsl-ubuntu.sh
```

**O que faz**:

- ✅ Instala todas as dependências (Node.js, PNPM, Docker)
- ✅ Copia e configura projeto completo
- ✅ Adapta configurações VS Code para WSL
- ✅ Configura Git com inputs interativos
- ✅ Configura NPM/PNPM globais
- ✅ Gera chaves SSH se necessário
- ✅ Instala dependências do projeto
- ✅ Valida toda a instalação
- ✅ Gera relatório final

**Tempo estimado**: 15-30 minutos

### 2. `copy-user-settings-to-wsl.sh` - Cópia Rápida

**Uso**: Cópia rápida apenas das configurações essenciais

```bash
./copy-user-settings-to-wsl.sh
```

**O que faz**:

- ✅ Copia configurações VS Code adaptadas para WSL
- ✅ Copia configurações do projeto (.vscode, .npmrc, .pnpmrc)
- ✅ Configura NPM/PNPM globais
- ✅ Adiciona aliases úteis ao bashrc
- ✅ Configura Git básico para WSL
- ✅ Cria backups das configurações existentes

**Tempo estimado**: 2-5 minutos

## 🚀 Como Executar

### Pré-requisitos

- WSL Ubuntu instalado e funcionando
- Acesso ao projeto Windows em `/mnt/d/neonpro`
- Permissões sudo no Ubuntu (para setup completo)

### Execução Recomendada

#### Para novo ambiente WSL:

```bash
# Navegar para o diretório scripts
cd /mnt/d/neonpro/scripts

# Executar setup completo
./setup-wsl-ubuntu.sh

# Aplicar configurações
source ~/.bashrc
```

#### Para cópia rápida de configurações:

```bash
# Navegar para o diretório scripts
cd /mnt/d/neonpro/scripts

# Executar cópia rápida
./copy-user-settings-to-wsl.sh

# Aplicar configurações
source ~/.bashrc
```

## 📂 Configurações Migradas

| Categoria       | Arquivos/Configs              | Localização WSL                  |
| --------------- | ----------------------------- | -------------------------------- |
| **VS Code**     | `settings.json`, `tasks.json` | `~/.vscode-server/data/Machine/` |
| **Git**         | Configurações globais         | `~/.gitconfig`                   |
| **NPM/PNPM**    | `.npmrc`, `.pnpmrc`           | `~/` e `~/neonpro/`              |
| **Environment** | Aliases, PATH, NODE_OPTIONS   | `~/.bashrc`                      |
| **Projeto**     | Estrutura completa            | `~/neonpro/`                     |
| **SSH**         | Chaves (se geradas)           | `~/.ssh/`                        |

## 🔧 Configurações Específicas WSL

### Terminal Profile

- Windows: `PowerShell`
- WSL: `bash`

### Git Line Endings

- `core.autocrlf=input`
- `core.eol=lf`

### Node.js Memory

- `NODE_OPTIONS="--max-old-space-size=4096"`

## 📝 Aliases Configurados

### Git

```bash
gs      # git status
ga      # git add
gc      # git commit
gp      # git push
gl      # git log --oneline
```

### PNPM

```bash
pi      # pnpm install
pr      # pnpm run
pd      # pnpm run dev
pb      # pnpm run build
pt      # pnpm test
```

### Sistema

```bash
ll      # ls -alF
la      # ls -A
..      # cd ..
...     # cd ../..
cdneon  # cd ~/neonpro
```

## 🧪 Validação

### Comandos de Teste

```bash
# Verificar instalações
node --version
npm --version
pnpm --version
git --version

# Testar projeto
cd ~/neonpro
pnpm run lint
pnpm run build
```

### Checklist Pós-Instalação

- [ ] Commands básicos funcionando (node, npm, pnpm, git)
- [ ] VS Code abrindo projeto corretamente
- [ ] Aliases bash funcionando
- [ ] Build do projeto sem erros
- [ ] Git configurado com usuário

## 🔍 Troubleshooting

### PNPM não encontrado

```bash
source ~/.bashrc
# ou
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
```

### VS Code não reconhece settings

```bash
# Verificar diretório
ls -la ~/.vscode-server/data/Machine/

# Reinstalar extensão Biome
code --install-extension biomejs.biome
```

### Git pede credenciais

```bash
# Configurar usuário se não configurado
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# Gerar SSH keys
ssh-keygen -t rsa -b 4096 -C "seu.email@exemplo.com"
```

## 📁 Estrutura de Arquivos Criada

```
~/
├── neonpro/                    # Projeto principal
│   ├── .vscode/               # Configurações VS Code do projeto
│   ├── .npmrc                 # Config PNPM local
│   ├── .pnpmrc               # Config PNPM local
│   └── ...                    # Todo o projeto
├── .vscode-server/
│   └── data/Machine/
│       └── settings.json      # VS Code settings globais
├── .pnpmrc                    # Config PNPM global
├── .npmrc                     # Config NPM global
├── .bashrc                    # Aliases e environment vars
├── .gitconfig                 # Git config (se configurado)
├── .ssh/                      # SSH keys (se geradas)
└── .config/
    └── neonpro-backup-*/      # Backups das configurações
```

## �� Comparação dos Scripts

| Aspecto          | `setup-wsl-ubuntu.sh` | `copy-user-settings-to-wsl.sh` |
| ---------------- | --------------------- | ------------------------------ |
| **Tempo**        | 15-30 min             | 2-5 min                        |
| **Dependências** | Instala tudo          | Só copia configs               |
| **Interativo**   | Sim (Git config)      | Mínimo                         |
| **Projeto**      | Copia + instala deps  | Só copia estrutura             |
| **Validação**    | Completa              | Básica                         |
| **Relatório**    | Detalhado             | Resumo                         |
| **Ideal para**   | Novo ambiente         | Sync rápido                    |

## 🎯 Recomendações de Uso

### Cenário 1: Primeiro Setup WSL

Use `setup-wsl-ubuntu.sh` - instala tudo do zero

### Cenário 2: Sync Rápido de Configs

Use `copy-user-settings-to-wsl.sh` - atualiza apenas configurações

### Cenário 3: Configuração Manual

Consulte `docs/wsl-ubuntu-setup.md` para executar cada etapa manualmente

## 📞 Suporte

Para problemas:

1. Consultar logs em `~/neonpro-setup.log` (setup completo)
2. Verificar backups em `~/.config/neonpro-backup-*/`
3. Consultar documentação completa em `docs/wsl-ubuntu-setup.md`
4. Executar comandos de validação listados acima

---

**Última atualização**: $(date) **Scripts testados no**: Ubuntu 20.04+ WSL2
