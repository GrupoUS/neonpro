/**
 * 💄 Services Routes - NeonPro API
 * ==================================
 *
 * Rotas para catálogo de serviços estéticos
 * com validação Zod, categorização e compliance ANVISA.
 */

import { zValidator } from "@hono/zod-validator";
import type { ApiResponse } from "@neonpro/shared/types";
import { Hono } from "hono";
import { z } from "zod";

// Zod schemas for services
const ServiceCategorySchema = z.enum([
	"facial_treatments",
	"body_treatments",
	"hair_removal",
	"cosmetic_procedures",
	"wellness",
	"consultations",
]);

const CreateServiceSchema = z.object({
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
	description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
	category: ServiceCategorySchema,
	duration: z.number().min(15).max(480), // 15 minutes to 8 hours
	price: z.number().min(0),
	isActive: z.boolean().default(true),

	// ANVISA Compliance
	anvisaCategory: z.enum(["cosmetic", "medical_device", "pharmaceutical", "none"]).default("none"),
	anvisaRegistration: z.string().optional(),
	requiresLicense: z.boolean().default(false),

	// Professional requirements
	requiredProfessions: z.array(z.enum(["dermatologist", "esthetician", "therapist"])),

	// Additional settings
	maxBookingAdvance: z.number().default(90), // days
	cancellationPolicy: z.string().optional(),
	contraindications: z.array(z.string()).default([]),
	aftercareInstructions: z.string().optional(),
});

const UpdateServiceSchema = CreateServiceSchema.partial();

const ServiceQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	search: z.string().optional(),
	category: ServiceCategorySchema.optional(),
	isActive: z.coerce.boolean().optional(),
	profession: z.enum(["dermatologist", "esthetician", "therapist"]).optional(),
	priceMin: z.coerce.number().min(0).optional(),
	priceMax: z.coerce.number().min(0).optional(),
});

// Create services router
export const servicesRoutes = new Hono()

	// Authentication middleware
	.use("*", async (c, next) => {
		const auth = c.req.header("Authorization");
		if (!(auth && auth.startsWith("Bearer "))) {
			return c.json({ error: "UNAUTHORIZED", message: "Token de acesso obrigatório" }, 401);
		}
		await next();
	})

	// 📋 List services
	.get("/", zValidator("query", ServiceQuerySchema), async (c) => {
		const { page, limit, search, category, isActive, profession, priceMin, priceMax } = c.req.valid("query");

		try {
			// TODO: Implement actual database query
			const mockServices = [
				{
					id: "srv_1",
					name: "Limpeza de Pele Profunda",
					description: "Tratamento completo de limpeza facial com extração e hidratação",
					category: "facial_treatments",
					duration: 60,
					price: 120.0,
					isActive: true,
					anvisaCategory: "cosmetic",
					requiredProfessions: ["esthetician"],
					createdAt: new Date().toISOString(),
				},
				{
					id: "srv_2",
					name: "Peeling Químico",
					description: "Renovação celular com ácidos para rejuvenescimento",
					category: "facial_treatments",
					duration: 45,
					price: 200.0,
					isActive: true,
					anvisaCategory: "medical_device",
					anvisaRegistration: "ANVISA-123456",
					requiredProfessions: ["dermatologist"],
					requiresLicense: true,
					createdAt: new Date().toISOString(),
				},
				{
					id: "srv_3",
					name: "Massagem Relaxante",
					description: "Massagem corporal para alívio de tensões",
					category: "wellness",
					duration: 90,
					price: 150.0,
					isActive: true,
					anvisaCategory: "none",
					requiredProfessions: ["therapist"],
					createdAt: new Date().toISOString(),
				},
			].filter((service) => {
				if (search && !service.name.toLowerCase().includes(search.toLowerCase())) return false;
				if (category && service.category !== category) return false;
				if (isActive !== undefined && service.isActive !== isActive) return false;
				if (profession && !service.requiredProfessions.includes(profession)) return false;
				if (priceMin !== undefined && service.price < priceMin) return false;
				if (priceMax !== undefined && service.price > priceMax) return false;
				return true;
			});

			const total = mockServices.length;
			const startIndex = (page - 1) * limit;
			const endIndex = startIndex + limit;
			const paginatedServices = mockServices.slice(startIndex, endIndex);

			const response: ApiResponse<{
				services: typeof paginatedServices;
				pagination: {
					page: number;
					limit: number;
					total: number;
					pages: number;
				};
			}> = {
				success: true,
				data: {
					services: paginatedServices,
					pagination: {
						page,
						limit,
						total,
						pages: Math.ceil(total / limit),
					},
				},
				message: "Serviços listados com sucesso",
			};

			return c.json(response, 200);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "INTERNAL_ERROR",
					message: "Erro ao listar serviços",
				},
				500
			);
		}
	})

	// 💄 Get service by ID
	.get("/:id", async (c) => {
		const id = c.req.param("id");

		try {
			// TODO: Implement actual database query
			const mockService = {
				id,
				name: "Limpeza de Pele Profunda",
				description: "Tratamento completo de limpeza facial com extração e hidratação",
				category: "facial_treatments",
				duration: 60,
				price: 120.0,
				isActive: true,
				anvisaCategory: "cosmetic",
				requiredProfessions: ["esthetician"],
				maxBookingAdvance: 90,
				cancellationPolicy: "Cancelamento até 24h antes sem taxa",
				contraindications: ["Gravidez", "Tratamentos com ácido recentes", "Pele com lesões ativas"],
				aftercareInstructions: "Evitar exposição solar por 24h. Usar protetor solar.",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			const response: ApiResponse<typeof mockService> = {
				success: true,
				data: mockService,
				message: "Serviço encontrado",
			};

			return c.json(response, 200);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "NOT_FOUND",
					message: "Serviço não encontrado",
				},
				404
			);
		}
	})

	// ✨ Create service
	.post("/", zValidator("json", CreateServiceSchema), async (c) => {
		const serviceData = c.req.valid("json");

		try {
			// TODO: Implement actual database creation
			const newService = {
				id: `srv_${Date.now()}`,
				...serviceData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			const response: ApiResponse<typeof newService> = {
				success: true,
				data: newService,
				message: "Serviço criado com sucesso",
			};

			return c.json(response, 201);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "VALIDATION_ERROR",
					message: "Erro ao criar serviço",
				},
				400
			);
		}
	})

	// ✏️ Update service
	.put("/:id", zValidator("json", UpdateServiceSchema), async (c) => {
		const id = c.req.param("id");
		const updateData = c.req.valid("json");

		try {
			// TODO: Implement actual database update
			const updatedService = {
				id,
				name: "Limpeza de Pele Profunda",
				description: "Tratamento completo de limpeza facial",
				category: "facial_treatments",
				duration: 60,
				price: 120.0,
				isActive: true,
				...updateData,
				updatedAt: new Date().toISOString(),
			};

			const response: ApiResponse<typeof updatedService> = {
				success: true,
				data: updatedService,
				message: "Serviço atualizado com sucesso",
			};

			return c.json(response, 200);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "NOT_FOUND",
					message: "Serviço não encontrado",
				},
				404
			);
		}
	})

	// 🗑️ Delete service (soft delete)
	.delete("/:id", async (c) => {
		const id = c.req.param("id");

		try {
			// TODO: Implement actual soft delete
			const response: ApiResponse<{ id: string }> = {
				success: true,
				data: { id },
				message: "Serviço removido com sucesso",
			};

			return c.json(response, 200);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "NOT_FOUND",
					message: "Serviço não encontrado",
				},
				404
			);
		}
	})

	// 📊 Get services by category
	.get("/category/:category", async (c) => {
		const category = c.req.param("category");

		try {
			// TODO: Implement actual category query
			const mockServices = [
				{
					id: "srv_1",
					name: "Limpeza de Pele Profunda",
					price: 120.0,
					duration: 60,
				},
				{
					id: "srv_2",
					name: "Hidratação Facial",
					price: 80.0,
					duration: 45,
				},
			];

			const response: ApiResponse<{
				category: string;
				services: typeof mockServices;
				count: number;
			}> = {
				success: true,
				data: {
					category,
					services: mockServices,
					count: mockServices.length,
				},
				message: `Serviços da categoria ${category}`,
			};

			return c.json(response, 200);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "NOT_FOUND",
					message: "Categoria não encontrada",
				},
				404
			);
		}
	})

	// 🏥 ANVISA compliance check
	.get("/:id/compliance", async (c) => {
		const id = c.req.param("id");

		try {
			// TODO: Implement actual compliance check
			const mockCompliance = {
				serviceId: id,
				anvisaCompliant: true,
				registrationValid: true,
				licenseRequired: true,
				lastInspection: "2024-01-15",
				expirationDate: "2025-01-15",
				warnings: [],
				certifications: ["ANVISA-123456", "ISO-9001"],
			};

			const response: ApiResponse<typeof mockCompliance> = {
				success: true,
				data: mockCompliance,
				message: "Status de compliance ANVISA",
			};

			return c.json(response, 200);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "NOT_FOUND",
					message: "Dados de compliance não encontrados",
				},
				404
			);
		}
	});
