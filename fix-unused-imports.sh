#!/bin/bash
# Script inteligente para correção automática de imports e variables não utilizadas
# Baseado na análise Code Reviewer + Architect Review

echo "🚀 INICIANDO CORREÇÃO COORDENADA DE IMPORTS E VARIABLES..."

# 1. Fix catch parameters não utilizados mas manter error handling
echo "🔧 Corrigindo catch parameters..."
find apps/ -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/} catch (error) {/} catch (_error) {/g'

# 2. Fix unused parameters com prefixo _
echo "🔧 Corrigindo parameters não utilizados..."
# Esta é uma operação mais complexa que requer análise individual

# 3. Remove imports específicos mais comuns
echo "🧹 Removendo imports não utilizados comuns..."

# Remove imports do DataAgentChat.tsx
sed -i '/Heart,/d' apps/web/src/components/ai/DataAgentChat.tsx
sed -i '/AlertDialog,/,/AlertDialogTrigger,/d' apps/web/src/components/ai/DataAgentChat.tsx
sed -i '/AvatarImage,/d' apps/web/src/components/ai/DataAgentChat.tsx  
sed -i '/Input,/d' apps/web/src/components/ai/DataAgentChat.tsx
sed -i '/Toast,/d' apps/web/src/components/ai/DataAgentChat.tsx

# Remove imports do serviço AGUI
sed -i '/PermissionContext/d' apps/api/src/services/agui-protocol/service.ts
sed -i '/RealtimeEvent/d' apps/api/src/services/agui-protocol/service.ts

echo "✅ Correções em lote aplicadas!"
echo "🔍 Execute 'get_errors' para verificar progresso..."