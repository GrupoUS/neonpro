'use client';

import { useCreatePatient } from '@/hooks/usePatients';
import { Button } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { Label } from '@neonpro/ui';
import { Textarea } from '@neonpro/ui';
import {
  DialogFooter,
  SmoothDrawer as Dialog,
  SmoothDrawerContent as DialogContent,
  SmoothDrawerDescription as DialogDescription,
  SmoothDrawerHeader as DialogHeader,
  SmoothDrawerTitle as DialogTitle,
} from '@neonpro/ui';
import { CreditCard, FileText, Loader2, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PatientCreationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  initialName?: string;
  onPatientCreated?: (patient: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    cpf?: string;
  }) => void;
}

interface PatientFormData {
  fullName: string;
  phone: string;
  email: string;
  cpf: string;
  address: string;
  medicalNotes: string;
}

interface PatientFormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  cpf?: string;
  address?: string;
  medicalNotes?: string;
}

export function PatientCreationForm({
  open,
  onOpenChange,
  clinicId,
  initialName = '',
  onPatientCreated,
}: PatientCreationFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    fullName: initialName,
    phone: '',
    email: '',
    cpf: '',
    address: '',
    medicalNotes: '',
  });

  const [errors, setErrors] = useState<PatientFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPatientMutation = useCreatePatient();

  // CPF validation function
  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;

    // Check for repeated digits
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  };

  // Phone formatting function
  const formatPhone = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length <= 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // CPF formatting function
  const formatCPF = (cpf: string): string => {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validateForm = (): boolean => {
    const newErrors: PatientFormErrors = {};

    // Required field validations
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
      }
    }

    // Optional field validations
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (formData.cpf && !validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF deve ter um formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setIsSubmitting(true);

    try {
      const patientData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.replace(/\D/g, ''), // Store clean phone number
        email: formData.email.trim() || undefined,
        cpf: formData.cpf.replace(/\D/g, '') || undefined, // Store clean CPF
        // Note: address and medicalNotes might need to be added to the service
        // For now, we'll include them in a notes field or handle separately
      };

      const newPatient = await createPatientMutation.mutateAsync({
        data: patientData,
        clinicId,
      });

      // Call the callback with the created patient
      onPatientCreated?.(newPatient);

      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        cpf: '',
        address: '',
        medicalNotes: '',
      });
      setErrors({});

      // Close dialog
      onOpenChange(false);

      toast.success('Paciente criado com sucesso!');
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Erro ao criar paciente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: initialName,
      phone: '',
      email: '',
      cpf: '',
      address: '',
      medicalNotes: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5 text-primary' />
            Cadastrar Novo Paciente
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do paciente para criar um novo cadastro no sistema
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <User className='h-4 w-4' />
              Informações Básicas
            </h4>

            <div className='grid grid-cols-1 gap-4'>
              <div>
                <Label htmlFor='fullName'>Nome Completo *</Label>
                <Input
                  id='fullName'
                  value={formData.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  placeholder='Digite o nome completo do paciente'
                  className={errors.fullName ? 'border-destructive' : ''}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && (
                  <p id='fullName-error' className='text-sm text-destructive mt-1'>
                    {errors.fullName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Phone className='h-4 w-4' />
              Informações de Contato
            </h4>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='phone'>Telefone *</Label>
                <Input
                  id='phone'
                  value={formData.phone}
                  onChange={e => {
                    const formatted = formatPhone(e.target.value);
                    handleInputChange('phone', formatted);
                  }}
                  placeholder='(11) 99999-9999'
                  className={errors.phone ? 'border-destructive' : ''}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <p id='phone-error' className='text-sm text-destructive mt-1'>
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder='email@exemplo.com'
                  className={errors.email ? 'border-destructive' : ''}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id='email-error' className='text-sm text-destructive mt-1'>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Document and Address */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <CreditCard className='h-4 w-4' />
              Documentos e Endereço
            </h4>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='cpf'>CPF</Label>
                <Input
                  id='cpf'
                  value={formData.cpf}
                  onChange={e => {
                    const formatted = formatCPF(e.target.value);
                    handleInputChange('cpf', formatted);
                  }}
                  placeholder='000.000.000-00'
                  className={errors.cpf ? 'border-destructive' : ''}
                  aria-describedby={errors.cpf ? 'cpf-error' : undefined}
                />
                {errors.cpf && (
                  <p id='cpf-error' className='text-sm text-destructive mt-1'>
                    {errors.cpf}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='address'>Endereço</Label>
                <Input
                  id='address'
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  placeholder='Rua, número, bairro, cidade'
                  className={errors.address ? 'border-destructive' : ''}
                />
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Observações Médicas
            </h4>

            <div>
              <Label htmlFor='medicalNotes'>Observações</Label>
              <Textarea
                id='medicalNotes'
                value={formData.medicalNotes}
                onChange={e => handleInputChange('medicalNotes', e.target.value)}
                placeholder='Alergias, condições médicas, observações importantes...'
                rows={3}
                className={errors.medicalNotes ? 'border-destructive' : ''}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Criar Paciente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
