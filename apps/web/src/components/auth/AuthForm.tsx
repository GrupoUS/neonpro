import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Alert, AlertDescription } from "@neonpro/ui";
import { UniversalButton } from "@neonpro/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@neonpro/ui";
// Enhanced with permanent shine border effect and smooth animations
import { showToast } from "@/components/ui/toaster";
import {
  resetPassword,
  signInWithEmail,
  signInWithProvider,
  signUpWithEmail,
} from "@/integrations/supabase/client";
import {
  type AuthFormData,
  authFormSchema,
  emailSchema,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react"; // React import not needed with new JSX transform
import { useForm } from "react-hook-form";
import { z } from "zod";

export type AuthMode = "sign-in" | "sign-up" | "forgot";

export interface AuthFormProps {
  defaultMode?: AuthMode;
  onSuccessRedirectTo?: string; // defaults to /dashboard
}

const signInSchema = z.object({
  email: authFormSchema.shape.email,
  password: authFormSchema.shape.password,
});

const signUpSchema = authFormSchema.pick({
  firstname: true,
  lastname: true,
  email: true,
  password: true,
  crm: true,
});

export function AuthForm({
  defaultMode = "sign-in",
  onSuccessRedirectTo = "/dashboard",
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<AuthFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      crm: "",
    },
  });

  const forgotForm = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  const handleProvider = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await signInWithProvider("google", onSuccessRedirectTo);
      if (error) setError(error.message);
    } catch (e: any) {
      setError(e?.message ?? "Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSignIn = async (data: z.infer<typeof signInSchema>) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await signInWithEmail(
        data.email as string,
        data.password as string,
      );
      if (error) return setError(error.message);
      router.navigate({ to: onSuccessRedirectTo });
    } catch (e: any) {
      setError(e?.message ?? "Falha ao entrar");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSignUp = async (data: AuthFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await signUpWithEmail(
        data.email,
        data.password,
        onSuccessRedirectTo,
      );
      if (error) return setError(error.message);
      router.navigate({
        to: "/auth/confirm",
        search: { email: data.email } as any,
      });
    } catch (e: any) {
      setError(e?.message ?? "Falha ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitForgot = async (data: { email: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await resetPassword(data.email, onSuccessRedirectTo);
      if (error) return setError(error.message);
      showToast("Enviamos um link de recuperação para seu e-mail.", "success");
      setMode("sign-in");
    } catch (e: any) {
      setError(e?.message ?? "Falha ao solicitar recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="w-full max-w-md shadow-2xl border border-border/50 bg-card/95 backdrop-blur-sm"
      shineDuration={8}
      shineColor="#AC9469"
      borderWidth={1}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
        backdropFilter: "blur(10px)",
        borderImage: "linear-gradient(135deg, #AC9469, #112031, #294359) 1",
      }}
    >
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
          NEON PRO
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Sistema para Clínicas de Estética
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className="grid grid-cols-2 gap-2"
          role="tablist"
          aria-label="Escolher ação de autenticação"
        >
          <UniversalButton
            role="tab"
            aria-selected={mode === "sign-in"}
            variant={mode === "sign-in" ? "default" : "secondary"}
            size="lg"
            onClick={() => setMode("sign-in")}
            animations={{
              shineBorder: {
                enabled: mode === "sign-in",
                pattern: "linear",
                intensity: "vibrant",
                theme: "gold",
                speed: "normal",
                hoverOnly: true,
              },
            }}
            className="transition-all duration-300"
          >
            Entrar
          </UniversalButton>
          <UniversalButton
            role="tab"
            aria-selected={mode === "sign-up"}
            variant={mode === "sign-up" ? "default" : "secondary"}
            size="lg"
            onClick={() => setMode("sign-up")}
            animations={{
              shineBorder: {
                enabled: mode === "sign-up",
                pattern: "linear",
                intensity: "vibrant",
                theme: "gold",
                speed: "normal",
                hoverOnly: true,
              },
            }}
            className="transition-all duration-300"
          >
            Criar conta
          </UniversalButton>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {mode !== "forgot" && (
          <UniversalButton
            type="button"
            variant="secondary"
            size="lg"
            className="w-full h-12"
            onClick={handleProvider}
            disabled={isLoading}
            animations={{
              hoverBorderGradient: {
                enabled: true,
                intensity: "normal",
                direction: "radial",
                theme: "blue",
                speed: "normal",
                colors: ["#4285f4", "#34a853", "#fbbc05"],
              },
            }}
          >
            <IconBrandGoogle className="h-4 w-4 mr-2 text-[#4285f4]" />
            Continuar com Google
          </UniversalButton>
        )}

        {mode === "sign-in" && (
          <form
            className="space-y-4"
            onSubmit={signInForm.handleSubmit(onSubmitSignIn)}
            aria-label="Formulário de login"
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@clinica.com.br"
                {...signInForm.register("email")}
                aria-invalid={!!signInForm.formState.errors.email}
              />
              {signInForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signInForm.formState.errors.email.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...signInForm.register("password")}
                aria-invalid={!!signInForm.formState.errors.password}
              />
              {signInForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signInForm.formState.errors.password.message as string}
                </p>
              )}
            </div>
            <UniversalButton
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={isLoading || signInForm.formState.isSubmitting}
              animations={{
                shineBorder: {
                  enabled: !isLoading,
                  pattern: "pulse",
                  intensity: "vibrant",
                  theme: "gold",
                  speed: isLoading ? "fast" : "normal",
                  hoverOnly: false,
                },
              }}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </UniversalButton>
          </form>
        )}

        {mode === "sign-up" && (
          <form
            className="space-y-4"
            onSubmit={signUpForm.handleSubmit(onSubmitSignUp)}
            aria-label="Formulário de cadastro"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstname">Nome</Label>
                <Input
                  id="firstname"
                  type="text"
                  {...signUpForm.register("firstname")}
                  aria-invalid={!!signUpForm.formState.errors.firstname}
                />
                {signUpForm.formState.errors.firstname && (
                  <p className="text-xs text-destructive">
                    {signUpForm.formState.errors.firstname.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Sobrenome</Label>
                <Input
                  id="lastname"
                  type="text"
                  {...signUpForm.register("lastname")}
                  aria-invalid={!!signUpForm.formState.errors.lastname}
                />
                {signUpForm.formState.errors.lastname && (
                  <p className="text-xs text-destructive">
                    {signUpForm.formState.errors.lastname.message as string}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-signup">E-mail</Label>
              <Input
                id="email-signup"
                type="email"
                {...signUpForm.register("email")}
                aria-invalid={!!signUpForm.formState.errors.email}
              />
              {signUpForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.email.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signup">Senha</Label>
              <Input
                id="password-signup"
                type="password"
                {...signUpForm.register("password")}
                aria-invalid={!!signUpForm.formState.errors.password}
              />
              {signUpForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.password.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm">CRM (opcional)</Label>
              <Input
                id="crm"
                type="text"
                placeholder="CRM/SP 123456"
                {...signUpForm.register("crm")}
                aria-invalid={!!signUpForm.formState.errors.crm}
              />
              {signUpForm.formState.errors.crm && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.crm.message as string}
                </p>
              )}
            </div>
            <UniversalButton
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={isLoading || signUpForm.formState.isSubmitting}
              animations={{
                shineBorder: {
                  enabled: !isLoading,
                  pattern: "pulse",
                  intensity: "vibrant",
                  theme: "gold",
                  speed: isLoading ? "fast" : "normal",
                  hoverOnly: false,
                },
              }}
            >
              {isLoading ? "Criando..." : "Criar conta"}
            </UniversalButton>
          </form>
        )}

        {mode === "forgot" && (
          <form
            className="space-y-4"
            onSubmit={forgotForm.handleSubmit(onSubmitForgot)}
            aria-label="Recuperação de senha"
          >
            <div className="space-y-2">
              <Label htmlFor="email-forgot">E-mail</Label>
              <Input
                id="email-forgot"
                type="email"
                {...forgotForm.register("email")}
                aria-invalid={!!forgotForm.formState.errors.email}
              />
              {forgotForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {forgotForm.formState.errors.email.message as string}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <UniversalButton
                type="submit"
                variant="default"
                size="lg"
                className="flex-1"
                disabled={isLoading || forgotForm.formState.isSubmitting}
                animations={{
                  shineBorder: {
                    enabled: !isLoading,
                    pattern: "linear",
                    intensity: "normal",
                    theme: "gold",
                    speed: "normal",
                    hoverOnly: true,
                  },
                }}
              >
                {isLoading ? "Enviando..." : "Enviar link"}
              </UniversalButton>
              <UniversalButton
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setMode("sign-in")}
                aria-label="Voltar ao login"
                animations={{
                  hoverBorderGradient: {
                    enabled: true,
                    intensity: "subtle",
                    direction: "radial",
                    theme: "silver",
                    speed: "normal",
                  },
                }}
                className="px-3"
              >
                <ArrowLeft className="h-4 w-4" />
              </UniversalButton>
            </div>
          </form>
        )}

        {mode === "sign-in" && (
          <div className="text-center">
            <button
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:underline"
              onClick={() => setMode("forgot")}
            >
              Esqueceu sua senha?
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AuthForm;
