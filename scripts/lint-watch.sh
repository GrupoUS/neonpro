#!/bin/bash

# Script para monitoramento contínuo do OxLint
# Executa lint periodicamente e só mostra diferenças

echo "🔍 Iniciando monitoramento OxLint..."
echo "📁 Monitorando: apps/ e packages/"
echo "⏱️  Intervalo: 3 segundos" 
echo "🛑 Para parar: Ctrl+C"
echo ""

LAST_OUTPUT=""
COUNTER=0

while true; do
  COUNTER=$((COUNTER + 1))
  
  # Limpa a tela a cada 20 execuções para evitar spam
  if [ $((COUNTER % 20)) -eq 0 ]; then
    clear
    echo "🔍 OxLint Watch - Ciclo #$COUNTER"
    echo "📁 Monitorando: apps/ e packages/"
    echo ""
  fi
  
  # Executa o lint e captura output
  CURRENT_OUTPUT=$(pnpm lint 2>&1)
  
  # Só mostra output se mudou
  if [ "$CURRENT_OUTPUT" != "$LAST_OUTPUT" ]; then
    echo "🔄 [$(date '+%H:%M:%S')] Mudanças detectadas:"
    echo "$CURRENT_OUTPUT"
    echo ""
    LAST_OUTPUT="$CURRENT_OUTPUT"
  fi
  
  # Aguarda 3 segundos
  sleep 3
done