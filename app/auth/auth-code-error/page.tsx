"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthCodeError() {
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
          <div className="text-sm text-muted-foreground text-center">
            <p>Possíveis causas:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Código de autorização inválido ou expirado</li>
              <li>• Problema de conectividade</li>
              <li>• Configuração OAuth incorreta</li>
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
              <Link href="/login">
                Fazer Login com Email
              </Link>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Se o problema persistir, entre em contato com o suporte.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}