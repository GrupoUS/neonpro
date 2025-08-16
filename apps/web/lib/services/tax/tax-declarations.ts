// lib/services/tax/tax-declarations.ts
export type TaxDeclaration = {
  id: string;
  year: number;
  type: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  data: Record<string, any>;
  createdAt: Date;
  submittedAt?: Date;
};

export class TaxDeclarationService {
  static async createDeclaration(
    data: Omit<TaxDeclaration, 'id' | 'createdAt'>,
  ): Promise<TaxDeclaration> {
    return {
      id: Math.random().toString(36),
      createdAt: new Date(),
      ...data,
    };
  }

  static async getDeclarations(): Promise<TaxDeclaration[]> {
    return [];
  }

  static async submitDeclaration(_id: string): Promise<boolean> {
    return true;
  }
}
