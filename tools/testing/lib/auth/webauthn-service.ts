// WebAuthn service - CommonJS/ESM compatible export
// This module provides a unified interface for both CommonJS and ESM imports

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

export interface WebAuthnConfig {
  rpName: string;
  rpID: string;
  origin: string;
}

export class WebAuthnService {
  private readonly config: WebAuthnConfig;

  constructor(config: WebAuthnConfig) {
    this.config = config;
  }

  async generateRegistrationOptions(userID: string, userName: string) {
    return await generateRegistrationOptions({
      rpName: this.config.rpName,
      rpID: this.config.rpID,
      userID,
      userName,
      attestationType: "none",
    });
  }

  async generateAuthenticationOptions() {
    return await generateAuthenticationOptions({
      rpID: this.config.rpID,
    });
  }

  async verifyRegistration(expectedChallenge: string, credential: any) {
    return await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: this.config.origin,
      expectedRPID: this.config.rpID,
    });
  }

  async verifyAuthentication(expectedChallenge: string, credential: any) {
    return await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: this.config.origin,
      expectedRPID: this.config.rpID,
      authenticator: {
        credentialID: credential.id,
        credentialPublicKey: new Uint8Array(),
        counter: 0,
      },
    });
  }
}

// Default instance
export const webAuthnService = new WebAuthnService({
  rpName: "NeonPro Healthcare",
  rpID: "localhost",
  origin: "http://localhost:3000",
});

// CommonJS compatibility
module.exports = {
  WebAuthnService,
  webAuthnService,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
};
