// scripts/verify-oauth-config.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Verificar .env.local
const envPath = path.join(__dirname, "..", ".env.local");

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");

  const hasGoogleClientId = envContent.includes("GOOGLE_CLIENT_ID=");
  const hasGoogleClientSecret = envContent.includes("GOOGLE_CLIENT_SECRET=");

  if (hasGoogleClientId && hasGoogleClientSecret) {
    const clientIdMatch = envContent.match(/GOOGLE_CLIENT_ID=(.+)/);
    const clientSecretMatch = envContent.match(/GOOGLE_CLIENT_SECRET=(.+)/);

    const clientIdPlaceholder = clientIdMatch?.[1].includes(
      "your_google_client_id_here",
    );
    const secretPlaceholder = clientSecretMatch?.[1].includes(
      "your_google_client_secret_here",
    );

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
const configPath = path.join(
  __dirname,
  "..",
  "infrastructure",
  "database",
  "config",
  "config.toml",
);
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, "utf8");
} else {
}
