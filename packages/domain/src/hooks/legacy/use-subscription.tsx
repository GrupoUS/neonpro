'use client';

import type { User } from '@supabase/auth-helpers-nextjs';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type SubscriptionData = {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  current_period_start: string;
  cancel_at_period_end: boolean;
  plan_name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  max_patients?: number;
  max_clinics?: number;
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/subscription/current');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        } else if (response.status === 401) {
          setError('Não autorizado');
        } else {
          setError('Erro ao carregar assinatura');
        }
      } catch (_error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  const hasFeature = (feature: string): boolean => {
    if (!subscription?.features) {
      return false;
    }
    return subscription.features.includes(feature);
  };

  const canAddPatients = (currentPatientCount: number): boolean => {
    if (!subscription?.max_patients) {
      return true; // Unlimited
    }
    return currentPatientCount < subscription.max_patients;
  };

  const canAddClinics = (currentClinicsCount: number): boolean => {
    if (!subscription?.max_clinics) {
      return true; // Unlimited
    }
    return currentClinicsCount < subscription.max_clinics;
  };

  const isActive = (): boolean => {
    if (!subscription) {
      return false;
    }

    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);

    return subscription.status === 'active' && periodEnd > now;
  };

  const daysUntilRenewal = (): number => {
    if (!subscription) {
      return 0;
    }

    const renewalDate = new Date(subscription.current_period_end);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpiringSoon = (days = 7): boolean => {
    return daysUntilRenewal() <= days && daysUntilRenewal() > 0;
  };

  return {
    subscription,
    loading,
    error,
    hasFeature,
    canAddPatients,
    canAddClinics,
    isActive,
    daysUntilRenewal,
    isExpiringSoon,
  };
}

// Context for subscription provider
type SubscriptionContextType = {
  subscription: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/current');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else if (response.status === 401) {
        setError('Não autorizado');
      } else {
        setError('Erro ao carregar assinatura');
      }
    } catch (_error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscriptionContext must be used within a SubscriptionProvider'
    );
  }
  return context;
}
