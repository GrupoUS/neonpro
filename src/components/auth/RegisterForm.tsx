
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { registerSchema, RegisterFormValues } from './schemas';
import { toast } from 'sonner';

type RegisterFormProps = {
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  handleGoogleSignIn: () => void;
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSuccess, 
  isLoading, 
  setIsLoading, 
  handleGoogleSignIn 
}) => {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Register form using the shared schema
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.fullName);
      // Navigate to login tab after successful registration
      toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.");
      onSuccess();
    } catch (error: unknown) {
      console.error("Signup error:", error);
      // Most errors are handled in AuthContext, but we'll add some additional UX here
      if (!navigator.onLine) {
        toast.error("Verifique sua conexão com a internet e tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 
          className="text-2xl font-bold text-foreground mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Junte-se ao NEON PRO
        </h2>
        <p 
          className="text-muted-foreground text-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Crie sua conta e transforme sua clínica
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel 
                  className="text-foreground font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Nome Completo
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="João da Silva" 
                    className="input-neon" 
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    {...field} 
                    aria-label="Nome completo"
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel 
                  className="text-foreground font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  E-mail
                </FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="input-neon" 
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    {...field} 
                    aria-label="Endereço de e-mail"
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel 
                  className="text-foreground font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Senha
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••" 
                      className="input-neon pr-12" 
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      {...field} 
                      aria-label="Senha"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent focus:outline-none transition-colors duration-300"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOffIcon size={20} />
                      ) : (
                        <EyeIcon size={20} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel 
                  className="text-foreground font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Confirmar Senha
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••" 
                      className="input-neon pr-12" 
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      {...field} 
                      aria-label="Confirmar senha"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent focus:outline-none transition-colors duration-300"
                      onClick={toggleConfirmPasswordVisibility}
                      aria-label={showConfirmPassword ? "Esconder confirmação de senha" : "Mostrar confirmação de senha"}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon size={20} />
                      ) : (
                        <EyeIcon size={20} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="btn-neon-primary w-full h-12 mt-6" 
            style={{ fontFamily: 'Inter, sans-serif' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cadastrando...
              </span>
            ) : 'Criar Conta NEON PRO'}
          </Button>
        </form>
      </Form>
      
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span 
            className="bg-background px-4 text-muted-foreground"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Ou continue com
          </span>
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full h-12 bg-card hover:bg-accent/10 border-border text-foreground hover:text-accent transition-all duration-300"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-3" />
        Continuar com Google
      </Button>
    </div>
  );
};
