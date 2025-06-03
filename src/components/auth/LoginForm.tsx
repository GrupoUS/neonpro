
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { toast } from 'sonner';
import { FormHeader } from './FormHeader';
import { PasswordInput } from './PasswordInput';
import { FormDivider } from './FormDivider';
import { GoogleSignInButton } from './GoogleSignInButton';
import { LoadingSpinner } from './LoadingSpinner';

type LoginFormProps = {
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  handleGoogleSignIn: () => void;
  onResetPassword: () => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  isLoading, 
  setIsLoading, 
  handleGoogleSignIn,
  onResetPassword 
}) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
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
      navigate('/');
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
    <div className="space-y-6">
      <FormHeader 
        title="Bem-vindo de volta"
        subtitle="Entre na sua conta NEON PRO"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
          
          <PasswordInput
            control={form.control}
            name="password"
            label="Senha"
            placeholder="••••••"
            showForgotPassword
            onForgotPassword={onResetPassword}
          />
          
          <Button 
            type="submit" 
            className="btn-neon-primary w-full h-12" 
            style={{ fontFamily: 'Inter, sans-serif' }}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : 'Entrar no NEON PRO'}
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
