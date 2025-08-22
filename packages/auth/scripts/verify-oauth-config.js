// scripts/verify-oauth-config.js
const fs = require("node:fs");
const path = require("node:path");

// 1. Verificar .env.local
const envPath = path.join(__dirname, "..", ".env.local");

if (fs.existsSync(envPath)) {
	const envContent = fs.readFileSync(envPath, "utf8");

	const hasGoogleClientId = envContent.includes("GOOGLE_CLIENT_ID=");
	const hasGoogleClientSecret = envContent.includes("GOOGLE_CLIENT_SECRET=");

	if (hasGoogleClientId && hasGoogleClientSecret) {
		const clientIdMatch = envContent.match(/GOOGLE_CLIENT_ID=(.+)/);
		const clientSecretMatch = envContent.match(/GOOGLE_CLIENT_SECRET=(.+)/);

		const clientIdPlaceholder = clientIdMatch?.[1].includes("your_google_client_id_here");
		const secretPlaceholder = clientSecretMatch?.[1].includes("your_google_client_secret_here");

		if (clientIdPlaceholder) {
		} else {
		}

		if (secretPlaceholder) {
		} else {
		}
	}
} else {
}

// 2. Verificar config.toml
const configPath = path.join(__dirname, "..", "infrastructure", "database", "config", "config.toml");
if (fs.existsSync(configPath)) {
	const configContent = fs.readFileSync(configPath, "utf8");

	const _hasGoogleConfig = configContent.includes("[auth.external.google]");
	const _isGoogleEnabled = configContent.includes("enabled = true");
	const _hasClientIdRef = configContent.includes('client_id = "env(GOOGLE_CLIENT_ID)"');
	const _hasSecretRef = configContent.includes('secret = "env(GOOGLE_CLIENT_SECRET)"');
} else {
}
