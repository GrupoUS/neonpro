#!/bin/bash

# Script de integração OxLint para IDEs
# Executa OxLint com formato JSON adequado para Problems panel

# Verifica se arquivo foi especificado
if [ -z "$1" ]; then
  # Se não especificado, executa em todo o projeto
  npx oxlint . --import-plugin --react-plugin --jsx-a11y-plugin --format=json
else
  # Se especificado, executa no arquivo específico
  npx oxlint "$1" --import-plugin --react-plugin --jsx-a11y-plugin --format=json
fi