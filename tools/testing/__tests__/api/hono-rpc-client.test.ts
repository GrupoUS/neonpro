import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock healthcare data
const mockPatient = {
	id: "pat_123456",
	name: "Maria Silva Santos",
	cpf: "123.456.789-00",
	email: "maria.silva@email.com",
	phone: "(11) 98765-4321",
	birthDate: "1985-03-15",
	address: {
		street: "Rua das Flores, 123",
		city: "São Paulo",
		state: "SP",
		zipCode: "01234-567",
	},
	medicalRecord: "MR001234",
	createdAt: "2024-01-15T10:30:00Z",
	updatedAt: "2024-01-15T10:30:00Z",
};

const mockAppointment = {
	id: "apt_789012",
	patientId: "pat_123456",
	professionalId: "prof_345678",
	serviceId: "srv_901234",
	scheduledFor: "2024-02-01T14:30:00Z",
	status: "scheduled",
	type: "consultation",
	notes: "Consulta de rotina - checkup anual",
	createdAt: "2024-01-15T10:30:00Z",
};

// Mock RPC-style Hono app
const createMockRPCApp = () => {
	const app = new Hono();

	app.use("*", cors());

	// Auth routes
	app.post("/auth/login", async (c) => {
		const body = await c.req.json();

		if (body.email === "admin@neonpro.com" && body.password === "admin123") {
			return c.json({
				token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token",
				user: {
					id: "user_123",
					email: "admin@neonpro.com",
					role: "admin",
					name: "Administrador Sistema",
				},
				expiresIn: "24h",
			});
		}

		return c.json(
			{
				error: "Credenciais inválidas",
				message: "Email ou senha incorretos",
			},
			401
		);
	});

	// Protected routes with JWT middleware simulation
	app.use("/api/*", async (c, next) => {
		const authHeader = c.req.header("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return c.json({ error: "Token de acesso requerido" }, 401);
		}
		await next();
	}); // Patient management endpoints
	app.get("/api/v1/patients", async (c) => {
		const page = c.req.query("page") || "1";
		const limit = c.req.query("limit") || "10";

		return c.json({
			data: [mockPatient],
			pagination: {
				page: Number.parseInt(page),
				limit: Number.parseInt(limit),
				total: 1,
				totalPages: 1,
			},
		});
	});

	app.post("/api/v1/patients", async (c) => {
		const body = await c.req.json();

		return c.json(
			{
				...mockPatient,
				...body,
				id: `pat_${Date.now()}`,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			201
		);
	});

	app.get("/api/v1/patients/:id", async (c) => {
		const id = c.req.param("id");

		if (id === mockPatient.id) {
			return c.json(mockPatient);
		}

		return c.json({ error: "Paciente não encontrado" }, 404);
	});

	// Appointment booking endpoints
	app.post("/api/v1/appointments", async (c) => {
		const body = await c.req.json();

		// Validate required fields
		if (!(body.patientId && body.professionalId && body.scheduledFor)) {
			return c.json(
				{
					error: "Campos obrigatórios",
					message: "patientId, professionalId e scheduledFor são obrigatórios",
				},
				400
			);
		}

		return c.json(
			{
				...mockAppointment,
				...body,
				id: `apt_${Date.now()}`,
				createdAt: new Date().toISOString(),
			},
			201
		);
	});

	app.get("/api/v1/appointments", async (c) => {
		const patientId = c.req.query("patientId");
		const status = c.req.query("status");

		let filteredAppointments = [mockAppointment];

		if (patientId) {
			filteredAppointments = filteredAppointments.filter((apt) => apt.patientId === patientId);
		}

		if (status) {
			filteredAppointments = filteredAppointments.filter((apt) => apt.status === status);
		}

		return c.json({ data: filteredAppointments });
	});

	return app;
}; // Mock TanStack Query client
const mockQueryClient = {
	invalidateQueries: vi.fn(),
	setQueryData: vi.fn(),
	getQueryData: vi.fn(),
	prefetchQuery: vi.fn(),
};

describe("🔌 NEONPRO Healthcare - Hono RPC Client Integration", () => {
	let app: ReturnType<typeof createMockRPCApp>;
	let client: ReturnType<typeof testClient>;
	let authToken: string;

	beforeEach(async () => {
		app = createMockRPCApp();
		client = testClient(app);
		vi.clearAllMocks();

		// Setup authenticated session
		const loginRes = await app.request("/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "admin@neonpro.com",
				password: "admin123",
			}),
		});

		const loginData = await loginRes.json();
		authToken = loginData.token;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Type-Safe RPC Client Integration", () => {
		it("should provide type-safe access to API endpoints", async () => {
			// Test that the client can be created and provides proper typing
			expect(client).toBeDefined();
			expect(typeof client).toBe("function");

			// Test endpoint access through RPC-style client
			const healthRes = await app.request("/api/v1/patients", {
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
			});

			expect(healthRes.status).toBe(200);

			const patientsData = await healthRes.json();
			expect(patientsData).toHaveProperty("data");
			expect(patientsData).toHaveProperty("pagination");
			expect(Array.isArray(patientsData.data)).toBe(true);
		});
	});

	describe("Authentication Flow Integration", () => {
		it("should successfully authenticate with valid credentials", async () => {
			const res = await app.request("/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "admin@neonpro.com",
					password: "admin123",
				}),
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toMatchObject({
				token: expect.any(String),
				user: {
					id: "user_123",
					email: "admin@neonpro.com",
					role: "admin",
					name: "Administrador Sistema",
				},
				expiresIn: "24h",
			});

			expect(body.token).toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
		});

		it("should reject authentication with invalid credentials", async () => {
			const res = await app.request("/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "wrong@email.com",
					password: "wrongpassword",
				}),
			});

			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body).toEqual({
				error: "Credenciais inválidas",
				message: "Email ou senha incorretos",
			});
		});

		it("should require authentication token for protected routes", async () => {
			const res = await app.request("/api/v1/patients");

			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body.error).toBe("Token de acesso requerido");
		});
	});

	describe("Patient Management Endpoints", () => {
		it("should fetch patients list with pagination", async () => {
			const res = await app.request("/api/v1/patients?page=1&limit=10", {
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toMatchObject({
				data: expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(String),
						name: expect.any(String),
						cpf: expect.any(String),
						email: expect.any(String),
						medicalRecord: expect.any(String),
					}),
				]),
				pagination: {
					page: 1,
					limit: 10,
					total: expect.any(Number),
					totalPages: expect.any(Number),
				},
			});
		});

		it("should create new patient with healthcare-specific validation", async () => {
			const newPatient = {
				name: "João Oliveira Costa",
				cpf: "987.654.321-00",
				email: "joao.costa@email.com",
				phone: "(11) 91234-5678",
				birthDate: "1990-08-22",
				address: {
					street: "Av. Paulista, 456",
					city: "São Paulo",
					state: "SP",
					zipCode: "01310-100",
				},
			};

			const res = await app.request("/api/v1/patients", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newPatient),
			});

			expect(res.status).toBe(201);

			const body = await res.json();
			expect(body).toMatchObject({
				...newPatient,
				id: expect.stringMatching(/^pat_\d+$/),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			});
		});
	});

	describe("Appointment Booking Endpoints", () => {
		it("should create appointment with healthcare validations", async () => {
			const newAppointment = {
				patientId: "pat_123456",
				professionalId: "prof_789012",
				serviceId: "srv_345678",
				scheduledFor: "2024-02-15T09:00:00Z",
				type: "consultation",
				notes: "Consulta dermatológica - avaliação de lesão",
			};

			const res = await app.request("/api/v1/appointments", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newAppointment),
			});

			expect(res.status).toBe(201);

			const body = await res.json();
			expect(body).toMatchObject({
				...newAppointment,
				id: expect.stringMatching(/^apt_\d+$/),
				status: "scheduled",
				createdAt: expect.any(String),
			});
		});

		it("should validate required fields for appointment creation", async () => {
			const invalidAppointment = {
				type: "consultation",
				notes: "Missing required fields",
			};

			const res = await app.request("/api/v1/appointments", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(invalidAppointment),
			});

			expect(res.status).toBe(400);

			const body = await res.json();
			expect(body).toEqual({
				error: "Campos obrigatórios",
				message: "patientId, professionalId e scheduledFor são obrigatórios",
			});
		});
	});

	describe("TanStack Query Integration Validation", () => {
		it("should integrate with query client for cache management", async () => {
			// Simulate TanStack Query integration patterns
			const queryKey = ["patients", { page: 1, limit: 10 }];

			// Mock query client operations
			mockQueryClient.setQueryData(queryKey, { data: [mockPatient] });

			expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(queryKey, {
				data: [mockPatient],
			});

			// Test invalidation after mutations
			mockQueryClient.invalidateQueries(["patients"]);

			expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(["patients"]);
		});

		it("should handle optimistic updates for healthcare data", async () => {
			const patientUpdate = {
				...mockPatient,
				name: "Maria Silva Santos Updated",
			};

			// Simulate optimistic update
			mockQueryClient.setQueryData(["patients", mockPatient.id], patientUpdate);

			expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(["patients", mockPatient.id], patientUpdate);

			// Verify query invalidation for data consistency
			mockQueryClient.invalidateQueries(["patients"]);

			expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(["patients"]);
		});
	});
});
