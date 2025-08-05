/**
 * Subscription Plans API
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 * 
 * GET /api/subscription/plans - Get all available subscription plans
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get all active subscription plans
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }

    // Format plans with calculated savings
    const formattedPlans = plans.map(plan => ({
      ...plan,
      savings: {
        quarterly: plan.price_monthly && plan.price_quarterly
          ? Math.round(((plan.price_monthly * 3 - plan.price_quarterly) / (plan.price_monthly * 3)) * 100)
          : 0,
        yearly: plan.price_monthly && plan.price_yearly
          ? Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)
          : 0
      },
      formatted_prices: {
        monthly: plan.price_monthly ? formatCurrency(plan.price_monthly) : null,
        quarterly: plan.price_quarterly ? formatCurrency(plan.price_quarterly) : null,
        yearly: plan.price_yearly ? formatCurrency(plan.price_yearly) : null
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedPlans
    });

  } catch (error) {
    console.error('Subscription plans API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

