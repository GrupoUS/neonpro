// LGPD Manager - Centralized LGPD compliance management
import { LGPDCore } from './lgpd-core';

export class LGPDManager {
  private static instance: LGPDManager;
  private lgpdCore: LGPDCore;

  private constructor() {
    this.lgpdCore = new LGPDCore();
  }

  public static getInstance(): LGPDManager {
    if (!LGPDManager.instance) {
      LGPDManager.instance = new LGPDManager();
    }
    return LGPDManager.instance;
  }

  public async validateConsent(userId: string, purpose: string): Promise<boolean> {
    try {
      return await this.lgpdCore.hasValidConsent(userId, purpose);
    } catch (error) {
      console.error('Error validating consent:', error);
      return false;
    }
  }

  public async recordDataAccess(userId: string, dataType: string): Promise<void> {
    try {
      await this.lgpdCore.logDataAccess(userId, dataType);
    } catch (error) {
      console.error('Error recording data access:', error);
    }
  }

  public async processDataSubjectRequest(request: any): Promise<any> {
    try {
      return await this.lgpdCore.handleDataSubjectRequest(request);
    } catch (error) {
      console.error('Error processing data subject request:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default LGPDManager.getInstance();
