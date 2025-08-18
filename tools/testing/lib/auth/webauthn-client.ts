/**
 * WebAuthn Client Service Mock
 * Mock implementation for WebAuthn client-side functionality
 */

export type WebAuthnCredential = {
  id: string;
  rawId: ArrayBuffer;
  type: 'public-key';
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject?: ArrayBuffer;
    authenticatorData?: ArrayBuffer;
    signature?: ArrayBuffer;
    userHandle?: ArrayBuffer;
  };
};

export type WebAuthnRegistrationOptions = {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: 'public-key';
    alg: number;
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    userVerification?: 'required' | 'preferred' | 'discouraged';
    requireResidentKey?: boolean;
  };
  timeout?: number;
  excludeCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: Array<'usb' | 'nfc' | 'ble' | 'internal'>;
  }>;
};

export type WebAuthnAuthenticationOptions = {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: Array<'usb' | 'nfc' | 'ble' | 'internal'>;
  }>;
  userVerification?: 'required' | 'preferred' | 'discouraged';
};

export class WebAuthnClient {
  private static instance: WebAuthnClient | null = null;
  private isSupported = false;

  constructor() {
    // Mock browser support detection
    this.isSupported =
      typeof window !== 'undefined' &&
      'credentials' in navigator &&
      'create' in navigator.credentials;
  }

  static getInstance(): WebAuthnClient {
    if (!WebAuthnClient.instance) {
      WebAuthnClient.instance = new WebAuthnClient();
    }
    return WebAuthnClient.instance;
  }

  isWebAuthnSupported(): boolean {
    return this.isSupported;
  }

  async register(
    options: WebAuthnRegistrationOptions
  ): Promise<WebAuthnCredential> {
    if (!this.isSupported) {
      throw new Error('WebAuthn is not supported in this environment');
    }

    // Mock successful registration
    return {
      id: 'mock-credential-id',
      rawId: new ArrayBuffer(32),
      type: 'public-key',
      response: {
        clientDataJSON: new ArrayBuffer(128),
        attestationObject: new ArrayBuffer(256),
      },
    };
  }

  async authenticate(
    options: WebAuthnAuthenticationOptions
  ): Promise<WebAuthnCredential> {
    if (!this.isSupported) {
      throw new Error('WebAuthn is not supported in this environment');
    }

    // Mock successful authentication
    return {
      id: 'mock-credential-id',
      rawId: new ArrayBuffer(32),
      type: 'public-key',
      response: {
        clientDataJSON: new ArrayBuffer(128),
        authenticatorData: new ArrayBuffer(256),
        signature: new ArrayBuffer(64),
        userHandle: new ArrayBuffer(32),
      },
    };
  }

  getStoredCredentials(): Promise<WebAuthnCredential[]> {
    // Mock stored credentials
    return [
      {
        id: 'stored-credential-1',
        rawId: new ArrayBuffer(32),
        type: 'public-key',
        response: {
          clientDataJSON: new ArrayBuffer(128),
        },
      },
    ];
  }

  async deleteCredential(credentialId: string): Promise<boolean> {
    // Mock successful deletion
    return true;
  }

  getCapabilities() {
    return {
      supportsUserVerification: true,
      supportsResidentKeys: true,
      supportedTransports: ['usb', 'nfc', 'ble', 'internal'],
      maxCredentials: 10,
    };
  }
}

// Export singleton instance
export const webAuthnClient = WebAuthnClient.getInstance();

// Default export
export default webAuthnClient;
