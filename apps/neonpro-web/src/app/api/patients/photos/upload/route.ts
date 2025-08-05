/**
 * Patient Photo Upload API
 * Handles photo upload with facial recognition and privacy controls
 * 
 * @route POST /api/patients/photos/upload
 * @author APEX Master Developer
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PhotoRecognitionManager, defaultPhotoRecognitionConfig } from '../../../../../lib/patients/photo-recognition/photo-recognition-manager'
import { AuditLogger } from '../../../../../lib/audit/audit-logger'
import { LGPDManager } from '../../../../../lib/security/lgpd-manager'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const auditLogger = new AuditLogger(supabase)
const lgpdManager = new LGPDManager(supabase, auditLogger)
const photoManager = new PhotoRecognitionManager(
  supabase,
  auditLogger,
  lgpdManager,
  defaultPhotoRecognitionConfig
)

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const photoFile = formData.get('photo') as File
    const patientId = formData.get('patientId') as string
    const photoType = formData.get('photoType') as string || 'profile'
    
    if (!photoFile || !patientId) {
      return NextResponse.json(
        { error: 'Photo file and patient ID are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(photoFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    if (photoFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Check if patient exists
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, name')
      .eq('id', patientId)
      .single()
    
    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Upload photo with recognition
    const result = await photoManager.uploadPatientPhoto(
      patientId,
      photoFile,
      photoType as any,
      user.id
    )

    return NextResponse.json({
      success: true,
      data: {
        photoId: result.photoId,
        metadata: result.metadata,
        recognition: result.recognition ? {
          success: result.recognition.success,
          confidence: result.recognition.confidence,
          matchesFound: result.recognition.matches.length
        } : null
      }
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const photoType = searchParams.get('photoType')
    
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    // Get patient photos
    const photos = await photoManager.getPatientPhotos(
      patientId,
      photoType || undefined,
      user.id
    )

    return NextResponse.json({
      success: true,
      data: photos
    })

  } catch (error) {
    console.error('Get photos error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to get photos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

