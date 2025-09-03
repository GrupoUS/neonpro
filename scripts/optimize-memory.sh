#!/bin/bash

# Script para otimizar o uso de memória dos linters e formatters
# Configurações de ambiente para reduzir consumo de RAM

echo "🔧 Configurando otimizações de memória para linters e formatters..."

# Configurar variáveis de ambiente para Node.js
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=64"
export UV_THREADPOOL_SIZE=1
export MALLOC_ARENA_MAX=1

# Configurar limites de processo (se disponível)
if command -v ulimit &> /dev/null; then
    # Limitar memória virtual para 8GB (mais adequado para builds complexos)
    ulimit -v 8388608
    # Limitar memória física para 4GB
    ulimit -m 4194304
    # Limitar número de processos (mais generoso para builds paralelos)
    ulimit -u 256
    echo "✅ Limites de processo configurados"
fi

# Configurar prioridade de processo (nice)
if command -v nice &> /dev/null; then
    export NICE_LEVEL=10
    echo "✅ Prioridade de processo configurada (nice level: $NICE_LEVEL)"
fi

# Função para executar oxlint com otimizações
run_oxlint_optimized() {
    echo "🔍 Executando oxlint com otimizações de memória..."
    nice -n ${NICE_LEVEL:-10} npx oxlint apps packages --threads 2 --max-warnings 100 "$@"
}

# Função para executar dprint com otimizações
run_dprint_optimized() {
    echo "📝 Executando dprint com otimizações de memória..."
    nice -n 10 npx dprint --config dprint-minimal.json "$@"
}

# Função para executar turbo com otimizações
run_turbo_optimized() {
    echo "🚀 Executando turbo com otimizações de memória..."
    nice -n ${NICE_LEVEL:-10} turbo "$@" --concurrency=2
}

# Exportar funções para uso em outros scripts
export -f run_oxlint_optimized
export -f run_dprint_optimized
export -f run_turbo_optimized

echo "✅ Configurações de otimização de memória aplicadas!"
echo "📊 Uso de memória atual:"
free -h | head -2

echo ""
echo "🔧 Comandos otimizados disponíveis:"
echo "  - run_oxlint_optimized [args]"
echo "  - run_dprint_optimized [args]"
echo "  - run_turbo_optimized [args]"
echo ""
echo "💡 Para usar: source scripts/optimize-memory.sh"
