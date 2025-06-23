// app/utils/supabase/server.ts
// Comentário: Cria um cliente Supabase para uso no lado do servidor (Server Components, Route Handlers, Server Actions).
// Gerencia a sessão de forma segura através de cookies.
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Ocorre em Server Actions quando se tenta setar um cookie.
          // A middleware se encarregará de atualizar os cookies.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Ocorre em Server Actions quando se tenta remover um cookie.
        }
      },
    },
  })
}
