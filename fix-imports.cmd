@echo off
echo 🔧 FASE 5: Corrigindo imports type/value...

REM Corrigir tRPC routers
echo 📝 Corrigindo tRPC routers...
sed -i "s/import type { createTRPCRouter/import { createTRPCRouter/g" apps/neonpro-web/src/server/routers/doctors.ts
sed -i "s/import type { createTRPCRouter/import { createTRPCRouter/g" apps/neonpro-web/src/server/routers/patients.ts
sed -i "s/import type { protectedProcedure/import { protectedProcedure/g" apps/neonpro-web/src/server/routers/*.ts
sed -i "s/import type { adminProcedure/import { adminProcedure/g" apps/neonpro-web/src/server/routers/*.ts

REM Corrigir tRPC core
echo 📝 Corrigindo tRPC core...
sed -i "s/import type { initTRPC/import { initTRPC/g" apps/neonpro-web/src/server/trpc.ts
sed -i "s/import type { TRPCError/import { TRPCError/g" apps/neonpro-web/src/server/trpc.ts
sed -i "s/import type { middleware/import { middleware/g" apps/neonpro-web/src/server/trpc/middleware.ts

REM Corrigir Supabase client
echo 📝 Corrigindo Supabase client...
sed -i "s/import type { createClientComponentClient/import { createClientComponentClient/g" apps/neonpro-web/src/utils/supabase/client.ts

echo ✅ Correção concluída!