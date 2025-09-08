/**
 * WhatsApp Page for NeonPro Healthcare
 * Main page for WhatsApp Business integration
 * Provides patient communication interface for Brazilian healthcare providers
 */

import type { Metadata, } from 'next'
import React from 'react'

// Components
import { WhatsappDashboard, } from '@/app/components/chat/whatsapp-dashboard'

// Utils and hooks
// import { redirect } from "next/navigation"; // unused

export const metadata: Metadata = {
  title: 'WhatsApp Business | NeonPro',
  description: 'Comunicação com pacientes via WhatsApp Business API',
}

export default async function WhatsappPage() {
  // TODO: Get current user and clinic info from auth context
  // For now, using mock data
  const clinicId = 'default-clinic-id'
  const currentUserId = 'default-user-id'

  return (
    <div className="container mx-auto p-6 h-full">
      <div className="h-full max-h-[calc(100vh-8rem)]">
        <WhatsappDashboard
          clinicId={clinicId}
          currentUserId={currentUserId}
          className="h-full"
        />
      </div>
    </div>
  )
}
