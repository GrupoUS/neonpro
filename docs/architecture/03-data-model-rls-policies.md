# 3 · Modelo de Dados & Políticas RLS

Principais tabelas usam **UUID padrão `gen_random_uuid()`**, campos `created_at`, `updated_at`, `deleted_at` (soft‑delete) e `clinic_id` como chave de tenant.

Stored Procedure `sp_book_appointment` garante atomicidade; triggers delegam enfileiramento via `pg_notify`.

## Exemplo de política RLS (SELECT)

```sql
CREATE POLICY select_appt ON appointments
FOR SELECT USING (
  clinic_id = current_setting('request.jwt.claims', true)::json->>'clinic_id'
  AND deleted_at IS NULL
);
```

Criptografia **PGP_symm** apenas em `patients.document`. Timezone armazenado em UTC + coluna `tz` na tabela `clinics`.
