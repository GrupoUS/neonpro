/**
 * Service Form Component
 * Form for creating and editing services with validation
 */

import { Button } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { Label } from '@neonpro/ui';
import { Textarea } from '@neonpro/ui';
import { Switch } from '@neonpro/ui';
import { Card } from '@neonpro/ui';
import { TimeSlotPicker } from '@neonpro/ui';
import { formatBRL, maskBRLInput } from '@neonpro/utils';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useCreateService, useUpdateService } from '@/hooks/useServices';
import type { Service } from '@/types/service';
import {
  HealthcareDataSensitivity,
  validateHealthcareFormData,
} from '@/utils/healthcare-form-validation';
import { toast } from 'sonner';

interface ServiceFormProps {
  _service?: Service; // If provided, form is in edit mode
  onSuccess: () => void;
  clinicId: string;
}

export function ServiceForm({
  service,
  onSuccess,
  clinicId,
}: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: service?.name || '',
    description: service?.description || '',
    duration_minutes: service?.duration_minutes || 60,
    price: service?.price || 0,
    is_active: service?.is_active ?? true,
  });

  // Local input state for formatted BRL price entry
  const [priceInput, setPriceInput] = useState<string>(
    formatBRL(service?.price ?? 0),
  );

  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  const isEditMode = !!service;

  // Update form data and formatted price when service prop changes
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes,
        price: service.price,
        is_active: service.is_active,
      });
      setPriceInput(formatBRL(service.price));
    } else {
      setPriceInput(formatBRL(0));
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

    // Price validation with healthcare compliance
    if (formData.price < 0) {
      newErrors.price = 'Preço não pode ser negativo';
    }

    // Healthcare compliance validation
    const healthcareValidation = validateHealthcareFormData({
      serviceName: formData.name,
      serviceDescription: formData.description,
      servicePrice: formData.price,
      serviceDuration: formData.duration_minutes,
      dataSensitivity: HealthcareDataSensitivity.LOW,
    });

    if (!healthcareValidation.isValid) {
      // Merge healthcare validation errors
      Object.assign(newErrors, healthcareValidation.errors);
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
      if (isEditMode && _service) {
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
    } catch (_error) {
      console.error('Error saving _service:', error);
      toast.error(
        isEditMode ? 'Erro ao atualizar serviço' : 'Erro ao criar serviço',
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

  // Price input handler: keep numeric value in state and formatted BRL string for UX
  const handlePriceChange = (raw: any) => {
    const { formatted, value } = maskBRLInput(raw);
    setPriceInput(formatted);
    handleInputChange('price', value);
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
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder='Ex: Consulta Médica, Exame de Sangue...'
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className='text-sm text-destructive'>{errors.name}</p>}
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Descrição</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder='Descreva o serviço oferecido...'
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className='text-sm text-destructive'>{errors.description}</p>}
          </div>

          {/* Duration and Price Row */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Duration */}
            <div className='space-y-2'>
              <Label htmlFor='duration'>
                Duração <span className='text-destructive'>*</span>
              </Label>
              <TimeSlotPicker
                id='duration'
                value={formData.duration_minutes}
                onChange={m => handleInputChange('duration_minutes', m)}
                min={15}
                max={480}
                step={15}
                aria-describedby={errors.duration_minutes ? 'duration-error' : undefined}
              />
              {errors.duration_minutes && (
                <p id='duration-error' className='text-sm text-destructive'>
                  {errors.duration_minutes}
                </p>
              )}
              <p className='text-xs text-muted-foreground'>
                Duração em múltiplos de 15 minutos (15 a 480)
              </p>
            </div>

            {/* Price */}
            <div className='space-y-2'>
              <Label htmlFor='price'>Preço (R$)</Label>
              {/* Text input with BRL mask/formatting */}
              <Input
                id='price'
                type='text'
                inputMode='numeric'
                value={priceInput}
                onChange={e => handlePriceChange(e.target.value)}
                placeholder='R$ 0,00'
                className={errors.price ? 'border-destructive' : ''}
                aria-describedby={errors.price ? 'price-error' : undefined}
              />
              {errors.price && (
                <p id='price-error' className='text-sm text-destructive'>
                  {errors.price}
                </p>
              )}
              <p className='text-xs text-muted-foreground'>
                Digite apenas números. Ex.: "1500" → "R$ 1.500,00"
              </p>
            </div>
          </div>

          {/* Active Status */}
          <div className='flex items-center space-x-2'>
            <Switch
              id='is_active'
              checked={formData.is_active}
              onCheckedChange={checked => handleInputChange('is_active', checked)}
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
            <Button type='submit' disabled={isSubmitting} className='gap-2'>
              {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
              {isEditMode ? 'Atualizar Serviço' : 'Criar Serviço'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
