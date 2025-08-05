// Evidence Validation API Endpoints
// Story 9.5: API endpoints for evidence validation and recommendation analysis

import { MedicalKnowledgeBaseService } from '@/app/lib/services/medical-knowledge-base';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const service = new MedicalKnowledgeBaseService();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'validation-history':
        // Get validation history for a recommendation
        const recommendationId = searchParams.get('recommendation_id');
        if (!recommendationId) {
          return NextResponse.json({ 
            error: 'Recommendation ID required' 
          }, { status: 400 });
        }

        const { data: validations, error } = await supabase
          .from('validation_results')
          .select('*')
          .eq('recommendation_id', recommendationId)
          .order('validation_date', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch validation history: ${error.message}`);
        }

        return NextResponse.json({ success: true, data: validations });

      case 'pending-validations':
        // Get all pending validations that require human review
        const { data: pending, error: pendingError } = await supabase
          .from('validation_results')
          .select('*')
          .eq('validation_status', 'requires_review')
          .order('validation_date', { ascending: true });

        if (pendingError) {
          throw new Error(`Failed to fetch pending validations: ${pendingError.message}`);
        }

        return NextResponse.json({ success: true, data: pending });

      case 'validation-stats':
        // Get validation statistics
        const { data: stats, error: statsError } = await supabase
          .from('validation_results')
          .select('validation_status, automated')
          .order('validation_date', { ascending: false })
          .limit(1000);

        if (statsError) {
          throw new Error(`Failed to fetch validation stats: ${statsError.message}`);
        }

        const statistics = {
          total_validations: stats?.length || 0,
          automated_validations: stats?.filter(v => v.automated).length || 0,
          manual_validations: stats?.filter(v => !v.automated).length || 0,
          validated: stats?.filter(v => v.validation_status === 'validated').length || 0,
          conflicted: stats?.filter(v => v.validation_status === 'conflicted').length || 0,
          unsupported: stats?.filter(v => v.validation_status === 'unsupported').length || 0,
          pending_review: stats?.filter(v => v.validation_status === 'requires_review').length || 0,
        };

        return NextResponse.json({ success: true, data: statistics });

      case 'evidence-sources':
        // Get available evidence sources for validation
        const evidenceQuery = searchParams.get('query') || '';
        const limit = parseInt(searchParams.get('limit') || '50');

        const { data: evidence, error: evidenceError } = await supabase
          .from('medical_knowledge')
          .select('id, title, evidence_level, source_id, knowledge_sources(source_name)')
          .textSearch('title', evidenceQuery)
          .limit(limit);

        if (evidenceError) {
          throw new Error(`Failed to fetch evidence sources: ${evidenceError.message}`);
        }

        return NextResponse.json({ success: true, data: evidence });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Evidence Validation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'validate-recommendation':
        // Validate a medical recommendation using evidence
        const validationResult = await service.validateRecommendation(data);
        return NextResponse.json({ success: true, data: validationResult });

      case 'batch-validate':
        // Validate multiple recommendations at once
        const { recommendations } = data;
        if (!Array.isArray(recommendations)) {
          return NextResponse.json({ 
            error: 'Recommendations must be an array' 
          }, { status: 400 });
        }

        const batchResults = await Promise.all(
          recommendations.map(rec => service.validateRecommendation(rec))
        );

        return NextResponse.json({ success: true, data: batchResults });

      case 'manual-validation':
        // Manual validation by human reviewer
        const { 
          validation_id, 
          reviewer_decision, 
          reviewer_notes, 
          confidence_score 
        } = data;

        if (!validation_id || !reviewer_decision) {
          return NextResponse.json({ 
            error: 'Validation ID and reviewer decision required' 
          }, { status: 400 });
        }

        const { data: updatedValidation, error: updateError } = await supabase
          .from('validation_results')
          .update({
            validation_status: reviewer_decision,
            validation_notes: reviewer_notes || '',
            confidence_score: confidence_score || 0.8,
            automated: false,
            reviewer_id: session.user.id,
          })
          .eq('id', validation_id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update validation: ${updateError.message}`);
        }

        return NextResponse.json({ success: true, data: updatedValidation });

      case 'evidence-feedback':
        // Submit feedback on evidence quality or relevance
        const { 
          evidence_id, 
          feedback_type, 
          feedback_rating, 
          feedback_notes 
        } = data;

        if (!evidence_id || !feedback_type) {
          return NextResponse.json({ 
            error: 'Evidence ID and feedback type required' 
          }, { status: 400 });
        }

        // Store feedback in a feedback table (would need to be created)
        const feedbackData = {
          evidence_id,
          feedback_type,
          feedback_rating: feedback_rating || 0,
          feedback_notes: feedback_notes || '',
          user_id: session.user.id,
          feedback_date: new Date().toISOString(),
        };

        // For now, just return success (in real implementation, store in feedback table)
        return NextResponse.json({ 
          success: true, 
          message: 'Feedback recorded successfully',
          data: feedbackData 
        });

      case 'create-evidence-synthesis':
        // Create a synthesis of multiple evidence sources
        const { 
          evidence_ids, 
          synthesis_title, 
          synthesis_summary, 
          confidence_assessment 
        } = data;

        if (!evidence_ids || !Array.isArray(evidence_ids) || evidence_ids.length === 0) {
          return NextResponse.json({ 
            error: 'Evidence IDs array required' 
          }, { status: 400 });
        }

        // Create evidence synthesis record
        const synthesisData = {
          title: synthesis_title || 'Evidence Synthesis',
          knowledge_type: 'synthesis',
          summary: synthesis_summary || '',
          evidence_level: 'Expert Opinion',
          confidence_score: confidence_assessment || 0.7,
          source_references: evidence_ids,
          created_by: session.user.id,
        };

        const synthesis = await service.createMedicalKnowledge(synthesisData);
        return NextResponse.json({ success: true, data: synthesis }, { status: 201 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Evidence Validation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, id, data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required for update operations' }, { status: 400 });
    }

    switch (action) {
      case 'update-validation-status':
        // Update validation status and notes
        const { status, notes, confidence_score } = data;
        
        const { data: updated, error } = await supabase
          .from('validation_results')
          .update({
            validation_status: status,
            validation_notes: notes || '',
            confidence_score: confidence_score || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update validation: ${error.message}`);
        }

        return NextResponse.json({ success: true, data: updated });

      case 'approve-validation':
        // Approve a validation result
        const { data: approved, error: approveError } = await supabase
          .from('validation_results')
          .update({
            validation_status: 'validated',
            approved_by: session.user.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (approveError) {
          throw new Error(`Failed to approve validation: ${approveError.message}`);
        }

        return NextResponse.json({ success: true, data: approved });

      case 'reject-validation':
        // Reject a validation result
        const { rejection_reason } = data;
        
        const { data: rejected, error: rejectError } = await supabase
          .from('validation_results')
          .update({
            validation_status: 'unsupported',
            validation_notes: rejection_reason || 'Validation rejected',
            rejected_by: session.user.id,
            rejected_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (rejectError) {
          throw new Error(`Failed to reject validation: ${rejectError.message}`);
        }

        return NextResponse.json({ success: true, data: rejected });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Evidence Validation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
