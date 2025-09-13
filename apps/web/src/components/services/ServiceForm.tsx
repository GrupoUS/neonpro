/**
 * Service Form Component
 * Form for creating and editing services with validation
 */

import { useState, useEffect } from 'react';
import { Button } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { Label } from '@neonpro/ui';
import { Textarea } from '@neonpro/ui';
import { Switch } from '@neonpro/ui';
import { Card, CardContent } from '@neonpro/ui';
import { Loader2 } from 'lucide-react';

import { useCreateService, useUpdateService } from '@/hooks/useServices';
import type { Service, ServiceFormData, ServiceFormErrors } from '@/types/service';
import { toast } from 'sonner';

interface ServiceFormProps {
  service?: Service; // If provided, form is in edit mode
  onSuccess: () => void;
  clinicId: string;
}

export function ServiceForm({ service, onSuccess, clinicId }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: service?.name || '',
    description: service?.description || '',
    duration_minutes: service?.duration_minutes || 60,
    price: service?.price || 0,
    is_active: service?.is_active ?? true,
  });

  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  const isEditMode = !!service;

  // Update form data when service prop changes
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes,
        price: service.price,
        is_active: service.is_active,
      });
    }
  }, [service]);

  const validateForm = (): boolean => {
    const newErrors: ServiceFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do serviço é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Duration validation
    if (!formData.duration_minutes || formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Duração deve ser maior que 0';
    } else if (formData.duration_minutes > 480) {
      newErrors.duration_minutes = 'Duração não pode ser maior que 8 horas (480 minutos)';
    }

    // Price validation
    if (formData.price < 0) {
      newErrors.price = 'Preço não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && service) {
        // Update existing service
        await updateServiceMutation.mutateAsync({
          id: service.id,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          duration_minutes: formData.duration_minutes,
          price: formData.price,
          is_active: formData.is_active,
        });
        toast.success('Serviço atualizado com sucesso!');
      } else {
        // Create new service
        await createServiceMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          duration_minutes: formData.duration_minutes,
          price: formData.price,
          is_active: formData.is_active,
          clinic_id: clinicId,
        });
        toast.success('Serviço criado com sucesso!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(
        isEditMode ? 'Erro ao atualizar serviço' : 'Erro ao criar serviço'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card>
      <CardContent className='pt-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Service Name */}
          <div className='space-y-2'>
            <Label htmlFor='name'>
              Nome do Serviço <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder='Ex: Consulta Médica, Exame de Sangue...'
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className='text-sm text-destructive'>{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Descrição</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder='Descreva o serviço oferecido...'
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className='text-sm text-destructive'>{errors.description}</p>
            )}
          </div>

          {/* Duration and Price Row */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Duration */}
            <div className='space-y-2'>
              <Label htmlFor='duration'>
                Duração (minutos) <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='duration'
                type='number'
                min='1'
                max='480'
                step='15'
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 0)}
                placeholder='60'
                className={errors.duration_minutes ? 'border-destructive' : ''}
              />
              {errors.duration_minutes && (
                <p className='text-sm text-destructive'>{errors.duration_minutes}</p>
              )}
              <p className='text-xs text-muted-foreground'>
                Duração padrão em minutos (ex: 30, 60, 90)
              </p>
            </div>

            {/* Price */}
            <div className='space-y-2'>
              <Label htmlFor='price'>Preço (R$)</Label>
              <Input
                id='price'
                type='number'
                min='0'
                step='0.01'
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder='0.00'
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && (
                <p className='text-sm text-destructive'>{errors.price}</p>
              )}
              <p className='text-xs text-muted-foreground'>
                Valor do serviço em reais
              </p>
            </div>
          </div>

          {/* Active Status */}
          <div className='flex items-center space-x-2'>
            <Switch
              id='is_active'
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor='is_active' className='text-sm font-medium'>
              Serviço ativo
            </Label>
          </div>
          <p className='text-xs text-muted-foreground'>
            Serviços inativos não aparecerão na lista de agendamentos
          </p>

          {/* Form Actions */}
          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onSuccess}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='gap-2'
            >
              {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
              {isEditMode ? 'Atualizar Serviço' : 'Criar Serviço'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
