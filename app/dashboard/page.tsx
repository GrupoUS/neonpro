// app/dashboard/page.tsx
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Se não houver sessão, redireciona para login
    redirect("/login");
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-xl text-muted-foreground">
            Bem-vindo ao NeonPro!
          </p>
        </div>
        
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informações do Usuário</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">ID:</span> {user?.id}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Último acesso:</span> {new Date(user?.last_sign_in_at || '').toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-destructive hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}