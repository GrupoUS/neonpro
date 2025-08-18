const http = require("node:http");
const https = require("node:https");

// Configurações de teste
const BASE_URL = "http://localhost:3000";
const TIMEOUT = 5000;

// Função para fazer requisições HTTP
function makeRequest(url, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      timeout: TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "NeonPro-Test-Script",
      },
    };

    if (data && method !== "GET") {
      const postData = JSON.stringify(data);
      options.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const client = urlObj.protocol === "https:" ? https : http;
    const req = client.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (data && method !== "GET") {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Função para testar uma URL
async function testEndpoint(_name, url, expectedStatus = 200) {
  try {
    const response = await makeRequest(url);

    if (response.statusCode === expectedStatus) {
      return true;
    }
    return false;
  } catch (_error) {
    return false;
  }
}

// Função para testar API com dados
async function testApiWithData(_name, url, method, data, expectedStatus = 200) {
  try {
    const response = await makeRequest(url, method, data);

    if (response.statusCode === expectedStatus) {
      if (response.body) {
        try {
          const _jsonData = JSON.parse(response.body);
        } catch (_e) {}
      }
      return true;
    }
    return false;
  } catch (_error) {
    return false;
  }
}

// Função principal de teste
async function runTests() {
  const results = [];

  // Teste 1: Página inicial
  results.push(await testEndpoint("Página Inicial", `${BASE_URL}/`));

  // Teste 2: Página de Tenants
  results.push(await testEndpoint("Página de Tenants", `${BASE_URL}/tenants`));

  // Teste 3: API - Listar Tenants (GET)
  results.push(await testApiWithData("API - Listar Tenants", `${BASE_URL}/api/tenants`, "GET"));

  // Teste 4: API - Criar Tenant (POST)
  const newTenant = {
    name: "Teste Clínica",
    slug: `teste-clinica-${Date.now()}`,
    description: "Clínica de teste criada automaticamente",
    contact_email: "teste@clinica.com",
  };
  results.push(
    await testApiWithData("API - Criar Tenant", `${BASE_URL}/api/tenants`, "POST", newTenant, 201),
  );

  // Teste 5: Verificar se CSS está carregando
  results.push(
    await testEndpoint("CSS Global", `${BASE_URL}/_next/static/css/app/layout.css`, 200),
  );

  const passed = results.filter((r) => r).length;
  const total = results.length;

  if (passed === total) {
  } else {
  }
}

// Executar testes
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint, testApiWithData };
