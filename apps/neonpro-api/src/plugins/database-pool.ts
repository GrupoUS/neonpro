/**
 * Database Connection Pool Manager
 * Optimized for PostgreSQL/Supabase with healthcare-specific configurations
 */

import { Pool, type PoolClient, type PoolConfig } from "pg";
import { z } from "zod";

// Configuration schemas
const DatabaseConfigSchema = z.object({
  host: z.string(),
  port: z.number().default(5432),
  database: z.string(),
  user: z.string(),
  password: z.string(),
  ssl: z.boolean().default(true),
  pool: z
    .object({
      min: z.number().default(5),
      max: z.number().default(20),
      idleTimeoutMillis: z.number().default(30000),
      connectionTimeoutMillis: z.number().default(10000),
      acquireTimeoutMillis: z.number().default(60000),
      maxUses: z.number().default(7500),
    })
    .optional(),
});

type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

// Connection pool metrics
interface PoolMetrics {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
  totalQueries: number;
  avgQueryTime: number;
  slowQueries: number;
  errors: number;
  lastError?: string;
  uptime: number;
}

// Query performance tracking
interface QueryStats {
  query: string;
  duration: number;
  timestamp: Date;
  tenantId?: string;
  userId?: string;
  error?: string;
}

/**
 * Healthcare-optimized database connection pool manager
 */
export class DatabasePoolManager {
  private pools: Map<string, Pool> = new Map();
  private metrics: Map<string, PoolMetrics> = new Map();
  private queryStats: QueryStats[] = [];
  private readonly maxQueryStatsSize = 1000;
  private readonly slowQueryThreshold = 1000; // 1 second

  constructor() {
    this.startMetricsCollection();
    this.setupHealthChecks();
  }

  /**
   * Initialize connection pool for a tenant
   */
  async createPool(tenantId: string, config: DatabaseConfig): Promise<void> {
    const validatedConfig = DatabaseConfigSchema.parse(config);

    const poolConfig: PoolConfig = {
      host: validatedConfig.host,
      port: validatedConfig.port,
      database: validatedConfig.database,
      user: validatedConfig.user,
      password: validatedConfig.password,
      ssl: validatedConfig.ssl ? { rejectUnauthorized: false } : false,
      min: validatedConfig.pool?.min || 5,
      max: validatedConfig.pool?.max || 20,
      idleTimeoutMillis: validatedConfig.pool?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: validatedConfig.pool?.connectionTimeoutMillis || 10000,
      acquireTimeoutMillis: validatedConfig.pool?.acquireTimeoutMillis || 60000,
      maxUses: validatedConfig.pool?.maxUses || 7500,

      // Healthcare-specific optimizations
      statement_timeout: 30000, // 30 seconds for complex queries
      query_timeout: 10000, // 10 seconds for regular queries
      application_name: `neonpro-${tenantId}`,

      // Connection validation
      allowExitOnIdle: false,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };

    const pool = new Pool(poolConfig);

    // Setup pool event handlers
    this.setupPoolEvents(pool, tenantId);

    // Test connection
    await this.validateConnection(pool, tenantId);

    this.pools.set(tenantId, pool);
    this.initializeMetrics(tenantId);

    console.log(`Database pool created for tenant: ${tenantId}`);
  }

  /**
   * Get connection pool for tenant
   */
  getPool(tenantId: string): Pool | null {
    return this.pools.get(tenantId) || null;
  }

  /**
   * Execute query with performance tracking
   */
  async query<T = any>(
    tenantId: string,
    text: string,
    params?: any[],
    userId?: string,
  ): Promise<{ rows: T[]; rowCount: number; duration: number }> {
    const pool = this.getPool(tenantId);
    if (!pool) {
      throw new Error(`No database pool found for tenant: ${tenantId}`);
    }

    const startTime = Date.now();
    let client: PoolClient | null = null;

    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      const duration = Date.now() - startTime;

      // Track query performance
      this.trackQuery({
        query: text.substring(0, 100), // Truncate for privacy
        duration,
        timestamp: new Date(),
        tenantId,
        userId,
      });

      this.updateMetrics(tenantId, duration);

      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      this.trackQuery({
        query: text.substring(0, 100),
        duration,
        timestamp: new Date(),
        tenantId,
        userId,
        error: errorMessage,
      });

      this.updateErrorMetrics(tenantId, errorMessage);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Execute transaction with automatic rollback on error
   */
  async transaction<T>(
    tenantId: string,
    callback: (client: PoolClient) => Promise<T>,
    userId?: string,
  ): Promise<T> {
    const pool = this.getPool(tenantId);
    if (!pool) {
      throw new Error(`No database pool found for tenant: ${tenantId}`);
    }

    const client = await pool.connect();
    const startTime = Date.now();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");

      const duration = Date.now() - startTime;
      this.trackQuery({
        query: "TRANSACTION",
        duration,
        timestamp: new Date(),
        tenantId,
        userId,
      });

      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Transaction failed";

      this.trackQuery({
        query: "TRANSACTION_FAILED",
        duration,
        timestamp: new Date(),
        tenantId,
        userId,
        error: errorMessage,
      });

      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Healthcare-specific batch operations
   */
  async batchInsert(
    tenantId: string,
    table: string,
    columns: string[],
    values: any[][],
    userId?: string,
  ): Promise<{ insertedCount: number; duration: number }> {
    if (values.length === 0) {
      return { insertedCount: 0, duration: 0 };
    }

    const placeholders = values
      .map(
        (_, index) =>
          `(${columns.map((_, colIndex) => `$${index * columns.length + colIndex + 1}`).join(", ")})`,
      )
      .join(", ");

    const flatValues = values.flat();
    const query = `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders}`;

    const result = await this.query(tenantId, query, flatValues, userId);
    return {
      insertedCount: result.rowCount,
      duration: result.duration,
    };
  }

  /**
   * Get pool metrics for monitoring
   */
  getMetrics(tenantId?: string): PoolMetrics | Map<string, PoolMetrics> {
    if (tenantId) {
      return this.metrics.get(tenantId) || this.createEmptyMetrics();
    }
    return new Map(this.metrics);
  }

  /**
   * Get recent query statistics
   */
  getQueryStats(tenantId?: string, limit: number = 100): QueryStats[] {
    let stats = this.queryStats;

    if (tenantId) {
      stats = stats.filter((stat) => stat.tenantId === tenantId);
    }

    return stats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  /**
   * Get slow queries for optimization
   */
  getSlowQueries(tenantId?: string, limit: number = 50): QueryStats[] {
    return this.getQueryStats(tenantId)
      .filter((stat) => stat.duration > this.slowQueryThreshold)
      .slice(0, limit);
  }

  /**
   * Health check for all pools
   */
  async healthCheck(): Promise<{ [tenantId: string]: boolean }> {
    const results: { [tenantId: string]: boolean } = {};

    for (const [tenantId, pool] of this.pools) {
      try {
        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();
        results[tenantId] = true;
      } catch (error) {
        results[tenantId] = false;
        console.error(`Health check failed for tenant ${tenantId}:`, error);
      }
    }

    return results;
  }

  /**
   * Close specific pool
   */
  async closePool(tenantId: string): Promise<void> {
    const pool = this.pools.get(tenantId);
    if (pool) {
      await pool.end();
      this.pools.delete(tenantId);
      this.metrics.delete(tenantId);
      console.log(`Database pool closed for tenant: ${tenantId}`);
    }
  }

  /**
   * Close all pools
   */
  async closeAllPools(): Promise<void> {
    const closePromises = Array.from(this.pools.keys()).map((tenantId) => this.closePool(tenantId));
    await Promise.all(closePromises);
  }

  // Private methods

  private setupPoolEvents(pool: Pool, tenantId: string): void {
    pool.on("connect", (client) => {
      console.log(`New client connected for tenant: ${tenantId}`);
    });

    pool.on("error", (err, client) => {
      console.error(`Database pool error for tenant ${tenantId}:`, err);
      this.updateErrorMetrics(tenantId, err.message);
    });

    pool.on("remove", (client) => {
      console.log(`Client removed from pool for tenant: ${tenantId}`);
    });
  }

  private async validateConnection(pool: Pool, tenantId: string): Promise<void> {
    try {
      const client = await pool.connect();
      await client.query("SELECT NOW()");
      client.release();
    } catch (error) {
      throw new Error(`Failed to validate connection for tenant ${tenantId}: ${error}`);
    }
  }

  private initializeMetrics(tenantId: string): void {
    this.metrics.set(tenantId, this.createEmptyMetrics());
  }

  private createEmptyMetrics(): PoolMetrics {
    return {
      totalConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      totalQueries: 0,
      avgQueryTime: 0,
      slowQueries: 0,
      errors: 0,
      uptime: Date.now(),
    };
  }

  private trackQuery(stats: QueryStats): void {
    this.queryStats.push(stats);

    // Keep only recent queries
    if (this.queryStats.length > this.maxQueryStatsSize) {
      this.queryStats = this.queryStats.slice(-this.maxQueryStatsSize);
    }
  }

  private updateMetrics(tenantId: string, duration: number): void {
    const metrics = this.metrics.get(tenantId);
    if (!metrics) return;

    metrics.totalQueries++;
    metrics.avgQueryTime = (metrics.avgQueryTime + duration) / 2;

    if (duration > this.slowQueryThreshold) {
      metrics.slowQueries++;
    }
  }

  private updateErrorMetrics(tenantId: string, error: string): void {
    const metrics = this.metrics.get(tenantId);
    if (!metrics) return;

    metrics.errors++;
    metrics.lastError = error;
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      for (const [tenantId, pool] of this.pools) {
        const metrics = this.metrics.get(tenantId);
        if (metrics) {
          metrics.totalConnections = pool.totalCount;
          metrics.idleConnections = pool.idleCount;
          metrics.waitingClients = pool.waitingCount;
        }
      }
    }, 5000); // Update every 5 seconds
  }

  private setupHealthChecks(): void {
    // Periodic health checks
    setInterval(async () => {
      await this.healthCheck();
    }, 30000); // Every 30 seconds
  }
}

// Singleton instance
export const databasePool = new DatabasePoolManager();

// Fastify plugin
export async function registerDatabasePool(fastify: any) {
  fastify.decorate("db", databasePool);

  // Add shutdown hook
  fastify.addHook("onClose", async () => {
    await databasePool.closeAllPools();
  });
}
