// app/auth/auth-code-error/page.tsx
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na Autenticação</AlertTitle>
          <AlertDescription>
            Ocorreu um erro durante o processo de autenticação com o Google. 
            Isso pode acontecer por várias razões:
          </AlertDescription>
        </Alert>
        
        <div className="bg-card rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Possíveis causas:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>O código de autorização expirou</li>
            <li>A sessão foi cancelada</li>
            <li>Configurações OAuth incorretas</li>
            <li>Erro de comunicação com o servidor</li>
          </ul>
          
          <div className="pt-4">
            <Link href="/login">
              <Button className="w-full">
                Tentar novamente
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
