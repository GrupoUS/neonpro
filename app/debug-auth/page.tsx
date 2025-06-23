"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>({
    loading: true,
    supabaseUrl: "",
    hasAnonKey: false,
    sessionStatus: "checking",
    userInfo: null,
    error: null,
    environment: "",
    callbacks: {
      expected: "",
      configured: ""
    }
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        
        // Verificar variáveis de ambiente
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        // Verificar sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Verificar usuário
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        setDebugInfo({
          loading: false,
          supabaseUrl,
          hasAnonKey,
          sessionStatus: session ? "active" : "none",
          userInfo: user,
          error: sessionError || userError,
          environment: process.env.NODE_ENV,
          callbacks: {
            expected: `${window.location.origin}/auth/callback`,
            configured: supabaseUrl ? `${supabaseUrl}/auth/v1/callback` : "N/A"
          }
        });
      } catch (err: any) {
        setDebugInfo(prev => ({
          ...prev,
          loading: false,
          error: err.message
        }));
      }
    }
    
    checkAuth();
  }, []);

  if (debugInfo.loading) {
    return <div className="p-8">Carregando informações de debug...</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Debug de Autenticação</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Status da Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Supabase URL:</span>
              <Badge variant={debugInfo.supabaseUrl ? "default" : "destructive"}>
                {debugInfo.supabaseUrl || "NÃO CONFIGURADA"}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Anon Key:</span>
              <Badge variant={debugInfo.hasAnonKey ? "default" : "destructive"}>
                {debugInfo.hasAnonKey ? "CONFIGURADA" : "NÃO CONFIGURADA"}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Ambiente:</span>
              <Badge>{debugInfo.environment}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Sessão:</span>
              <Badge variant={debugInfo.sessionStatus === "active" ? "default" : "outline"}>
                {debugInfo.sessionStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>URLs de Callback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>URL Esperada (app):</strong>
              <code className="block bg-muted p-2 rounded mt-1">
                {debugInfo.callbacks.expected}
              </code>
            </div>
            <div>
              <strong>URL do Supabase:</strong>
              <code className="block bg-muted p-2 rounded mt-1">
                {debugInfo.callbacks.configured}
              </code>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              ⚠️ Configure estas URLs no Supabase Dashboard em Authentication → URL Configuration
            </div>
          </CardContent>
        </Card>
        
        {debugInfo.error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Erro Detectado</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-destructive/10 p-4 rounded overflow-x-auto">
                {JSON.stringify(debugInfo.error, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
        
        {debugInfo.userInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded overflow-x-auto">
                {JSON.stringify(debugInfo.userInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}