// app/utils/supabase/client.ts
// Comentário: Cria um cliente Supabase para ser usado em Componentes de Cliente (executados no navegador).
// É essencial para interações de UI como login, logout, etc.
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
