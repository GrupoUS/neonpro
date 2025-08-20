import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Mock patient data
    const patient = {
      id,
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '+5511999999999',
      birthDate: '1990-01-01',
      gender: 'female',
      created_at: new Date().toISOString()
    }

    return NextResponse.json({
      data: patient,
      success: true,
      message: 'Paciente encontrado'
    })
  } catch (error) {
    console.error('Erro ao buscar paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Mock update
    const updatedPatient = {
      id,
      ...body,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      data: updatedPatient,
      success: true,
      message: 'Paciente atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    return NextResponse.json({
      success: true,
      message: 'Paciente removido com sucesso'
    })
  } catch (error) {
    console.error('Erro ao remover paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    )
  }
}