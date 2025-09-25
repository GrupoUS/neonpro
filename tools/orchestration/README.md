# Tools Orchestration

CLI simples para orquestrar execução de ferramentas em sequência ou paralelo.

## Uso

```bash
# Executar todos os workflows sequencialmente
node dist/index.js

# Executar em paralelo
node dist/index.js --parallel

# Executar pacotes específicos
node dist/index.js --packages=@neonpro/tools-backend-tests,@neonpro/tools-frontend-tests

# Dry run (simulação)
node dist/index.js --dry-run
```

## Features

- ✅ Execução sequencial/paralela
- ✅ Seleção de pacotes
- ✅ Modo dry-run
- ✅ Logging estruturado
