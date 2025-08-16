/**
 * WebAuthn Client Utilities for TASK-002: Multi-Factor Authentication Enhancement
 *
 * Provides client-side WebAuthn/FIDO2 functionality including:
 * - Registration flow
 * - Authentication flow
 * - Browser compatibility checking
 * - Error handling
 */

import {
  type AuthenticationResponseJSON,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  type RegistrationResponseJSON,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';

export type WebAuthnRegistrationResult = {
  success: boolean;
  response?: RegistrationResponseJSON;
  error?: string;
};

export type WebAuthnAuthenticationResult = {
  success: boolean;
  response?: AuthenticationResponseJSON;
  error?: string;
};

export type WebAuthnCapabilities = {
  supported: boolean;
  platformAuthenticatorAvailable: boolean;
  userAgent: string;
};

class WebAuthnClient {
  /**
   * Check browser WebAuthn capabilities
   */
  async checkCapabilities(): Promise<WebAuthnCapabilities> {
    const supported = browserSupportsWebAuthn();
    let platformAuthenticatorAvailable = false;

    if (supported) {
      try {
        platformAuthenticatorAvailable =
          await platformAuthenticatorIsAvailable();
      } catch (_error) {}
    }

    return {
      supported,
      platformAuthenticatorAvailable,
      userAgent: navigator.userAgent,
    };
  }

  /**
   * Register a new WebAuthn credential
   */
  async registerCredential(
    deviceName?: string,
  ): Promise<WebAuthnRegistrationResult> {
    try {
      // Check browser support
      const capabilities = await this.checkCapabilities();
      if (!capabilities.supported) {
        return {
          success: false,
          error: 'WebAuthn is not supported in this browser',
        };
      }

      // Get registration options from server
      const optionsResponse = await fetch(
        '/api/auth/webauthn/register/options',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deviceName }),
        },
      );

      if (!optionsResponse.ok) {
        const error = await optionsResponse.text();
        return {
          success: false,
          error: `Failed to get registration options: ${error}`,
        };
      }

      const options = await optionsResponse.json();

      // Start WebAuthn registration
      const registrationResponse = await startRegistration(options);

      // Verify registration with server
      const verificationResponse = await fetch(
        '/api/auth/webauthn/register/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            response: registrationResponse,
            deviceName,
          }),
        },
      );

      if (!verificationResponse.ok) {
        const error = await verificationResponse.text();
        return {
          success: false,
          error: `Registration verification failed: ${error}`,
        };
      }

      return {
        success: true,
        response: registrationResponse,
      };
    } catch (error) {
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        // Handle common WebAuthn errors
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Operation was cancelled or timed out';
        } else if (error.name === 'SecurityError') {
          errorMessage =
            'Security error - ensure you are on a secure connection';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'This authenticator is not supported';
        } else if (error.name === 'InvalidStateError') {
          errorMessage = 'Authenticator already registered for this account';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Authenticate with WebAuthn credential
   */
  async authenticateWithCredential(
    userIdentifier?: string,
  ): Promise<WebAuthnAuthenticationResult> {
    try {
      // Check browser support
      const capabilities = await this.checkCapabilities();
      if (!capabilities.supported) {
        return {
          success: false,
          error: 'WebAuthn is not supported in this browser',
        };
      }

      // Get authentication options from server
      const optionsResponse = await fetch(
        '/api/auth/webauthn/authenticate/options',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userIdentifier }),
        },
      );

      if (!optionsResponse.ok) {
        const error = await optionsResponse.text();
        return {
          success: false,
          error: `Failed to get authentication options: ${error}`,
        };
      }

      const options = await optionsResponse.json();

      // Start WebAuthn authentication
      const authenticationResponse = await startAuthentication(options);

      // Verify authentication with server
      const verificationResponse = await fetch(
        '/api/auth/webauthn/authenticate/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            response: authenticationResponse,
            userIdentifier,
          }),
        },
      );

      if (!verificationResponse.ok) {
        const error = await verificationResponse.text();
        return {
          success: false,
          error: `Authentication verification failed: ${error}`,
        };
      }

      return {
        success: true,
        response: authenticationResponse,
      };
    } catch (error) {
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        // Handle common WebAuthn errors
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Operation was cancelled or timed out';
        } else if (error.name === 'SecurityError') {
          errorMessage =
            'Security error - ensure you are on a secure connection';
        } else if (error.name === 'InvalidStateError') {
          errorMessage = 'No valid authenticator found';
        } else if (error.name === 'UnknownError') {
          errorMessage = 'Authentication failed - please try again';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if WebAuthn is available and suggest best flow
   */
  async getSuggestedAuthFlow(): Promise<{
    recommended: 'webauthn' | 'password' | 'hybrid';
    capabilities: WebAuthnCapabilities;
    reasons: string[];
  }> {
    const capabilities = await this.checkCapabilities();
    const reasons: string[] = [];

    if (!capabilities.supported) {
      reasons.push('WebAuthn not supported in this browser');
      return {
        recommended: 'password',
        capabilities,
        reasons,
      };
    }

    if (capabilities.platformAuthenticatorAvailable) {
      reasons.push(
        'Platform authenticator (Touch ID, Face ID, Windows Hello) available',
      );
      return {
        recommended: 'webauthn',
        capabilities,
        reasons,
      };
    }

    // Check for security keys or external authenticators
    try {
      // This is a rough check - in a real implementation you might want to check
      // for registered credentials or use conditional mediation
      reasons.push('WebAuthn supported but no platform authenticator detected');
      return {
        recommended: 'hybrid',
        capabilities,
        reasons,
      };
    } catch (_error) {
      reasons.push('WebAuthn available but limited support detected');
      return {
        recommended: 'password',
        capabilities,
        reasons,
      };
    }
  }

  /**
   * Test WebAuthn functionality (for debugging)
   */
  async testWebAuthnSupport(): Promise<{
    browserSupport: boolean;
    platformAuthenticator: boolean;
    conditionalMediation: boolean;
    userAgent: string;
    errors: string[];
  }> {
    const errors: string[] = [];

    const browserSupport = browserSupportsWebAuthn();
    if (!browserSupport) {
      errors.push('Browser does not support WebAuthn');
    }

    let platformAuthenticator = false;
    try {
      platformAuthenticator = await platformAuthenticatorIsAvailable();
    } catch (error) {
      errors.push(`Platform authenticator check failed: ${error}`);
    }

    let conditionalMediation = false;
    try {
      conditionalMediation =
        await PublicKeyCredential.isConditionalMediationAvailable();
    } catch (error) {
      errors.push(`Conditional mediation check failed: ${error}`);
    }

    return {
      browserSupport,
      platformAuthenticator,
      conditionalMediation,
      userAgent: navigator.userAgent,
      errors,
    };
  }
}

// Export singleton instance
export const webAuthnClient = new WebAuthnClient();

// Helper function for React components
export const useWebAuthnCapabilities = async () => {
  return await webAuthnClient.checkCapabilities();
};

// Helper function to get user-friendly error messages
export const getWebAuthnErrorMessage = (error: string): string => {
  const errorMap: Record<string, string> = {
    NotAllowedError:
      'Authentication was cancelled or timed out. Please try again.',
    SecurityError:
      'Security error occurred. Make sure you are on a secure connection (HTTPS).',
    NotSupportedError:
      'This authenticator is not supported. Try a different device or method.',
    InvalidStateError:
      'Invalid state. The authenticator may already be registered or not found.',
    UnknownError: 'An unexpected error occurred. Please try again.',
    AbortError: 'Operation was aborted. Please try again.',
  };

  // Check if error starts with any known error type
  for (const [errorType, message] of Object.entries(errorMap)) {
    if (error.includes(errorType)) {
      return message;
    }
  }

  return error || 'An unknown error occurred. Please try again.';
};
