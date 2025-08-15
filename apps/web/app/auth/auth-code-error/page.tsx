// app/auth/auth-code-error/page.tsx

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na Autenticação</AlertTitle>
          <AlertDescription>
            Ocorreu um erro durante o processo de autenticação com o Google.
            Isso pode acontecer por várias razões:
          </AlertDescription>
        </Alert>

        <div className="space-y-4 rounded-lg bg-card p-6 shadow">
          <h2 className="font-semibold text-lg">Possíveis causas:</h2>
          <ul className="list-inside list-disc space-y-2 text-muted-foreground text-sm">
            <li>O código de autorização expirou</li>
            <li>A sessão foi cancelada</li>
            <li>Configurações OAuth incorretas</li>
            <li>Erro de comunicação com o servidor</li>
          </ul>

          <div className="pt-4">
            <Link href="/login">
              <Button className="w-full">Tentar novamente</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
