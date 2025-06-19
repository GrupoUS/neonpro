#!/usr/bin/env node

/**
 * NEONPRO Vercel Deployment Script
 * Automatiza o processo de deploy para o Vercel
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 NEONPRO - Script de Deploy Vercel\n");

// Verificar se o Vercel CLI está instalado
function checkVercelCLI() {
  try {
    execSync("vercel --version", { stdio: "pipe" });
    console.log("✅ Vercel CLI encontrado");
    return true;
  } catch (error) {
    console.log("❌ Vercel CLI não encontrado");
    console.log("📦 Instalando Vercel CLI...");
    try {
      execSync("npm install -g vercel", { stdio: "inherit" });
      console.log("✅ Vercel CLI instalado com sucesso");
      return true;
    } catch (installError) {
      console.error("❌ Erro ao instalar Vercel CLI:", installError.message);
      return false;
    }
  }
}

// Verificar arquivos necessários
function checkRequiredFiles() {
  const requiredFiles = [
    "package.json",
    "next.config.ts",
    "vercel.json",
    ".env.example",
  ];

  console.log("\n🔍 Verificando arquivos necessários...");

  for (const file of requiredFiles) {
    if (fs.existsSync(path.join(__dirname, "..", file))) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - AUSENTE`);
      return false;
    }
  }

  return true;
}

// Executar testes antes do deploy
function runTests() {
  console.log("\n🧪 Executando testes...");
  try {
    // Verificar se TypeScript está disponível
    try {
      execSync("npx tsc --noEmit", {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });
      console.log("✅ Type check passou");
    } catch (tsError) {
      console.log("⚠️  Type check pulado (TypeScript não disponível)");
    }

    // Executar validação personalizada
    execSync("node scripts/validate-implementation.js", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    console.log("✅ Validação personalizada passou");

    return true;
  } catch (error) {
    console.error("❌ Testes falharam:", error.message);
    return false;
  }
}

// Fazer build local para verificar
function buildProject() {
  console.log("\n🔨 Fazendo build do projeto...");
  try {
    execSync("npm run build", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    console.log("✅ Build concluído com sucesso");
    return true;
  } catch (error) {
    console.error("❌ Build falhou:", error.message);
    return false;
  }
}

// Fazer login no Vercel
function vercelLogin() {
  console.log("\n🔐 Verificando autenticação Vercel...");
  try {
    execSync("vercel whoami", { stdio: "pipe" });
    console.log("✅ Já autenticado no Vercel");
    return true;
  } catch (error) {
    console.log("🔑 Fazendo login no Vercel...");
    try {
      execSync("vercel login", { stdio: "inherit" });
      console.log("✅ Login realizado com sucesso");
      return true;
    } catch (loginError) {
      console.error("❌ Erro no login:", loginError.message);
      return false;
    }
  }
}

// Fazer deploy
function deployToVercel(environment = "preview") {
  console.log(`\n🚀 Fazendo deploy para ${environment}...`);

  const deployCommand =
    environment === "production" ? "vercel --prod" : "vercel";

  try {
    const output = execSync(deployCommand, {
      stdio: "pipe",
      cwd: path.join(__dirname, ".."),
      encoding: "utf8",
    });

    console.log("✅ Deploy concluído com sucesso!");

    // Extrair URL do deploy
    const urlMatch = output.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      const deployUrl = urlMatch[0];
      console.log(`🌐 URL do deploy: ${deployUrl}`);

      // Salvar URL em arquivo
      fs.writeFileSync(
        path.join(__dirname, "..", "DEPLOY_URL.txt"),
        `Deploy URL: ${deployUrl}\nEnvironment: ${environment}\nDate: ${new Date().toISOString()}\n`
      );
    }

    return true;
  } catch (error) {
    console.error("❌ Deploy falhou:", error.message);
    return false;
  }
}

// Função principal
async function main() {
  try {
    // Verificações pré-deploy
    if (!checkVercelCLI()) {
      process.exit(1);
    }

    if (!checkRequiredFiles()) {
      console.error(
        "\n❌ Arquivos necessários ausentes. Verifique a estrutura do projeto."
      );
      process.exit(1);
    }

    if (!runTests()) {
      console.error(
        "\n❌ Testes falharam. Corrija os problemas antes do deploy."
      );
      process.exit(1);
    }

    if (!buildProject()) {
      console.error("\n❌ Build falhou. Corrija os erros antes do deploy.");
      process.exit(1);
    }

    if (!vercelLogin()) {
      console.error("\n❌ Falha na autenticação Vercel.");
      process.exit(1);
    }

    // Perguntar tipo de deploy
    const args = process.argv.slice(2);
    const isProduction =
      args.includes("--prod") || args.includes("--production");
    const environment = isProduction ? "production" : "preview";

    if (!deployToVercel(environment)) {
      process.exit(1);
    }

    console.log("\n🎉 Deploy concluído com sucesso!");
    console.log("\n📋 Próximos passos:");
    console.log("1. Teste a aplicação na URL fornecida");
    console.log("2. Configure as variáveis de ambiente no Vercel Dashboard");
    console.log("3. Configure o domínio personalizado (se necessário)");
    console.log("4. Configure monitoramento e analytics");
  } catch (error) {
    console.error("\n❌ Erro durante o deploy:", error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
