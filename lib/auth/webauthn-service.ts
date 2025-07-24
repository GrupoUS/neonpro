/**
 * WebAuthn Service for TASK-002: Multi-Factor Authentication Enhancement
 * 
 * Provides WebAuthn/FIDO2 authentication capabilities including:
 * - Passwordless authentication
 * - Multi-factor authentication
 * - Biometric authentication support
 * - Trusted device management
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type VerifyAuthenticationResponseOpts,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';

import { createClient } from '../../app/utils/supabase/server';
import { trackMFAVerification } from './performance-tracker';
import { logAnalyticsEvent } from '@/lib/monitoring/analytics';

export interface WebAuthnCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: Uint8Array;
  counter: number;
  device_type: 'platform' | 'cross-platform';
  device_name?: string;
  created_at: Date;
  last_used_at?: Date;
  is_active: boolean;
  backup_eligible: boolean;
  backup_state: boolean;
  transports: string[];
  aaguid?: string;
}

export interface WebAuthnRegistrationOptions {
  userId: string;
  userName: string;
  userDisplayName: string;
  deviceName?: string;
}

export interface WebAuthnAuthenticationOptions {
  userId?: string;
  allowCredentials?: boolean;
}

class WebAuthnService {
  private readonly rpName = 'NeonPro';
  private readonly rpID = process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || 'localhost';
  private readonly origin = process.env.NEXT_PUBLIC_WEBAUTHN_ORIGIN || 'http://localhost:3000';
  
  /**
   * Generate registration options for new WebAuthn credential
   */
  async generateRegistrationOptions(options: WebAuthnRegistrationOptions) {
    const supabase = await createClient();
    
    // Get existing credentials for user to exclude
    const { data: existingCredentials } = await supabase
      .from('webauthn_credentials')
      .select('credential_id')
      .eq('user_id', options.userId)
      .eq('is_active', true);

    const excludeCredentials = existingCredentials?.map(cred => ({
      id: cred.credential_id,
      type: 'public-key' as const,
    })) || [];

    const registrationOptions = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: options.userId,
      userName: options.userName,
      userDisplayName: options.userDisplayName,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    // Store challenge temporarily (in production, use Redis or secure session storage)
    await this.storeChallenge(options.userId, registrationOptions.challenge, 'registration');

    // Log analytics
    await logAnalyticsEvent('webauthn_registration_started', {
      userId: options.userId,
      deviceName: options.deviceName,
      timestamp: new Date().toISOString(),
    });

    return registrationOptions;
  }

  /**
   * Verify registration response and store credential
   */
  async verifyRegistrationResponse(
    userId: string,
    response: RegistrationResponseJSON,
    deviceName?: string
  ) {
    return trackMFAVerification(async () => {
      const supabase = await createClient();
      
      // Get stored challenge
      const challenge = await this.getChallenge(userId, 'registration');
      if (!challenge) {
        throw new Error('No registration challenge found');
      }

      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: challenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        requireUserVerification: true,
      });

      if (!verification.verified || !verification.registrationInfo) {
        await logAnalyticsEvent('webauthn_registration_failed', {
          userId,
          error: 'Verification failed',
          timestamp: new Date().toISOString(),
        });
        throw new Error('WebAuthn registration verification failed');
      }

      // Store credential in database
      const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
      
      const { error } = await supabase
        .from('webauthn_credentials')
        .insert({
          user_id: userId,
          credential_id: credentialID,
          public_key: credentialPublicKey,
          counter,
          device_type: credentialDeviceType,
          device_name: deviceName,
          backup_eligible: credentialBackedUp,
          backup_state: credentialBackedUp,
          transports: response.response.transports || [],
        });

      if (error) {
        throw new Error(`Failed to store WebAuthn credential: ${error.message}`);
      }

      // Clean up challenge
      await this.removeChallenge(userId, 'registration');

      await logAnalyticsEvent('webauthn_registration_success', {
        userId,
        deviceName,
        deviceType: credentialDeviceType,
        timestamp: new Date().toISOString(),
      });

      return verification;
    }, {
      userId,
      method: 'webauthn',
      additionalData: { deviceName, operation: 'registration' },
    });
  }

  /**
   * Generate authentication options for WebAuthn login
   */
  async generateAuthenticationOptions(options: WebAuthnAuthenticationOptions = {}) {
    const supabase = await createClient();
    let allowCredentials;

    if (options.userId) {
      // Get user's credentials
      const { data: credentials } = await supabase
        .from('webauthn_credentials')
        .select('credential_id, transports')
        .eq('user_id', options.userId)
        .eq('is_active', true);

      allowCredentials = credentials?.map(cred => ({
        id: cred.credential_id,
        type: 'public-key' as const,
        transports: cred.transports as AuthenticatorTransport[],
      }));
    }

    const authenticationOptions = await generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials: options.allowCredentials !== false ? allowCredentials : undefined,
      userVerification: 'preferred',
      rpID: this.rpID,
    });

    // Store challenge
    const challengeKey = options.userId ? options.userId : 'anonymous';
    await this.storeChallenge(challengeKey, authenticationOptions.challenge, 'authentication');

    await logAnalyticsEvent('webauthn_authentication_started', {
      userId: options.userId,
      hasAllowCredentials: !!allowCredentials?.length,
      timestamp: new Date().toISOString(),
    });

    return authenticationOptions;
  }

  /**
   * Verify authentication response
   */
  async verifyAuthenticationResponse(
    response: AuthenticationResponseJSON,
    userId?: string
  ) {
    return trackMFAVerification(async () => {
      const supabase = await createClient();
      
      // Get credential from database
      const { data: credential } = await supabase
        .from('webauthn_credentials')
        .select('*')
        .eq('credential_id', response.id)
        .eq('is_active', true)
        .single();

      if (!credential) {
        throw new Error('WebAuthn credential not found');
      }

      // Get stored challenge
      const challengeKey = userId || credential.user_id;
      const challenge = await this.getChallenge(challengeKey, 'authentication');
      if (!challenge) {
        throw new Error('No authentication challenge found');
      }

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: challenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        authenticator: {
          credentialID: credential.credential_id,
          credentialPublicKey: new Uint8Array(credential.public_key),
          counter: credential.counter,
          transports: credential.transports as AuthenticatorTransport[],
        },
        requireUserVerification: true,
      });

      if (!verification.verified) {
        await logAnalyticsEvent('webauthn_authentication_failed', {
          userId: credential.user_id,
          credentialId: credential.credential_id,
          timestamp: new Date().toISOString(),
        });
        throw new Error('WebAuthn authentication verification failed');
      }

      // Update credential counter and last used
      await supabase
        .from('webauthn_credentials')
        .update({
          counter: verification.authenticationInfo.newCounter,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', credential.id);

      // Clean up challenge
      await this.removeChallenge(challengeKey, 'authentication');

      await logAnalyticsEvent('webauthn_authentication_success', {
        userId: credential.user_id,
        credentialId: credential.credential_id,
        deviceType: credential.device_type,
        timestamp: new Date().toISOString(),
      });

      return {
        verified: verification.verified,
        userId: credential.user_id,
        credentialId: credential.credential_id,
        authenticationInfo: verification.authenticationInfo,
      };
    }, {
      userId: userId || credential?.user_id,
      method: 'webauthn',
      additionalData: { operation: 'authentication' },
    });
  }

  /**
   * Get user's WebAuthn credentials
   */
  async getUserCredentials(userId: string): Promise<WebAuthnCredential[]> {
    const supabase = await createClient();
    
    const { data: credentials, error } = await supabase
      .from('webauthn_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch WebAuthn credentials: ${error.message}`);
    }

    return credentials || [];
  }

  /**
   * Remove a WebAuthn credential
   */
  async removeCredential(userId: string, credentialId: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('webauthn_credentials')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('credential_id', credentialId);

    if (error) {
      throw new Error(`Failed to remove WebAuthn credential: ${error.message}`);
    }

    await logAnalyticsEvent('webauthn_credential_removed', {
      userId,
      credentialId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Store challenge temporarily (implement with Redis in production)
   */
  private async storeChallenge(userId: string, challenge: string, type: 'registration' | 'authentication'): Promise<void> {
    // For now, using simple in-memory storage
    // In production, use Redis or secure session storage
    if (typeof globalThis !== 'undefined') {
      if (!globalThis.webauthnChallenges) {
        globalThis.webauthnChallenges = new Map();
      }
      globalThis.webauthnChallenges.set(`${userId}:${type}`, {
        challenge,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get stored challenge
   */
  private async getChallenge(userId: string, type: 'registration' | 'authentication'): Promise<string | null> {
    if (typeof globalThis !== 'undefined' && globalThis.webauthnChallenges) {
      const data = globalThis.webauthnChallenges.get(`${userId}:${type}`);
      if (data && Date.now() - data.timestamp < 300000) { // 5 minutes
        return data.challenge;
      }
    }
    return null;
  }

  /**
   * Remove stored challenge
   */
  private async removeChallenge(userId: string, type: 'registration' | 'authentication'): Promise<void> {
    if (typeof globalThis !== 'undefined' && globalThis.webauthnChallenges) {
      globalThis.webauthnChallenges.delete(`${userId}:${type}`);
    }
  }
}

// Export singleton instance
export const webAuthnService = new WebAuthnService();

declare global {
  var webauthnChallenges: Map<string, { challenge: string; timestamp: number }> | undefined;
}