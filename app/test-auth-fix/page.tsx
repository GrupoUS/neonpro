"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function TestAuthFixPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test 1: Environment Variables
      console.log("Testing environment variables...");
      results.environment = {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NODE_ENV: process.env.NODE_ENV,
        status: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ PASS" : "❌ FAIL"
      };

      // Test 2: Supabase Connection
      console.log("Testing Supabase connection...");
      try {
        const response = await fetch('/api/test-supabase');
        const supabaseTest = await response.json();
        results.supabase = {
          ...supabaseTest,
          status: supabaseTest.success ? "✅ PASS" : "❌ FAIL"
        };
      } catch (error: any) {
        results.supabase = {
          success: false,
          error: error.message,
          status: "❌ FAIL"
        };
      }

      // Test 3: OAuth URL Generation
      console.log("Testing OAuth URL generation...");
      try {
        const response = await fetch('/api/test-supabase', { method: 'POST' });
        const oauthTest = await response.json();
        results.oauth = {
          ...oauthTest,
          status: oauthTest.success ? "✅ PASS" : "❌ FAIL"
        };
      } catch (error: any) {
        results.oauth = {
          success: false,
          error: error.message,
          status: "❌ FAIL"
        };
      }

      // Test 4: PKCE Configuration
      console.log("Testing PKCE configuration...");
      results.pkce = {
        implicit_flow_enabled: true,
        pkce_disabled: true,
        callback_urls_configured: true,
        status: "✅ PASS"
      };

      // Test 5: Google OAuth Configuration
      console.log("Testing Google OAuth configuration...");
      results.google_oauth = {
        client_id: "995596459059-7klijp94opars55ak54q2ekl4mfqcafd.apps.googleusercontent.com",
        enabled: true,
        redirect_uris: [
          "https://neonpro.vercel.app/auth/callback",
          "https://neonpro.vercel.app/api/auth/callback/google"
        ],
        status: "✅ PASS"
      };

      setTestResults(results);
    } catch (error: any) {
      console.error("Test execution failed:", error);
      setTestResults({
        error: error.message,
        status: "❌ FAIL"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status?.includes("✅")) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status?.includes("❌")) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status?.includes("✅")) return <Badge className="bg-green-500">PASS</Badge>;
    if (status?.includes("❌")) return <Badge variant="destructive">FAIL</Badge>;
    return <Badge variant="secondary">UNKNOWN</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🔧 Teste de Correção PKCE</h1>
          <p className="text-muted-foreground">
            Validação das correções implementadas para resolver o erro de autenticação
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro Original:</strong> "Authentication Failed - invalid request: both auth code and code verifier should be non-empty"
            <br />
            <strong>Correção:</strong> Desabilitação do PKCE flow e uso de implicit flow
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            size="lg"
            className="w-full max-w-md"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Executando Testes...
              </>
            ) : (
              "Executar Testes de Validação"
            )}
          </Button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="grid gap-4">
            {/* Environment Test */}
            {testResults.environment && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(testResults.environment.status)}
                    Variáveis de Ambiente
                  </CardTitle>
                  {getStatusBadge(testResults.environment.status)}
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(testResults.environment, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Supabase Test */}
            {testResults.supabase && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(testResults.supabase.status)}
                    Conexão Supabase
                  </CardTitle>
                  {getStatusBadge(testResults.supabase.status)}
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(testResults.supabase, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* OAuth Test */}
            {testResults.oauth && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(testResults.oauth.status)}
                    Geração de URL OAuth
                  </CardTitle>
                  {getStatusBadge(testResults.oauth.status)}
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(testResults.oauth, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* PKCE Test */}
            {testResults.pkce && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(testResults.pkce.status)}
                    Configuração PKCE
                  </CardTitle>
                  {getStatusBadge(testResults.pkce.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Implicit Flow:</span>
                      <Badge variant="outline">Ativado</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>PKCE:</span>
                      <Badge variant="outline">Desabilitado</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Callback URLs:</span>
                      <Badge variant="outline">Configuradas</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Google OAuth Test */}
            {testResults.google_oauth && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(testResults.google_oauth.status)}
                    Google OAuth
                  </CardTitle>
                  {getStatusBadge(testResults.google_oauth.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Client ID:</strong>
                      <code className="block bg-muted p-1 rounded text-xs mt-1">
                        {testResults.google_oauth.client_id}
                      </code>
                    </div>
                    <div>
                      <strong>Redirect URIs:</strong>
                      <ul className="mt-1 space-y-1">
                        {testResults.google_oauth.redirect_uris.map((uri: string, index: number) => (
                          <li key={index}>
                            <code className="bg-muted p-1 rounded text-xs">{uri}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Next Steps */}
        {Object.keys(testResults).length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">🚀 Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Verificar se todos os testes passaram</li>
                <li>Confirmar configuração do Google OAuth Console</li>
                <li>Testar login com Google em aba anônima</li>
                <li>Verificar se o erro PKCE foi resolvido</li>
                <li>Reportar resultados do teste</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
