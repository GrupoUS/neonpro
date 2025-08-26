#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de produção no Vercel
 * Verifica configurações, variáveis de ambiente e rotas
 */

const fs = require("node:fs");
const _path = require("node:path");
const requiredFiles = [
	"app/auth/popup-callback/route.ts",
	"app/auth/callback/route.ts",
	"app/dashboard/page.tsx",
	"contexts/auth-context.tsx",
	"middleware.ts",
	"vercel.json",
];

const missingFiles = [];
requiredFiles.forEach((file) => {
	if (fs.existsSync(file)) {
	} else {
		missingFiles.push(file);
	}
});
const envFile = ".env.local";
if (fs.existsSync(envFile)) {
	const envContent = fs.readFileSync(envFile, "utf8");
	const requiredVars = [
		"NEXT_PUBLIC_SUPABASE_URL",
		"NEXT_PUBLIC_SUPABASE_ANON_KEY",
	];

	requiredVars.forEach((varName) => {
		if (envContent.includes(varName)) {
		} else {
		}
	});
} else {
}
if (fs.existsSync("next.config.mjs")) {
	const config = fs.readFileSync("next.config.mjs", "utf8");
	if (config.includes("ignoreBuildErrors: true")) {
	}
} else {
}
if (fs.existsSync("vercel.json")) {
	try {
		const vercelConfig = JSON.parse(fs.readFileSync("vercel.json", "utf8"));

		if (vercelConfig.functions) {
		}

		if (vercelConfig.rewrites) {
		}
	} catch (_error) {}
} else {
}
const authRoutes = [
	"app/auth/popup-callback/route.ts",
	"app/auth/callback/route.ts",
];

authRoutes.forEach((route) => {
	if (fs.existsSync(route)) {
		const content = fs.readFileSync(route, "utf8");

		// Verificar se exporta GET
		if (content.includes("export async function GET")) {
		} else {
		}

		// Verificar se usa createClient
		if (content.includes("createClient")) {
		} else {
		}
	}
});
if (missingFiles.length > 0) {
	missingFiles.forEach((_file) => {});
}
