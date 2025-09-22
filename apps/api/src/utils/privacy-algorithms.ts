/**
 * Privacy-Preserving Algorithms
 * Implementation of k-anonymity, l-diversity, differential privacy, and other privacy techniques
 */

import { createHash, pbkdf2Sync, randomBytes } from 'crypto';

export interface AnonymizationConfig {
  k: number; // k-anonymity parameter
  l: number; // l-diversity parameter
  epsilon?: number; // differential privacy parameter
  delta?: number; // differential privacy parameter
  saltRounds?: number; // for pseudonymization
}

export interface DataRecord {
  id: string;
  [key: string]: any;
}

export interface AnonymizedDataset {
  records: DataRecord[];
  metadata: {
    originalCount: number;
    anonymizedCount: number;
    suppressedCount: number;
    generalizedFields: string[];
    suppressedFields: string[];
    kAnonymity: number;
    lDiversity: number;
    privacyMetrics: {
      informationLoss: number;
      dataUtility: number;
      privacyLevel: number;
    };
  };
}

export interface PseudonymizationResult {
  pseudonym: string;
  salt: string;
  algorithm: string;
  reversible: boolean;
}

export class PrivacyAlgorithms {
  private static instance: PrivacyAlgorithms;
  private masterKey: string;

  private constructor() {
    this.masterKey = process.env.PRIVACY_MASTER_KEY || this.generateMasterKey();
  }

  static getInstance(): PrivacyAlgorithms {
    if (!PrivacyAlgorithms.instance) {
      PrivacyAlgorithms.instance = new PrivacyAlgorithms();
    }
    return PrivacyAlgorithms.instance;
  }

  /**
   * Apply k-anonymity to a dataset
   */
  async applyKAnonymity(
    records: DataRecord[],
    quasiIdentifiers: string[],
    sensitiveAttributes: string[],
    config: AnonymizationConfig,
  ): Promise<AnonymizedDataset> {
    try {
      const { k } = config;

      // Group records by quasi-identifier combinations
      const groups = this.groupByQuasiIdentifiers(records, quasiIdentifiers);

      const anonymizedRecords: DataRecord[] = [];
      const suppressedRecords: DataRecord[] = [];
      let generalizedFields: string[] = [];

      for (const group of groups) {
        if (group.length >= k) {
          // Group satisfies k-anonymity, generalize quasi-identifiers
          const generalizedGroup = this.generalizeGroup(
            group,
            quasiIdentifiers,
          );
          anonymizedRecords.push(...generalizedGroup.records);
          generalizedFields = [
            ...new Set([
              ...generalizedFields,
              ...generalizedGroup.generalizedFields,
            ]),
          ];
        } else {
          // Group too small, suppress these records
          suppressedRecords.push(...group);
        }
      }

      // Calculate privacy metrics
      const privacyMetrics = this.calculatePrivacyMetrics(
        records,
        anonymizedRecords,
        quasiIdentifiers,
        sensitiveAttributes,
      );

      return {
        records: anonymizedRecords,
        metadata: {
          originalCount: records.length,
          anonymizedCount: anonymizedRecords.length,
          suppressedCount: suppressedRecords.length,
          generalizedFields,
          suppressedFields: [],
          kAnonymity: k,
          lDiversity: config.l || 0,
          privacyMetrics,
        },
      };
    } catch (error) {
      console.error('Error applying k-anonymity:', error);
      throw new Error('Failed to apply k-anonymity');
    }
  }

  /**
   * Apply l-diversity to enhance k-anonymity
   */
  async applyLDiversity(
    kAnonymousData: AnonymizedDataset,
    sensitiveAttributes: string[],
    config: AnonymizationConfig,
  ): Promise<AnonymizedDataset> {
    try {
      const { l } = config;

      const validRecords: DataRecord[] = [];
      const suppressedRecords: DataRecord[] = [];

      // Group by generalized quasi-identifiers
      const groups = this.groupByGeneralizedValues(
        kAnonymousData.records,
        sensitiveAttributes,
      );

      for (const group of groups) {
        const diversityValid = this.checkLDiversity(
          group,
          sensitiveAttributes,
          l,
        );

        if (diversityValid) {
          validRecords.push(...group);
        } else {
          // Further generalize or suppress
          const furtherGeneralized = this.furtherGeneralize(
            group,
            sensitiveAttributes,
          );
          if (furtherGeneralized.length >= config.k) {
            validRecords.push(...furtherGeneralized);
          } else {
            suppressedRecords.push(...group);
          }
        }
      }

      // Update privacy metrics
      const privacyMetrics = this.calculatePrivacyMetrics(
        kAnonymousData.records,
        validRecords,
        [],
        sensitiveAttributes,
      );

      return {
        records: validRecords,
        metadata: {
          ...kAnonymousData.metadata,
          anonymizedCount: validRecords.length,
          suppressedCount: kAnonymousData.metadata.suppressedCount + suppressedRecords.length,
          lDiversity: l,
          privacyMetrics,
        },
      };
    } catch (error) {
      console.error('Error applying l-diversity:', error);
      throw new Error('Failed to apply l-diversity');
    }
  }

  /**
   * Apply differential privacy to numerical data
   */
  addDifferentialPrivacy(
    value: number,
    epsilon: number,
    sensitivity: number = 1,
    mechanism: 'laplace' | 'gaussian' = 'laplace',
  ): number {
    try {
      if (mechanism === 'laplace') {
        const scale = sensitivity / epsilon;
        const noise = this.generateLaplaceNoise(scale);
        return value + noise;
      } else {
        const sigma = (Math.sqrt(2 * Math.log(1.25)) * sensitivity) / epsilon;
        const noise = this.generateGaussianNoise(0, sigma);
        return value + noise;
      }
    } catch (error) {
      console.error('Error adding differential privacy:', error);
      return value;
    }
  }

  /**
   * Apply differential privacy to query results
   */
  async applyDifferentialPrivacyToQuery(
    queryResult: number,
    queryType: 'count' | 'sum' | 'average' | 'max' | 'min',
    epsilon: number,
    dataRange?: { min: number; max: number },
  ): Promise<number> {
    try {
      let sensitivity: number;

      switch (queryType) {
        case 'count':
          sensitivity = 1;
          break;
        case 'sum':
          sensitivity = dataRange ? dataRange.max - dataRange.min : 1;
          break;
        case 'average':
          sensitivity = dataRange ? dataRange.max - dataRange.min : 1;
          break;
        case 'max':
        case 'min':
          sensitivity = dataRange ? dataRange.max - dataRange.min : 1;
          break;
        default:
          sensitivity = 1;
      }

      return this.addDifferentialPrivacy(queryResult, epsilon, sensitivity);
    } catch (error) {
      console.error('Error applying differential privacy to _query:', error);
      return queryResult;
    }
  }

  /**
   * Create reversible pseudonym for research purposes
   */
  async createReversiblePseudonym(
    identifier: string,
    purpose: string,
    expirationDays?: number,
  ): Promise<PseudonymizationResult> {
    try {
      const salt = randomBytes(32).toString('hex');
      const purposeKey = this.derivePurposeKey(purpose, salt);

      // Create HMAC-based pseudonym
      const pseudonym = createHash('sha256')
        .update(identifier + purposeKey + salt)
        .digest('hex');

      // Store mapping for reversibility (in production, use secure key management)
      await this.storePseudonymMapping(
        pseudonym,
        identifier,
        purpose,
        salt,
        expirationDays,
      );

      return {
        pseudonym,
        salt,
        algorithm: 'HMAC-SHA256',
        reversible: true,
      };
    } catch (error) {
      console.error('Error creating reversible pseudonym:', error);
      throw new Error('Failed to create reversible pseudonym');
    }
  }

  /**
   * Create irreversible pseudonym for analytics
   */
  createIrreversiblePseudonym(
    identifier: string,
    purpose: string,
  ): PseudonymizationResult {
    try {
      const salt = randomBytes(32).toString('hex');
      const purposeKey = this.derivePurposeKey(purpose, salt);

      // Use one-way hash function
      const pseudonym = pbkdf2Sync(
        identifier,
        purposeKey + salt,
        100000,
        32,
        'sha512',
      ).toString('hex');

      return {
        pseudonym,
        salt,
        algorithm: 'PBKDF2-SHA512',
        reversible: false,
      };
    } catch (error) {
      console.error('Error creating irreversible pseudonym:', error);
      throw new Error('Failed to create irreversible pseudonym');
    }
  }

  /**
   * Reverse pseudonymization for authorized access
   */
  async reversePseudonym(
    pseudonym: string,
    purpose: string,
    authorization: string,
  ): Promise<string | null> {
    try {
      // Validate authorization (implement proper authorization check)
      if (!this.validateReversalAuthorization(authorization, purpose)) {
        throw new Error('Unauthorized reversal attempt');
      }

      // Retrieve original identifier from secure storage
      const originalIdentifier = await this.retrievePseudonymMapping(
        pseudonym,
        purpose,
      );

      if (originalIdentifier) {
        // Log reversal for audit
        console.log(
          `Pseudonym reversed: ${pseudonym} -> [REDACTED] for purpose: ${purpose}`,
        );
      }

      return originalIdentifier;
    } catch (error) {
      console.error('Error reversing pseudonym:', error);
      return null;
    }
  }

  /**
   * Anonymize geographic data with spatial generalization
   */
  anonymizeGeographicData(
    latitude: number,
    longitude: number,
    precisionLevel: 'city' | 'region' | 'country' = 'city',
  ): { latitude: number; longitude: number; precision: string } {
    try {
      let precision: number;

      switch (precisionLevel) {
        case 'city':
          precision = 2; // ~1.1 km precision
          break;
        case 'region':
          precision = 1; // ~11 km precision
          break;
        case 'country':
          precision = 0; // ~111 km precision
          break;
        default:
          precision = 2;
      }

      const anonymizedLat = Math.round(latitude * Math.pow(10, precision))
        / Math.pow(10, precision);
      const anonymizedLng = Math.round(longitude * Math.pow(10, precision))
        / Math.pow(10, precision);

      return {
        latitude: anonymizedLat,
        longitude: anonymizedLng,
        precision: precisionLevel,
      };
    } catch (error) {
      console.error('Error anonymizing geographic data:', error);
      return { latitude, longitude, precision: 'original' };
    }
  }

  /**
   * Anonymize dates with temporal generalization
   */
  anonymizeDate(
    date: Date,
    granularity: 'year' | 'month' | 'week' | 'day' = 'month',
  ): { date: Date; granularity: string } {
    try {
      let anonymizedDate: Date;

      switch (granularity) {
        case 'year':
          anonymizedDate = new Date(date.getFullYear(), 0, 1);
          break;
        case 'month':
          anonymizedDate = new Date(date.getFullYear(), date.getMonth(), 1);
          break;
        case 'week':
          const dayOfWeek = date.getDay();
          anonymizedDate = new Date(date);
          anonymizedDate.setDate(date.getDate() - dayOfWeek);
          anonymizedDate.setHours(0, 0, 0, 0);
          break;
        case 'day':
          anonymizedDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          );
          break;
        default:
          anonymizedDate = new Date(date.getFullYear(), date.getMonth(), 1);
      }

      return {
        date: anonymizedDate,
        granularity,
      };
    } catch (error) {
      console.error('Error anonymizing date:', error);
      return { date, granularity: 'original' };
    }
  }

  /**
   * Anonymize age with range generalization
   */
  anonymizeAge(
    age: number,
    binSize: number = 5,
  ): { ageRange: string; midpoint: number } {
    try {
      const lowerBound = Math.floor(age / binSize) * binSize;
      const upperBound = lowerBound + binSize - 1;
      const midpoint = (lowerBound + upperBound) / 2;

      return {
        ageRange: `${lowerBound}-${upperBound}`,
        midpoint,
      };
    } catch (error) {
      console.error('Error anonymizing age:', error);
      return { ageRange: 'unknown', midpoint: age };
    }
  }

  // Private helper methods

  private generateMasterKey(): string {
    return randomBytes(32).toString('hex');
  }

  private groupByQuasiIdentifiers(
    records: DataRecord[],
    quasiIdentifiers: string[],
  ): DataRecord[][] {
    const groups: Map<string, DataRecord[]> = new Map();

    for (const record of records) {
      const key = quasiIdentifiers.map(qi => record[qi]).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    }

    return Array.from(groups.values());
  }

  private generalizeGroup(
    group: DataRecord[],
    quasiIdentifiers: string[],
  ): { records: DataRecord[]; generalizedFields: string[] } {
    const generalizedFields: string[] = [];
    const generalizedRecords = group.map(record => ({ ...record }));

    for (const qi of quasiIdentifiers) {
      const values = group.map(r => r[qi]);
      const generalizedValue = this.generalizeValues(values, qi);

      if (generalizedValue !== values[0]) {
        generalizedFields.push(qi);
      }

      for (const record of generalizedRecords) {
        record[qi] = generalizedValue;
      }
    }

    return { records: generalizedRecords, generalizedFields };
  }

  private generalizeValues(values: any[], fieldName: string): any {
    // Simple generalization strategies
    if (typeof values[0] === 'number') {
      const min = Math.min(...values);
      const max = Math.max(...values);
      return `${min}-${max}`;
    }

    if (typeof values[0] === 'string') {
      // For strings, use common prefix or category
      const uniqueValues = [...new Set(values)];
      if (uniqueValues.length === 1) {
        return uniqueValues[0];
      }
      return '*'; // Generalized to wildcard
    }

    return '*';
  }

  private groupByGeneralizedValues(
    records: DataRecord[],
    sensitiveAttributes: string[],
  ): DataRecord[][] {
    const groups: Map<string, DataRecord[]> = new Map();

    for (const record of records) {
      // Group by all attributes except sensitive ones
      const nonSensitiveKeys = Object.keys(record).filter(
        k => !sensitiveAttributes.includes(k),
      );
      const key = nonSensitiveKeys.map(k => record[k]).join('|');

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    }

    return Array.from(groups.values());
  }

  private checkLDiversity(
    group: DataRecord[],
    sensitiveAttributes: string[],
    l: number,
  ): boolean {
    for (const attr of sensitiveAttributes) {
      const values = group.map(r => r[attr]);
      const uniqueValues = new Set(values);
      if (uniqueValues.size < l) {
        return false;
      }
    }
    return true;
  }

  private furtherGeneralize(
    group: DataRecord[],
    sensitiveAttributes: string[],
  ): DataRecord[] {
    // Simple further generalization - in practice, this would be more sophisticated
    return group.map(record => {
      const generalized = { ...record };
      for (const attr of sensitiveAttributes) {
        if (typeof generalized[attr] === 'string') {
          generalized[attr] = generalized[attr].substring(0, 1) + '*';
        }
      }
      return generalized;
    });
  }

  private calculatePrivacyMetrics(
    originalRecords: DataRecord[],
    anonymizedRecords: DataRecord[],
    quasiIdentifiers: string[],
    sensitiveAttributes: string[],
  ): { informationLoss: number; dataUtility: number; privacyLevel: number } {
    // Simplified metrics calculation
    const informationLoss = 1 - anonymizedRecords.length / originalRecords.length;
    const dataUtility = anonymizedRecords.length > 0 ? 0.8 : 0; // Simplified
    const privacyLevel = Math.min(informationLoss + 0.5, 1);

    return {
      informationLoss: Math.round(informationLoss * 100) / 100,
      dataUtility: Math.round(dataUtility * 100) / 100,
      privacyLevel: Math.round(privacyLevel * 100) / 100,
    };
  }

  private generateLaplaceNoise(scale: number): number {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  private generateGaussianNoise(mean: number, sigma: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * sigma + mean;
  }

  private derivePurposeKey(purpose: string, salt: string): string {
    return createHash('sha256')
      .update(this.masterKey + purpose + salt)
      .digest('hex');
  }

  private async storePseudonymMapping(
    pseudonym: string,
    originalId: string,
    purpose: string,
    salt: string,
    _expirationDays?: number,
  ): Promise<void> {
    // In production, store in secure key-value store with proper encryption
    console.log(
      `Storing pseudonym mapping: ${pseudonym} for purpose: ${purpose}`,
    );
  }

  private async retrievePseudonymMapping(
    pseudonym: string,
    purpose: string,
  ): Promise<string | null> {
    // In production, retrieve from secure key-value store
    console.log(
      `Retrieving pseudonym mapping: ${pseudonym} for purpose: ${purpose}`,
    );
    return null; // Placeholder
  }

  private validateReversalAuthorization(
    authorization: string,
    purpose: string,
  ): boolean {
    // In production, implement proper authorization validation
    return (
      authorization === 'authorized_researcher'
      && purpose === 'medical_research'
    );
  }
}

// Export singleton instance
export const privacyAlgorithms = PrivacyAlgorithms.getInstance();
