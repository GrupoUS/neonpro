import type {
	BotoxOptimization,
	FeatureImportance,
	FillerVolumePrediction,
	InjectionPoint,
	LaserSettingsPrediction,
	PatientProfile,
	TreatmentOutcomePrediction,
	TreatmentRequest,
	VolumeRecommendation,
} from "../types";

/**
 * Post-Processing Engine for AI Prediction Results
 * Converts raw neural network outputs into actionable clinical recommendations
 */
export class AestheticPostProcessor {
	/**
	 * Process treatment outcome prediction results
	 */
	postProcessTreatmentOutcome(
		rawOutput: Float32Array,
		patient: PatientProfile,
		treatment: TreatmentRequest
	): TreatmentOutcomePrediction["outputs"] {
		// Raw outputs: [outcome_score, confidence, timeline_weeks]
		const outcomeScore = Math.max(0, Math.min(1, rawOutput[0]));
		const confidence = Math.max(0, Math.min(1, rawOutput[1]));
		const timelineWeeks = Math.max(1, Math.min(52, rawOutput[2] * 52));

		// Calculate durability based on treatment type and patient factors
		const durability = this.calculateTreatmentDurability(treatment.treatmentType, patient, outcomeScore);

		// Estimate satisfaction based on outcome and patient expectations
		const satisfaction = this.estimateSatisfaction(outcomeScore, treatment.goals.expectations, confidence);

		return {
			outcomeScore,
			confidence,
			expectedTimeline: timelineWeeks,
			durability,
			satisfaction,
		};
	}

	/**
	 * Process Botox optimization results
	 */
	postProcessBotoxOptimization(rawOutput: Float32Array, targetAreas: string[]): BotoxOptimization["outputs"] {
		// Raw outputs: [total_units, confidence, duration_factor]
		const totalUnits = Math.max(10, Math.min(200, rawOutput[0] * 100));
		const confidence = Math.max(0, Math.min(1, rawOutput[1]));
		const durationFactor = Math.max(0.5, Math.min(2, rawOutput[2]));

		// Distribute units across target areas
		const injectionPattern = this.distributeBoxtoxUnits(totalUnits, targetAreas);

		// Calculate expected duration (base 3-4 months)
		const baseDuration = 3.5; // months
		const expectedDuration = baseDuration * durationFactor;

		// Estimate onset time (typically 3-14 days)
		const onsetTime = this.calculateBotoxOnset(totalUnits, targetAreas);

		return {
			optimalUnits: Math.round(totalUnits),
			confidence,
			injectionPattern,
			expectedDuration: Math.round(expectedDuration * 10) / 10, // Round to 1 decimal
			onsetTime,
		};
	}

	/**
	 * Process filler volume optimization results
	 */
	postProcessFillerVolume(rawOutput: Float32Array, targetAreas: string[]): FillerVolumePrediction["outputs"] {
		// Raw outputs: [volume_per_area_1, volume_per_area_2, ..., confidence, longevity_factor]
		const areaCount = targetAreas.length;
		const volumeData = Array.from(rawOutput.slice(0, areaCount));
		const confidence = Math.max(0, Math.min(1, rawOutput[areaCount]));
		const longevityFactor = Math.max(0.5, Math.min(2, rawOutput[areaCount + 1]));

		// Create volume recommendations for each area
		const volumePerArea = targetAreas.map((area, index) => {
			const volume = Math.max(0.1, Math.min(3, volumeData[index] * 2)); // Max 3ml per area
			return this.createVolumeRecommendation(area, volume);
		});

		// Determine injection technique based on areas and volumes
		const technique = this.selectInjectionTechnique(targetAreas, volumePerArea);

		// Calculate longevity (base 12-18 months for HA fillers)
		const baseLongevity = 15; // months
		const expectedLongevity = baseLongevity * longevityFactor;

		// Determine if touch-up will be needed
		const totalVolume = volumePerArea.reduce((sum, v) => sum + v.volume, 0);
		const touchUpNeeded = totalVolume > 3 || targetAreas.length > 2;

		return {
			volumePerArea,
			confidence,
			technique,
			expectedLongevity: Math.round(expectedLongevity),
			touchUpNeeded,
		};
	}

	/**
	 * Process laser settings optimization results
	 */
	postProcessLaserSettings(rawOutput: Float32Array): LaserSettingsPrediction["outputs"] {
		// Raw outputs: [energy, pulse_width, spot_size, passes, cooling_time, downtime]
		const energyLevel = Math.max(5, Math.min(100, rawOutput[0] * 50)); // J/cm²
		const pulseWidth = Math.max(0.1, Math.min(50, rawOutput[1] * 25)); // milliseconds
		const spotSize = Math.max(3, Math.min(15, rawOutput[2] * 12)); // mm
		const passes = Math.max(1, Math.min(5, Math.round(rawOutput[3] * 4)));
		const coolingTime = Math.max(1, Math.min(30, rawOutput[4] * 20)); // seconds
		const expectedDowntime = Math.max(0, Math.min(14, rawOutput[5] * 10)); // days

		// Calculate confidence based on parameter consistency
		const confidence = this.calculateLaserConfidence(energyLevel, pulseWidth, spotSize);

		return {
			energyLevel: Math.round(energyLevel * 10) / 10,
			pulseWidth: Math.round(pulseWidth * 10) / 10,
			spotSize: Math.round(spotSize),
			passes,
			coolingTime: Math.round(coolingTime),
			confidence,
			expectedDowntime: Math.round(expectedDowntime),
		};
	}

	// ==================== HELPER METHODS ====================

	private calculateTreatmentDurability(treatmentType: string, patient: PatientProfile, outcomeScore: number): number {
		// Base durability in months for different treatments
		const baseDurability: Record<string, number> = {
			botox: 4,
			"dermal-fillers": 15,
			"laser-resurfacing": 36,
			"chemical-peel": 6,
			microneedling: 8,
			coolsculpting: 60, // Permanent fat reduction
			radiofrequency: 12,
			photofacial: 8,
		};

		let durability = baseDurability[treatmentType] || 12;

		// Adjust based on patient factors
		// Age affects longevity
		if (patient.age < 30) {
			durability *= 0.8; // Faster metabolism
		} else if (patient.age > 50) {
			durability *= 1.2; // Slower metabolism
		}

		// Lifestyle factors
		if (patient.lifestyle.smoking) {
			durability *= 0.7;
		}
		if (patient.lifestyle.sunExposure === "high") {
			durability *= 0.8;
		}
		if (patient.lifestyle.exerciseLevel === "high") {
			durability *= 0.9;
		}

		// Outcome score affects perceived durability
		durability *= 0.5 + outcomeScore * 0.5;

		return Math.round(durability);
	}

	private estimateSatisfaction(outcomeScore: number, expectations: string, confidence: number): number {
		let satisfaction = outcomeScore;

		// Adjust based on expectations
		const expectationAdjustment: Record<string, number> = {
			subtle: 0.1,
			moderate: 0,
			dramatic: -0.1,
		};

		satisfaction += expectationAdjustment[expectations] || 0;

		// Confidence affects satisfaction
		satisfaction *= 0.8 + confidence * 0.2;

		return Math.max(0, Math.min(1, satisfaction));
	}

	private distributeBoxtoxUnits(totalUnits: number, targetAreas: string[]): InjectionPoint[] {
		const areaDistribution: Record<string, { percentage: number; technique: string }> = {
			forehead: { percentage: 0.25, technique: "horizontal_lines" },
			glabella: { percentage: 0.3, technique: "central_spread" },
			"crows-feet": { percentage: 0.2, technique: "fan_pattern" },
			"under-eyes": { percentage: 0.15, technique: "micro_injections" },
			jawline: { percentage: 0.35, technique: "masseter_reduction" },
			neck: { percentage: 0.4, technique: "platysmal_bands" },
		};

		const injectionPoints: InjectionPoint[] = [];

		targetAreas.forEach((area) => {
			const distribution = areaDistribution[area];
			if (distribution) {
				const areaUnits = Math.round(totalUnits * distribution.percentage);

				injectionPoints.push({
					area: area as any,
					units: areaUnits,
					depth: this.determineInjectionDepth(area),
					technique: distribution.technique,
					coordinates: this.generateInjectionCoordinates(area),
				});
			}
		});

		return injectionPoints;
	}

	private determineInjectionDepth(area: string): "superficial" | "mid" | "deep" {
		const depthMap: Record<string, "superficial" | "mid" | "deep"> = {
			forehead: "mid",
			glabella: "mid",
			"crows-feet": "superficial",
			"under-eyes": "superficial",
			jawline: "deep",
			neck: "superficial",
		};

		return depthMap[area] || "mid";
	}

	private generateInjectionCoordinates(area: string): { x: number; y: number } {
		// This would ideally use facial mapping data
		// For now, return relative coordinates
		const coordinateMap: Record<string, { x: number; y: number }> = {
			forehead: { x: 0.5, y: 0.2 },
			glabella: { x: 0.5, y: 0.3 },
			"crows-feet": { x: 0.7, y: 0.4 },
			"under-eyes": { x: 0.6, y: 0.45 },
			jawline: { x: 0.8, y: 0.7 },
			neck: { x: 0.5, y: 0.9 },
		};

		return coordinateMap[area] || { x: 0.5, y: 0.5 };
	}

	private calculateBotoxOnset(totalUnits: number, targetAreas: string[]): number {
		// Base onset time is 3-7 days
		let onsetDays = 5;

		// Higher doses may work faster
		if (totalUnits > 50) {
			onsetDays -= 1;
		}
		if (totalUnits > 100) {
			onsetDays -= 1;
		}

		// Certain areas respond faster
		const fastAreas = ["forehead", "glabella"];
		const hasFastAreas = targetAreas.some((area) => fastAreas.includes(area));
		if (hasFastAreas) {
			onsetDays -= 1;
		}

		return Math.max(3, Math.min(14, onsetDays));
	}

	private createVolumeRecommendation(area: string, volume: number): VolumeRecommendation {
		const productRecommendations: Record<string, string> = {
			lips: "Thin consistency HA",
			cheeks: "Thick consistency HA",
			"nasolabial-folds": "Medium consistency HA",
			"marionette-lines": "Medium consistency HA",
			"under-eyes": "Very thin consistency HA",
			jawline: "Thick consistency HA",
		};

		const layerDistribution = this.calculateLayerDistribution(area, volume);

		return {
			area: area as any,
			volume: Math.round(volume * 10) / 10, // Round to 0.1ml
			product: productRecommendations[area] || "Medium consistency HA",
			layers: layerDistribution,
		};
	}

	private calculateLayerDistribution(area: string, totalVolume: number) {
		// Different areas require different injection depths
		const layerStrategies: Record<string, any[]> = {
			lips: [
				{
					depth: "subcutaneous",
					volume: totalVolume * 0.7,
					technique: "linear_threading",
				},
				{
					depth: "supraperiosteal",
					volume: totalVolume * 0.3,
					technique: "micro_bolus",
				},
			],
			cheeks: [
				{
					depth: "supraperiosteal",
					volume: totalVolume * 0.6,
					technique: "bolus_injection",
				},
				{
					depth: "subcutaneous",
					volume: totalVolume * 0.4,
					technique: "fanning",
				},
			],
			"nasolabial-folds": [
				{
					depth: "subcutaneous",
					volume: totalVolume * 0.8,
					technique: "linear_threading",
				},
				{
					depth: "supraperiosteal",
					volume: totalVolume * 0.2,
					technique: "micro_bolus",
				},
			],
		};

		return (
			layerStrategies[area] || [
				{
					depth: "subcutaneous",
					volume: totalVolume,
					technique: "linear_threading",
				},
			]
		);
	}

	private selectInjectionTechnique(areas: string[], volumes: VolumeRecommendation[]) {
		const totalVolume = volumes.reduce((sum, v) => sum + v.volume, 0);

		// Determine technique based on volume and complexity
		let method: "linear" | "fanning" | "cross-hatching" | "bolus" = "linear";
		let needleSize = "30G";
		let cannulaRecommended = false;
		let anesthesia: "topical" | "nerve-block" | "none" = "topical";

		if (totalVolume > 2) {
			method = "cross-hatching";
			cannulaRecommended = true;
		} else if (areas.length > 2) {
			method = "fanning";
		}

		// Specific area considerations
		if (areas.includes("lips")) {
			needleSize = "32G";
			anesthesia = "nerve-block";
		}

		if (areas.includes("under-eyes")) {
			cannulaRecommended = true;
			needleSize = "27G";
		}

		return {
			method,
			needleSize,
			cannulaRecommended,
			anesthesia,
		};
	}

	private calculateLaserConfidence(energy: number, pulseWidth: number, spotSize: number): number {
		// Calculate confidence based on parameter relationships
		let confidence = 0.8; // Base confidence

		// Energy-pulse width relationship
		const energyPulseRatio = energy / pulseWidth;
		if (energyPulseRatio > 1 && energyPulseRatio < 5) {
			confidence += 0.1;
		}

		// Spot size appropriateness
		if (spotSize >= 6 && spotSize <= 12) {
			confidence += 0.1;
		}

		return Math.min(confidence, 1);
	}

	/**
	 * Calculate feature importance for interpretability
	 */
	calculateFeatureImportance(_features: number[]): FeatureImportance[] {
		// This would ideally use model's actual feature importance
		// For now, provide general importance based on clinical knowledge
		const importance: FeatureImportance[] = [
			{ feature: "age", importance: 0.25, impact: "negative" },
			{ feature: "skin_type", importance: 0.2, impact: "neutral" },
			{ feature: "treatment_history", importance: 0.15, impact: "positive" },
			{ feature: "lifestyle_factors", importance: 0.15, impact: "negative" },
			{ feature: "medical_history", importance: 0.1, impact: "negative" },
			{ feature: "treatment_complexity", importance: 0.1, impact: "negative" },
			{ feature: "expectations", importance: 0.05, impact: "neutral" },
		];

		return importance;
	}

	/**
	 * Generate treatment recommendations based on prediction results
	 */
	generateTreatmentRecommendations(result: any, patient: PatientProfile): string[] {
		const recommendations: string[] = [];

		// General recommendations based on confidence
		if (result.confidence < 0.7) {
			recommendations.push("Recommend consultation with senior practitioner due to complexity");
		}

		// Age-based recommendations
		if (patient.age < 25) {
			recommendations.push("Consider conservative approach for younger patient");
		} else if (patient.age > 65) {
			recommendations.push("Extended recovery time may be needed");
		}

		// Lifestyle recommendations
		if (patient.lifestyle.smoking) {
			recommendations.push("Strongly recommend smoking cessation before treatment");
		}

		if (patient.lifestyle.sunExposure === "high") {
			recommendations.push("Implement strict sun protection protocol");
		}

		// Medical history considerations
		if (patient.medicalHistory.bloodThinnersUse) {
			recommendations.push("Coordinate with prescribing physician regarding anticoagulation");
		}

		if (patient.medicalHistory.keloidProneness) {
			recommendations.push("Use conservative approach due to keloid risk");
		}

		return recommendations;
	}

	/**
	 * Generate specific recommendations for Botox treatments
	 */
	generateBotoxRecommendations(result: BotoxOptimization["outputs"], patient: PatientProfile): string[] {
		const recommendations: string[] = [];

		if (result.optimalUnits > 50) {
			recommendations.push("High unit requirement - consider staged treatment approach");
		}

		if (result.expectedDuration < 3) {
			recommendations.push("Shorter duration expected - discuss maintenance schedule");
		}

		if (patient.age < 30) {
			recommendations.push("Conservative dosing recommended for prevention");
		}

		return recommendations;
	}

	/**
	 * Generate specific recommendations for filler treatments
	 */
	generateFillerRecommendations(result: FillerVolumePrediction["outputs"], patient: PatientProfile): string[] {
		const recommendations: string[] = [];

		const totalVolume = result.volumePerArea.reduce((sum, v) => sum + v.volume, 0);

		if (totalVolume > 3) {
			recommendations.push("Large volume requirement - consider multiple sessions");
		}

		if (result.touchUpNeeded) {
			recommendations.push("Touch-up session likely needed in 2-3 weeks");
		}

		if (patient.medicalHistory.bloodThinnersUse) {
			recommendations.push("Increased bruising risk - consider arnica supplementation");
		}

		return recommendations;
	}

	/**
	 * Generate specific recommendations for laser treatments
	 */
	generateLaserRecommendations(result: LaserSettingsPrediction["outputs"], patient: PatientProfile): string[] {
		const recommendations: string[] = [];

		if (result.expectedDowntime > 7) {
			recommendations.push("Significant downtime expected - plan accordingly");
		}

		if (result.energyLevel > 30) {
			recommendations.push("High energy treatment - ensure patient comfort measures");
		}

		if (patient.skinType.includes("4") || patient.skinType.includes("5") || patient.skinType.includes("6")) {
			recommendations.push("Monitor closely for pigmentation changes");
		}

		return recommendations;
	}
}
