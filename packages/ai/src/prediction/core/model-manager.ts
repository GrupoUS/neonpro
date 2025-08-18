import * as tf from '@tensorflow/tfjs';
import type { GraphModel, LayersModel } from '@tensorflow/tfjs';
import type { ModelMetadata, ModelType, PredictionConfig } from '../types';

/**
 * Core AI Model Manager for NeonPro Aesthetic Treatment Predictions
 * Handles TensorFlow.js model loading, caching, and lifecycle management
 * Target: 85%+ prediction accuracy with <2s inference time
 */
export class AIModelManager {
  private models = new Map<string, GraphModel | LayersModel>();
  private modelMetadata = new Map<string, ModelMetadata>();
  private loadingPromises = new Map<string, Promise<GraphModel | LayersModel>>();
  private isInitialized = false;
  
  // Model configuration for aesthetic treatments
  private readonly MODEL_CONFIGS: Record<ModelType, PredictionConfig> = {
    'treatment-outcome': {
      modelPath: '/models/treatment-outcome-v2.json',
      inputShape: [1, 24], // Patient features: age, skin type, medical history, etc.
      outputShape: [1, 3], // Outcome probability, confidence, timeline
      accuracy: 0.87,
      version: '2.1.0'
    },
    'duration-estimation': {
      modelPath: '/models/duration-estimation-v1.json',
      inputShape: [1, 18], // Treatment type, patient factors, complexity
      outputShape: [1, 2], // Session duration, recovery time
      accuracy: 0.91,
      version: '1.3.0'
    },
    'success-probability': {
      modelPath: '/models/success-probability-v3.json',
      inputShape: [1, 32], // Comprehensive patient and treatment features
      outputShape: [1, 4], // Success probability, confidence, risk factors, timeline
      accuracy: 0.89,
      version: '3.0.1'
    },
    'risk-assessment': {
      modelPath: '/models/risk-assessment-v2.json',
      inputShape: [1, 28], // Medical history, contraindications, patient factors
      outputShape: [1, 5], // Risk levels for different complication types
      accuracy: 0.93,
      version: '2.2.0'
    },
    'botox-optimization': {
      modelPath: '/models/botox-optimization-v1.json',
      inputShape: [1, 20], // Muscle activity, patient characteristics, target areas
      outputShape: [1, 3], // Optimal units, injection pattern, expected results
      accuracy: 0.88,
      version: '1.1.0'
    },
    'filler-volume': {
      modelPath: '/models/filler-volume-v1.json',
      inputShape: [1, 22], // Facial analysis, patient goals, skin properties
      outputShape: [1, 4], // Volume per area, injection technique, timeline, longevity
      accuracy: 0.86,
      version: '1.0.2'
    },
    'laser-settings': {
      modelPath: '/models/laser-settings-v2.json',
      inputShape: [1, 26], // Skin type, condition, previous treatments, sensitivity
      outputShape: [1, 6], // Energy, pulse duration, spot size, passes, cooling, recovery
      accuracy: 0.92,
      version: '2.1.1'
    }
  };

  /**
   * Initialize the AI Model Manager
   * Preloads critical models for faster inference
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Configure TensorFlow.js for optimal browser performance
      await tf.ready();
      
      // Set backend preference for best performance
      if (tf.env().platform.has('webgl')) {
        await tf.setBackend('webgl');
      } else if (tf.env().platform.has('cpu')) {
        await tf.setBackend('cpu');
      }

      // Preload critical models for immediate availability
      const criticalModels: ModelType[] = [
        'treatment-outcome',
        'risk-assessment',
        'success-probability'
      ];

      await Promise.all(
        criticalModels.map(modelType => this.preloadModel(modelType))
      );

      this.isInitialized = true;
      console.log('✅ AI Model Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI Model Manager:', error);
      throw new Error(`AI Model Manager initialization failed: ${error}`);
    }
  }

  /**
   * Load a specific model with caching and error handling
   */
  async loadModel(modelType: ModelType): Promise<GraphModel | LayersModel> {
    // Return cached model if available
    if (this.models.has(modelType)) {
      return this.models.get(modelType)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(modelType)) {
      return this.loadingPromises.get(modelType)!;
    }

    const config = this.MODEL_CONFIGS[modelType];
    if (!config) {
      throw new Error(`Unknown model type: ${modelType}`);
    }

    // Create loading promise
    const loadingPromise = this.performModelLoad(modelType, config);
    this.loadingPromises.set(modelType, loadingPromise);

    try {
      const model = await loadingPromise;
      this.models.set(modelType, model);
      this.modelMetadata.set(modelType, {
        type: modelType,
        version: config.version,
        accuracy: config.accuracy,
        loadedAt: new Date(),
        inputShape: config.inputShape,
        outputShape: config.outputShape
      });
      
      return model;
    } finally {
      this.loadingPromises.delete(modelType);
    }
  }  /**
   * Perform actual model loading with comprehensive error handling
   */
  private async performModelLoad(
    modelType: ModelType, 
    config: PredictionConfig
  ): Promise<GraphModel | LayersModel> {
    const startTime = performance.now();
    
    try {
      // Load model with timeout protection
      const modelPromise = tf.loadLayersModel(config.modelPath);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Model loading timeout')), 30000)
      );

      const model = await Promise.race([modelPromise, timeoutPromise]);
      
      // Validate model structure
      this.validateModelStructure(model, config);
      
      const loadTime = performance.now() - startTime;
      console.log(`✅ Model ${modelType} loaded successfully in ${loadTime.toFixed(2)}ms`);
      
      return model;
    } catch (error) {
      console.error(`❌ Failed to load model ${modelType}:`, error);
      throw new Error(`Model loading failed for ${modelType}: ${error}`);
    }
  }

  /**
   * Validate model structure matches expected configuration
   */
  private validateModelStructure(
    model: GraphModel | LayersModel, 
    config: PredictionConfig
  ): void {
    if ('inputs' in model && model.inputs) {
      const inputShape = model.inputs[0].shape;
      const expectedInput = config.inputShape;
      
      if (inputShape && !this.shapesMatch(inputShape, expectedInput)) {
        throw new Error(
          `Model input shape mismatch. Expected: ${expectedInput}, Got: ${inputShape}`
        );
      }
    }
  }

  /**
   * Check if tensor shapes match (allowing null dimensions)
   */
  private shapesMatch(actual: number[], expected: number[]): boolean {
    if (actual.length !== expected.length) return false;
    
    return actual.every((dim, index) => 
      dim === expected[index] || dim === null || expected[index] === null
    );
  }

  /**
   * Preload a model for immediate availability
   */
  private async preloadModel(modelType: ModelType): Promise<void> {
    try {
      await this.loadModel(modelType);
      console.log(`🚀 Preloaded model: ${modelType}`);
    } catch (error) {
      console.warn(`⚠️  Failed to preload model ${modelType}:`, error);
      // Don't throw here - preloading failures shouldn't break initialization
    }
  }

  /**
   * Get model metadata for monitoring and analytics
   */
  getModelMetadata(modelType: ModelType): ModelMetadata | null {
    return this.modelMetadata.get(modelType) || null;
  }

  /**
   * Get all loaded models status
   */
  getLoadedModelsStatus(): Record<ModelType, boolean> {
    const status: Partial<Record<ModelType, boolean>> = {};
    
    Object.keys(this.MODEL_CONFIGS).forEach(modelType => {
      status[modelType as ModelType] = this.models.has(modelType);
    });
    
    return status as Record<ModelType, boolean>;
  }

  /**
   * Memory management - clear unused models
   */
  async clearModel(modelType: ModelType): Promise<void> {
    const model = this.models.get(modelType);
    if (model) {
      model.dispose();
      this.models.delete(modelType);
      this.modelMetadata.delete(modelType);
      console.log(`🧹 Cleared model: ${modelType}`);
    }
  }

  /**
   * Clear all models and free memory
   */
  async clearAllModels(): Promise<void> {
    for (const [modelType, model] of this.models) {
      model.dispose();
    }
    
    this.models.clear();
    this.modelMetadata.clear();
    this.loadingPromises.clear();
    
    console.log('🧹 All models cleared');
  }

  /**
   * Health check for model manager
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const details: Record<string, any> = {
      initialized: this.isInitialized,
      modelsLoaded: this.models.size,
      totalModels: Object.keys(this.MODEL_CONFIGS).length,
      memoryUsage: tf.memory(),
      backend: tf.getBackend()
    };

    const loadedCount = this.models.size;
    const totalCount = Object.keys(this.MODEL_CONFIGS).length;
    const loadedPercentage = loadedCount / totalCount;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (loadedPercentage >= 0.8) {
      status = 'healthy';
    } else if (loadedPercentage >= 0.5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, details };
  }
}

// Singleton instance for global use
export const aiModelManager = new AIModelManager();