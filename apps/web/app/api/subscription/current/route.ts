/**
 * Current Subscription API
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 *
 * GET /api/subscription/current - Get current user's subscription details
 * PUT /api/subscription/current - Update subscription settings
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';

export async function GET(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic
    const { data: userClinic } = await supabase
      .from('user_clinics')
      .select('clinic_id')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single();

    if (!userClinic) {
      return NextResponse.json(
        { error: 'No active clinic found' },
        { status: 404 }
      );
    }

    // Get current subscription with plan details and usage
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(*),
        usage:subscription_usage(*)
      `
      )
      .eq('clinic_id', userClinic.clinic_id)
      .in('status', ['trial', 'active'])
      .single();

    if (error || !subscription) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active subscription found',
      });
    }

    // Calculate usage statistics
    const usageStats = await calculateUsageStats(supabase, subscription);

    // Check subscription status
    const subscriptionStatus = getSubscriptionStatus(subscription);

    return NextResponse.json({
      success: true,
      data: {
        ...subscription,
        status_info: subscriptionStatus,
        usage_stats: usageStats,
        formatted_dates: {
          current_period_start: subscription.current_period_start
            ? new Date(subscription.current_period_start).toLocaleDateString(
                'pt-BR'
              )
            : null,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end).toLocaleDateString(
                'pt-BR'
              )
            : null,
          trial_end: subscription.trial_end
            ? new Date(subscription.trial_end).toLocaleDateString('pt-BR')
            : null,
          next_billing_date: subscription.next_billing_date
            ? new Date(subscription.next_billing_date).toLocaleDateString(
                'pt-BR'
              )
            : null,
        },
      },
    });
  } catch (error) {
    console.error('Current subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cancel_at_period_end, cancellation_reason } = body;

    // Get user's clinic
    const { data: userClinic } = await supabase
      .from('user_clinics')
      .select('clinic_id')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single();

    if (!userClinic) {
      return NextResponse.json(
        { error: 'No active clinic found' },
        { status: 404 }
      );
    }

    // Update subscription settings
    const updateData: any = {};

    if (cancel_at_period_end !== undefined) {
      updateData.cancel_at_period_end = cancel_at_period_end;
      if (cancel_at_period_end && cancellation_reason) {
        updateData.cancellation_reason = cancellation_reason;
      }
    }

    const { data: updatedSubscription, error } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('clinic_id', userClinic.clinic_id)
      .in('status', ['trial', 'active'])
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: cancel_at_period_end
        ? 'Assinatura será cancelada no final do período atual'
        : 'Configurações de assinatura atualizadas',
    });
  } catch (error) {
    console.error('Update subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateUsageStats(supabase: any, subscription: any) {
  const limits = subscription.plan?.limits || {};
  const stats: any = {};

  try {
    // Calculate current usage for key metrics
    const usagePromises = Object.keys(limits).map(async (limitKey) => {
      let currentUsage = 0;

      switch (limitKey) {
        case 'max_patients': {
          const { count: patientCount } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', subscription.clinic_id)
            .eq('is_active', true);
          currentUsage = patientCount || 0;
          break;
        }

        case 'max_appointments_per_month': {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { count: appointmentCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', subscription.clinic_id)
            .gte('appointment_date', startOfMonth.toISOString());
          currentUsage = appointmentCount || 0;
          break;
        }

        case 'max_users': {
          const { count: userCount } = await supabase
            .from('user_clinics')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', subscription.clinic_id)
            .eq('is_active', true);
          currentUsage = userCount || 0;
          break;
        }
      }

      const limit = limits[limitKey];
      const percentage =
        limit === -1 ? 0 : Math.round((currentUsage / limit) * 100);

      stats[limitKey] = {
        current: currentUsage,
        limit: limit === -1 ? 'Unlimited' : limit,
        percentage,
        remaining:
          limit === -1
            ? Number.POSITIVE_INFINITY
            : Math.max(0, limit - currentUsage),
      };
    });

    await Promise.all(usagePromises);
  } catch (error) {
    console.error('Error calculating usage stats:', error);
  }

  return stats;
}

function getSubscriptionStatus(subscription: any) {
  const now = new Date();

  if (subscription.status === 'trial' && subscription.trial_end) {
    const trialEnd = new Date(subscription.trial_end);
    const daysRemaining = Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining <= 0) {
      return {
        status: 'trial_expired',
        message: 'Período de teste expirado',
        action_required: true,
      };
    }
    if (daysRemaining <= 3) {
      return {
        status: 'trial_ending',
        message: `Teste expira em ${daysRemaining} dias`,
        action_required: true,
      };
    }
    return {
      status: 'trial_active',
      message: `${daysRemaining} dias restantes no teste`,
      action_required: false,
    };
  }

  if (subscription.cancel_at_period_end && subscription.current_period_end) {
    const periodEnd = new Date(subscription.current_period_end);
    const daysRemaining = Math.ceil(
      (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      status: 'canceling',
      message: `Assinatura será cancelada em ${daysRemaining} dias`,
      action_required: false,
    };
  }

  return {
    status: 'active',
    message: 'Assinatura ativa',
    action_required: false,
  };
}
