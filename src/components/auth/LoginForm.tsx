
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { loginSchema, LoginFormValues } from './schemas';
import { FormHeader } from './FormHeader';
import { FormDivider } from './FormDivider';
import { GoogleSignInButton } from './GoogleSignInButton';
import { PasswordInput } from './PasswordInput';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from 'sonner';

interface LoginFormProps {
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleGoogleSignIn: () => Promise<void>;
  onResetPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  isLoading, 
  setIsLoading, 
  handleGoogleSignIn,
  onResetPassword
}) => {
  const { signIn } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      onSuccess();
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (!navigator.onLine) {
        toast.error("Verifique sua conexão com a internet e tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <FormHeader 
        title="Bem-vindo ao NEON PRO"
        subtitle="Entre na sua conta para continuar"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel 
                  className="text-foreground font-medium text-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  E-mail
                </FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="input-neon h-12 text-base" 
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    {...field} 
                    aria-label="Endereço de e-mail"
                  />
                </FormControl>
                <FormMessage className="text-destructive text-sm" />
              </FormItem>
            )}
          />
          
          <PasswordInput
            control={form.control}
            name="password"
            label="Senha"
            placeholder="••••••••"
            showForgotPassword={true}
            onForgotPassword={onResetPassword}
          />
          
          <Button 
            type="submit" 
            className="btn-neon-primary w-full h-12 mt-8 text-base font-semibold" 
            style={{ fontFamily: 'Inter, sans-serif' }}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner text="Entrando..." /> : 'Entrar no NEON PRO'}
          </Button>
        </form>
      </Form>
      
      <FormDivider text="Ou continue com" />
      
      <GoogleSignInButton
        onClick={handleGoogleSignIn}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LoginForm;
