# Script para instalar todas as dependências necessárias
Set-Location C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web

Write-Host "Instalando todas as dependências necessárias..."

$dependencies = @(
    "@trpc/server",
    "@trpc/client", 
    "@trpc/next",
    "@trpc/react-query",
    "@radix-ui/react-alert-dialog",
    "@radix-ui/react-radio-group",
    "react-day-picker"
)

foreach ($dep in $dependencies) {
    Write-Host "Instalando $dep..."
    pnpm add $dep
    Start-Sleep -Seconds 2
}

Write-Host "Todas as dependências foram instaladas!"