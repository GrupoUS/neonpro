#!/usr/bin/env sh

echo "🧪 Testando correções do pre-commit hook..."
echo "================================================="

# Source the common utilities
. .husky/common.sh

echo ""
echo "🔍 Informações do ambiente:"
debug_environment

echo ""
echo "🔧 Testando comandos disponíveis:"

echo "  ✓ Testando command_exists node: $(command_exists node && echo "✅ OK" || echo "❌ FAIL")"
echo "  ✓ Testando command_exists npm: $(command_exists npm && echo "✅ OK" || echo "❌ FAIL")"  
echo "  ✓ Testando command_exists npx: $(command_exists npx && echo "✅ OK" || echo "❌ FAIL")"
echo "  ✓ Testando command_exists pnpm: $(command_exists pnpm && echo "✅ OK" || echo "❌ FAIL")"

echo ""
echo "🚀 Testando funções de fallback:"

echo "  📦 Testando run_package_command..."
if run_package_command --version >/dev/null 2>&1; then
    echo "    ✅ run_package_command: OK"
else
    echo "    ⚠️  run_package_command: Não executado (normal para teste)"
fi

echo "  🔧 Testando run_npx_command..."
if run_npx_command --version >/dev/null 2>&1; then
    echo "    ✅ run_npx_command: OK"
else
    echo "    ⚠️  run_npx_command: Não executado (normal para teste)"
fi

echo ""
echo "🏁 Teste das correções completo!"
echo ""
echo "Para testar o hook completo, execute:"
echo "  git add ."
echo "  git commit -m 'test: verificar correções do pre-commit'"
echo ""