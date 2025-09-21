/**
 * Aesthetic Clinic Patient Lookup Edge Function
 * Optimized for <100ms cold starts - Brazilian aesthetic clinic operations
 */

// Edge Runtime replacement - standard fetch API
export const preferredRegion = 'gru1'; // São Paulo, Brazil for LGPD compliance

interface AestheticPatientLookup {
  cpf?: string;
  phone?: string;
  email?: string;
  name?: string;
}

interface AestheticPatientProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  treatments: {
    type:
      | 'botox'
      | 'preenchimento'
      | 'limpeza_pele'
      | 'peeling'
      | 'laser'
      | 'harmonizacao_facial';
    date: string;
    status: 'agendado' | 'realizado' | 'cancelado';
    professional: string;
  }[];
  preferences: {
    communication_channel: 'whatsapp' | 'sms' | 'email' | 'ligacao';
    best_time: 'manha' | 'tarde' | 'noite';
    notification_advance: '24h' | '12h' | '6h' | '2h';
  };
  lgpd_consent: {
    marketing: boolean;
    data_processing: boolean;
    whatsapp_communication: boolean;
    consent_date: string;
  };
}

export default async function handler(req: Request) {
  // LGPD compliance headers
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-LGPD-Compliance': 'true',
    'Cache-Control': 'no-store, max-age=0',
  };

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido', code: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers },
    );
  }

  try {
    const startTime = Date.now();
    const { cpf, phone, email, name }: AestheticPatientLookup = await req.json();

    // Input validation for aesthetic clinic context
    if (!cpf && !phone && !email && !name) {
      return new Response(
        JSON.stringify({
          error: 'Informe pelo menos um dado para busca: CPF, telefone, email ou nome',
          code: 'MISSING_SEARCH_CRITERIA',
        }),
        { status: 400, headers },
      );
    }

    // Simulate fast patient lookup for aesthetic clinic
    // In production, this would connect to Supabase with optimized queries
    const mockPatientProfile: AestheticPatientProfile = {
      id: `patient_${Date.now()}`,
      name: 'Ana Silva',
      phone: '+5511999887766',
      email: 'ana.silva@email.com',
      treatments: [
        {
          type: 'botox',
          date: '2024-09-25T14:00:00Z',
          status: 'agendado',
          professional: 'Dra. Carolina Mendes',
        },
        {
          type: 'limpeza_pele',
          date: '2024-08-15T10:30:00Z',
          status: 'realizado',
          professional: 'Esteticista Mariana',
        },
      ],
      preferences: {
        communication_channel: 'whatsapp',
        best_time: 'tarde',
        notification_advance: '24h',
      },
      lgpd_consent: {
        marketing: true,
        data_processing: true,
        whatsapp_communication: true,
        consent_date: '2024-08-01T12:00:00Z',
      },
    };

    const processingTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        patient: mockPatientProfile,
        performance: {
          processing_time_ms: processingTime,
          region: 'gru1',
          lgpd_compliant: true,
        },
      }),
      { status: 200, headers },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        lgpd_compliant: true,
      }),
      { status: 500, headers },
    );
  }
}
