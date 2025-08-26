/**
 * NEONPRO Mock Supabase Setup for Healthcare Testing
 * Provides isolated Supabase client mocking for healthcare data testing
 * Ensures LGPD compliance and tenant isolation in tests
 */

import { vi } from "vitest";

// Mock Supabase Types for Healthcare
export type MockSupabaseClient = {
	from: (table: string) => MockQueryBuilder;
	auth: MockAuthClient;
	storage: MockStorageClient;
	channel: (name: string) => MockChannel;
	rpc: (fn: string, params?: any) => Promise<any>;
};

export type MockQueryBuilder = {
	select: (columns?: string) => MockQueryBuilder;
	insert: (data: any) => MockQueryBuilder;
	update: (data: any) => MockQueryBuilder;
	delete: () => MockQueryBuilder;
	eq: (column: string, value: any) => MockQueryBuilder;
	neq: (column: string, value: any) => MockQueryBuilder;
	gte: (column: string, value: any) => MockQueryBuilder;
	lte: (column: string, value: any) => MockQueryBuilder;
	like: (column: string, pattern: string) => MockQueryBuilder;
	ilike: (column: string, pattern: string) => MockQueryBuilder;
	in: (column: string, values: any[]) => MockQueryBuilder;
	order: (
		column: string,
		options?: { ascending?: boolean },
	) => MockQueryBuilder;
	limit: (count: number) => MockQueryBuilder;
	range: (from: number, to: number) => MockQueryBuilder;
	single: () => MockQueryBuilder;
	maybeSingle: () => MockQueryBuilder;
	then: (onfulfilled?: any, onrejected?: any) => Promise<any>;
};

export type MockAuthClient = {
	getUser: () => Promise<{ data: { user: any } | null; error: any }>;
	getSession: () => Promise<{ data: { session: any } | null; error: any }>;
	signUp: (credentials: any) => Promise<{ data: any; error: any }>;
	signInWithPassword: (credentials: any) => Promise<{ data: any; error: any }>;
	signOut: () => Promise<{ error: any }>;
};

export type MockStorageClient = {
	from: (bucket: string) => MockBucket;
};

export type MockBucket = {
	upload: (path: string, file: any) => Promise<{ data: any; error: any }>;
	download: (path: string) => Promise<{ data: any; error: any }>;
	remove: (paths: string[]) => Promise<{ data: any; error: any }>;
	list: (path?: string) => Promise<{ data: any; error: any }>;
};

export type MockChannel = {
	on: (event: string, filter: any, callback: any) => MockChannel;
	subscribe: () => MockChannel;
	unsubscribe: () => Promise<any>;
}; // Healthcare Mock Data Store
class HealthcareMockDataStore {
	private readonly data: Map<string, any[]> = new Map();
	private readonly tenantId: string;

	constructor(tenantId = "test-tenant-healthcare") {
		this.tenantId = tenantId;
		this.initializeTestData();
	}

	private initializeTestData() {
		// Initialize with empty healthcare tables
		this.data.set("patients", []);
		this.data.set("appointments", []);
		this.data.set("providers", []);
		this.data.set("procedures", []);
		this.data.set("medical_records", []);
		this.data.set("audit_logs", []);
		this.data.set("lgpd_consents", []);
	}

	getTable(tableName: string): any[] {
		return this.data.get(tableName) || [];
	}

	setTable(tableName: string, data: any[]): void {
		this.data.set(tableName, data);
	}

	addRecord(tableName: string, record: any): any {
		const table = this.getTable(tableName);
		const id =
			record.id ||
			`${tableName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const tenantRecord = {
			...record,
			id,
			tenant_id: this.tenantId,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		table.push(tenantRecord);
		this.setTable(tableName, table);
		return tenantRecord;
	}

	clear(): void {
		this.data.clear();
		this.initializeTestData();
	}
} // Mock Query Builder Implementation
class MockQueryBuilderImpl implements MockQueryBuilder {
	private readonly tableName: string;
	private readonly dataStore: HealthcareMockDataStore;
	private readonly query: any = {};
	private operation: "select" | "insert" | "update" | "delete" = "select";

	constructor(tableName: string, dataStore: HealthcareMockDataStore) {
		this.tableName = tableName;
		this.dataStore = dataStore;
	}

	select(columns?: string): MockQueryBuilder {
		this.operation = "select";
		this.query.columns = columns;
		return this;
	}

	insert(data: any): MockQueryBuilder {
		this.operation = "insert";
		this.query.data = data;
		return this;
	}

	update(data: any): MockQueryBuilder {
		this.operation = "update";
		this.query.data = data;
		return this;
	}

	delete(): MockQueryBuilder {
		this.operation = "delete";
		return this;
	}

	eq(column: string, value: any): MockQueryBuilder {
		this.query.filters = this.query.filters || [];
		this.query.filters.push({ type: "eq", column, value });
		return this;
	}

	neq(column: string, value: any): MockQueryBuilder {
		this.query.filters = this.query.filters || [];
		this.query.filters.push({ type: "neq", column, value });
		return this;
	}

	gte(column: string, value: any): MockQueryBuilder {
		this.query.filters = this.query.filters || [];
		this.query.filters.push({ type: "gte", column, value });
		return this;
	}

	lte(column: string, value: any): MockQueryBuilder {
		this.query.filters = this.query.filters || [];
		this.query.filters.push({ type: "lte", column, value });
		return this;
	}

	like(column: string, pattern: string): MockQueryBuilder {
		this.query.filters = this.query.filters || [];
		this.query.filters.push({ type: "like", column, value: pattern });
		return this;
	}

	ilike(column: string, pattern: string): MockQueryBuilder {
		this.query.filters = this.query.filters || [];
		this.query.filters.push({ type: "ilike", column, value: pattern });
		return this;
	}

	in(column: string, values: any[]): MockQueryBuilder {
		this.query.filters = this.query.filters || [];
		this.query.filters.push({ type: "in", column, value: values });
		return this;
	}

	order(column: string, options?: { ascending?: boolean }): MockQueryBuilder {
		this.query.order = { column, ascending: options?.ascending !== false };
		return this;
	}

	limit(count: number): MockQueryBuilder {
		this.query.limit = count;
		return this;
	}

	range(from: number, to: number): MockQueryBuilder {
		this.query.range = { from, to };
		return this;
	}

	single(): MockQueryBuilder {
		this.query.single = true;
		return this;
	}

	maybeSingle(): MockQueryBuilder {
		this.query.maybeSingle = true;
		return this;
	}

	then(onfulfilled?: any, onrejected?: any): Promise<any> {
		return this.execute().then(onfulfilled, onrejected);
	}
	private async execute(): Promise<any> {
		try {
			let data = this.dataStore.getTable(this.tableName);

			// Apply filters
			if (this.query.filters) {
				data = data.filter((record) => {
					return this.query.filters.every((filter: any) => {
						const value = record[filter.column];
						switch (filter.type) {
							case "eq":
								return value === filter.value;
							case "neq":
								return value !== filter.value;
							case "gte":
								return value >= filter.value;
							case "lte":
								return value <= filter.value;
							case "like":
								return String(value).includes(filter.value.replace("%", ""));
							case "ilike":
								return String(value)
									.toLowerCase()
									.includes(filter.value.replace("%", "").toLowerCase());
							case "in":
								return filter.value.includes(value);
							default:
								return true;
						}
					});
				});
			}

			switch (this.operation) {
				case "select":
					// Apply ordering
					if (this.query.order) {
						data.sort((a, b) => {
							const aVal = a[this.query.order.column];
							const bVal = b[this.query.order.column];
							const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
							return this.query.order.ascending ? comparison : -comparison;
						});
					}

					// Apply range/limit
					if (this.query.range) {
						data = data.slice(this.query.range.from, this.query.range.to + 1);
					} else if (this.query.limit) {
						data = data.slice(0, this.query.limit);
					}

					if (this.query.single || this.query.maybeSingle) {
						return { data: data[0] || null, error: null };
					}

					return { data, error: null };

				case "insert": {
					const insertedRecord = this.dataStore.addRecord(
						this.tableName,
						this.query.data,
					);
					return { data: insertedRecord, error: null };
				}

				case "update": {
					// Update matching records
					const table = this.dataStore.getTable(this.tableName);
					const updatedRecords = table.map((record) => {
						const matches =
							!this.query.filters ||
							this.query.filters.every((filter: any) => {
								const value = record[filter.column];
								return filter.type === "eq" ? value === filter.value : true;
							});

						if (matches) {
							return {
								...record,
								...this.query.data,
								updated_at: new Date().toISOString(),
							};
						}
						return record;
					});

					this.dataStore.setTable(this.tableName, updatedRecords);
					return {
						data: updatedRecords.filter((_, i) => data.includes(table[i])),
						error: null,
					};
				}

				case "delete": {
					const remainingRecords = this.dataStore
						.getTable(this.tableName)
						.filter((record) => {
							return this.query.filters
								? !this.query.filters.every((filter: any) => {
										const value = record[filter.column];
										return filter.type === "eq" ? value === filter.value : true;
									})
								: false;
						});

					this.dataStore.setTable(this.tableName, remainingRecords);
					return { data: null, error: null };
				}

				default:
					return { data: null, error: new Error("Unknown operation") };
			}
		} catch (error) {
			return { data: null, error };
		}
	}
} // Mock Supabase Client Implementation
export class MockSupabaseClientImpl implements MockSupabaseClient {
	private readonly dataStore: HealthcareMockDataStore;

	constructor(dataStore?: HealthcareMockDataStore) {
		this.dataStore = dataStore || new HealthcareMockDataStore();
	}

	from(table: string): MockQueryBuilder {
		return new MockQueryBuilderImpl(table, this.dataStore);
	}

	auth: MockAuthClient = {
		async getUser() {
			return {
				data: {
					user: {
						id: "test-user-id",
						email: "test@healthcare.com",
						app_metadata: { tenant_id: "test-tenant-healthcare" },
					},
				},
				error: null,
			};
		},

		async getSession() {
			return {
				data: {
					session: {
						access_token: "test-access-token",
						user: { id: "test-user-id", email: "test@healthcare.com" },
					},
				},
				error: null,
			};
		},

		async signUp(credentials: any) {
			return {
				data: { user: { id: "new-user-id", ...credentials } },
				error: null,
			};
		},

		async signInWithPassword(credentials: any) {
			return {
				data: { user: { id: "test-user-id", email: credentials.email } },
				error: null,
			};
		},

		async signOut() {
			return { error: null };
		},
	};

	storage: MockStorageClient = {
		from: (_bucket: string) => ({
			async upload(path: string, _file: any) {
				return { data: { path, size: 1024 }, error: null };
			},
			async download(_path: string) {
				return { data: new Blob(["test data"]), error: null };
			},
			async remove(paths: string[]) {
				return { data: paths, error: null };
			},
			async list(_path?: string) {
				return { data: [], error: null };
			},
		}),
	};

	channel(name: string): MockChannel {
		return {
			on: (_event: string, _filter: any, _callback: any) => {
				// Mock real-time subscription
				return this.channel(name);
			},
			subscribe: () => this.channel(name),
			unsubscribe: async () => ({ status: "ok" }),
		};
	}

	async rpc(fn: string, _params?: any) {
		// Mock RPC calls for healthcare functions
		switch (fn) {
			case "get_patient_analytics":
				return {
					data: { total_patients: 100, active_patients: 85 },
					error: null,
				};
			case "validate_lgpd_compliance":
				return {
					data: { compliant: true, last_check: new Date().toISOString() },
					error: null,
				};
			default:
				return { data: null, error: new Error(`Unknown RPC function: ${fn}`) };
		}
	}
}

// Global Mock Setup
let mockSupabaseClient: MockSupabaseClientImpl;
let mockDataStore: HealthcareMockDataStore;

export const setupMockSupabase = () => {
	mockDataStore = new HealthcareMockDataStore();
	mockSupabaseClient = new MockSupabaseClientImpl(mockDataStore);

	// Set global mock client
	(globalThis as any).__MOCK_SUPABASE_CLIENT__ = mockSupabaseClient;
	(globalThis as any).__MOCK_DATA_STORE__ = mockDataStore;

	// Mock Supabase imports
	vi.doMock("@supabase/supabase-js", () => ({
		createClient: () => mockSupabaseClient,
	}));

	vi.doMock("@supabase/ssr", () => ({
		createServerClient: () => mockSupabaseClient,
		createBrowserClient: () => mockSupabaseClient,
	}));
};

export const cleanupMockSupabase = () => {
	if (mockDataStore) {
		mockDataStore.clear();
	}
	(globalThis as any).__MOCK_SUPABASE_CLIENT__ = undefined;
	(globalThis as any).__MOCK_DATA_STORE__ = undefined;
	vi.resetModules();
};
