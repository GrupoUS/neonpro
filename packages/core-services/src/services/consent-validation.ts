// Consent validation service (Phase 1)

export interface ConsentContext {
  _userId: string;
  clinicId: string;
  consentStatus: "valid" | "missing" | "invalid";
}

export class ConsentValidationService {
  hasValidConsent(ctx: ConsentContext): boolean {
    return ctx.consentStatus === "valid";
  }
}
