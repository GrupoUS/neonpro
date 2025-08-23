/**
 * Simplified Vitest Setup - NeonPro Healthcare
 * ===========================================
 *
 * Essential mocks only - no complex async operations or extensive logging
 */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { beforeEach, vi } from "vitest";

// Make React globally available
Object.defineProperty(global, "React", { value: React });
Object.defineProperty(globalThis, "React", { value: React });

// Mock environment variables
process.env = {
	...process.env,
	NODE_ENV: "test",
	NEXT_PUBLIC_ENVIRONMENT: "test",
	NEXT_PUBLIC_APP_URL: "http://localhost:3000",
	NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
	NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
};

// Mock Next.js router
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		prefetch: vi.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/test",
	notFound: vi.fn(),
}));

// Enhanced React Query mocks with proper state management
const createMockMutation = () => {
	let state = {
		isPending: false,
		isSuccess: false,
		isError: false,
		isIdle: true,
		data: undefined,
		error: null,
	};

	const mutate = vi.fn((variables: any, options?: any) => {
		// Simulate async mutation
		state = { ...state, isPending: true, isIdle: false };

		setTimeout(() => {
			try {
				// Simulate success
				const mockData = { success: true, data: variables };
				state = {
					...state,
					isPending: false,
					isSuccess: true,
					isError: false,
					data: mockData,
				};

				if (options?.onSuccess) {
					options.onSuccess(mockData, variables);
				}
			} catch (error) {
				state = {
					...state,
					isPending: false,
					isSuccess: false,
					isError: true,
					error,
				};

				if (options?.onError) {
					options.onError(error, variables);
				}
			}
		}, 0);
	});

	return {
		...state,
		mutate,
		mutateAsync: vi.fn(() => Promise.resolve({ success: true, data: {} })),
		reset: vi.fn(() => {
			state = {
				isPending: false,
				isSuccess: false,
				isError: false,
				isIdle: true,
				data: undefined,
				error: null,
			};
		}),
	};
};

vi.mock("@tanstack/react-query", () => ({
	useMutation: vi.fn(() => createMockMutation()),
	useQuery: vi.fn(() => ({
		data: null,
		isLoading: false,
		isError: false,
		isSuccess: true,
		error: null,
		refetch: vi.fn(),
	})),
	useQueryClient: vi.fn(() => ({
		invalidateQueries: vi.fn(),
		clear: vi.fn(),
	})),
	QueryClient: vi.fn().mockImplementation(() => ({
		invalidateQueries: vi.fn(),
		clear: vi.fn(),
	})),
	QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock API client with all required methods
vi.mock("@neonpro/shared/api-client", () => ({
	ApiHelpers: {
		formatError: vi.fn((error: any) => {
			if (typeof error === "string") {
				return error;
			}
			if (error instanceof Error) {
				return error.message;
			}
			return "An error occurred";
		}),
		handleResponse: vi.fn(() => ({ success: true, data: {} })),
		validateResponse: vi.fn((response: any) => response),
		handleApiError: vi.fn(() => {
			throw new Error("API Error");
		}),
		isNetworkError: vi.fn(() => false),
		isAuthError: vi.fn(() => false),
		getApiKey: vi.fn(() => "test-key"),
	},
	apiClient: {
		auth: {
			setTokens: vi.fn(),
			getAccessToken: vi.fn(() => "mock-token"),
			getRefreshToken: vi.fn(() => "mock-refresh"),
			getSessionId: vi.fn(() => "mock-session-id"),
			getUser: vi.fn(() => ({ id: "user-1", role: "doctor", email: "test@example.com" })),
			isAuthenticated: vi.fn(() => true),
			clearTokens: vi.fn(),
			shouldRefresh: vi.fn(() => false),
			refreshToken: vi.fn(() => Promise.resolve({ success: true })),
		},
		api: {
			v1: {
				auth: {
					login: { $post: vi.fn(() => Promise.resolve({ success: true })) },
					refresh: { $post: vi.fn(() => Promise.resolve({ success: true })) },
					logout: { $post: vi.fn(() => Promise.resolve({ success: true })) },
				},
				patients: {
					$post: vi.fn(() =>
						Promise.resolve({
							success: true,
							data: { id: "patient-1", name: "Test Patient" },
						})
					),
					$get: vi.fn(() => Promise.resolve({ success: true, data: [] })),
				},
			},
		},
		audit: {
			log: vi.fn(() => Promise.resolve({ success: true })),
		},
		utils: {
			getUserAgent: vi.fn(() => "test-agent"),
		},
	},
}));

// Mock shared schemas (empty for now)
vi.mock("@neonpro/shared/schemas", () => ({}));

// Essential browser API mocks
Object.defineProperty(window, "location", {
	value: {
		href: "http://localhost:3000",
		assign: vi.fn(),
		replace: vi.fn(),
		reload: vi.fn(),
	},
	writable: true,
});

Object.defineProperty(global, "fetch", {
	value: vi.fn(() =>
		Promise.resolve({
			ok: true,
			status: 200,
			json: () => Promise.resolve({}),
			text: () => Promise.resolve(""),
		})
	),
});

// Mock localStorage
Object.defineProperty(window, "localStorage", {
	value: {
		getItem: vi.fn(),
		setItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn(),
	},
});

// Mock console to reduce noise
global.console = {
	...console,
	log: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	info: vi.fn(),
	debug: vi.fn(),
	trace: vi.fn(),
};

// Enhanced browser API mocks
Object.defineProperty(window, "confirm", {
	value: vi.fn(() => true),
	writable: true,
	configurable: true,
});

Object.defineProperty(window, "alert", {
	value: vi.fn(),
	writable: true,
	configurable: true,
});

// Form submission polyfill - Enhanced for JSDOM compatibility
if (typeof HTMLFormElement !== "undefined") {
	// Check if requestSubmit is already available
	if (!HTMLFormElement.prototype.requestSubmit) {
		HTMLFormElement.prototype.requestSubmit = function (submitter?: HTMLElement) {
			// Create and dispatch submit event
			const event = new Event("submit", { bubbles: true, cancelable: true });

			// Add submitter property if provided
			if (submitter) {
				Object.defineProperty(event, "submitter", {
					value: submitter,
					writable: false,
					configurable: true,
				});
			}

			// Dispatch the event on the form
			const eventResult = this.dispatchEvent(event);

			// If event wasn't cancelled, perform default form submission behavior
			if (eventResult) {
			}

			return eventResult;
		};
	}

	// Also polyfill form validation methods
	if (!HTMLFormElement.prototype.checkValidity) {
		HTMLFormElement.prototype.checkValidity = () => {
			return true; // Simplified for tests
		};
	}

	if (!HTMLFormElement.prototype.reportValidity) {
		HTMLFormElement.prototype.reportValidity = function () {
			return this.checkValidity();
		};
	}
}

beforeEach(() => {
	vi.clearAllMocks();
});
