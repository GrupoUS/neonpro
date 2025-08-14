// components/auth/login-modal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'professional' | 'patient';
}

export function LoginModal({ open, onOpenChange, type }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock authentication logic
      if (formData.email && formData.password) {
        // Redirect based on type
        if (type === 'professional') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/patient-portal';
        }
      } else {
        setError("Por favor, preencha todos os campos");
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const securityFeatures = [
    "Autenticação multi-fator disponível",
    "Criptografia end-to-end",
    "Conformidade LGPD garantida",
    "Logs de auditoria completos"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span>
              {type === 'professional' ? 'Login Profissional' : 'Portal do Paciente'}
            </span>
            <Badge className="bg-sky-100 text-sky-700 text-xs">
              Seguro
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Notice */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Acesso Seguro
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {type === 'professional' 
                ? 'Acesso exclusivo para profissionais certificados com dados criptografados.'
                : 'Portal seguro para acompanhar seus tratamentos e consultas.'
              }
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                {type === 'professional' ? 'E-mail Profissional' : 'E-mail ou CPF'}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  placeholder={
                    type === 'professional' 
                      ? 'dr.silva@clinica.com.br' 
                      : 'seu@email.com ou 000.000.000-00'
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Lembrar-me
                </Label>
              </div>
              <a 
                href="/forgot-password" 
                className="text-sm text-sky-600 hover:text-sky-700 hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {type === 'professional' && (
            <>
              <Separator />
              
              {/* Professional Features */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Recursos Profissionais:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  {securityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-sky-600 rounded-full flex-shrink-0"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* First Access */}
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Primeiro acesso ou precisa de ajuda?
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open('/setup-guide', '_blank')}
                  >
                    Guia de Configuração
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open('/contact-support', '_blank')}
                  >
                    Suporte Técnico
                  </Button>
                </div>
              </div>
            </>
          )}

          {type === 'patient' && (
            <>
              <Separator />
              
              {/* Patient First Access */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Primeiro acesso?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Use o CPF e número de celular informados na sua primeira consulta.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open('/patient-help', '_blank')}
                >
                  Como acessar minha conta
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </>
          )}

          {/* Security Footer */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Shield className="h-3 w-3 text-green-600" />
              <span className="text-xs text-slate-500">
                Protegido por criptografia bancária
              </span>
            </div>
            <div className="flex justify-center space-x-3 text-xs text-slate-400">
              <span>LGPD</span>
              <span>•</span>
              <span>ANVISA</span>
              <span>•</span>
              <span>CFM</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}