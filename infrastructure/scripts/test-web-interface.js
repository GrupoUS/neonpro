// Script para testar a interface web do Accounts Payable
// Usage: node scripts/test-web-interface.jsconst http = require("node:http");

const baseUrl = "http://127.0.0.1:8080";

// Lista de rotas para testar
const routesToTest = [
  "/dashboard",
  "/dashboard/accounts-payable",
  "/dashboard/accounts-payable/vendors",
  "/dashboard/accounts-payable/reports",
  "/dashboard/accounts-payable/approvals",
  "/dashboard/accounts-payable/notifications",
  "/dashboard/accounts-payable/analytics",
];

async function testRoute(path) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${path}`;

    const req = http.get(url, (res) => {
      const { statusCode: statusCode } = res;
      const { statusMessage: statusMessage } = res;

      // Verificar se a resposta é válida
      if (statusCode === 200) {
        resolve({ path, status: statusCode, success: true });
      } else if (statusCode === 302 || statusCode === 307) {
        resolve({
          path,
          status: statusCode,
          success: true,
          note: "Redirect (Auth required)",
        });
      } else if (statusCode === 404) {
        resolve({
          path,
          status: statusCode,
          success: false,
          error: "Route not found",
        });
      } else {
        resolve({
          path,
          status: statusCode,
          success: false,
          error: statusMessage,
        });
      }
    });

    req.on("error", (error) => {
      resolve({ path, status: 0, success: false, error: error.message });
    });

    // Timeout após 5 segundos
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ path, status: 0, success: false, error: "Timeout" });
    });
  });
}

async function runWebInterfaceTests() {
  const results = [];

  for (const route of routesToTest) {
    const result = await testRoute(route);
    results.push(result);
    // Pequena pausa entre requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length > 0) {
    successful.forEach((result) => {    });
  }

  if (failed.length > 0) {
    failed.forEach((_result) => {});
  }

  if (successful.length === results.length) {
  } else if (successful.length > 0) {
  } else {
  }

  return results;
}

// Executar os testes
runWebInterfaceTests().catch(console.error);
