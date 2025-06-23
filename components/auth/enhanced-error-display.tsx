"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, RefreshCw, Home, Bug } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface EnhancedErrorDisplayProps {
  error: string;
  description?: string;
  debug?: string;
}

export function EnhancedErrorDisplay({ error, description, debug }: EnhancedErrorDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  let debugInfo = null;
  if (debug) {
    try {
      debugInfo = JSON.parse(debug);
    } catch (e) {
      debugInfo = { raw: debug };
    }
  }

  const copyErrorDetails = () => {
    const errorDetails = `Error: ${error}\nDescription: ${description}\nTimestamp: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getErrorDetails = (errorCode: string) => {
    switch (errorCode) {
      case "redirect_uri_mismatch":
        return {
          title: "Erro de Configuração OAuth",
          message: "URL de redirecionamento não configurada corretamente no Google Console",
          severity: "high" as const,
          icon: "🔧",
          solutions: [
            "Verifique se a URL está configurada: https://neonpro.vercel.app/api/auth/callback/google",
            "Confirme se o domínio vercel.app está autorizado no OAuth Consent Screen",
            "Aguarde 5-10 minutos após mudanças na configuração do Google",
            "Teste em uma aba anônima após as mudanças",
          ],
          technicalNote: "Este erro indica que o Google OAuth não reconhece a URL de callback configurada.",
        };
      case "no_code":
        return {
          title: "Código de Autorização Não Recebido",
          message: "O Google não retornou o código de autorização necessário",
          severity: "high" as const,
          icon: "🔑",
          solutions: [
            "Verifique se você clicou em 'Permitir' durante o login do Google",
            "Desative bloqueadores de popup temporariamente",
            "Tente fazer login em uma aba anônima",
            "Limpe cookies e cache do navegador",
            "Verifique se não há extensões interferindo",
          ],
          technicalNote: "Isso geralmente indica um problema no fluxo OAuth ou configuração incorreta.",
        };
      case "config":
      case "exchange_failed":
        return {
          title: "Erro de Configuração do Servidor",
          message: "Problema nas configurações do Supabase ou variáveis de ambiente",
          severity: "critical" as const,
          icon: "⚙️",
          solutions: [
            "Verifique se NEXT_PUBLIC_SUPABASE_URL está configurada",
            "Confirme se NEXT_PUBLIC_SUPABASE_ANON_KEY está presente",
            "Verifique se as chaves do Supabase estão corretas e ativas",
            "Confirme se o projeto Supabase está ativo",
          ],
          technicalNote: "Este é um erro de configuração que requer atenção técnica imediata.",
        };
      default:
        return {
          title: "Erro de Autenticação",
          message: description || "Ocorreu um erro inesperado durante a autenticação",
          severity: "medium" as const,
          icon: "⚠️",
          solutions: [
            "Tente fazer login novamente",
            "Limpe o cache e cookies do navegador",
            "Tente em uma aba anônima",
            "Verifique sua conexão com a internet",
            "Entre em contato com o suporte se persistir",
          ],
          technicalNote: "Erro genérico que pode ter várias causas.",
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card className="border-destructive/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">{errorDetails.icon}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-destructive text-xl">
                {errorDetails.title}
              </CardTitle>
              <Badge variant={getSeverityColor(errorDetails.severity)}>
                {errorDetails.severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Código: <code className="bg-muted px-2 py-1 rounded text-xs">{error}</code>
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorDetails.message}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span>🔧</span> Soluções Recomendadas:
            </h4>
            <ul className="space-y-2">
              {errorDetails.solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="text-primary font-bold mt-0.5">{index + 1}.</span>
                  <span className="text-muted-foreground">{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link href="/login">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/login?method=email">
                Usar Email
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/debug-auth">
                <Bug className="mr-2 h-4 w-4" />
                Debug
              </Link>
            </Button>
          </div>

          <div className="flex justify-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>
          </div>

          {/* Debug Information */}
          {debugInfo && (
            <div className="border-t pt-4 space-y-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDebug(!showDebug)}
                className="w-full"
              >
                {showDebug ? "Ocultar" : "Mostrar"} Informações Técnicas
              </Button>
              
              {showDebug && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Detalhes do Erro:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyErrorDetails}
                      className="h-6 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copied ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48 border">
                    {JSON.stringify({
                      error,
                      description,
                      debugInfo,
                      timestamp: new Date().toISOString(),
                      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
                      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Technical Note */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded border-l-4 border-muted">
            <strong>Nota Técnica:</strong> {errorDetails.technicalNote}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
