// components/auth/patient-login.tsx
"use client";

import type {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import type { useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PatientLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientLoginModal({ open, onOpenChange }: PatientLoginModalProps) {
  const [loginMethod, setLoginMethod] = useState<"cpf" | "email">("cpf");
  const [formData, setFormData] = useState({
    cpf: "",
    email: "",
    phone: "",
    password: "",
    birthDate: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock authentication logic
      const hasRequiredFields =
        loginMethod === "cpf"
          ? formData.cpf && formData.phone
          : formData.email && formData.password;

      if (hasRequiredFields) {
        window.location.href = "/patient-portal";
      } else {
        setError("Por favor, preencha todos os campos obrigatórios");
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const patientFeatures = [
    "Histórico completo de consultas",
    "Fotos de acompanhamento",
    "Agendamento online",
    "Lembretes automáticos",
    "Chat com a clínica",
    "Dados sempre seguros",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span>Portal do Paciente</span>
            <Badge className="bg-pink-100 text-pink-700 text-xs">Bem-estar</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Bem-vindo ao seu Portal
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Acompanhe seus tratamentos, veja seu progresso e mantenha-se conectado com sua
              clínica.
            </p>
          </div>

          {/* Login Method Tabs */}
          <Tabs
            value={loginMethod}
            onValueChange={(value) => setLoginMethod(value as "cpf" | "email")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cpf" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>CPF + Celular</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>E-mail + Senha</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                </div>
              )}

              <TabsContent value="cpf" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="cpf"
                        type="text"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange("cpf", formatCPF(e.target.value))}
                        className="pl-10"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Celular *</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", formatPhone(e.target.value))}
                        className="pl-10"
                        placeholder="(11) 99999-0000"
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento (opcional)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Para maior segurança, informe sua data de nascimento
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Acessando...
                      </>
                    ) : (
                      <>
                        Acessar Portal
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
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
                        onCheckedChange={(checked) =>
                          handleInputChange("rememberMe", checked as boolean)
                        }
                      />
                      <Label htmlFor="rememberMe" className="text-sm">
                        Lembrar-me
                      </Label>
                    </div>
                    <a
                      href="/patient-password-reset"
                      className="text-sm text-pink-600 hover:text-pink-700 hover:underline"
                    >
                      Esqueci minha senha
                    </a>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
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
              </TabsContent>
            </div>
          </Tabs>

          <Separator />

          {/* Patient Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              No seu portal você encontra:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              {patientFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-pink-600 rounded-full flex-shrink-0"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Help Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Precisa de ajuda?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Entre em contato com sua clínica ou use o CPF e celular informados na consulta.
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/patient-support", "_blank")}
              >
                Central de Ajuda
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Shield className="h-3 w-3 text-green-600" />
              <span className="text-xs text-slate-500">Seus dados são protegidos pela LGPD</span>
            </div>
            <p className="text-xs text-slate-400">
              Criptografia bancária • Privacidade garantida • Acesso controlado
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
