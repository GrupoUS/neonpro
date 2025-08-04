// ===============================================
// Portal Manifest API Route
// Story 4.3: Patient Portal & Self-Service
// ===============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { generateClinicPWAConfig } from '@/lib/auth-advanced/pwa-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicCode = searchParams.get('clinic')
    
    if (!clinicCode) {
      return NextResponse.json(
        { error: 'Clinic code is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get clinic information
    const { data: clinic, error } = await supabase
      .from('clinics')
      .select('id, clinic_name, logo_url, theme_colors')
      .eq('clinic_code', clinicCode)
      .single()

    if (error || !clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      )
    }

    // Generate clinic-specific PWA config
    const pwaConfig = generateClinicPWAConfig(
      clinic.clinic_name,
      clinic.theme_colors?.primary,
      clinic.theme_colors?.background
    )

    // Add clinic-specific start URL
    const manifestData = {
      ...pwaConfig,
      start_url: `/portal?clinic=${clinicCode}`,
      id: `/portal?clinic=${clinicCode}`,
      categories: ['medical', 'health', 'beauty'],
      screenshots: [
        {
          src: '/portal/screenshots/desktop-login.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide',
          label: 'Login do Portal'
        },
        {
          src: '/portal/screenshots/mobile-dashboard.png',
          sizes: '414x896',
          type: 'image/png',
          form_factor: 'narrow',
          label: 'Dashboard Mobile'
        }
      ],
      shortcuts: [
        {
          name: 'Agendar Consulta',
          short_name: 'Agendar',
          description: 'Agendar nova consulta',
          url: `/portal/booking?clinic=${clinicCode}`,
          icons: [
            {
              src: '/portal/icons/shortcut-booking.png',
              sizes: '96x96'
            }
          ]
        },
        {
          name: 'Meus Agendamentos',
          short_name: 'Agendamentos',
          description: 'Ver agendamentos',
          url: `/portal/appointments?clinic=${clinicCode}`,
          icons: [
            {
              src: '/portal/icons/shortcut-appointments.png',
              sizes: '96x96'
            }
          ]
        },
        {
          name: 'Meu Progresso',
          short_name: 'Progresso',
          description: 'Acompanhar progresso',
          url: `/portal/progress?clinic=${clinicCode}`,
          icons: [
            {
              src: '/portal/icons/shortcut-progress.png',
              sizes: '96x96'
            }
          ]
        }
      ]
    }

    // Set appropriate cache headers
    const response = NextResponse.json(manifestData)
    response.headers.set('Content-Type', 'application/manifest+json')
    response.headers.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    
    return response

  } catch (error) {
    console.error('Manifest generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}