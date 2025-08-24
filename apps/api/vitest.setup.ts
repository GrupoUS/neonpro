import { vi } from "vitest";

// Mock console for cleaner test output
global.console = {
	...console,
	log: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};

// Mock environment variables
process.env = {
	...process.env,
	NODE_ENV: "test",
	SUPABASE_URL: "http://localhost:54321",
	SUPABASE_ANON_KEY: "test-key",
	DATABASE_URL: "postgresql://test:test@localhost:5432/test",
	JWT_SECRET: "test-secret",
};

// Mock crypto
Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
		getRandomValues: (arr: Uint8Array) => arr,
	},
});

// Create a fetch mock that proxies to the Hono app for API routes
const mockFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
	const url = typeof input === "string" ? input : input.toString();

	// If it's an API route, proxy to the Hono app
	if (url.startsWith("/api/") || url.includes("api/")) {
		const { default: app } = await import("./src/index");

		// Create a proper Request object
		const request = new Request(url.startsWith("http") ? url : `http://localhost:8000${url}`, {
			method: init?.method || "GET",
			headers: init?.headers || {},
			body: init?.body,
		});

		return app.fetch(request);
	}

	// For non-API routes, return mock response
	return Promise.resolve({
		ok: true,
		status: 200,
		json: () => Promise.resolve({}),
		text: () => Promise.resolve(""),
		headers: new Headers({
			"content-type": "application/json",
		}),
	} as Response);
});

// Add mock methods that tests expect
mockFetch.mockClear = vi.fn();
mockFetch.mockResolvedValue = vi.fn();
mockFetch.mockRejectedValue = vi.fn();

// Mock fetch for API testing
Object.defineProperty(global, "fetch", {
	value: mockFetch,
});
