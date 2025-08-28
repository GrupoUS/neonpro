/**
 * Healthcare Metric Card Component
 * Based on TweakCN NEONPRO theme design ($15,231.89 +20.1% style)
 * Optimized for Brazilian healthcare metrics display
 */

import React from 'react';
import { cn } from '@neonpro/utils';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Calendar } from 'lucide-react';

// Brazilian healthcare metric types
export type HealthcareMetricType = 
  | 'revenue'       // Receita total
  | 'patients'      // Pacientes atendidos
  | 'appointments'  // Consultas agendadas
  | 'treatments'    // Tratamentos realizados
  | 'growth'        // Crescimento percentual
  | 'satisfaction'  // Satisfação do cliente
  | 'retention'     // Taxa de retenção
  | 'conversion';   // Taxa de conversão

export interface HealthcareMetricCardProps {
  // Core metric data
  title: string;
  value: string | number;
  type: HealthcareMetricType;
  
  // Growth indicators (NEONPRO style)
  growth?: {
    value: number;        // Growth percentage
    period: string;       // "from last month", "vs. last quarter"
    isPositive?: boolean; // Auto-detected if undefined
  };
  
  // Formatting options
  currency?: 'BRL' | 'USD';
  format?: 'currency' | 'number' | 'percentage';
  
  // Visual customization
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'revenue' | 'success' | 'warning' | 'emergency';
  showIcon?: boolean;
  
  // Brazilian healthcare specific
  complianceIndicator?: {
    type: 'LGPD' | 'CFM' | 'ANVISA' | 'ANS';
    status: 'compliant' | 'warning' | 'violation';
  };
  
  // Interactive features
  onClick?: () => void;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

// Metric type to icon mapping
const METRIC_ICONS = {
  revenue: DollarSign,
  patients: Users,
  appointments: Calendar,
  treatments: Activity,
  growth: TrendingUp,
  satisfaction: Users,
  retention: Users,
  conversion: TrendingUp,
} as const;

// Metric type to color mapping (NEONPRO theme colors)
const METRIC_COLORS = {
  revenue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    border: 'border-blue-200',
  },
  patients: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: 'text-green-600',
    border: 'border-green-200',
  },
  appointments: {
    bg: 'bg-purple-50', 
    text: 'text-purple-700',
    icon: 'text-purple-600',
    border: 'border-purple-200',
  },
  treatments: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    icon: 'text-orange-600',
    border: 'border-orange-200',
  },
  growth: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  satisfaction: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    icon: 'text-rose-600',
    border: 'border-rose-200',
  },
  retention: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    icon: 'text-indigo-600',
    border: 'border-indigo-200',
  },
  conversion: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    icon: 'text-cyan-600',
    border: 'border-cyan-200',
  },
} as const;

// Format value based on type and currency
const formatValue = (value: string | number, format?: string, currency?: string): string => {
  if (typeof value === 'string') {return value;}
  
  switch (format) {
    case 'currency':
      return currency === 'BRL' 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'number':
    default:
      return new Intl.NumberFormat('pt-BR').format(value);
  }
};

// Growth indicator component (NEONPRO style)
const GrowthIndicator: React.FC<{ growth: NonNullable<HealthcareMetricCardProps['growth']> }> = ({ 
  growth 
}) => {
  const isPositive = growth.isPositive ?? growth.value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className={cn(
      'flex items-center gap-1 text-sm font-medium',
      isPositive ? 'text-green-600' : 'text-red-600'
    )}>
      <Icon className="w-4 h-4" />
      <span>
        {isPositive ? '+' : ''}{growth.value}% {growth.period}
      </span>
    </div>
  );
};

// Compliance indicator component (Brazilian healthcare specific)
const ComplianceIndicator: React.FC<{ 
  compliance: NonNullable<HealthcareMetricCardProps['complianceIndicator']> 
}> = ({ compliance }) => {
  const statusColors = {
    compliant: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    violation: 'bg-red-100 text-red-700 border-red-200',
  };
  
  return (
    <div className={cn(
      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
      statusColors[compliance.status]
    )}>
      {compliance.type}
    </div>
  );
};

export const HealthcareMetricCard: React.FC<HealthcareMetricCardProps> = ({
  title,
  value,
  type,
  growth,
  currency = 'BRL',
  format,
  size = 'md',
  variant = 'default', 
  showIcon = true,
  complianceIndicator,
  onClick,
  href,
  className,
  children,
  ...props
}) => {
  // Auto-detect format based on type
  const autoFormat = format || (() => {
    switch (type) {
      case 'revenue': return 'currency';
      case 'growth': case 'satisfaction': case 'retention': case 'conversion': 
        return 'percentage';
      default: return 'number';
    }
  })();
  
  // Get colors based on variant or type
  const colors = variant === 'default' 
    ? METRIC_COLORS[type] 
    : METRIC_COLORS[type]; // Could extend for custom variants
    
  // Get icon for metric type
  const Icon = showIcon ? METRIC_ICONS[type] : null;
  
  // Size variants
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const valueSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl', 
    lg: 'text-4xl',
  };
  
  // Format the display value
  const formattedValue = formatValue(value, autoFormat, currency);
  
  // Base card classes (NEONPRO theme styling)
  const cardClasses = cn(
    // Base layout
    'relative overflow-hidden rounded-xl border transition-all duration-200',
    
    // NEONPRO theme colors
    colors.bg,
    colors.border,
    
    // Size variant
    sizeClasses[size],
    
    // Interactive states
    (onClick || href) && [
      'cursor-pointer',
      'hover:shadow-lg hover:shadow-black/5',
      'hover:border-gray-300',
      'active:scale-[0.98]',
    ],
    
    // Custom classes
    className
  );
  
  // Card content
  const cardContent = (
    <>
      {/* Header with icon and compliance */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              'flex items-center justify-center rounded-lg p-2',
              colors.bg === 'bg-blue-50' ? 'bg-blue-100' : 'bg-gray-100'
            )}>
              <Icon className={cn('w-5 h-5', colors.icon)} />
            </div>
          )}
          <h3 className={cn(
            'font-medium text-gray-900',
            titleSizeClasses[size]
          )}>
            {title}
          </h3>
        </div>
        
        {complianceIndicator && (
          <ComplianceIndicator compliance={complianceIndicator} />
        )}
      </div>
      
      {/* Main value (NEONPRO style) */}
      <div className="space-y-2">
        <div className={cn(
          'font-bold text-gray-900',
          valueSizeClasses[size]
        )}>
          {formattedValue}
        </div>
        
        {/* Growth indicator */}
        {growth && <GrowthIndicator growth={growth} />}
      </div>
      
      {/* Additional content */}
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </>
  );
  
  // Render as link or button if href/onClick provided
  if (href) {
    return (
      <a href={href} className={cardClasses} {...props}>
        {cardContent}
      </a>
    );
  }
  
  if (onClick) {
    return (
      <button onClick={onClick} className={cardClasses} {...props}>
        {cardContent}
      </button>
    );
  }
  
  // Render as div
  return (
    <div className={cardClasses} {...props}>
      {cardContent}
    </div>
  );
};

export default HealthcareMetricCard;