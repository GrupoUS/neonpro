"use client";

import type { useState } from "react";
import type { useRouter } from "next/navigation";
import type { useAuth } from "@/contexts/auth-context";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Input } from "@/components/ui/input";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Separator } from "@/components/ui/separator";
import type { useForm } from "react-hook-form";
import type { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { Eye, EyeOff, Lock, Mail, User, X, Heart, Phone, Calendar } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    phone: z
      .string()
      .min(10, "Telefone inválido")
      .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato: (11) 99999-9999"),
    birthDate: z
      .string()
      .min(1, "Data de nascimento é obrigatória")
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número",
      ),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    lgpdConsent: z
      .boolean()
      .refine((val) => val === true, "Você deve aceitar os termos de privacidade"),
    marketingConsent: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onClose?: () => void;
}

export function RegisterForm({ onSwitchToLogin, onClose }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      password: "",
      confirmPassword: "",
      lgpdConsent: false,
      marketingConsent: false,
    },
  });

  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      const formatted = cleaned.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
      return formatted;
    }
    return value;
  };

  // Format birth date as user types
  const handleBirthDateChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 8) {
      const formatted = cleaned.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
      return formatted;
    }
    return value;
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Convert birth date to ISO format
      const [day, month, year] = data.birthDate.split("/");
      const birthDateISO = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

      const { data: authData, error } = await signUp(data.email, data.password, {
        full_name: data.name,
        phone: data.phone,
        birth_date: birthDateISO,
        role: "patient",
        lgpd_consent: true,
        lgpd_consent_date: new Date().toISOString(),
        marketing_consent: data.marketingConsent || false,
        marketing_consent_date: data.marketingConsent ? new Date().toISOString() : null,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          form.setError("email", {
            type: "manual",
            message: "Este email já está cadastrado. Tente fazer login.",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: "Erro ao criar conta. Tente novamente.",
          });
        }
        return;
      }

      if (authData?.user) {
        // Show success message and redirect to patient portal
        router.push("/patient-portal?welcome=true");
        onClose?.();
      }
    } catch (error) {
      form.setError("root", {
        type: "manual",
        message: "Erro interno. Tente novamente em alguns momentos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-xl border-0">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6366f1]">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Criar Conta de Paciente
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Cadastre-se para acessar seu portal do paciente
              </p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Nome Completo *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="Digite seu nome completo"
                        className="pl-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Email *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Telefone *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="pl-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]"
                        disabled={isLoading}
                        onChange={(e) => {
                          const formatted = handlePhoneChange(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Data de Nascimento *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="DD/MM/AAAA"
                        className="pl-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]"
                        disabled={isLoading}
                        onChange={(e) => {
                          const formatted = handleBirthDateChange(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Senha *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Crie uma senha segura"
                        className="pl-10 pr-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-slate-600"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Confirmar Senha *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Digite a senha novamente"
                        className="pl-10 pr-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-slate-600"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LGPD Consent Section */}
            <div className="space-y-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <h4 className="font-medium text-slate-900 text-sm">
                Consentimento para Tratamento de Dados (LGPD)
              </h4>

              <FormField
                control={form.control}
                name="lgpdConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#6366f1] data-[state=checked]:border-[#6366f1]"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs text-slate-700 font-normal cursor-pointer">
                        Autorizo o tratamento dos meus dados pessoais para prestação de serviços
                        médicos, conforme{" "}
                        <a href="/privacy" className="text-[#6366f1] hover:underline font-medium">
                          Política de Privacidade
                        </a>{" "}
                        e{" "}
                        <a href="/terms" className="text-[#6366f1] hover:underline font-medium">
                          Termos de Uso
                        </a>
                        . *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#6366f1] data-[state=checked]:border-[#6366f1]"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs text-slate-700 font-normal cursor-pointer">
                        Desejo receber comunicações sobre novos tratamentos, promoções e conteúdos
                        relacionados ao bem-estar e estética (opcional).
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {form.formState.errors.root && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium">
                  {form.formState.errors.root.message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#6366f1] hover:bg-[#5855eb] text-white font-medium shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando conta...</span>
                </div>
              ) : (
                "Criar Minha Conta"
              )}
            </Button>
          </form>
        </Form>

        {onSwitchToLogin && (
          <>
            <Separator className="bg-slate-200" />
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600">Já possui uma conta?</p>
              <Button
                variant="outline"
                onClick={onSwitchToLogin}
                className="w-full h-12 border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1] hover:text-white"
                disabled={isLoading}
              >
                Fazer Login
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
