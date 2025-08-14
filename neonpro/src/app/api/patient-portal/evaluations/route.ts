import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { validatePatientSession } from '@/lib/utils/patient-portal-validation';

// GET /api/patient-portal/evaluations - Get patient evaluations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Validate patient session
    const { session, patient } = await validatePatientSession(supabase);
    if (!session || !patient) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const status = searchParams.get('status'); // pending, completed, expired
    const treatmentId = searchParams.get('treatment_id');
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('patient_evaluations')
      .select(`
        *,
        evaluation_questions:patient_evaluation_questions(
          *,
          patient_evaluation_answers(*)
        ),
        treatment:treatments(
          id,
          name,
          procedure_name
        ),
        professional:professionals(
          id,
          name,
          specialty
        )
      `)
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (treatmentId) {
      query = query.eq('treatment_id', treatmentId);
    }

    // Execute query with pagination
    const { data: evaluations, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      console.error('Error fetching evaluations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch evaluations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      evaluations: evaluations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in evaluations GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/patient-portal/evaluations - Submit evaluation response
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Validate patient session
    const { session, patient } = await validatePatientSession(supabase);
    if (!session || !patient) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { 
      evaluation_id,
      answers,
      overall_rating,
      feedback_text 
    } = body;

    // Validate required fields
    if (!evaluation_id || !answers || typeof overall_rating !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: evaluation_id, answers, overall_rating' },
        { status: 400 }
      );
    }

    // Validate overall rating range
    if (overall_rating < 1 || overall_rating > 5) {
      return NextResponse.json(
        { error: 'Overall rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if evaluation exists and belongs to patient
    const { data: evaluation, error: evalError } = await supabase
      .from('patient_evaluations')
      .select('*')
      .eq('id', evaluation_id)
      .eq('patient_id', patient.id)
      .eq('status', 'pending')
      .single();

    if (evalError || !evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found or already completed' },
        { status: 404 }
      );
    }

    // Check if evaluation is still within deadline
    const now = new Date();
    const deadline = new Date(evaluation.expires_at);
    
    if (now > deadline) {
      // Mark as expired
      await supabase
        .from('patient_evaluations')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', evaluation_id);

      return NextResponse.json(
        { error: 'Evaluation deadline has passed' },
        { status: 410 }
      );
    }

    // Start transaction
    const { data: questions, error: questionsError } = await supabase
      .from('patient_evaluation_questions')
      .select('*')
      .eq('evaluation_id', evaluation_id)
      .order('order_index');

    if (questionsError) {
      throw questionsError;
    }

    // Validate answers against questions
    const questionIds = questions.map(q => q.id);
    const answerQuestionIds = answers.map((a: any) => a.question_id);
    
    // Check if all required questions are answered
    const missingAnswers = questionIds.filter(id => !answerQuestionIds.includes(id));
    if (missingAnswers.length > 0) {
      return NextResponse.json(
        { error: 'Missing answers for required questions' },
        { status: 400 }
      );
    }

    // Process answers
    const answerData = answers.map((answer: any) => ({
      evaluation_id,
      question_id: answer.question_id,
      answer_type: answer.answer_type,
      answer_text: answer.answer_text || null,
      answer_rating: answer.answer_rating || null,
      answer_choice: answer.answer_choice || null,
      answer_boolean: answer.answer_boolean || null,
      created_at: new Date().toISOString()
    }));

    // Insert answers
    const { error: answersError } = await supabase
      .from('patient_evaluation_answers')
      .insert(answerData);

    if (answersError) {
      throw answersError;
    }

    // Update evaluation status and ratings
    const { error: updateError } = await supabase
      .from('patient_evaluations')
      .update({
        status: 'completed',
        overall_rating,
        feedback_text: feedback_text || null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', evaluation_id);

    if (updateError) {
      throw updateError;
    }

    // Calculate and update professional/clinic ratings
    await updateProfessionalRatings(supabase, evaluation.professional_id);
    await updateClinicRatings(supabase, evaluation.clinic_id);

    // Log activity
    await supabase
      .from('patient_portal_activity')
      .insert({
        patient_id: patient.id,
        activity_type: 'evaluation_completed',
        activity_data: {
          evaluation_id,
          overall_rating,
          professional_id: evaluation.professional_id,
          treatment_id: evaluation.treatment_id
        },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      message: 'Evaluation submitted successfully',
      evaluation_id,
      overall_rating
    });

  } catch (error) {
    console.error('Error submitting evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to submit evaluation' },
      { status: 500 }
    );
  }
}

// Helper function to update professional ratings
async function updateProfessionalRatings(supabase: any, professionalId: string) {
  try {
    // Calculate average rating for professional
    const { data: ratingData } = await supabase
      .from('patient_evaluations')
      .select('overall_rating')
      .eq('professional_id', professionalId)
      .eq('status', 'completed')
      .not('overall_rating', 'is', null);

    if (ratingData && ratingData.length > 0) {
      const ratings = ratingData.map((r: any) => r.overall_rating);
      const averageRating = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length;
      const totalEvaluations = ratings.length;

      // Update professional stats
      await supabase
        .from('professionals')
        .update({
          average_rating: Number(averageRating.toFixed(2)),
          total_evaluations: totalEvaluations,
          updated_at: new Date().toISOString()
        })
        .eq('id', professionalId);
    }
  } catch (error) {
    console.error('Error updating professional ratings:', error);
  }
}

// Helper function to update clinic ratings
async function updateClinicRatings(supabase: any, clinicId: string) {
  try {
    // Calculate average rating for clinic
    const { data: ratingData } = await supabase
      .from('patient_evaluations')
      .select('overall_rating')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .not('overall_rating', 'is', null);

    if (ratingData && ratingData.length > 0) {
      const ratings = ratingData.map((r: any) => r.overall_rating);
      const averageRating = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length;
      const totalEvaluations = ratings.length;

      // Update clinic stats
      await supabase
        .from('clinics')
        .update({
          average_rating: Number(averageRating.toFixed(2)),
          total_evaluations: totalEvaluations,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicId);
    }
  } catch (error) {
    console.error('Error updating clinic ratings:', error);
  }
}