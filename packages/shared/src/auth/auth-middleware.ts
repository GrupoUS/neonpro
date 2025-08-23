/**
 * Middleware de autenticação para Hono/Next.js
 * Integrado com AuthTokenManager e Supabase
 */

import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";
import type { AuthContext } from "../types/hono.types";

export type AuthUser = {
	id: string;
	email: string;
	name?: string;
	role?: string;
	tenantId?: string;
};

// Module augmentation moved to types/hono.types.ts to avoid conflicts
// declare module 'hono' {
//   interface Context {
//     get(key: 'auth'): AuthContext;
//     set(key: 'auth', value: AuthContext): void;
//   }
// }

/**
 * Extrai token do header Authorization
 */
function extractTokenFromHeader(authHeader: string | undefined): string | null {
	if (!authHeader) {
		return null;
	}

	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return null;
	}

	return parts[1] || null;
}

/**
 * Valida e decodifica JWT token
 */
async function validateJWTToken(token: string): Promise<AuthUser | null> {
	try {
		if (!process.env.JWT_SECRET) {
			throw new Error("JWT_SECRET not configured");
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

		if (!decoded || typeof decoded !== "object") {
			return null;
		}

		// Validar estrutura do token
		if (!(decoded.sub && decoded.email)) {
			return null;
		}

		return {
			id: decoded.sub,
			email: decoded.email,
			name: decoded.name,
			role: decoded.role,
			tenantId: decoded.tenant_id,
		};
	} catch (_error) {
		return null;
	}
}

/**
 * Middleware obrigatório de autenticação
 * Rejeita requests sem token válido
 */
export const requireAuth = createMiddleware(async (c, next) => {
	const authHeader = c.req.header("authorization");
	const token = extractTokenFromHeader(authHeader);

	if (!token) {
		throw new HTTPException(401, {
			message: "Token de autenticação obrigatório",
		});
	}

	const user = await validateJWTToken(token);

	if (!user) {
		throw new HTTPException(401, {
			message: "Token de autenticação inválido",
		});
	}

	// Adicionar dados de auth ao contexto
	c.set("auth", { user, token });

	await next();
});

/**
 * Middleware opcional de autenticação
 * Permite requests sem token, mas adiciona dados se disponível
 */
export const optionalAuth = createMiddleware(async (c, next) => {
	const authHeader = c.req.header("authorization");
	const token = extractTokenFromHeader(authHeader);

	if (token) {
		const user = await validateJWTToken(token);

		if (user) {
			c.set("auth", { user, token });
		}
	}

	await next();
});

/**
 * Middleware de verificação de role
 */
export const requireRole = (requiredRole: string) => {
	return createMiddleware(async (c, next) => {
		const authContext = c.get("auth");

		if (!authContext) {
			throw new HTTPException(401, {
				message: "Autenticação obrigatória",
			});
		}

		if (authContext.user.role !== requiredRole) {
			throw new HTTPException(403, {
				message: `Role '${requiredRole}' obrigatória`,
			});
		}

		await next();
	});
};

/**
 * Middleware de verificação de permissões
 */
export const requirePermissions = (permissions: string[]) => {
	return createMiddleware(async (c, next) => {
		const authContext = c.get("auth");

		if (!authContext) {
			throw new HTTPException(401, {
				message: "Autenticação obrigatória",
			});
		}

		const user = authContext.user;

		// Admin tem todas as permissões
		if (user.role === "admin") {
			await next();
			return;
		}

		// TODO: Implementar sistema de permissões mais sofisticado
		// Por enquanto, apenas verifica roles básicas
		const hasPermissions = permissions.every((permission) => {
			switch (permission) {
				case "read:patients":
					return ["healthcare_professional", "nurse", "doctor"].includes(
						user.role || "",
					);
				case "write:patients":
					return ["healthcare_professional", "doctor"].includes(
						user.role || "",
					);
				case "read:analytics":
					return ["admin", "manager"].includes(user.role || "");
				case "write:system":
					return user.role === "admin";
				default:
					return false;
			}
		});

		if (!hasPermissions) {
			throw new HTTPException(403, {
				message: "Permissões insuficientes",
			});
		}

		await next();
	});
};

/**
 * Middleware de verificação de tenant
 * Garante que usuário só acessa dados do seu tenant
 */
export const requireTenant = createMiddleware(async (c, next) => {
	const authContext = c.get("auth");

	if (!authContext) {
		throw new HTTPException(401, {
			message: "Autenticação obrigatória",
		});
	}

	const user = authContext.user;
	const requestedTenantId =
		c.req.header("x-tenant-id") || c.req.param("tenantId");

	if (!user.tenantId) {
		throw new HTTPException(403, {
			message: "Usuário não associado a nenhum tenant",
		});
	}

	if (requestedTenantId && user.tenantId !== requestedTenantId) {
		throw new HTTPException(403, {
			message: "Acesso negado ao tenant solicitado",
		});
	}

	await next();
});

/**
 * Utility para obter dados de autenticação do contexto
 */
export function getAuthContext(c: any): AuthContext | null {
	try {
		return c.get("auth") || null;
	} catch {
		return null;
	}
}

/**
 * Utility para obter usuário atual
 */
export function getCurrentUser(c: any): AuthUser | null {
	const authContext = getAuthContext(c);
	return authContext?.user || null;
}

/**
 * Middleware combinado para rotas protegidas com tenant
 */
export const protectedRoute = [requireAuth, requireTenant];

/**
 * Middleware para rotas administrativas
 */
export const adminRoute = [requireAuth, requireRole("admin")];

/**
 * Middleware para profissionais de saúde
 */
export const healthcareRoute = [
	requireAuth,
	requireTenant,
	requirePermissions(["read:patients"]),
];
