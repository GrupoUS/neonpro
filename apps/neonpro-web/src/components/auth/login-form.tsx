"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type { Eye, EyeOff, Heart, Lock, Mail, User, X } from "lucide-react";
import type { useRouter } from "next/navigation";
import type { useState } from "react";
import type { useForm } from "react-hook-form";
import type { z } from "zod";
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
import type { Separator } from "@/components/ui/separator";
import type { useAuth } from "@/contexts/auth-context";

const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  type: "professional" | "patient";
  onSwitchToRegister?: () => void;
  onClose?: () => void;
}

export function LoginForm({ type, onSwitchToRegister, onClose }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const { data: authData, error } = await signIn(data.email, data.password);

      if (error) {
        form.setError("root", {
          type: "manual",
          message: "Email ou senha incorretos. Tente novamente.",
        });
        return;
      }

      if (authData?.user) {
        // Role-based routing
        const userRole = authData.user.user_metadata?.role || "patient";

        if (type === "professional" && userRole !== "patient") {
          router.push("/dashboard");
        } else if (type === "patient" && userRole === "patient") {
          router.push("/patient-portal");
        } else {
          // Mismatch between expected type and actual role
          form.setError("root", {
            type: "manual",
            message: "Tipo de acesso incorreto. Verifique se está usando o login correto.",
          });
          return;
        }

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
                {type === "professional" ? "Acesso Profissional" : "Portal do Paciente"}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Entre com suas credenciais para acessar o sistema
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
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
                  <span>Entrando...</span>
                </div>
              ) : (
                `Entrar ${type === "professional" ? "no Sistema" : "no Portal"}`
              )}
            </Button>
          </form>
        </Form>

        {type === "patient" && onSwitchToRegister && (
          <>
            <Separator className="bg-slate-200" />
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600">Primeira vez no NeonPro?</p>
              <Button
                variant="outline"
                onClick={onSwitchToRegister}
                className="w-full h-12 border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1] hover:text-white"
                disabled={isLoading}
              >
                <User className="h-4 w-4 mr-2" />
                Criar Conta de Paciente
              </Button>
            </div>
          </>
        )}

        <div className="text-center">
          <a
            href="/forgot-password"
            className="text-sm text-[#6366f1] hover:text-[#5855eb] font-medium underline-offset-4 hover:underline"
          >
            Esqueceu sua senha?
          </a>
        </div>

        {/* LGPD Compliance Notice */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-xs text-slate-600 leading-relaxed">
            Ao fazer login, você concorda com nossos{" "}
            <a href="/terms" className="text-[#6366f1] hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="/privacy" className="text-[#6366f1] hover:underline">
              Política de Privacidade
            </a>
            . Todos os dados são protegidos conforme a LGPD.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
