/**
 * Appointment Template Selector Component
 * Allows users to select from pre-configured appointment templates
 */

import {
  useAppointmentTemplates,
  useDefaultAppointmentTemplates,
} from '@/hooks/useAppointmentTemplates';
import {
  APPOINTMENT_TEMPLATE_CATEGORY_COLORS,
  APPOINTMENT_TEMPLATE_CATEGORY_LABELS,
  type AppointmentTemplate,
  type AppointmentTemplateCategory,
} from '@/types/appointment-templates';
import { cn } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import { formatBRL } from '@neonpro/utils';
import { Clock } from 'lucide-react';
import React, { useState } from 'react';

interface AppointmentTemplateSelectorProps {
  clinicId?: string;
  onSelectTemplate: (template: AppointmentTemplate) => void;
  selectedTemplateId?: string;
  className?: string;
}

export function AppointmentTemplateSelector({
  clinicId,
  onSelectTemplate,
  selectedTemplateId,
  className,
}: AppointmentTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    AppointmentTemplateCategory | 'all'
  >('all');

  const { data: allTemplates, isLoading } = useAppointmentTemplates({
    clinicId,
    isActive: true,
  });
  const { data: defaultTemplates } = useDefaultAppointmentTemplates(clinicId);

  // Filter templates based on search and category
  const filteredTemplates = React.useMemo(() => {
    if (!allTemplates) return [];

    let filtered = allTemplates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        template => template.category === selectedCategory,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        template =>
          template.name.toLowerCase().includes(query)
          || template.description?.toLowerCase().includes(query)
          || template.serviceName.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [allTemplates, selectedCategory, searchQuery]);

  // Get unique categories from templates
  const categories = React.useMemo(() => {
    if (!allTemplates) return [];
    const uniqueCategories = [...new Set(allTemplates.map(t => t.category))];
    return uniqueCategories.sort();
  }, [allTemplates]);

  const formatPrice = (_price: any) => {
    return formatBRL(price);
  };

  const formatDuration = (_minutes: any) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        <Input
          placeholder='Buscar templates...'
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Category switcher */}
      <div className='grid w-full grid-cols-4 lg:grid-cols-8 gap-2'>
        <Button
          type='button'
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          Todos
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            type='button'
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
          >
            {APPOINTMENT_TEMPLATE_CATEGORY_LABELS[category]}
          </Button>
        ))}
      </div>

      <div className='mt-4'>
        <ScrollArea className='h-[400px]'>
          <div className='grid gap-3'>
            {/* Default Templates Section */}
            {selectedCategory === 'all'
              && defaultTemplates
              && defaultTemplates.length > 0 && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Star className='h-4 w-4 text-yellow-500' />
                  <h3 className='text-sm font-medium'>
                    Templates Recomendados
                  </h3>
                </div>
                <div className='grid gap-2'>
                  {defaultTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplateId === template.id}
                      onSelect={() => onSelectTemplate(template)}
                      formatPrice={formatPrice}
                      formatDuration={formatDuration}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            <div className='space-y-2'>
              {selectedCategory === 'all' && (
                <h3 className='text-sm font-medium'>Todos os Templates</h3>
              )}
              <div className='grid gap-2'>
                {filteredTemplates.length > 0
                  ? (
                    filteredTemplates.map(template => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplateId === template.id}
                        onSelect={() => onSelectTemplate(template)}
                        formatPrice={formatPrice}
                        formatDuration={formatDuration}
                      />
                    ))
                  )
                  : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <p>Nenhum template encontrado</p>
                      {searchQuery && <p className='text-sm'>Tente ajustar sua busca</p>}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: AppointmentTemplate;
  isSelected: boolean;
  onSelect: () => void;
  formatPrice: (price: number) => string;
  formatDuration: (minutes: number) => string;
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  formatPrice,
  formatDuration,
}: TemplateCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
      )}
      onClick={onSelect}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 space-y-2'>
            <div className='flex items-center gap-2'>
              <h4 className='font-medium'>{template.name}</h4>
              <Badge
                variant='secondary'
                style={{
                  backgroundColor: `${APPOINTMENT_TEMPLATE_CATEGORY_COLORS[template.category]}20`,
                  color: APPOINTMENT_TEMPLATE_CATEGORY_COLORS[template.category],
                }}
              >
                {APPOINTMENT_TEMPLATE_CATEGORY_LABELS[template.category]}
              </Badge>
              {template.isDefault && (
                <Badge
                  variant='outline'
                  className='text-yellow-600 border-yellow-600'
                >
                  <Star className='h-3 w-3 mr-1' />
                  Recomendado
                </Badge>
              )}
            </div>

            {template.description && (
              <p className='text-sm text-muted-foreground'>
                {template.description}
              </p>
            )}

            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {formatDuration(template.duration)}
              </div>
              <div className='flex items-center gap-1'>
                <DollarSign className='h-3 w-3' />
                {formatPrice(template.price)}
              </div>
            </div>
          </div>

          <Button
            variant={isSelected ? 'default' : 'outline'}
            size='sm'
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected ? 'Selecionado' : 'Selecionar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
