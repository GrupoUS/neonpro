
import React, { useState } from 'react';
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
import { resetPasswordSchema, ResetPasswordFormValues } from './schemas';
import { FormHeader } from './FormHeader';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from 'sonner';

type ResetPasswordFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  onSuccess, 
  onCancel,
  isLoading, 
  setIsLoading
}) => {
  const { resetPassword } = useAuth();
  const [resetSent, setResetSent] = useState(false);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      await resetPassword(values.email);
      setResetSent(true);
      toast.success('Email de recuperação enviado com sucesso!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      toast.error('Houve um problema ao enviar o email de recuperação. Verifique seu email e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormHeader 
        title="Recuperar Senha"
        subtitle="Digite seu e-mail para receber um link para redefinir sua senha"
      />
      
      {resetSent ? (
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/20 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <h3 
              className="text-lg font-semibold text-foreground"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Email Enviado!
            </h3>
            <p 
              className="text-sm text-muted-foreground max-w-md mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Se existe uma conta com o e-mail informado, você receberá um link para redefinir sua senha.
            </p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 bg-card hover:bg-accent/10 border-border text-foreground hover:text-accent transition-all duration-300 mt-6" 
            style={{ fontFamily: 'Inter, sans-serif' }}
            onClick={onCancel}
          >
            Voltar para Login
          </Button>
        </div>
      ) : (
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
            
            <div className="pt-4 flex flex-col gap-3">
              <Button 
                type="submit" 
                className="btn-neon-primary w-full h-12" 
                style={{ fontFamily: 'Inter, sans-serif' }}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : 'Enviar Link de Recuperação'}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 bg-card hover:bg-accent/10 border-border text-foreground hover:text-accent transition-all duration-300" 
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  onClick={onCancel} 
                  disabled={isLoading}
                >
                  Voltar para Login
                </Button>
              )}
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
