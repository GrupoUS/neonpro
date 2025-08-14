import { TreatmentSuccessService } from '@/app/lib/services/treatment-success';
import { createQualityBenchmarkSchema } from '@/app/lib/validations/treatment-success';
import { NextRequest, NextResponse } from 'next/server';

const treatmentSuccessService = new TreatmentSuccessService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await treatmentSuccessService.getQualityBenchmarks(page, limit);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quality benchmarks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createQualityBenchmarkSchema.parse(body);
    
    const benchmark = await treatmentSuccessService.createQualityBenchmark(validatedData);

    return NextResponse.json({
      success: true,
      data: benchmark
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating quality benchmark:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados inválidos',
          details: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
