"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';
import { toast } from 'sonner';

interface AccessibleFormProps {
  onSuccess?: () => void;
  mode?: 'login' | 'register' | 'reset';
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface AccessibilityState {
  announcements: string[];
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderActive: boolean;
}

export function AccessibleAuthForm({ onSuccess, mode = 'login' }: AccessibleFormProps) {
  const [formMode, setFormMode] = useState(mode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    announcements: [],
    highContrast: false,
    reducedMotion: false,
    screenReaderActive: false,
  });

  const supabase = createClient();

  // Detect screen reader and accessibility preferences
  useEffect(() => {
    const checkAccessibilityPreferences = () => {
      const hasScreenReader = window.navigator.userAgent.includes('NVDA') || 
                             window.navigator.userAgent.includes('JAWS') ||
                             'speechSynthesis' in window;
      
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

      setAccessibility(prev => ({
        ...prev,
        screenReaderActive: hasScreenReader,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    };

    checkAccessibilityPreferences();

    // Listen for changes in accessibility preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setAccessibility(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setAccessibility(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Announce messages to screen readers
  const announceToScreenReader = (message: string) => {
    setAccessibility(prev => ({
      ...prev,
      announcements: [...prev.announcements, message],
    }));

    // Clear announcement after it's been read
    setTimeout(() => {
      setAccessibility(prev => ({
        ...prev,
        announcements: prev.announcements.filter(a => a !== message),
      }));
    }, 3000);
  };

  // Validate form with accessibility-friendly error messages
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório para continuar';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Por favor, insira um email válido no formato usuario@dominio.com';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formMode === 'register' && formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres para segurança';
    }

    // Confirm password validation for registration
    if (formMode === 'register') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem. Por favor, verifique ambos os campos';
      }
    }

    setErrors(newErrors);

    // Announce errors to screen reader
    const errorCount = Object.keys(newErrors).length;
    if (errorCount > 0) {
      const errorMessage = `Formulário contém ${errorCount} erro${errorCount > 1 ? 's' : ''}. Por favor, corrija os campos destacados.`;
      announceToScreenReader(errorMessage);
    }

    return errorCount === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (formMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrors({ general: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.' });
            announceToScreenReader('Login falhou. Email ou senha incorretos.');
          } else {
            setErrors({ general: `Erro no login: ${error.message}` });
            announceToScreenReader('Erro no sistema. Tente novamente em alguns momentos.');
          }
          return;
        }

        announceToScreenReader('Login realizado com sucesso. Redirecionando...');
        toast.success('Login realizado com sucesso!');
        onSuccess?.();

      } else if (formMode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setErrors({ general: `Erro no cadastro: ${error.message}` });
          announceToScreenReader('Erro no cadastro. Tente novamente.');
          return;
        }

        announceToScreenReader('Cadastro realizado com sucesso. Verifique seu email para confirmação.');
        toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
        setFormMode('login');

      } else if (formMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);

        if (error) {
          setErrors({ general: `Erro ao enviar email: ${error.message}` });
          announceToScreenReader('Erro ao enviar email de recuperação.');
          return;
        }

        announceToScreenReader('Email de recuperação enviado com sucesso.');
        toast.success('Email de recuperação enviado!');
        setFormMode('login');
      }
    } catch (error) {
      setErrors({ general: 'Erro inesperado. Tente novamente.' });
      announceToScreenReader('Erro inesperado no sistema.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with real-time validation feedback
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Get form title and description based on mode
  const getFormContent = () => {
    switch (formMode) {
      case 'register':
        return {
          title: 'Criar nova conta',
          description: 'Preencha os dados para criar sua conta no NeonPro',
          submitText: 'Criar conta',
          switchText: 'Já tem uma conta? Faça login',
          switchAction: () => setFormMode('login'),
        };
      case 'reset':
        return {
          title: 'Recuperar senha',
          description: 'Digite seu email para receber instruções de recuperação',
          submitText: 'Enviar email',
          switchText: 'Lembrou da senha? Faça login',
          switchAction: () => setFormMode('login'),
        };
      default:
        return {
          title: 'Entrar na conta',
          description: 'Digite suas credenciais para acessar o NeonPro',
          submitText: 'Entrar',
          switchText: 'Não tem uma conta? Cadastre-se',
          switchAction: () => setFormMode('register'),
        };
    }
  };

  const formContent = getFormContent();

  return (
    <div 
      className={`w-full max-w-md mx-auto ${accessibility.highContrast ? 'high-contrast' : ''}`}
      data-testid="accessible-auth-form"
    >
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {accessibility.announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>

      <Card className="border-2 focus-within:border-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {formContent.title}
          </CardTitle>
          <CardDescription className="text-base">
            {formContent.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            {/* General error alert */}
            {errors.general && (
              <Alert variant="destructive" className="mb-4" role="alert">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Email field */}
            <div className="space-y-2 mb-4">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium"
              >
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : 'email-help'}
                placeholder="seu.email@exemplo.com"
                autoComplete="email"
                required
              />
              <div id="email-help" className="text-xs text-muted-foreground">
                Digite seu endereço de email válido
              </div>
              {errors.email && (
                <div 
                  id="email-error" 
                  className="text-xs text-red-600" 
                  role="alert"
                  aria-live="polite"
                >
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password field (not shown in reset mode) */}
            {formMode !== 'reset' && (
              <div className="space-y-2 mb-4">
                <Label 
                  htmlFor="password" 
                  className="text-sm font-medium"
                >
                  Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : 'password-help'}
                    placeholder={formMode === 'register' ? 'Mínimo 8 caracteres' : 'Digite sua senha'}
                    autoComplete={formMode === 'register' ? 'new-password' : 'current-password'}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                <div id="password-help" className="text-xs text-muted-foreground">
                  {formMode === 'register' 
                    ? 'Senha deve ter pelo menos 8 caracteres para segurança'
                    : 'Digite sua senha atual'
                  }
                </div>
                {errors.password && (
                  <div 
                    id="password-error" 
                    className="text-xs text-red-600" 
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.password}
                  </div>
                )}
              </div>
            )}

            {/* Confirm password field (only for registration) */}
            {formMode === 'register' && (
              <div className="space-y-2 mb-4">
                <Label 
                  htmlFor="confirmPassword" 
                  className="text-sm font-medium"
                >
                  Confirmar senha *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : 'confirm-password-help'}
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                <div id="confirm-password-help" className="text-xs text-muted-foreground">
                  Repita a senha para confirmação
                </div>
                {errors.confirmPassword && (
                  <div 
                    id="confirm-password-error" 
                    className="text-xs text-red-600" 
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full mb-4"
              disabled={isLoading}
              aria-describedby="submit-help"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>{formContent.submitText}</span>
                </>
              )}
            </Button>
            <div id="submit-help" className="sr-only">
              {isLoading ? 'Aguarde enquanto processamos sua solicitação' : `Clique para ${formContent.submitText.toLowerCase()}`}
            </div>

            {/* Mode switch */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={formContent.switchAction}
                className="text-sm"
                disabled={isLoading}
              >
                {formContent.switchText}
              </Button>
            </div>

            {/* Password reset link */}
            {formMode === 'login' && (
              <div className="text-center mt-2">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setFormMode('reset')}
                  className="text-sm text-muted-foreground"
                  disabled={isLoading}
                >
                  Esqueceu sua senha?
                </Button>
              </div>
            )}
          </form>

          {/* Accessibility features info */}
          {accessibility.screenReaderActive && (
            <div className="mt-4 p-2 bg-muted rounded text-xs">
              <p className="font-medium">Recursos de acessibilidade ativos:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Navegação por teclado completa</li>
                <li>Anúncios para leitores de tela</li>
                <li>Descrições detalhadas de campos</li>
                <li>Validação em tempo real</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
