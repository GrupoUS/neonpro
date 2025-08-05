/**
 * Plan Selector Component
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  Star, 
  Rocket, 
  Crown, 
  Zap,
  Shield,
  Users,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_quarterly: number;
  price_yearly: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  is_featured: boolean;
  savings: {
    quarterly: number;
    yearly: number;
  };
  formatted_prices: {
    monthly: string;
    quarterly: string;
    yearly: string;
  };
}

interface PlanSelectorProps {
  currentPlanId?: string;
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'quarterly' | 'yearly') => void;
  isUpgrade?: boolean;
  loading?: boolean;
}

export default function PlanSelector({ 
  currentPlanId, 
  onSelectPlan, 
  isUpgrade = false, 
  loading = false 
}: PlanSelectorProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const result = await response.json();
      
      if (result.success) {
        setPlans(result.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'basic':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'professional':
        return <Rocket className="h-6 w-6 text-purple-500" />;
      case 'enterprise':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      default:
        return <Star className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    switch (billingCycle) {
      case 'monthly':
        return { price: plan.price_monthly, formatted: plan.formatted_prices.monthly };
      case 'quarterly':
        return { price: plan.price_quarterly, formatted: plan.formatted_prices.quarterly };
      case 'yearly':
        return { price: plan.price_yearly, formatted: plan.formatted_prices.yearly };
    }
  };

  const getSavings = (plan: SubscriptionPlan) => {
    switch (billingCycle) {
      case 'quarterly':
        return plan.savings.quarterly;
      case 'yearly':
        return plan.savings.yearly;
      default:
        return 0;
    }
  };

  const getFeaturesList = (plan: SubscriptionPlan) => {
    const featureLabels: Record<string, { label: string; icon: React.ReactNode }> = {
      appointment_management: { label: 'Gestão de Consultas', icon: <BarChart3 className="h-4 w-4" /> },
      patient_records: { label: 'Prontuários Digitais', icon: <Users className="h-4 w-4" /> },
      basic_reports: { label: 'Relatórios Básicos', icon: <BarChart3 className="h-4 w-4" /> },
      advanced_reports: { label: 'Relatórios Avançados', icon: <BarChart3 className="h-4 w-4" /> },
      bi_dashboard: { label: 'Dashboard BI', icon: <BarChart3 className="h-4 w-4" /> },
      inventory_management: { label: 'Gestão de Estoque', icon: <BarChart3 className="h-4 w-4" /> },
      financial_management: { label: 'Gestão Financeira', icon: <BarChart3 className="h-4 w-4" /> },
      email_notifications: { label: 'Notificações E-mail', icon: <Zap className="h-4 w-4" /> },
      sms_notifications: { label: 'Notificações SMS', icon: <Zap className="h-4 w-4" /> },
      mobile_app: { label: 'App Mobile', icon: <Zap className="h-4 w-4" /> },
      api_access: { label: 'Acesso à API', icon: <Zap className="h-4 w-4" /> },
      priority_support: { label: 'Suporte Prioritário', icon: <Shield className="h-4 w-4" /> },
      lgpd_compliance: { label: 'Conformidade LGPD', icon: <Shield className="h-4 w-4" /> },
      multi_location: { label: 'Múltiplas Localizações', icon: <BarChart3 className="h-4 w-4" /> },
      custom_templates: { label: 'Templates Personalizados', icon: <BarChart3 className="h-4 w-4" /> }
    };

    return Object.entries(plan.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => featureLabels[feature] || { label: feature, icon: <Check className="h-4 w-4" /> })
      .slice(0, 8); // Show top 8 features
  };

  const getLimitsText = (plan: SubscriptionPlan) => {
    const limits = plan.limits;
    const limitTexts = [];

    if (limits.max_patients !== undefined) {
      limitTexts.push(`${limits.max_patients === -1 ? 'Ilimitados' : limits.max_patients} pacientes`);
    }
    if (limits.max_users !== undefined) {
      limitTexts.push(`${limits.max_users === -1 ? 'Ilimitados' : limits.max_users} usuários`);
    }
    if (limits.storage_gb !== undefined) {
      limitTexts.push(`${limits.storage_gb}GB armazenamento`);
    }

    return limitTexts.slice(0, 3).join(' • ');
  };

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-muted rounded-lg">
        <Label htmlFor="billing-monthly" className={billingCycle === 'monthly' ? 'font-semibold' : ''}>
          Mensal
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingCycle !== 'monthly'}
          onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <Label htmlFor="billing-yearly" className={billingCycle === 'yearly' ? 'font-semibold' : ''}>
          Anual
        </Label>
        {billingCycle === 'yearly' && (
          <Badge variant="secondary" className="ml-2">
            Economize até 20%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const planPrice = getPlanPrice(plan);
          const savings = getSavings(plan);
          const features = getFeaturesList(plan);
          const limits = getLimitsText(plan);
          const isCurrentPlan = plan.id === currentPlanId;

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.is_featured ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.is_featured && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                <CardDescription className="text-sm px-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {planPrice.formatted}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    por {billingCycle === 'monthly' ? 'mês' : 
                          billingCycle === 'quarterly' ? 'trimestre' : 'ano'}
                  </div>
                  {savings > 0 && (
                    <Badge variant="outline" className="mt-1">
                      Economize {savings}%
                    </Badge>
                  )}
                </div>

                {/* Limits */}
                <div className="text-center text-sm text-muted-foreground border-t pt-4">
                  {limits}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      Plano Atual
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={plan.is_featured ? 'default' : 'outline'}
                      onClick={() => onSelectPlan(plan.id, billingCycle)}
                      disabled={loading}
                    >
                      {isUpgrade ? 'Fazer Upgrade' : 'Selecionar Plano'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          • Todos os planos incluem suporte técnico e atualizações automáticas
        </p>
        <p>
          • Cancele a qualquer momento • Política de reembolso de 30 dias
        </p>
        <p>
          • Conformidade total com LGPD e regulamentações de saúde
        </p>
      </div>
    </div>
  );
}
