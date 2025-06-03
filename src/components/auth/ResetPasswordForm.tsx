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
  
  // Reset password form using the shared schema
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
      // Go back to login screen after reset request
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
      <div className="text-center mb-8">
        <h2 
          className="text-2xl font-bold text-sacha-dark-blue dark:text-sacha-gray-light mb-2"
          style={{ fontFamily: 'Optima, Arial, sans-serif' }}
        >
          Recuperar Senha
        </h2>
        <p 
          className="text-sacha-blue dark:text-sacha-gray-medium text-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Digite seu e-mail para receber um link para redefinir sua senha
        </p>
      </div>
      
      {resetSent ? (
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-sacha-gold/20 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sacha-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <h3 
              className="text-lg font-semibold text-sacha-dark-blue dark:text-sacha-gray-light"
              style={{ fontFamily: 'Optima, Arial, sans-serif' }}
            >
              Email Enviado!
            </h3>
            <p 
              className="text-sm text-sacha-blue dark:text-sacha-gray-medium max-w-md mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Se existe uma conta com o e-mail informado, você receberá um link para redefinir sua senha.
            </p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 bg-white/50 dark:bg-sacha-dark-blue/30 border-sacha-gold/30 dark:border-sacha-gold/40 text-sacha-dark-blue dark:text-sacha-gray-light hover:bg-sacha-gold/10 hover:border-sacha-gold transition-all duration-300 backdrop-blur-sm mt-6" 
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
                    className="text-sacha-dark-blue dark:text-sacha-gray-light font-medium"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    E-mail
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="h-12 bg-white/50 dark:bg-sacha-dark-blue/30 border-sacha-gold/30 dark:border-sacha-gold/40 text-sacha-dark-blue dark:text-sacha-gray-light placeholder:text-sacha-blue/60 dark:placeholder:text-sacha-gray-medium/60 focus:ring-2 focus:ring-sacha-gold focus:border-sacha-gold transition-all duration-300 backdrop-blur-sm" 
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      {...field} 
                      aria-label="Endereço de e-mail"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            
            <div className="pt-4 flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-sacha-gold to-sacha-gold/90 hover:from-sacha-gold/90 hover:to-sacha-gold text-sacha-dark-blue font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-sacha-gold/25 rounded-lg" 
                style={{ fontFamily: 'Inter, sans-serif' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-sacha-dark-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : 'Enviar Link de Recuperação'}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 bg-white/50 dark:bg-sacha-dark-blue/30 border-sacha-gold/30 dark:border-sacha-gold/40 text-sacha-dark-blue dark:text-sacha-gray-light hover:bg-sacha-gold/10 hover:border-sacha-gold transition-all duration-300 backdrop-blur-sm" 
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
