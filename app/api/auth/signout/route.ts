// app/api/auth/signout/route.ts
import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Realiza o logout no Supabase
  await supabase.auth.signOut();

  // Redireciona para a página de login
  return NextResponse.redirect(new URL("/login", request.url));
}
