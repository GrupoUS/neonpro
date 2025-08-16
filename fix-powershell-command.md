# PowerShell Command Fix

## Problema Identificado

O comando PowerShell tem problemas de sintaxe com aspas e literais de string:

```powershell
# COMANDO COM ERRO (original):
powershell -Command '$context = if (Test-Path 'E:\neonpro/package.json') { 'nextjs react typescript' } elseif (Test-Path 'E:\neonpro/.env*') { 'security authentication' } else { 'base' }; if ($context -eq 'base') { node 'E:\neonpro/.github/scripts/conditional-instructions-loader.js' reset } else { node 'E:\neonpro/.github/scripts/conditional-instructions-loader.js' analyze $context }; Write-Host "Contexto detectado: $context" -ForegroundColor Green'
```

## Solução Corrigida

```powershell
# COMANDO CORRIGIDO:
powershell -Command "$context = if (Test-Path 'E:\neonpro/package.json') { 'nextjs react typescript' } elseif (Test-Path 'E:\neonpro/.env*') { 'security authentication' } else { 'base' }; if (`$context -eq 'base') { node 'E:\neonpro/.github/scripts/conditional-instructions-loader.js' reset } else { node 'E:\neonpro/.github/scripts/conditional-instructions-loader.js' analyze `$context }; Write-Host 'Contexto detectado: ' -NoNewline; Write-Host `$context -ForegroundColor Green"
```

## Principais Correções

1. **Usar aspas duplas externas** para evitar conflitos com aspas simples internas
2. **Escapar variáveis** com backtick (`) quando necessário: `$context
3. **Corrigir Write-Host** para evitar problemas de interpolação de strings
4. **Validar que o script existe** antes de executar

## Versão Alternativa (mais robusta)

```powershell
powershell -Command "
`$context = if (Test-Path 'E:\neonpro/package.json') { 'nextjs react typescript' } elseif (Test-Path 'E:\neonpro/.env*') { 'security authentication' } else { 'base' };
`$scriptPath = 'E:\neonpro/.github/scripts/conditional-instructions-loader.js';
if (Test-Path `$scriptPath) {
    if (`$context -eq 'base') {
        node `$scriptPath reset
    } else {
        node `$scriptPath analyze `$context
    }
} else {
    Write-Host 'Script não encontrado: ' -NoNewline; Write-Host `$scriptPath -ForegroundColor Red
}
Write-Host 'Contexto detectado: ' -NoNewline; Write-Host `$context -ForegroundColor Green
"
```

## Como Aplicar a Correção

1. Localize onde este comando está definido (possivelmente em .vscode/tasks.json, workspace config, ou script)
2. Substitua o comando problemático pela versão corrigida
3. Teste o comando corrigido

## Nota Importante

O script referenciado (`E:\neonpro/.github/scripts/conditional-instructions-loader.js`) não existe atualmente no projeto.
Você pode precisar criá-lo ou remover esta task se não for necessária.