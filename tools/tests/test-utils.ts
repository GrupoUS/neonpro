import { vi } from "vitest";

/**
 * Global test utilities for NeonPro tests
 *
 * This file provides shared mock instances that can be imported
 * by test files to ensure consistent mocking across the test suite.
 */

// Get the global Supabase mock instance that was created in vitest.setup.ts
export const getGlobalSupabaseMock = () => {
	return (globalThis as any).mockSupabaseClient;
};

// Utility to reset all global mocks
export const resetAllGlobalMocks = () => {
	const globalMock = getGlobalSupabaseMock();
	if (globalMock) {
		// Reset all mock call histories recursively
		const resetMockRecursively = (obj: any) => {
			Object.values(obj).forEach((value: any) => {
				if (typeof value === "function" && "mockClear" in value) {
					(value as any).mockClear();
				} else if (typeof value === "object" && value !== null) {
					resetMockRecursively(value);
				}
			});
		};

		resetMockRecursively(globalMock);
	}
};

// Helper to set up common Supabase mock behaviors for tests
export const setupSupabaseMockForTable = (tableName: string, mockData: any) => {
	const globalMock = getGlobalSupabaseMock();
	if (globalMock?.from) {
		globalMock.from.mockImplementation((table: string) => {
			if (table === tableName) {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							single: vi
								.fn()
								.mockResolvedValue({ data: mockData, error: null }),
							order: vi.fn().mockReturnValue({
								limit: vi
									.fn()
									.mockResolvedValue({ data: [mockData], error: null }),
							}),
						}),
						neq: vi.fn().mockReturnValue({
							order: vi.fn().mockReturnValue({
								limit: vi
									.fn()
									.mockResolvedValue({ data: [mockData], error: null }),
							}),
						}),
						ilike: vi.fn().mockReturnValue({
							eq: vi.fn().mockReturnValue({
								order: vi.fn().mockReturnValue({
									limit: vi
										.fn()
										.mockResolvedValue({ data: [mockData], error: null }),
								}),
							}),
						}),
					}),
					insert: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							single: vi
								.fn()
								.mockResolvedValue({ data: mockData, error: null }),
						}),
					}),
					update: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							select: vi.fn().mockReturnValue({
								single: vi
									.fn()
									.mockResolvedValue({ data: mockData, error: null }),
							}),
						}),
					}),
					delete: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({ error: null }),
					}),
					upsert: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							single: vi
								.fn()
								.mockResolvedValue({ data: mockData, error: null }),
						}),
					}),
				};
			}
			// Return default mock for other tables
			return globalMock.from(table);
		});
	}
};
