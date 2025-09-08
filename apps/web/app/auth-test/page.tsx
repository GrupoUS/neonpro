"use client";

import { useRealAuthContext } from "@/contexts/RealAuthContext";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Separator,
} from "@/components/ui";
import {
  CheckCircle,
  Clock,
  LoaderCircle,
  LogIn,
  LogOut,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AuthTestPage() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    clearError,
  } = useRealAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Clear errors when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, mfaCode, error, clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    setLoginLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
        ...(mfaCode && { mfaCode: mfaCode.trim() }),
      });
    } catch (_err) { // Unused catch parameter
      // Error is handled by the auth context
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setEmail("");
      setPassword("");
      setMfaCode("");
    } catch (_err) { // Unused catch parameter
      // Error is handled by the auth context
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Carregando sistema de autenticação...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Teste de Autenticação</h1>
        <p className="text-muted-foreground">
          Página de teste para validar o sistema de autenticação real do NeonPro
        </p>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Status de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isAuthenticated
                ? <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                : <XCircle className="h-5 w-5 text-red-500 mr-2" />}
              <span className="text-lg font-medium">
                {isAuthenticated ? "Autenticado" : "Não autenticado"}
              </span>
            </div>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "ATIVO" : "INATIVO"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro de Autenticação:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Login Form - Only show when not authenticated */}
      {!isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LogIn className="h-5 w-5 mr-2" />
              Fazer Login
            </CardTitle>
            <CardDescription>
              Use credenciais válidas para testar a autenticação real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  required
                  disabled={loginLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  disabled={loginLoading}
                />
              </div>

              <div>
                <label htmlFor="mfaCode" className="block text-sm font-medium mb-1">
                  Código MFA (opcional)
                </label>
                <Input
                  id="mfaCode"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  disabled={loginLoading}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Deixe em branco se não tiver MFA configurado
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginLoading || !email.trim() || !password.trim()}
              >
                {loginLoading
                  ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  : <LogIn className="h-4 w-4 mr-2" />}
                {loginLoading ? "Fazendo Login..." : "Fazer Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* User Information - Only show when authenticated */}
      {isAuthenticated && user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações do Usuário
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="font-mono text-xs bg-muted p-2 rounded">{user.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user.email}</p>
              </div>

              {user.fullName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="text-sm">{user.fullName}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Função</p>
                <Badge variant="outline">
                  {user.role || "Não definido"}
                </Badge>
              </div>

              {/* Clinic ID not available in current User type */}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuário Ativo</p>
                <div className="flex items-center">
                  {user.isActive
                    ? <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    : <XCircle className="h-4 w-4 text-red-500 mr-1" />}
                  <span className="text-sm">
                    {user.isActive ? "Sim" : "Não"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Permissões
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.keys(user.permissions || {}).length > 0
                  ? (
                    Object.keys(user.permissions || {}).map((permission: string) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {(user.permissions && user.permissions[permission]) || permission}
                      </Badge>
                    ))
                  )
                  : <Badge variant="outline">Nenhuma permissão definida</Badge>}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Sessão
              </p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>
                  Último login: {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString("pt-BR")
                    : "Não disponível"}
                </p>
                {/* Session expiration not available in User type */}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Dados Brutos (Debug)
              </p>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar esta página de teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium mb-1">1. Teste de Login</h4>
            <p className="text-sm text-muted-foreground">
              Digite credenciais válidas do Supabase para testar o login. O sistema irá validar
              contra as tabelas profiles e active_user_sessions.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-1">2. Validação de Dados</h4>
            <p className="text-sm text-muted-foreground">
              Após login bem-sucedido, verifique se as informações do usuário são carregadas
              corretamente do perfil no Supabase.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-1">3. Teste de Logout</h4>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Logout&quot; para testar a funcionalidade de encerramento de sessão.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-1">4. Gerenciamento de Erros</h4>
            <p className="text-sm text-muted-foreground">
              Teste credenciais inválidas para verificar o tratamento de erros.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
