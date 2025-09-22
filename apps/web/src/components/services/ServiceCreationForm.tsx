'use client';

import { useCreateService } from '@/hooks/useServices';
import { Button } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { Label } from '@neonpro/ui';
import { Textarea } from '@neonpro/ui';
import { Switch } from '@neonpro/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@neonpro/ui';
import { useState } from 'react';
import { toast } from 'sonner';

interface ServiceCreationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onServiceCreated?: (_service: {
    id: string;
    name: string;
    duration_minutes: number;
    price: number;
    is_active: boolean;
  }) => void;
}

interface ServiceFormData {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

interface ServiceFormErrors {
  name?: string;
  description?: string;
  duration_minutes?: string;
  price?: string;
}

export function ServiceCreationForm({
  open,
  onOpenChange,
  clinicId,
  onServiceCreated,
}: ServiceCreationFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    is_active: true,
  });

  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createServiceMutation = useCreateService();

  const validateForm = (): boolean => {
    const newErrors: ServiceFormErrors = {};

    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do serviço é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Duração deve ser maior que 0 minutos';
    } else if (formData.duration_minutes > 480) {
      newErrors.duration_minutes = 'Duração não pode ser maior que 8 horas (480 minutos)';
    }

    if (formData.price < 0) {
      newErrors.price = 'Preço não pode ser negativo';
    } else if (formData.price > 10000) {
      newErrors.price = 'Preço não pode ser maior que R$ 10.000,00';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof ServiceFormData,
    value: string | number | boolean,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof ServiceFormErrors]) {
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
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        duration_minutes: formData.duration_minutes,
        price: formData.price,
        is_active: formData.is_active,
        clinic_id: clinicId,
      };

      const response = await createServiceMutation.mutateAsync(serviceData);

      // Call the callback with the created service data
      if (response.success && response.data) {
        onServiceCreated?.({
          id: response.data.id,
          name: response.data.name,
          duration_minutes: response.data.duration_minutes,
          price: response.data.price,
          is_active: response.data.is_active,
        });
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        duration_minutes: 60,
        price: 0,
        is_active: true,
      });
      setErrors({});

      // Close dialog
      onOpenChange(false);

      toast.success('Serviço criado com sucesso!');
    } catch (_error) {
      console.error('Error creating _service:', error);
      toast.error('Erro ao criar serviço. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      is_active: true,
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5 text-primary' />
            Criar Novo Serviço
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do serviço para adicioná-lo ao sistema
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Settings className='h-4 w-4' />
              Informações Básicas
            </h4>

            <div className='grid grid-cols-1 gap-4'>
              <div>
                <Label htmlFor='serviceName'>Nome do Serviço *</Label>
                <Input
                  id='serviceName'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='Ex: Limpeza de Pele, Botox, Preenchimento...'
                  className={errors.name ? 'border-destructive' : ''}
                  aria-describedby={errors.name ? 'serviceName-error' : undefined}
                />
                {errors.name && (
                  <p
                    id='serviceName-error'
                    className='text-sm text-destructive mt-1'
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='serviceDescription'>Descrição</Label>
                <Textarea
                  id='serviceDescription'
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder='Descreva o serviço, procedimentos incluídos, benefícios...'
                  rows={3}
                  className={errors.description ? 'border-destructive' : ''}
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Detalhes do Serviço
            </h4>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='duration'>Duração (minutos) *</Label>
                <Input
                  id='duration'
                  type='number'
                  min='15'
                  max='480'
                  step='15'
                  value={formData.duration_minutes}
                  onChange={e =>
                    handleInputChange(
                      'duration_minutes',
                      parseInt(e.target.value) || 0,
                    )}
                  placeholder='60'
                  className={errors.duration_minutes ? 'border-destructive' : ''}
                  aria-describedby={errors.duration_minutes ? 'duration-error' : undefined}
                />
                {errors.duration_minutes && (
                  <p
                    id='duration-error'
                    className='text-sm text-destructive mt-1'
                  >
                    {errors.duration_minutes}
                  </p>
                )}
                <p className='text-xs text-muted-foreground mt-1'>
                  Duração em minutos (15 min - 8 horas)
                </p>
              </div>

              <div>
                <Label htmlFor='price'>Preço (R$) *</Label>
                <Input
                  id='price'
                  type='number'
                  min='0'
                  max='10000'
                  step='0.01'
                  value={formData.price}
                  onChange={e => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder='150.00'
                  className={errors.price ? 'border-destructive' : ''}
                  aria-describedby={errors.price ? 'price-error' : undefined}
                />
                {errors.price && (
                  <p id='price-error' className='text-sm text-destructive mt-1'>
                    {errors.price}
                  </p>
                )}
                <p className='text-xs text-muted-foreground mt-1'>
                  Preço em reais (R$ 0,00 - R$ 10.000,00)
                </p>
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Status do Serviço
            </h4>

            <div className='flex items-center space-x-2'>
              <Switch
                id='isActive'
                checked={formData.is_active}
                onCheckedChange={checked => handleInputChange('is_active', checked)}
              />
              <Label htmlFor='isActive' className='text-sm'>
                Serviço ativo (disponível para agendamento)
              </Label>
            </div>
            <p className='text-xs text-muted-foreground'>
              Serviços inativos não aparecerão na lista de agendamentos
            </p>
          </div>

          {/* Preview */}
          {formData.name && (
            <div className='space-y-4'>
              <h4 className='text-sm font-medium text-muted-foreground'>
                Pré-visualização
              </h4>
              <div className='p-4 border rounded-lg bg-muted/50'>
                <div className='flex justify-between items-start mb-2'>
                  <h5 className='font-medium'>{formData.name}</h5>
                  <span className='text-sm font-medium text-primary'>
                    {formData.price.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
                {formData.description && (
                  <p className='text-sm text-muted-foreground mb-2'>
                    {formData.description}
                  </p>
                )}
                <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                  <span className='flex items-center gap-1'>
                    <Clock className='h-3 w-3' />
                    {formData.duration_minutes} min
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      formData.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {formData.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Criar Serviço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
