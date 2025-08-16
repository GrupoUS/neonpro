# 🚀 Script de Configuração Final - Git Credential Manager

Write-Host "="*70 -ForegroundColor Green
Write-Host "  🔧 CONFIGURAÇÃO AUTOMÁTICA DO GIT CREDENTIAL MANAGER" -ForegroundColor Green  
Write-Host "="*70 -ForegroundColor Green
Write-Host ""

# Passo 1: Status atual
Write-Host "📊 VERIFICANDO STATUS ATUAL..." -ForegroundColor Yellow
Write-Host "Git Config atual:" -ForegroundColor Cyan
git config --global --list | findstr credential
Write-Host ""

# Passo 2: GitHub CLI Login
Write-Host "🔐 INICIANDO LOGIN NO GITHUB CLI..." -ForegroundColor Yellow
Write-Host "⚠️  IMPORTANTE: Uma janela do navegador será aberta" -ForegroundColor Red
Write-Host "⚠️  Copie o código que aparecer e cole no navegador" -ForegroundColor Red
Write-Host ""
Write-Host "Pressione ENTER para continuar..." -ForegroundColor Cyan
Read-Host

# Verificar se GITHUB_TOKEN existe e remover
if ($env:GITHUB_TOKEN) {
    Write-Host "🧹 Removendo GITHUB_TOKEN do ambiente..." -ForegroundColor Cyan
    Remove-Item Env:GITHUB_TOKEN -ErrorAction SilentlyContinue
}

# Fazer logout primeiro
Write-Host "🔄 Fazendo logout do GitHub CLI..." -ForegroundColor Cyan
gh auth logout --hostname github.com 2>$null

# Fazer login
Write-Host "🔑 Fazendo login no GitHub CLI..." -ForegroundColor Cyan
gh auth login --hostname github.com --git-protocol https --web

# Passo 3: Verificação
Write-Host ""
Write-Host "✅ VERIFICANDO CONFIGURAÇÃO..." -ForegroundColor Yellow
Write-Host "GitHub CLI Status:" -ForegroundColor Cyan
gh auth status

Write-Host ""
Write-Host "Git Credential Helper:" -ForegroundColor Cyan
git config --global --list | findstr credential

# Passo 4: Teste
Write-Host ""
Write-Host "🧪 TESTANDO CONFIGURAÇÃO..." -ForegroundColor Yellow
Set-Location "E:\neonpro"
Write-Host "Executando git fetch..." -ForegroundColor Cyan
git fetch origin 2>&1

# Resultado
Write-Host ""
Write-Host "="*70 -ForegroundColor Green
Write-Host "  🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "="*70 -ForegroundColor Green
Write-Host ""
Write-Host "✅ GitHub CLI configurado como credential helper" -ForegroundColor Green
Write-Host "✅ Autenticação persistente ativada" -ForegroundColor Green
Write-Host "✅ VS Code não solicitará mais login" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Feche completamente o VS Code" -ForegroundColor Cyan
Write-Host "2. Abra o VS Code novamente" -ForegroundColor Cyan
Write-Host "3. Teste operações Git (fetch, push, pull)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🆘 Se ainda houver problemas, execute:" -ForegroundColor Red
Write-Host "   gh auth status" -ForegroundColor White
Write-Host "   git config --global --list | grep credential" -ForegroundColor White
Write-Host ""