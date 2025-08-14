import webpush from 'web-push'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// FIXED: Removed direct import of 'next/headers' to avoid client-side errors

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@neonpro.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
} else {
  console.warn('VAPID keys not configured for push notifications')
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  url?: string
  type?: 'appointment_reminder' | 'appointment_confirmation' | 'appointment_cancellation' | 'payment_due' | 'payment_received' | 'system_notification'
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
}

class PushNotificationService {
  private supabase: any = null

  // Initialize Supabase client with dynamic cookies import
  private async getSupabaseClient() {
    if (this.supabase) {
      return this.supabase
    }

    // Check if we're on the server side
    if (typeof window === 'undefined') {
      try {
        // Dynamic import to avoid client-side errors
        const { cookies } = await import('next/headers')
        this.supabase = createServerComponentClient({ cookies })
      } catch (error) {
        console.error('Error importing next/headers:', error)
        // Fallback to basic client without cookies
        const { createClient } = await import('@supabase/supabase-js')
        this.supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
      }
    } else {
      // Client-side fallback
      const { createClient } = await import('@supabase/supabase-js')
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }

    return this.supabase
  }

  // Save push subscription for a user
  async saveSubscription(userId: string, subscription: PushSubscription): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await this.getSupabaseClient()
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          is_active: true,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving push subscription:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in saveSubscription:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Remove push subscription for a user
  async removeSubscription(userId: string, endpoint: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await this.getSupabaseClient()
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('endpoint', endpoint)

      if (error) {
        console.error('Error removing push subscription:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in removeSubscription:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Get all active subscriptions for a user
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh_key, auth_key')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching user subscriptions:', error)
        return []
      }

      return data.map(sub => ({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key
        }
      }))
    } catch (error) {
      console.error('Error in getUserSubscriptions:', error)
      return []
    }
  }

  // Send push notification to a specific user
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId)
      
      if (subscriptions.length === 0) {
        return { success: false, sent: 0, failed: 0, errors: ['No active subscriptions found'] }
      }

      const results = await Promise.allSettled(
        subscriptions.map(subscription => 
          webpush.sendNotification(subscription, JSON.stringify(payload))
        )
      )

      let sent = 0
      let failed = 0
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          sent++
        } else {
          failed++
          const subscription = subscriptions[index]
          errors.push(`Failed to send to ${subscription.endpoint}: ${result.reason?.message}`)
          
          // If subscription is invalid, mark as inactive
          if (result.reason?.statusCode === 410) {
            this.removeSubscription(userId, subscription.endpoint)
          }
        }
      })

      return {
        success: sent > 0,
        sent,
        failed,
        errors
      }
    } catch (error) {
      console.error('Error sending push notification to user:', error)
      return {
        success: false,
        sent: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  // Send push notification to multiple users
  async sendToUsers(userIds: string[], payload: PushNotificationPayload): Promise<{
    success: boolean
    totalSent: number
    totalFailed: number
    results: Array<{ userId: string; sent: number; failed: number; errors: string[] }>
  }> {
    try {
      const results = await Promise.allSettled(
        userIds.map(userId => this.sendToUser(userId, payload))
      )

      let totalSent = 0
      let totalFailed = 0
      const processedResults = []

      results.forEach((result, index) => {
        const userId = userIds[index]
        
        if (result.status === 'fulfilled') {
          const { sent, failed, errors } = result.value
          totalSent += sent
          totalFailed += failed
          processedResults.push({ userId, sent, failed, errors })
        } else {
          totalFailed++
          processedResults.push({
            userId,
            sent: 0,
            failed: 1,
            errors: [result.reason?.message || 'Failed to process user']
          })
        }
      })

      return {
        success: totalSent > 0,
        totalSent,
        totalFailed,
        results: processedResults
      }
    } catch (error) {
      console.error('Error sending bulk push notifications:', error)
      return {
        success: false,
        totalSent: 0,
        totalFailed: userIds.length,
        results: userIds.map(userId => ({
          userId,
          sent: 0,
          failed: 1,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        }))
      }
    }
  }

  // Helper methods for common notification types
  async sendAppointmentReminder(userId: string, appointmentData: {
    patientName: string
    serviceName: string
    professionalName: string
    appointmentDate: string
    appointmentTime: string
    appointmentId: string
  }) {
    const payload: PushNotificationPayload = {
      title: '🔔 Lembrete de Consulta',
      body: `Olá ${appointmentData.patientName}! Você tem consulta de ${appointmentData.serviceName} amanhã às ${appointmentData.appointmentTime} com ${appointmentData.professionalName}.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `appointment_reminder_${appointmentData.appointmentId}`,
      url: `/dashboard/appointments/${appointmentData.appointmentId}`,
      type: 'appointment_reminder',
      data: {
        appointmentId: appointmentData.appointmentId,
        type: 'appointment_reminder'
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Detalhes',
          icon: '/icons/view-action.png'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200]
    }

    return this.sendToUser(userId, payload)
  }

  async sendAppointmentConfirmation(userId: string, appointmentData: {
    patientName: string
    serviceName: string
    professionalName: string
    appointmentDate: string
    appointmentTime: string
    appointmentId: string
  }) {
    const payload: PushNotificationPayload = {
      title: '✅ Consulta Confirmada',
      body: `Sua consulta de ${appointmentData.serviceName} foi confirmada para ${appointmentData.appointmentDate} às ${appointmentData.appointmentTime}.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `appointment_confirmation_${appointmentData.appointmentId}`,
      url: `/dashboard/appointments/${appointmentData.appointmentId}`,
      type: 'appointment_confirmation',
      data: {
        appointmentId: appointmentData.appointmentId,
        type: 'appointment_confirmation'
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Detalhes'
        }
      ],
      vibrate: [100, 50, 100]
    }

    return this.sendToUser(userId, payload)
  }

  async sendPaymentReminder(userId: string, paymentData: {
    patientName: string
    amount: number
    dueDate: string
    invoiceId: string
  }) {
    const payload: PushNotificationPayload = {
      title: '💰 Lembrete de Pagamento',
      body: `Olá ${paymentData.patientName}! Você tem um pagamento de R$ ${paymentData.amount.toFixed(2)} vencendo em ${paymentData.dueDate}.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `payment_reminder_${paymentData.invoiceId}`,
      url: `/dashboard/billing/${paymentData.invoiceId}`,
      type: 'payment_due',
      data: {
        invoiceId: paymentData.invoiceId,
        type: 'payment_due'
      },
      actions: [
        {
          action: 'pay',
          title: 'Pagar Agora',
          icon: '/icons/pay-action.png'
        },
        {
          action: 'view',
          title: 'Ver Detalhes'
        }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200]
    }

    return this.sendToUser(userId, payload)
  }

  // Test notification for checking push setup
  async sendTestNotification(userId: string) {
    const payload: PushNotificationPayload = {
      title: '🧪 Notificação de Teste',
      body: 'Se você está vendo isso, as notificações push estão funcionando perfeitamente!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'test_notification',
      url: '/dashboard/notifications',
      type: 'system_notification',
      data: {
        type: 'test'
      },
      actions: [
        {
          action: 'close',
          title: 'OK'
        }
      ],
      vibrate: [100]
    }

    return this.sendToUser(userId, payload)
  }

  // Get VAPID public key for client-side subscription
  getVapidPublicKey(): string | null {
    return process.env.VAPID_PUBLIC_KEY || null
  }

  // Validate push subscription
  async validateSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
        return false
      }

      // Test sending a minimal notification
      const testPayload = {
        title: 'Test',
        body: 'Validation test',
        silent: true
      }

      await webpush.sendNotification(subscription, JSON.stringify(testPayload))
      return true
    } catch (error) {
      console.error('Subscription validation failed:', error)
      return false
    }
  }
}

// Singleton instance
const pushNotificationService = new PushNotificationService()
export default pushNotificationService

// Utility functions
export function generateVapidKeys() {
  return webpush.generateVAPIDKeys()
}