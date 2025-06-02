
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
    } catch (error) {
      toast.error('Houve um problema ao enviar o email de recuperação. Verifique seu email e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-medium text-center">Recuperar Senha</h2>
      <p className="text-sm text-gray-500 text-center mb-4">
        Digite seu e-mail para receber um link para redefinir sua senha.
      </p>
      
      {resetSent ? (
        <div className="text-center space-y-4 py-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            Se existe uma conta com o e-mail informado, você receberá um link para redefinir sua senha.
          </p>
          <Button type="button" variant="outline" className="w-full mt-4" onClick={onCancel}>
            Voltar para Login
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="seu@email.com" 
                      {...field} 
                      className="transition-all focus:ring-gold focus:border-gold"
                      aria-label="Endereço de e-mail"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-2 flex flex-col gap-2">
              <Button 
                type="submit" 
                className="w-full bg-gold hover:bg-gold/90 transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  className="w-full transition-all" 
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
