'use client';

import { AlertCircle, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/auth-context';
import { toastHelpers } from '@/lib/toast-helpers';

// Tipos simplificados
interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  phone: string;
  clinicName: string;
  userType: 'admin' | 'professional' | 'receptionist';
  lgpdConsent: boolean;
  terms: boolean;
}

// Validação simplificada de CPF
const validateCPF = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/[^\d]/g, '');
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  
  return checkDigit === parseInt(cleanCpf.charAt(10));
};

// Formatação de CPF
const formatCPF = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '');
  if (cleanValue.length <= 11) {
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return value;
};

// Formatação de telefone
const formatPhone = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '');
  if (cleanValue.length <= 11) {
    return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const { signUp, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    phone: '',
    clinicName: '',
    userType: 'admin',
    lgpdConsent: false,
    terms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Formatação automática
    if (field === 'cpf' && typeof value === 'string') {
      const formatted = formatCPF(value);
      setFormData(prev => ({ ...prev, cpf: formatted }));
    }

    if (field === 'phone' && typeof value === 'string') {
      const formatted = formatPhone(value);
      setFormData(prev => ({ ...prev, phone: formatted }));
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};

    if (stepNumber === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Nome é obrigatório';
      if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
      if (!formData.password) newErrors.password = 'Senha é obrigatória';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }

    if (stepNumber === 2) {
      if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
      else if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
      if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
      if (!formData.clinicName.trim()) newErrors.clinicName = 'Nome da clínica é obrigatório';
    }

    if (stepNumber === 3) {
      if (!formData.lgpdConsent) newErrors.lgpdConsent = 'É obrigatório aceitar os termos LGPD';
      if (!formData.terms) newErrors.terms = 'É obrigatório aceitar os termos de uso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await signUp(formData.email, formData.password);

      if (error) {
        throw error;
      }

      if (data?.user) {
        toastHelpers.success.signup();
        router.push('/login?message=confirm-email');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
      toastHelpers.error.generic();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          placeholder="Seu nome completo"
          required
        />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="seu@email.com"
          required
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Digite sua senha"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirme sua senha"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          type="text"
          value={formData.cpf}
          onChange={(e) => handleInputChange('cpf', e.target.value)}
          placeholder="000.000.000-00"
          maxLength={14}
          required
        />
        {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="text"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="(11) 99999-9999"
          maxLength={15}
          required
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinicName">Nome da Clínica</Label>
        <Input
          id="clinicName"
          type="text"
          value={formData.clinicName}
          onChange={(e) => handleInputChange('clinicName', e.target.value)}
          placeholder="Nome da sua clínica"
          required
        />
        {errors.clinicName && <p className="text-sm text-red-500">{errors.clinicName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="userType">Tipo de Usuário</Label>
        <select
          id="userType"
          value={formData.userType}
          onChange={(e) => handleInputChange('userType', e.target.value as any)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2"
          required
        >
          <option value="admin">Administrador</option>
          <option value="professional">Profissional</option>
          <option value="receptionist">Recepcionista</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="lgpdConsent"
            checked={formData.lgpdConsent}
            onCheckedChange={(checked) => handleInputChange('lgpdConsent', !!checked)}
          />
          <div className="text-sm leading-5">
            <label htmlFor="lgpdConsent" className="cursor-pointer">
              Aceito os{' '}
              <a href="/privacy" className="text-primary underline" target="_blank">
                Termos de Privacidade LGPD
              </a>{' '}
              e autorizo o tratamento dos meus dados pessoais conforme a Lei 13.709/2018.
            </label>
            {errors.lgpdConsent && <p className="text-red-500 mt-1">{errors.lgpdConsent}</p>}
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={formData.terms}
            onCheckedChange={(checked) => handleInputChange('terms', !!checked)}
          />
          <div className="text-sm leading-5">
            <label htmlFor="terms" className="cursor-pointer">
              Aceito os{' '}
              <a href="/terms" className="text-primary underline" target="_blank">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="/compliance" className="text-primary underline" target="_blank">
                Diretrizes de Conformidade ANVISA/CFM
              </a>
              .
            </label>
            {errors.terms && <p className="text-red-500 mt-1">{errors.terms}</p>}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Conformidade Healthcare</p>
            <p>
              Ao criar sua conta, você confirma estar ciente das regulamentações ANVISA e CFM 
              aplicáveis às atividades de clínicas estéticas e procedimentos de saúde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2">
        {[1, 2, 3].map((stepNumber) => (
          <div
            key={stepNumber}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              stepNumber === step
                ? 'bg-primary text-primary-foreground'
                : stepNumber < step
                ? 'bg-green-600 text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {stepNumber < step ? <Check className="h-4 w-4" /> : stepNumber}
          </div>
        ))}
      </div>

      {/* Step Titles */}
      <div className="text-center">
        <h2 className="text-lg font-semibold">
          {step === 1 && 'Dados Pessoais'}
          {step === 2 && 'Dados Profissionais'}
          {step === 3 && 'Consentimentos'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Etapa {step} de 3
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <div className="flex justify-between">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              Voltar
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="ml-auto"
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="ml-auto"
            >
              {isSubmitting || loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Conta
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <a href="/login" className="text-primary underline hover:no-underline">
            Faça login
          </a>
        </p>
      </div>
    </div>
  );
}