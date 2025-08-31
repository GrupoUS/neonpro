/**
 * Handoff Token Validation API
 * T3.3: Cross-Device Continuity e QR Handoff System
 * 
 * Validates tokens and facilitates secure cross-device session transfer
 * Features:
 * - Token signature verification
 * - Device fingerprint comparison
 * - One-time use enforcement
 * - Session state restoration
 * - LGPD compliant audit logging
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import crypto from 'node:crypto';

interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface TokenValidationRequest {
  token: string;
  targetDevice: DeviceFingerprint;
}

// Reuse encryption service from generate route
class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';

  private static getEncryptionKey(): Buffer {
    const key = process.env.HANDOFF_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('HANDOFF_ENCRYPTION_KEY environment variable is required');
    }
    return Buffer.from(key, 'hex');
  }

  static decrypt(encryptedData: string, ivHex: string, tagHex: string): any {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.ALGORITHM, key);
    decipher.setAAD(Buffer.from('handoff-token'));
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}

// Token validation service
class TokenValidationService {
  static verifyAndDecodeToken(token: string): any {
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64url').toString());
      const { encrypted, iv, tag, expiresAt } = tokenData;

      // Quick expiry check
      if (Date.now() > expiresAt) {
        throw new Error('Token has expired');
      }

      // Decrypt and return payload
      return EncryptionService.decrypt(encrypted, iv, tag);
    } catch (error) {
      throw new Error(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static validateDeviceFingerprint(sourceDevice: DeviceFingerprint, targetDevice: DeviceFingerprint): {
    isValid: boolean;
    isDifferentDevice: boolean;
    riskScore: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check if devices are different (required for security)
    const isDifferentDevice = sourceDevice.userAgent !== targetDevice.userAgent ||
                             sourceDevice.screenResolution !== targetDevice.screenResolution;

    if (!isDifferentDevice) {
      reasons.push('Same device fingerprint detected - potential security risk');
      riskScore += 50;
    }

    // Check for suspicious patterns
    if (sourceDevice.timezone !== targetDevice.timezone) {
      const timezoneRisk = Math.abs(
        new Date().getTimezoneOffset() - 
        parseInt(targetDevice.timezone.split('GMT')[1] || '0') * 60
      );
      if (timezoneRisk > 720) { // More than 12 hours difference
        reasons.push('Significant timezone difference detected');
        riskScore += 20;
      }
    }

    // Device type transition validation
    const validTransitions = [
      ['mobile', 'tablet'], ['mobile', 'desktop'],
      ['tablet', 'mobile'], ['tablet', 'desktop'],
      ['desktop', 'mobile'], ['desktop', 'tablet']
    ];

    const transition = [sourceDevice.deviceType, targetDevice.deviceType];
    const isValidTransition = validTransitions.some(
      validTransition => validTransition[0] === transition[0] && validTransition[1] === transition[1]
    );

    if (!isValidTransition && isDifferentDevice) {
      reasons.push('Unusual device type transition');
      riskScore += 10;
    }

    return {
      isValid: riskScore < 70, // Allow some risk but block high-risk transfers
      isDifferentDevice,
      riskScore,
      reasons
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Parse request body
    const body: TokenValidationRequest = await request.json();
    const { token, targetDevice } = body;

    // Validate input
    if (!token || !targetDevice) {
      return NextResponse.json(
        { error: 'Missing required fields: token, targetDevice' },
        { status: 400 }
      );
    }

    // Decode and verify token
    let decodedToken;
    try {
      decodedToken = TokenValidationService.verifyAndDecodeToken(token);
    } catch (error) {
      await supabase
        .from('handoff_audit_log')
        .insert({
          action: 'validation_failed',
          target_device_fingerprint: targetDevice,
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });

      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const { sessionId, deviceFingerprint: sourceDevice, payload } = decodedToken;

    // Check if token exists and is still active in database
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('handoff_tokens')
      .select('*')
      .eq('id', sessionId)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenRecord) {
      await supabase
        .from('handoff_audit_log')
        .insert({
          token_id: sessionId,
          action: 'validation_failed',
          target_device_fingerprint: targetDevice,
          success: false,
          error_message: 'Token not found or already used'
        });

      return NextResponse.json(
        { error: 'Token not found or already used' },
        { status: 400 }
      );
    }

    // Validate device fingerprints
    const deviceValidation = TokenValidationService.validateDeviceFingerprint(
      sourceDevice,
      targetDevice
    );

    if (!deviceValidation.isValid) {
      await supabase
        .from('handoff_audit_log')
        .insert({
          token_id: sessionId,
          action: 'validation_failed',
          source_device_fingerprint: sourceDevice,
          target_device_fingerprint: targetDevice,
          success: false,
          error_message: `Device validation failed: ${deviceValidation.reasons.join(', ')}`
        });

      return NextResponse.json(
        { 
          error: 'Device validation failed',
          reasons: deviceValidation.reasons,
          riskScore: deviceValidation.riskScore
        },
        { status: 403 }
      );
    }

    // Mark token as used (one-time use enforcement)
    const { error: updateError } = await supabase
      .from('handoff_tokens')
      .update({ 
        is_active: false,
        used_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Failed to mark token as used:', updateError);
      return NextResponse.json(
        { error: 'Token processing failed' },
        { status: 500 }
      );
    }

    // Create success audit log
    await supabase
      .from('handoff_audit_log')
      .insert({
        token_id: sessionId,
        action: 'validated',
        source_device_fingerprint: sourceDevice,
        target_device_fingerprint: targetDevice,
        success: true
      });

    // Return session data for restoration
    const response = {
      success: true,
      sessionData: payload.sessionData,
      userId: payload.userId,
      userEmail: payload.userEmail,
      transferredAt: new Date().toISOString(),
      sourceDevice: {
        type: sourceDevice.deviceType,
        fingerprint: sourceDevice
      },
      targetDevice: {
        type: targetDevice.deviceType,
        fingerprint: targetDevice
      },
      deviceValidation: {
        riskScore: deviceValidation.riskScore,
        isDifferentDevice: deviceValidation.isDifferentDevice
      },
      message: 'Session transferred successfully'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Handoff token validation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}