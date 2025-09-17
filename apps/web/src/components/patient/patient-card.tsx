/**
 * Patient Card Component (T056)
 * Mobile-optimized patient card with Brazilian healthcare compliance
 *
 * Features:
 * - Mobile-first responsive design with touch interactions
 * - Brazilian data display (CPF masking, phone formatting)
 * - LGPD compliant data rendering with consent awareness
 * - Performance optimization for mobile devices (<500ms load time)
 * - Accessibility compliance (WCAG 2.1 AA+) with ARIA labels
 * - Integration with Patient Management API endpoints (T043-T050)
 */

'use client';

import { useNavigate } from '@tanstack/react-router';
import {
  Calendar,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  ShieldX,
  Stethoscope,
  User,
  UserCheck,
} from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { formatCEP } from '@/utils/brazilian-formatters';
import { Patient } from '@neonpro/shared/types/patient';
import { cn } from '@neonpro/ui';
import { formatBRPhone, formatCPF } from '@neonpro/utils';

export interface PatientCardProps {
  /** Patient data */
  patient: Patient;
  /** Card variant for different contexts */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show actions (view, edit, delete) */
  showActions?: boolean;
  /** LGPD consent status affects data display */
  lgpdConsent?: {
    canShowFullData: boolean;
    canShowSensitiveData: boolean;
    consentLevel: 'basic' | 'full' | 'restricted';
  };
  /** Mobile optimization settings */
  mobileOptimized?: boolean;
  /** Click handler for card interaction */
  onClick?: (patient: Patient) => void;
  /** Action handlers */
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Accessibility label override */
  ariaLabel?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * PatientCard - Mobile-optimized patient card component
 * Displays patient information with Brazilian healthcare compliance
 */
export const PatientCard = memo<PatientCardProps>(({
  patient,
  variant = 'default',
  showActions = true,
  lgpdConsent = {
    canShowFullData: true,
    canShowSensitiveData: false,
    consentLevel: 'basic',
  },
  mobileOptimized = true,
  onClick,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  error = null,
  ariaLabel,
  testId = 'patient-card',
}) => {
  const navigate = useNavigate();

  // Handle card click navigation
  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick(patient);
    } else if (onView) {
      onView(patient);
    } else {
      // Default navigation to patient profile
      navigate({
        to: '/patients/$patientId',
        params: { patientId: patient.id },
      });
    }
  }, [onClick, onView, patient, navigate]);

  // Handle action buttons
  const handleView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(patient);
    } else {
      navigate({
        to: '/patients/$patientId',
        params: { patientId: patient.id },
      });
    }
  }, [onView, patient, navigate]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(patient);
    } else {
      navigate({
        to: '/patients/$patientId/edit',
        params: { patientId: patient.id },
      });
    }
  }, [onEdit, patient, navigate]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(patient);
    }
  }, [onDelete, patient]);

  // Format patient data based on LGPD consent
  const displayData = useMemo(() => {
    const { canShowFullData, canShowSensitiveData } = lgpdConsent;

    return {
      name: canShowFullData
        ? patient.name
        : patient.name?.split(' ')[0] || 'Paciente',
      cpf: canShowSensitiveData ? formatCPF(patient.cpf) : '***.***.***-**',
      phone: canShowFullData && patient.phone
        ? formatBRPhone(patient.phone)
        : canShowFullData
        ? 'Não informado'
        : '(**) ****-****',
      email: canShowFullData && patient.email
        ? patient.email
        : canShowFullData
        ? 'Não informado'
        : '***@***.***',
      address: canShowFullData && patient.address
        ? `${patient.address.street}, ${patient.address.number} - ${patient.address.neighborhood}`
        : canShowFullData
        ? 'Não informado'
        : 'Endereço restrito',
      cep: canShowFullData && patient.address?.cep
        ? formatCEP(patient.address.cep)
        : '****-***',
    };
  }, [patient, lgpdConsent]);

  // Get patient status badge
  const statusBadge = useMemo(() => {
    const status = patient.status || 'active';
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const, icon: UserCheck },
      inactive: { label: 'Inativo', variant: 'secondary' as const, icon: User },
      suspended: { label: 'Suspenso', variant: 'destructive' as const, icon: ShieldX },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className='flex items-center gap-1'>
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    );
  }, [patient.status]);

  // Get LGPD consent badge
  const lgpdBadge = useMemo(() => {
    const { consentLevel } = lgpdConsent;
    const consentConfig = {
      full: { label: 'Consentimento Completo', variant: 'default' as const, icon: ShieldCheck },
      basic: { label: 'Consentimento Básico', variant: 'secondary' as const, icon: Shield },
      restricted: { label: 'Acesso Restrito', variant: 'destructive' as const, icon: ShieldX },
    };

    const config = consentConfig[consentLevel];
    const Icon = config.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={config.variant} className='flex items-center gap-1'>
              <Icon className='h-3 w-3' />
              LGPD
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }, [lgpdConsent]);

  // Card classes based on variant and mobile optimization
  const cardClasses = cn(
    'group cursor-pointer transition-all duration-200 hover:shadow-md',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    {
      'h-auto': variant === 'compact',
      'min-h-[200px]': variant === 'default',
      'min-h-[300px]': variant === 'detailed',
      // Mobile optimizations
      'touch-manipulation': mobileOptimized,
      'active:scale-[0.98]': mobileOptimized,
      'hover:scale-[1.02]': !mobileOptimized,
    },
  );

  if (isLoading) {
    return (
      <Card className={cn(cardClasses, 'animate-pulse')} data-testid={`${testId}-loading`}>
        <CardHeader className='space-y-2'>
          <div className='h-4 bg-muted rounded w-3/4' />
          <div className='h-3 bg-muted rounded w-1/2' />
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='h-3 bg-muted rounded w-full' />
          <div className='h-3 bg-muted rounded w-2/3' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(cardClasses, 'border-destructive')} data-testid={`${testId}-error`}>
        <CardContent className='flex items-center justify-center p-6'>
          <div className='text-center text-destructive'>
            <p className='text-sm'>Erro ao carregar paciente</p>
            <p className='text-xs text-muted-foreground mt-1'>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cardClasses}
      onClick={handleCardClick}
      role='button'
      tabIndex={0}
      aria-label={ariaLabel || `Cartão do paciente ${displayData.name}`}
      data-testid={testId}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1 flex-1 min-w-0'>
            <h3 className='font-semibold text-lg leading-tight truncate'>
              {displayData.name}
            </h3>
            <p className='text-sm text-muted-foreground'>
              CPF: {displayData.cpf}
            </p>
          </div>
          <div className='flex flex-col gap-2 ml-2'>
            {statusBadge}
            {lgpdBadge}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        {/* Contact Information */}
        <div className='space-y-2'>
          {displayData.phone !== '(**) ****-****' && (
            <div className='flex items-center gap-2 text-sm'>
              <Phone className='h-4 w-4 text-muted-foreground flex-shrink-0' />
              <span className='truncate'>{displayData.phone}</span>
            </div>
          )}

          {displayData.email !== '***@***.***' && (
            <div className='flex items-center gap-2 text-sm'>
              <Mail className='h-4 w-4 text-muted-foreground flex-shrink-0' />
              <span className='truncate'>{displayData.email}</span>
            </div>
          )}

          {displayData.address !== 'Endereço restrito' && (
            <div className='flex items-center gap-2 text-sm'>
              <MapPin className='h-4 w-4 text-muted-foreground flex-shrink-0' />
              <span className='truncate'>{displayData.address}</span>
            </div>
          )}
        </div>

        {/* Additional Info for detailed variant */}
        {variant === 'detailed' && (
          <div className='space-y-2 pt-2 border-t'>
            {patient.birthDate && (
              <div className='flex items-center gap-2 text-sm'>
                <Calendar className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <span>
                  Nascimento: {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}

            {patient.healthcareInfo?.allergies && patient.healthcareInfo.allergies.length > 0 && (
              <div className='flex items-center gap-2 text-sm'>
                <Stethoscope className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <span className='truncate'>
                  Alergias: {patient.healthcareInfo.allergies.slice(0, 2).join(', ')}
                  {patient.healthcareInfo.allergies.length > 2 && '...'}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className='pt-3 border-t'>
          <div className='flex gap-2 w-full'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleView}
              className='flex-1'
              aria-label={`Ver detalhes de ${displayData.name}`}
            >
              <User className='h-4 w-4 mr-1' />
              Ver
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={handleEdit}
              className='flex-1'
              aria-label={`Editar ${displayData.name}`}
            >
              Editar
            </Button>

            {onDelete && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleDelete}
                className='text-destructive hover:text-destructive'
                aria-label={`Excluir ${displayData.name}`}
              >
                Excluir
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
});

PatientCard.displayName = 'PatientCard';

export default PatientCard;
