"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const description = searchParams.get("description");
  const [copied, setCopied] = useState(false);

  const copyErrorDetails = () => {
    const errorDetails = `Error: ${error}\nDescription: ${description}`;
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Erro de Autenticação</CardTitle>
          <CardDescription>
            Ocorreu um erro durante o processo de autenticação com Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm font-medium text-destructive mb-1">
                Erro: {error}
              </div>
              {description && (
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={copyErrorDetails}
                className="mt-2 h-6 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                {copied ? "Copiado!" : "Copiar detalhes"}
              </Button>
            </div>
          )}

          <div className="text-sm text-muted-foreground text-center">
            <p>Possíveis causas:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Código de autorização inválido ou expirado</li>
              <li>• Problema de conectividade</li>
              <li>• Configuração OAuth incorreta</li>
              <li>• Redirecionamento bloqueado pelo navegador</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/login">Fazer Login com Email</Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Se o problema persistir, entre em contato com o suporte e forneça os
            detalhes do erro acima.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCodeError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Carregando...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <AuthCodeErrorContent />
    </Suspense>
  );
}
