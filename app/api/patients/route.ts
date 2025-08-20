import { type NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock patients data for now
    const patients = [
      {
        id: '1',
        name: 'Maria Silva',
        email: 'maria@example.com',
        phone: '+5511999999999',
        birthDate: '1990-01-01',
        gender: 'female',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao@example.com',
        phone: '+5511888888888',
        birthDate: '1985-05-15',
        gender: 'male',
        created_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      data: patients,
      success: true,
      message: 'Pacientes carregados com sucesso',
    });
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock creation - in real app would save to Supabase
    const newPatient = {
      id: Date.now().toString(),
      ...body,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      data: newPatient,
      success: true,
      message: 'Paciente criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    );
  }
}
