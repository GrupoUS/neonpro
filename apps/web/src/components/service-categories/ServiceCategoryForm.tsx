/**
 * Service Category Form Component
 * Form for creating and editing service categories
 */

import { useCreateServiceCategory, useUpdateServiceCategory } from '@/hooks/useServiceCategories';
import type { ServiceCategory } from '@/types/service-categories';
import { SERVICE_CATEGORY_COLORS } from '@/types/service-categories';
import { Button } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { Label } from '@neonpro/ui';
import { Textarea } from '@neonpro/ui';
import { Switch } from '@neonpro/ui';
import React, { useState } from 'react';

interface ServiceCategoryFormProps {
  category?: ServiceCategory;
  clinicId: string;
  onSuccess: () => void;
}

export function ServiceCategoryForm({
  category,
  clinicId,
  onSuccess,
}: ServiceCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#3b82f6',
    is_active: category?.is_active !== undefined ? category.is_active : true,
  });

  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory();

  const isEditing = !!category;
  const isLoading = createCategory.isPending || updateCategory.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateCategory.mutateAsync({
          id: category.id,
          ...formData,
        });
      } else {
        await createCategory.mutateAsync({
          ...formData,
          clinic_id: clinicId,
        });
      }
      onSuccess();
    } catch (error) {
      // Error is handled by the hooks
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const colorOptions = Object.values(SERVICE_CATEGORY_COLORS);

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nome da Categoria *</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={e => handleInputChange('name', e.target.value)}
          placeholder='Ex: Tratamentos Faciais'
          required
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>Descrição</Label>
        <Textarea
          id='description'
          value={formData.description}
          onChange={e => handleInputChange('description', e.target.value)}
          placeholder='Descreva o tipo de serviços desta categoria...'
          rows={3}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='color'>Cor da Categoria</Label>
        <div className='flex items-center gap-2'>
          <Input
            id='color'
            type='color'
            value={formData.color}
            onChange={e => handleInputChange('color', e.target.value)}
            className='w-16 h-10 p-1 border rounded'
          />
          <div className='flex gap-1'>
            {colorOptions.map(color => (
              <button
                key={color}
                type='button'
                className='w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform'
                style={{ backgroundColor: color }}
                onClick={() => handleInputChange('color', color)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Switch
          id='is_active'
          checked={formData.is_active}
          onCheckedChange={checked => handleInputChange('is_active', checked)}
        />
        <Label htmlFor='is_active'>Categoria ativa</Label>
      </div>

      <div className='flex justify-end gap-2 pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onSuccess}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type='submit' disabled={isLoading || !formData.name.trim()}>
          {isLoading
            ? isEditing
              ? 'Salvando...'
              : 'Criando...'
            : isEditing
            ? 'Salvar Alterações'
            : 'Criar Categoria'}
        </Button>
      </div>
    </form>
  );
}
