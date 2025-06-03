<<<<<<< Updated upstream

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
=======
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
>>>>>>> Stashed changes

interface LoginFormProps {
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleGoogleSignIn: () => Promise<void>;
  onResetPassword: () => void;
}

<<<<<<< Updated upstream
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
=======
const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, isLoading, setIsLoading, handleGoogleSignIn, onResetPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      onSuccess();
>>>>>>> Stashed changes
    }
    setIsLoading(false);
  };

<<<<<<< Updated upstream
  return (
    <div className="space-y-6">
      <FormHeader 
        title="Bem-vindo ao NEON PRO"
        subtitle="Entre na sua conta para continuar"
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
            showForgotPassword={true}
            onForgotPassword={onResetPassword}
          />
          
          <Button 
            type="submit" 
            className="btn-neon-primary w-full h-12 mt-6" 
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
=======
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Registration successful. Please check your email for confirmation.');
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Password reset email sent. Please check your inbox.');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border border-gray-300 rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border border-gray-300 rounded"
        required
      />
      <button type="submit" disabled={isLoading} className="p-2 bg-blue-500 text-white rounded">
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className="p-2 bg-red-500 text-white rounded">
        {isLoading ? 'Loading...' : 'Login with Google'}
      </button>
      <button type="button" onClick={onResetPassword} disabled={isLoading} className="text-blue-500 text-sm">
        Forgot Password?
      </button>
      {message && <p className="text-center text-sm">{message}</p>}
    </form>
>>>>>>> Stashed changes
  );
};

export default LoginForm;
