
import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function DashboardCard({ 
  title, 
  value, 
  icon, 
  subtitle, 
  actionText, 
  actionHref,
  trend 
}: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-elegant card-hover border border-gray-100 h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center text-white shadow-md">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend.isPositive 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            <span>{trend.isPositive ? '↗️' : '↘️'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <p className="text-3xl font-serif font-bold text-dark-blue">{value}</p>
      </div>
      
      {actionText && actionHref && (
        <a 
          href={actionHref}
          className="inline-flex items-center text-gold hover:text-gold/80 font-medium text-sm transition-colors duration-200"
        >
          {actionText}
          <ChevronRight className="h-4 w-4 ml-1" />
        </a>
      )}
    </div>
  );
}
