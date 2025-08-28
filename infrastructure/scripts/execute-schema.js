const fs = require("node:fs");
const https = require("node:https");
require("dotenv").config({ path: "../.env.local" });

// Configurações do Supabase - USAR VARIÁVEIS DE AMBIENTE
const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]
  || "gfkskrkbnawkuppazkpt";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

// Ler o arquivo SQL
const sqlContent = fs.readFileSync("15-insert-single-customer.sql", "utf8");

// Configurar requisição
const postData = JSON.stringify({
  query: sqlContent,
});

const options = {
  hostname: "api.supabase.com",
  port: 443,
  path: `/v1/projects/${projectRef}/database/query`,
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let _data = "";

  res.on("data", (chunk) => {
    _data += chunk;
  });

  res.on("end", () => {
    if (res.statusCode === 200) {
    } else {
    }
  });
});

req.on("error", (_error) => {});

req.write(postData);
req.end();
