/**
 * TensorFlow.js Lazy Loader for Healthcare Performance Optimization
 * Reduces initial bundle size by ~10MB with on-demand loading
 */

interface TensorFlowInstance {
  ready: () => Promise<void>;
  loadLayersModel: (url: string) => Promise<unknown>;
  loadGraphModel: (url: string) => Promise<unknown>;
  tensor: (values: unknown, shape?: number[]) => unknown;
  dispose: (tensor: unknown) => void;
  setBackend: (backend: string) => Promise<boolean>;
  getBackend: () => string;
  browser: {
    fromPixels: (pixels: unknown) => unknown;
  };
  sequential: (config?: Record<string, unknown>) => unknown;
  layers: Record<string, unknown>;
  train: Record<string, unknown>;
  losses: Record<string, unknown>;
  metrics: Record<string, unknown>;
  optimizers: Record<string, unknown>;
  // Add other TensorFlow.js APIs as needed
}

class TensorFlowLazyLoader {
  private tfInstance: TensorFlowInstance | null = null;
  private loadingPromise: Promise<TensorFlowInstance> | null = null;
  private isLoaded = false;

  /**
   * Get TensorFlow.js instance with lazy loading
   * First call triggers dynamic import, subsequent calls return cached instance
   */
  async getTensorFlow(): Promise<TensorFlowInstance> {
    if (this.tfInstance) {
      return this.tfInstance;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadTensorFlow();
    this.tfInstance = await this.loadingPromise;
    return this.tfInstance;
  }

  /**
   * Dynamic import TensorFlow.js with performance optimization
   */
  private async loadTensorFlow(): Promise<TensorFlowInstance> {
    try {
      console.log("🧠 Loading TensorFlow.js for AI predictions...");
      const startTime = performance.now();

      // Dynamic import to avoid bundle inclusion
      const tf = await import("@tensorflow/tfjs");

      // Initialize TensorFlow.js
      await tf.ready();

      // Optimize for healthcare performance
      await this.optimizeForHealthcare(tf);

      const loadTime = performance.now() - startTime;
      console.log(`✅ TensorFlow.js loaded in ${Math.round(loadTime)}ms`);

      this.isLoaded = true;
      return tf as TensorFlowInstance;
    } catch (error) {
      console.error("❌ Failed to load TensorFlow.js:", error);
      throw new Error(`TensorFlow.js lazy loading failed: ${error}`);
    }
  }

  /**
   * Optimize TensorFlow.js for healthcare workflows
   */
  private async optimizeForHealthcare(tf: Record<string, unknown>): Promise<void> {
    try {
      // Set optimal backend for browser performance
      if (typeof window !== "undefined") {
        const backends = ["webgl", "webgpu", "cpu"];

        for (const backend of backends) {
          try {
            const success = await tf.setBackend(backend);
            if (success) {
              console.log(`🎯 TensorFlow.js backend: ${backend}`);
              break;
            }
          } catch (backendError) {
            console.warn(`Backend ${backend} not available:`, backendError);
          }
        }
      }

      // Configure for healthcare performance requirements
      if (tf.env) {
        tf.env().set("WEBGL_PACK", true); // Optimize WebGL operations
        tf.env().set("WEBGL_FORCE_F16_TEXTURES", true); // Use half precision for speed
        tf.env().set("WEBGL_CONV_IM2COL", true); // Optimize convolutions
      }
    } catch (error) {
      console.warn("⚠️ TensorFlow.js optimization failed:", error);
      // Continue without optimization rather than failing
    }
  }

  /**
   * Preload TensorFlow.js in background (optional)
   * Call this when AI features might be needed soon
   */
  async preload(): Promise<void> {
    if (!this.isLoaded && !this.loadingPromise) {
      // Start loading in background without awaiting
      this.loadingPromise = this.loadTensorFlow();
      this.loadingPromise.catch(error => {
        console.warn("TensorFlow.js preload failed:", error);
        this.loadingPromise = null; // Allow retry
      });
    }
  }

  /**
   * Check if TensorFlow.js is currently loaded
   */
  isAvailable(): boolean {
    return this.isLoaded && this.tfInstance !== null;
  }

  /**
   * Get loading status for UI feedback
   */
  getLoadingStatus(): {
    isLoaded: boolean;
    isLoading: boolean;
    canLoad: boolean;
  } {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.loadingPromise !== null && !this.isLoaded,
      canLoad: typeof window !== "undefined", // Only available in browser
    };
  }

  /**
   * Dispose TensorFlow.js instance and free memory
   * Useful for cleaning up when AI features are no longer needed
   */
  dispose(): void {
    if (this.tfInstance) {
      // TensorFlow.js doesn't have a global dispose, but we can clear our references
      this.tfInstance = null;
      this.isLoaded = false;
      this.loadingPromise = null;
      console.log("🧹 TensorFlow.js instance disposed");
    }
  }
}

// Singleton instance for application-wide lazy loading
export const tensorFlowLoader = new TensorFlowLazyLoader();

// Convenience function for getting TensorFlow.js
export const getTensorFlow = () => tensorFlowLoader.getTensorFlow();

// Type-safe wrapper for TensorFlow.js operations
export class LazyTensorFlowOperations {
  private static async withTensorFlow<T>(
    operation: (tf: TensorFlowInstance) => Promise<T>,
  ): Promise<T> {
    const tf = await tensorFlowLoader.getTensorFlow();
    return operation(tf);
  }

  /**
   * Create tensor with lazy loading
   */
  static async createTensor(values: unknown, shape?: number[]): Promise<unknown> {
    return this.withTensorFlow(async (tf) => tf.tensor(values, shape));
  }

  /**
   * Load model with lazy loading
   */
  static async loadModel(modelUrl: string, type: "layers" | "graph" = "graph"): Promise<any> {
    return this.withTensorFlow(async (tf) => {
      if (type === "layers") {
        return tf.loadLayersModel(modelUrl);
      } else {
        return tf.loadGraphModel(modelUrl);
      }
    });
  }

  /**
   * Check if TensorFlow.js is ready for operations
   */
  static isReady(): boolean {
    return tensorFlowLoader.isAvailable();
  }

  /**
   * Preload TensorFlow.js for better UX
   */
  static preload(): Promise<void> {
    return tensorFlowLoader.preload();
  }
}

export default tensorFlowLoader;
