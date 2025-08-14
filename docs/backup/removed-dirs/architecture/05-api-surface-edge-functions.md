# 5 · API Surface & Edge Functions

Versão **`/v1`** com JSON padrão `{{ traceId, errorCode, message }}`.

| Método | Endpoint | Auth | Rate‑limit | Observações |
|--------|----------|------|-----------|-------------|
| POST | `/v1/agenda/book` | JWT public | 60 rpm | Chama proc, retorna 201 |
| PATCH | `/v1/agenda/{{id}}/status` | recep/gestor | 120 rpm | Atualiza enum |
| GET | `/v1/agenda` | JWT | 120 rpm | Filtros date, professional, status |
| POST | `/v1/payments/import` | finance | 30 rpm | CSV ≤ 5 MB, scanned |
| POST | `/v1/messages/send` | gestor | 60 rpm | Enfileira |
| GET | `/v1/reports/kpi` | gestor | 30 rpm | cache 60 s |
| GET | `/v1/healthz` | none | — | 200 OK |
| GET | `/v1/metrics` | token | — | Prometheus |
| GET | `/v1/docs` | public | — | Swagger UI |

Esquemas em Zod → OpenAPI via pipeline; docs em `/v1/openapi.json`.
