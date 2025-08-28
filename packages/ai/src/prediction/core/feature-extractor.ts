import type { PatientProfile, SkinType, TreatmentRequest } from "../types";

/**
 * Feature Extraction for AI Prediction Models
 * Converts patient and treatment data into ML-ready feature vectors
 */
export class AestheticFeatureExtractor {
  /**
   * Extract comprehensive features for treatment outcome prediction
   */
  async extractTreatmentFeatures(
    patient: PatientProfile,
    treatment: TreatmentRequest,
  ): Promise<number[]> {
    const features: number[] = [];

    // Patient demographic features (0-5)
    features.push(
      patient.age / 100, // Normalized age
      this.encodeGender(patient.gender),
      this.encodeSkinType(patient.skinType),
      patient.medicalHistory.bloodThinnersUse ? 1 : 0,
      patient.medicalHistory.keloidProneness ? 1 : 0,
      patient.medicalHistory.autoimmuneDiseases.length / 10, // Normalized count
    );

    // Lifestyle factors (6-12)
    features.push(
      patient.lifestyle.smoking ? 1 : 0,
      this.encodeSmokingFrequency(patient.lifestyle.smokingFrequency),
      this.encodeSunExposure(patient.lifestyle.sunExposure),
      patient.lifestyle.stressLevel / 10, // Normalized 1-10 scale
      patient.lifestyle.sleepQuality / 10, // Normalized 1-10 scale
      patient.lifestyle.skincare.sunscreenUse ? 1 : 0,
      patient.lifestyle.skincare.retinoidUse ? 1 : 0,
    );

    // Treatment history features (13-17)
    const relevantHistory = patient.previousTreatments.filter(
      (t) => t.type === treatment.treatmentType,
    );
    features.push(
      relevantHistory.length / 5, // Normalized count
      relevantHistory.length > 0
        ? relevantHistory.reduce((sum, t) => sum + t.satisfaction, 0) /
            (relevantHistory.length * 10)
        : 0,
      relevantHistory.length > 0
        ? relevantHistory.reduce(
            (sum, t) => sum + t.outcome.effectivenesss,
            0,
          ) /
            (relevantHistory.length * 10)
        : 0,
      patient.previousTreatments.some((t) => t.complications.length > 0)
        ? 1
        : 0,
      patient.previousTreatments.length / 10, // Total treatment experience
    );

    // Treatment-specific features (18-23)
    features.push(
      this.encodeTreatmentType(treatment.treatmentType),
      treatment.targetAreas.length / 5, // Normalized area count
      treatment.targetAreas.reduce((sum, area) => sum + area.severity, 0) /
        (treatment.targetAreas.length * 10),
      this.encodeExpectationLevel(treatment.goals.expectations),
      this.encodeUrgency(treatment.urgency),
      treatment.goals.naturalLook ? 1 : 0,
    );

    return features;
  }

  /**
   * Extract Botox-specific features
   */
  async extractBotoxFeatures(
    patient: PatientProfile,
    targetAreas: string[],
    desiredIntensity: number,
  ): Promise<number[]> {
    const features: number[] = [];

    // Patient factors for Botox (0-11)
    features.push(
      patient.age / 100,
      this.encodeGender(patient.gender),
      this.encodeSkinType(patient.skinType),
      patient.medicalHistory.conditions.some((c) => c.name.includes("muscle"))
        ? 1
        : 0,
      patient.lifestyle.stressLevel / 10,
      patient.medicalHistory.medications.some((m) => m.affectsHealing) ? 1 : 0,
      // Previous Botox experience
      patient.previousTreatments.filter((t) => t.type === "botox").length / 5,
      // Muscle activity indicators
      this.estimateMuscleActivity(patient, targetAreas),
      // Skin elasticity estimate
      this.estimateSkinElasticity(patient),
      // Asymmetry risk
      this.estimateAsymmetryRisk(patient, targetAreas),
      // Expression strength
      this.estimateExpressionStrength(patient, targetAreas),
      // Recovery capacity
      this.estimateRecoveryCapacity(patient),
    );

    // Treatment parameters (12-17)
    features.push(
      targetAreas.length / 5, // Number of areas
      desiredIntensity / 10, // Desired intensity (1-10 scale)
      this.encodeBotoxAreas(targetAreas),
      // Treatment complexity
      this.calculateBotoxComplexity(targetAreas),
      // Previous area treatment
      this.hasPreviousAreaTreatment(patient, targetAreas, "botox") ? 1 : 0,
      // Concurrent treatments risk
      this.evaluateConcurrentTreatmentRisk(patient, "botox"),
    );

    // Contextual factors (18-19)
    features.push(
      this.encodeSeasonalFactor(),
      this.encodeCurrentTrends("botox"),
    );

    return features;
  }

  /**
   * Extract filler-specific features
   */
  async extractFillerFeatures(
    patient: PatientProfile,
    targetAreas: string[],
    volumeGoals: Record<string, number>,
  ): Promise<number[]> {
    const features: number[] = [];

    // Patient factors for fillers (0-13)
    features.push(
      patient.age / 100,
      this.encodeGender(patient.gender),
      this.encodeSkinType(patient.skinType),
      this.estimateVolumeDeficit(patient, targetAreas),
      this.estimateSkinThickness(patient),
      this.estimateCollagenProduction(patient),
      patient.medicalHistory.allergies.length / 10,
      patient.medicalHistory.autoimmuneDiseases.length > 0 ? 1 : 0,
      patient.lifestyle.smoking ? 1 : 0,
      this.estimateHealingCapacity(patient),
      // Previous filler experience
      patient.previousTreatments.filter((t) => t.type === "dermal-fillers")
        .length / 5,
      this.estimateFacialAsymmetry(patient),
      this.estimateSkinLaxity(patient),
      this.evaluateProductCompatibility(patient, "hyaluronic-acid"),
    );

    // Volume and technique parameters (14-19)
    const totalDesiredVolume = Object.values(volumeGoals).reduce(
      (sum, vol) => sum + vol,
      0,
    );
    features.push(
      totalDesiredVolume / 5, // Normalized total volume
      targetAreas.length / 3, // Number of areas
      this.calculateVolumeComplexity(targetAreas, volumeGoals),
      this.encodeFillerAreas(targetAreas),
      this.estimateInjectionDifficulty(targetAreas),
      this.evaluateMaintenanceRequirement(patient, targetAreas),
    );

    // Risk and context factors (20-21)
    features.push(
      this.evaluateVascularRisk(patient, targetAreas),
      this.estimateSwellingProneness(patient),
    );

    return features;
  } /**
   * Extract laser treatment features
   */

  async extractLaserFeatures(
    patient: PatientProfile,
    laserType: string,
    treatmentGoal: string,
  ): Promise<number[]> {
    const features: number[] = [];

    // Patient skin characteristics (0-15)
    features.push(
      patient.age / 100,
      this.encodeGender(patient.gender),
      this.encodeSkinType(patient.skinType),
      this.estimateMelaninContent(patient),
      this.estimateSkinSensitivity(patient),
      this.estimateSkinThickness(patient),
      this.evaluatePhotodamage(patient),
      patient.lifestyle.sunExposure === "high" ? 1 : 0,
      patient.lifestyle.skincare.retinoidUse ? 1 : 0,
      patient.medicalHistory.medications.some((m) =>
        m.name.includes("photosensitizing"),
      )
        ? 1
        : 0,
      // Previous laser experience
      patient.previousTreatments.filter((t) => t.type.includes("laser"))
        .length / 5,
      this.estimateHealingResponse(patient),
      this.evaluatePigmentationRisk(patient),
      this.estimateScarRisk(patient),
      this.evaluateDowntimeTolerance(patient),
      this.estimateInflammatoryResponse(patient),
    );

    // Laser and treatment parameters (16-21)
    features.push(
      this.encodeLaserType(laserType),
      this.encodeTreatmentGoal(treatmentGoal),
      this.estimateRequiredEnergy(patient, treatmentGoal),
      this.calculateTreatmentDepth(treatmentGoal),
      this.estimateSessionsRequired(patient, treatmentGoal),
      this.evaluateSeasonalAppropriate(patient, laserType),
    );

    // Risk and context factors (22-25)
    features.push(
      this.evaluateContraindicationRisk(patient, laserType),
      this.estimateComplicationRisk(patient, laserType),
      this.evaluatePostTreatmentCare(patient),
      this.encodeGeographicFactor(),
    );

    return features;
  }

  // ==================== ENCODING METHODS ====================

  private encodeGender(gender: string): number {
    const mapping = { male: 0, female: 1, other: 0.5 };
    return mapping[gender as keyof typeof mapping] || 0.5;
  }

  private encodeSkinType(skinType: SkinType): number {
    const typeMap = {
      "fitzpatrick-1": 0.167,
      "fitzpatrick-2": 0.333,
      "fitzpatrick-3": 0.5,
      "fitzpatrick-4": 0.667,
      "fitzpatrick-5": 0.833,
      "fitzpatrick-6": 1,
    };
    return typeMap[skinType] || 0.5;
  }

  private encodeSmokingFrequency(frequency?: string): number {
    if (!frequency) {
      return 0;
    }
    const mapping = { occasional: 0.33, daily: 0.67, heavy: 1 };
    return mapping[frequency as keyof typeof mapping] || 0;
  }

  private encodeSunExposure(exposure: string): number {
    const mapping = { minimal: 0.25, moderate: 0.5, high: 1 };
    return mapping[exposure as keyof typeof mapping] || 0.5;
  }

  private encodeTreatmentType(treatmentType: string): number {
    const typeMap = {
      botox: 0.1,
      "dermal-fillers": 0.2,
      "laser-resurfacing": 0.3,
      "laser-hair-removal": 0.4,
      "chemical-peel": 0.5,
      microneedling: 0.6,
      coolsculpting: 0.7,
      radiofrequency: 0.8,
      photofacial: 0.9,
      "thread-lift": 1,
    };
    return typeMap[treatmentType as keyof typeof typeMap] || 0.5;
  }

  private encodeExpectationLevel(level: string): number {
    const mapping = { subtle: 0.33, moderate: 0.67, dramatic: 1 };
    return mapping[level as keyof typeof mapping] || 0.67;
  }

  private encodeUrgency(urgency: string): number {
    const mapping = { low: 0.25, moderate: 0.5, high: 1 };
    return mapping[urgency as keyof typeof mapping] || 0.5;
  }

  private encodeBotoxAreas(areas: string[]): number {
    // Encode based on complexity and interaction of areas
    const complexityScore = areas.reduce((score, area) => {
      const areaComplexity = {
        forehead: 0.3,
        glabella: 0.5,
        "crows-feet": 0.4,
        "under-eyes": 0.7,
        jawline: 0.6,
        neck: 0.8,
      };
      return (
        score + (areaComplexity[area as keyof typeof areaComplexity] || 0.5)
      );
    }, 0);
    return Math.min(complexityScore / areas.length, 1);
  }

  private encodeFillerAreas(areas: string[]): number {
    const volumeComplexity = areas.reduce((score, area) => {
      const areaComplexity = {
        lips: 0.6,
        cheeks: 0.8,
        "nasolabial-folds": 0.4,
        "marionette-lines": 0.5,
        "under-eyes": 0.9,
        jawline: 0.7,
      };
      return (
        score + (areaComplexity[area as keyof typeof areaComplexity] || 0.5)
      );
    }, 0);
    return Math.min(volumeComplexity / areas.length, 1);
  }

  private encodeLaserType(laserType: string): number {
    const typeMap = {
      co2: 1,
      erbium: 0.8,
      fraxel: 0.6,
      ipl: 0.4,
      alexandrite: 0.5,
      diode: 0.3,
      "nd-yag": 0.7,
    };
    return typeMap[laserType as keyof typeof typeMap] || 0.5;
  }

  private encodeTreatmentGoal(goal: string): number {
    const goalMap = {
      "wrinkle-reduction": 0.3,
      pigmentation: 0.5,
      "hair-removal": 0.2,
      "skin-tightening": 0.7,
      "acne-scars": 0.8,
      "overall-rejuvenation": 0.9,
    };
    return goalMap[goal as keyof typeof goalMap] || 0.5;
  } // ==================== ESTIMATION METHODS ====================

  private estimateMuscleActivity(
    patient: PatientProfile,
    _areas: string[],
  ): number {
    let activityScore = 0.5; // Base activity

    // Age factor - younger patients typically have stronger muscle activity
    if (patient.age < 30) {
      activityScore += 0.2;
    } else if (patient.age > 50) {
      activityScore -= 0.1;
    }

    // Stress level affects muscle tension
    activityScore += (patient.lifestyle.stressLevel / 10) * 0.2;

    // Previous Botox experience may indicate high muscle activity
    const botoxHistory = patient.previousTreatments.filter(
      (t) => t.type === "botox",
    );
    if (botoxHistory.length > 0) {
      const avgSatisfaction =
        botoxHistory.reduce((sum, t) => sum + t.satisfaction, 0) /
        botoxHistory.length;
      if (avgSatisfaction < 7) {
        activityScore += 0.1; // Low satisfaction may indicate strong muscles
      }
    }

    return Math.min(Math.max(activityScore, 0), 1);
  }

  private estimateSkinElasticity(patient: PatientProfile): number {
    let elasticity = 1; // Start with perfect elasticity

    // Age significantly affects elasticity
    elasticity -= (patient.age - 20) / 100;

    // Sun exposure damages elasticity
    if (patient.lifestyle.sunExposure === "high") {
      elasticity -= 0.2;
    } else if (patient.lifestyle.sunExposure === "moderate") {
      elasticity -= 0.1;
    }

    // Smoking damages collagen
    if (patient.lifestyle.smoking) {
      elasticity -= 0.15;
      if (patient.lifestyle.smokingFrequency === "heavy") {
        elasticity -= 0.1;
      }
    }

    // Skincare routine helps
    if (patient.lifestyle.skincare.sunscreenUse) {
      elasticity += 0.05;
    }
    if (patient.lifestyle.skincare.retinoidUse) {
      elasticity += 0.1;
    }

    return Math.min(Math.max(elasticity, 0), 1);
  }

  private estimateAsymmetryRisk(
    patient: PatientProfile,
    areas: string[],
  ): number {
    let riskScore = 0.1; // Base asymmetry risk

    // Previous treatment complications increase risk
    const hasAsymmetryHistory = patient.previousTreatments.some((t) =>
      t.complications.includes("asymmetry"),
    );
    if (hasAsymmetryHistory) {
      riskScore += 0.3;
    }

    // Multiple areas increase complexity and risk
    if (areas.length > 3) {
      riskScore += 0.1;
    }

    // Certain areas are higher risk
    const highRiskAreas = new Set(["under-eyes", "jawline"]);
    const hasHighRiskAreas = areas.some((area) => highRiskAreas.has(area));
    if (hasHighRiskAreas) {
      riskScore += 0.2;
    }

    return Math.min(riskScore, 1);
  }

  private estimateExpressionStrength(
    patient: PatientProfile,
    _areas: string[],
  ): number {
    let strength = 0.5;

    // Stress and personality factors
    strength += (patient.lifestyle.stressLevel / 10) * 0.3;

    // Professional factors (estimated from lifestyle)
    if (patient.lifestyle.stressLevel > 7) {
      strength += 0.1; // High-stress professions
    }

    // Age factor - expression lines deepen with age
    if (patient.age > 40) {
      strength += 0.1;
    }
    if (patient.age > 55) {
      strength += 0.1;
    }

    return Math.min(strength, 1);
  }

  private estimateRecoveryCapacity(patient: PatientProfile): number {
    let capacity = 0.8; // Base recovery capacity

    // Age affects recovery
    capacity -= (patient.age - 25) / 100;

    // Health factors
    if (patient.medicalHistory.autoimmuneDiseases.length > 0) {
      capacity -= 0.2;
    }
    if (patient.medicalHistory.medications.some((m) => m.affectsHealing)) {
      capacity -= 0.1;
    }

    // Lifestyle factors
    if (patient.lifestyle.smoking) {
      capacity -= 0.2;
    }
    capacity += (patient.lifestyle.sleepQuality / 10) * 0.1;
    capacity += (10 - patient.lifestyle.stressLevel) / 100;

    // Exercise helps recovery
    const exerciseBonus = {
      sedentary: 0,
      light: 0.05,
      moderate: 0.1,
      high: 0.15,
    };
    capacity += exerciseBonus[patient.lifestyle.exerciseLevel];

    return Math.min(Math.max(capacity, 0), 1);
  }

  private estimateVolumeDeficit(
    patient: PatientProfile,
    _areas: string[],
  ): number {
    let deficit = 0;

    // Age-related volume loss
    if (patient.age > 30) {
      deficit += (patient.age - 30) / 100;
    }

    // Weight loss history (estimated from lifestyle)
    if (patient.lifestyle.exerciseLevel === "high") {
      deficit += 0.1;
    }

    // Genetics (estimated from family history if available)
    // This would ideally come from patient data
    deficit += 0.1; // Base genetic factor

    return Math.min(deficit, 1);
  }

  private estimateSkinThickness(patient: PatientProfile): number {
    let thickness = 0.5;

    // Age affects skin thickness
    thickness -= (patient.age - 25) / 200;

    // Gender differences
    if (patient.gender === "male") {
      thickness += 0.1;
    }

    // Skin type affects thickness
    if (patient.skinType.includes("5") || patient.skinType.includes("6")) {
      thickness += 0.1;
    }

    return Math.min(Math.max(thickness, 0.1), 1);
  }

  private estimateCollagenProduction(patient: PatientProfile): number {
    let production = 1;

    // Age is the primary factor
    production -= (patient.age - 20) / 80; // Decreases with age

    // Lifestyle factors
    if (patient.lifestyle.smoking) {
      production -= 0.2;
    }
    if (patient.lifestyle.sunExposure === "high") {
      production -= 0.15;
    }

    // Beneficial factors
    if (patient.lifestyle.skincare.retinoidUse) {
      production += 0.1;
    }
    production += (patient.lifestyle.sleepQuality / 10) * 0.05;

    return Math.min(Math.max(production, 0.1), 1);
  }
  private estimateHealingCapacity(patient: PatientProfile): number {
    return this.estimateRecoveryCapacity(patient); // Similar calculation
  }

  private estimateFacialAsymmetry(patient: PatientProfile): number {
    // This would ideally use facial analysis data
    let asymmetry = 0.1; // Base natural asymmetry

    // Previous treatment history
    const hasAsymmetryIssues = patient.previousTreatments.some(
      (t) => t.complications.includes("asymmetry") || t.satisfaction < 6,
    );
    if (hasAsymmetryIssues) {
      asymmetry += 0.2;
    }

    return Math.min(asymmetry, 0.5);
  }

  private estimateSkinLaxity(patient: PatientProfile): number {
    let laxity = 0;

    // Age is primary factor
    if (patient.age > 35) {
      laxity += (patient.age - 35) / 100;
    }

    // Sun damage increases laxity
    if (patient.lifestyle.sunExposure === "high") {
      laxity += 0.15;
    }

    // Weight fluctuations (estimated)
    if (patient.lifestyle.exerciseLevel === "sedentary") {
      laxity += 0.05;
    }

    return Math.min(laxity, 0.8);
  }

  private evaluateProductCompatibility(
    patient: PatientProfile,
    _productType: string,
  ): number {
    let compatibility = 0.9; // High base compatibility for HA

    // Allergy history
    const hasRelevantAllergies = patient.medicalHistory.allergies.some(
      (allergy) =>
        allergy.toLowerCase().includes("hyaluronic") ||
        allergy.toLowerCase().includes("lidocaine"),
    );
    if (hasRelevantAllergies) {
      compatibility -= 0.4;
    }

    // Previous filler reactions
    const fillerHistory = patient.previousTreatments.filter(
      (t) => t.type === "dermal-fillers",
    );
    const hasReactions = fillerHistory.some((t) => t.complications.length > 0);
    if (hasReactions) {
      compatibility -= 0.2;
    }

    return Math.max(compatibility, 0.1);
  }

  private calculateVolumeComplexity(
    areas: string[],
    volumeGoals: Record<string, number>,
  ): number {
    const totalVolume = Object.values(volumeGoals).reduce(
      (sum, vol) => sum + vol,
      0,
    );
    const avgVolumePerArea = totalVolume / areas.length;

    // Higher volumes and more areas increase complexity
    let complexity = avgVolumePerArea / 2 + areas.length / 5;

    // Certain area combinations are more complex
    const complexCombinations = [
      ["lips", "nasolabial-folds"],
      ["cheeks", "under-eyes"],
      ["jawline", "marionette-lines"],
    ];

    const hasComplexCombination = complexCombinations.some((combo) =>
      combo.every((area) => areas.includes(area)),
    );
    if (hasComplexCombination) {
      complexity += 0.2;
    }

    return Math.min(complexity, 1);
  }

  private estimateInjectionDifficulty(areas: string[]): number {
    const difficultyMap = {
      lips: 0.8,
      "under-eyes": 0.9,
      "nasolabial-folds": 0.4,
      cheeks: 0.6,
      "marionette-lines": 0.5,
      jawline: 0.7,
    };

    const avgDifficulty =
      areas.reduce((sum, area) => {
        return sum + (difficultyMap[area as keyof typeof difficultyMap] || 0.5);
      }, 0) / areas.length;

    return avgDifficulty;
  }

  private evaluateMaintenanceRequirement(
    patient: PatientProfile,
    areas: string[],
  ): number {
    let maintenance = 0.5; // Base maintenance requirement

    // Age affects longevity
    if (patient.age < 30) {
      maintenance += 0.1; // Faster metabolism
    }
    if (patient.age > 60) {
      maintenance -= 0.1; // Slower metabolism
    }

    // Lifestyle factors
    if (patient.lifestyle.exerciseLevel === "high") {
      maintenance += 0.1;
    }
    if (patient.lifestyle.smoking) {
      maintenance += 0.15;
    }

    // Area-specific factors
    const highMaintenanceAreas = new Set(["lips", "nasolabial-folds"]);
    const hasHighMaintenanceAreas = areas.some((area) =>
      highMaintenanceAreas.has(area),
    );
    if (hasHighMaintenanceAreas) {
      maintenance += 0.1;
    }

    return Math.min(maintenance, 1);
  }

  private evaluateVascularRisk(
    patient: PatientProfile,
    areas: string[],
  ): number {
    let risk = 0.1; // Base vascular risk

    // Blood thinners significantly increase risk
    if (patient.medicalHistory.bloodThinnersUse) {
      risk += 0.3;
    }

    // Certain medications increase bleeding risk
    const riskMedications = patient.medicalHistory.medications.filter(
      (m) => m.isBloodThinner || m.name.toLowerCase().includes("aspirin"),
    );
    risk += riskMedications.length * 0.1;

    // High-risk areas
    const highRiskAreas = new Set(["under-eyes", "lips"]);
    const hasHighRiskAreas = areas.some((area) => highRiskAreas.has(area));
    if (hasHighRiskAreas) {
      risk += 0.15;
    }

    // Age factor
    if (patient.age > 60) {
      risk += 0.1;
    }

    return Math.min(risk, 0.8);
  }

  private estimateSwellingProneness(patient: PatientProfile): number {
    let proneness = 0.3; // Base swelling tendency

    // Age factor
    if (patient.age > 50) {
      proneness += 0.1;
    }

    // Medical conditions
    if (
      patient.medicalHistory.conditions.some(
        (c) =>
          c.name.toLowerCase().includes("thyroid") ||
          c.name.toLowerCase().includes("kidney"),
      )
    ) {
      proneness += 0.2;
    }

    // Lifestyle factors
    if (patient.lifestyle.alcohol) {
      proneness += 0.1;
    }
    proneness -= (patient.lifestyle.sleepQuality / 10) * 0.1;

    return Math.min(proneness, 0.8);
  }

  // Additional helper methods for laser treatments
  private estimateMelaninContent(patient: PatientProfile): number {
    const melaninMap = {
      "fitzpatrick-1": 0.1,
      "fitzpatrick-2": 0.2,
      "fitzpatrick-3": 0.4,
      "fitzpatrick-4": 0.6,
      "fitzpatrick-5": 0.8,
      "fitzpatrick-6": 1,
    };
    return melaninMap[patient.skinType] || 0.5;
  }

  private estimateSkinSensitivity(patient: PatientProfile): number {
    let sensitivity = 0.5;

    // Skin type affects sensitivity
    if (patient.skinType.includes("1") || patient.skinType.includes("2")) {
      sensitivity += 0.2;
    }

    // Medical conditions
    if (
      patient.medicalHistory.conditions.some(
        (c) =>
          c.name.toLowerCase().includes("eczema") ||
          c.name.toLowerCase().includes("dermatitis"),
      )
    ) {
      sensitivity += 0.3;
    }

    // Retinoid use increases sensitivity
    if (patient.lifestyle.skincare.retinoidUse) {
      sensitivity += 0.1;
    }

    return Math.min(sensitivity, 1);
  }

  // Utility methods for contextual factors
  private calculateBotoxComplexity(areas: string[]): number {
    return this.encodeBotoxAreas(areas);
  }

  private hasPreviousAreaTreatment(
    patient: PatientProfile,
    areas: string[],
    treatmentType: string,
  ): boolean {
    return patient.previousTreatments.some(
      (t) =>
        t.type === treatmentType &&
        t.notes &&
        areas.some((area) => t.notes.toLowerCase().includes(area)),
    );
  }

  private evaluateConcurrentTreatmentRisk(
    _patient: PatientProfile,
    _treatmentType: string,
  ): number {
    // This would check for interactions with other planned treatments
    // For now, return a base risk assessment
    return 0.1;
  }

  private encodeSeasonalFactor(): number {
    // Current season affects treatment planning
    const month = new Date().getMonth();
    // Summer months (higher sun exposure risk)
    if (month >= 5 && month <= 8) {
      return 0.8;
    }
    // Winter months (lower sun exposure, better for some treatments)
    if (month >= 11 || month <= 2) {
      return 0.3;
    }
    // Spring/Fall
    return 0.5;
  }

  private encodeCurrentTrends(_treatmentType: string): number {
    // This would incorporate current aesthetic trends
    // For now, return a neutral value
    return 0.5;
  }

  private encodeGeographicFactor(): number {
    // Geographic location affects UV exposure, pollution, etc.
    // This would ideally use actual location data
    return 0.5;
  }

  // Additional estimation methods for comprehensive feature extraction
  private estimateRequiredEnergy(
    patient: PatientProfile,
    goal: string,
  ): number {
    let energy = 0.5;

    // Skin type affects energy requirements
    const skinTypeFactor = this.encodeSkinType(patient.skinType);
    energy += skinTypeFactor * 0.3;

    // Treatment goal affects energy
    const goalMap = {
      "hair-removal": 0.4,
      pigmentation: 0.6,
      "wrinkle-reduction": 0.8,
      "skin-tightening": 0.9,
    };
    energy += (goalMap[goal as keyof typeof goalMap] || 0.5) * 0.4;

    return Math.min(energy, 1);
  }

  private calculateTreatmentDepth(goal: string): number {
    const depthMap = {
      "hair-removal": 0.3,
      pigmentation: 0.4,
      "wrinkle-reduction": 0.7,
      "skin-tightening": 0.9,
      "acne-scars": 0.8,
    };
    return depthMap[goal as keyof typeof depthMap] || 0.5;
  }

  private estimateSessionsRequired(
    patient: PatientProfile,
    goal: string,
  ): number {
    let sessions = 0.5;

    // Age affects number of sessions needed
    if (patient.age > 50) {
      sessions += 0.2;
    }

    // Skin damage level
    if (patient.lifestyle.sunExposure === "high") {
      sessions += 0.2;
    }
    if (patient.lifestyle.smoking) {
      sessions += 0.1;
    }

    // Goal complexity
    const complexGoals = ["acne-scars", "deep-wrinkles", "skin-tightening"];
    if (complexGoals.some((g) => goal.includes(g))) {
      sessions += 0.3;
    }

    return Math.min(sessions, 1);
  }

  // Additional contextual and risk assessment methods
  private evaluateSeasonalAppropriate(
    _patient: PatientProfile,
    laserType: string,
  ): number {
    const month = new Date().getMonth();
    const isSummer = month >= 5 && month <= 8;

    // Some laser treatments are better in winter
    const winterPreferred = new Set(["co2", "erbium", "fraxel"]);
    if (winterPreferred.has(laserType) && !isSummer) {
      return 0.8;
    }
    if (winterPreferred.has(laserType) && isSummer) {
      return 0.3;
    }

    return 0.6;
  }

  private evaluateContraindicationRisk(
    patient: PatientProfile,
    _laserType: string,
  ): number {
    let risk = 0;

    // Pregnancy (if applicable)
    if (patient.medicalHistory.pregnancyStatus) {
      risk += 0.8;
    }

    // Photosensitizing medications
    const photosensitizingMeds = patient.medicalHistory.medications.filter(
      (m) =>
        m.name.toLowerCase().includes("tretinoin") ||
        m.name.toLowerCase().includes("doxycycline"),
    );
    risk += photosensitizingMeds.length * 0.3;

    // Autoimmune conditions
    if (patient.medicalHistory.autoimmuneDiseases.length > 0) {
      risk += 0.2;
    }

    // Recent sun exposure
    if (patient.lifestyle.sunExposure === "high") {
      risk += 0.2;
    }

    return Math.min(risk, 1);
  }

  private estimateComplicationRisk(
    patient: PatientProfile,
    _laserType: string,
  ): number {
    let risk = 0.1;

    // Skin type affects complication risk
    const skinTypeRisk = this.estimateMelaninContent(patient);
    risk += skinTypeRisk * 0.3;

    // Previous complications
    const hasLaserComplications = patient.previousTreatments.some(
      (t) => t.type.includes("laser") && t.complications.length > 0,
    );
    if (hasLaserComplications) {
      risk += 0.3;
    }

    // Healing capacity
    risk += (1 - this.estimateHealingCapacity(patient)) * 0.2;

    return Math.min(risk, 0.8);
  }

  private evaluatePostTreatmentCare(patient: PatientProfile): number {
    let careScore = 0.5;

    // Previous treatment compliance (estimated from satisfaction scores)
    const avgSatisfaction =
      patient.previousTreatments.length > 0
        ? patient.previousTreatments.reduce(
            (sum, t) => sum + t.satisfaction,
            0,
          ) / patient.previousTreatments.length
        : 7; // Default assumption

    careScore += (avgSatisfaction / 10) * 0.3;

    // Skincare routine indicates care level
    const routineScore =
      Object.values(patient.lifestyle.skincare).filter(Boolean).length / 6;
    careScore += routineScore * 0.2;

    return Math.min(careScore, 1);
  }

  // Risk assessment specific methods
  private evaluatePhotodamage(patient: PatientProfile): number {
    let damage = 0;

    // Age and sun exposure history
    if (patient.age > 40) {
      damage += (patient.age - 40) / 100;
    }

    // Lifestyle sun exposure
    const exposureMap = { minimal: 0.1, moderate: 0.3, high: 0.6 };
    damage += exposureMap[patient.lifestyle.sunExposure];

    // Protective measures
    if (patient.lifestyle.skincare.sunscreenUse) {
      damage *= 0.7;
    }

    return Math.min(damage, 0.8);
  }

  private estimateHealingResponse(patient: PatientProfile): number {
    return this.estimateHealingCapacity(patient);
  }

  private evaluatePigmentationRisk(patient: PatientProfile): number {
    let risk = 0.1;

    // Skin type is primary factor
    risk += this.estimateMelaninContent(patient) * 0.4;

    // Previous pigmentation issues
    const hasPigmentationHistory = patient.previousTreatments.some(
      (t) =>
        t.complications.includes("pigmentation") ||
        t.complications.includes("hyperpigmentation") ||
        t.complications.includes("hypopigmentation"),
    );
    if (hasPigmentationHistory) {
      risk += 0.3;
    }

    // Hormonal factors (estimated)
    if (patient.gender === "female" && patient.age >= 20 && patient.age <= 45) {
      risk += 0.1; // Melasma risk
    }

    return Math.min(risk, 0.8);
  }

  private estimateScarRisk(patient: PatientProfile): number {
    let risk = 0.1;

    // Keloid tendency
    if (patient.medicalHistory.keloidProneness) {
      risk += 0.4;
    }

    // Previous scarring
    const hasScarHistory = patient.previousTreatments.some(
      (t) =>
        t.complications.includes("scar") ||
        t.complications.includes("scarring"),
    );
    if (hasScarHistory) {
      risk += 0.3;
    }

    // Healing factors
    risk += (1 - this.estimateHealingCapacity(patient)) * 0.2;

    return Math.min(risk, 0.7);
  }

  private evaluateDowntimeTolerance(patient: PatientProfile): number {
    // This would ideally be patient-reported
    // For now, estimate based on lifestyle
    let tolerance = 0.5;

    // Stress level may indicate lifestyle demands
    tolerance -= (patient.lifestyle.stressLevel / 10) * 0.3;

    // Previous treatment history may indicate tolerance
    const hasMinimalDowntimeTreatments = patient.previousTreatments.some((t) =>
      ["botox", "dermal-fillers", "microneedling"].includes(t.type),
    );
    if (hasMinimalDowntimeTreatments) {
      tolerance += 0.2;
    }

    return Math.min(Math.max(tolerance, 0.2), 1);
  }

  private estimateInflammatoryResponse(patient: PatientProfile): number {
    let response = 0.3; // Base inflammatory response

    // Age affects inflammatory response
    if (patient.age > 50) {
      response += 0.1;
    }

    // Medical conditions
    if (patient.medicalHistory.autoimmuneDiseases.length > 0) {
      response += 0.2;
    }

    // Lifestyle factors
    if (patient.lifestyle.smoking) {
      response += 0.15;
    }
    response -= (patient.lifestyle.sleepQuality / 10) * 0.1;

    // Skin sensitivity
    response += this.estimateSkinSensitivity(patient) * 0.2;

    return Math.min(response, 0.8);
  }

  // Feature name methods for interpretability
  getTreatmentFeatureNames(): string[] {
    return [
      "age_normalized",
      "gender_encoded",
      "skin_type",
      "blood_thinners",
      "keloid_proneness",
      "autoimmune_diseases",
      "smoking_status",
      "smoking_frequency",
      "sun_exposure",
      "stress_level",
      "sleep_quality",
      "sunscreen_use",
      "retinoid_use",
      "relevant_treatment_history",
      "avg_satisfaction",
      "avg_effectiveness",
      "complication_history",
      "total_experience",
      "treatment_type",
      "target_area_count",
      "avg_severity",
      "expectation_level",
      "urgency",
      "natural_look_preference",
    ];
  }

  getBotoxFeatureNames(): string[] {
    return [
      "age_normalized",
      "gender_encoded",
      "skin_type",
      "muscle_conditions",
      "stress_level",
      "healing_medications",
      "botox_experience",
      "muscle_activity",
      "skin_elasticity",
      "asymmetry_risk",
      "expression_strength",
      "recovery_capacity",
      "area_count",
      "desired_intensity",
      "area_complexity",
      "treatment_complexity",
      "previous_area_treatment",
      "concurrent_risk",
      "seasonal_factor",
      "current_trends",
    ];
  }

  getFillerFeatureNames(): string[] {
    return [
      "age_normalized",
      "gender_encoded",
      "skin_type",
      "volume_deficit",
      "skin_thickness",
      "collagen_production",
      "allergy_count",
      "autoimmune_status",
      "smoking_status",
      "healing_capacity",
      "filler_experience",
      "facial_asymmetry",
      "skin_laxity",
      "product_compatibility",
      "total_volume",
      "area_count",
      "volume_complexity",
      "area_encoding",
      "injection_difficulty",
      "maintenance_requirement",
      "vascular_risk",
      "swelling_proneness",
    ];
  }

  getLaserFeatureNames(): string[] {
    return [
      "age_normalized",
      "gender_encoded",
      "skin_type",
      "melanin_content",
      "skin_sensitivity",
      "skin_thickness",
      "photodamage_level",
      "sun_exposure_current",
      "retinoid_use",
      "photosensitizing_meds",
      "laser_experience",
      "healing_response",
      "pigmentation_risk",
      "scar_risk",
      "downtime_tolerance",
      "inflammatory_response",
      "laser_type",
      "treatment_goal",
      "required_energy",
      "treatment_depth",
      "sessions_required",
      "seasonal_appropriate",
      "contraindication_risk",
      "complication_risk",
      "post_care_compliance",
      "geographic_factor",
    ];
  }
}

// Export type interfaces for feature extraction
export interface FeatureExtractor {
  extractTreatmentFeatures(
    patient: PatientProfile,
    treatment: TreatmentRequest,
  ): Promise<number[]>;
  extractBotoxFeatures(
    patient: PatientProfile,
    areas: string[],
    intensity: number,
  ): Promise<number[]>;
  extractFillerFeatures(
    patient: PatientProfile,
    areas: string[],
    volumes: Record<string, number>,
  ): Promise<number[]>;
  extractLaserFeatures(
    patient: PatientProfile,
    laserType: string,
    goal: string,
  ): Promise<number[]>;
}

export interface PostProcessor {
  process(rawOutput: Float32Array, inputs: unknown): unknown;
}
