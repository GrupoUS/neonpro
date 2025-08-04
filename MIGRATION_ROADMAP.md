# 🔄 API Migration Roadmap - REST to tRPC

## 📋 Status de Migração

### ✅ **Fase 1: Infraestrutura** (CONCLUÍDA)
- [x] tRPC setup e configuração
- [x] Router base implementado
- [x] Context e middlewares
- [x] Tipos TypeScript

### 🚧 **Fase 2: APIs Principais** (EM ANDAMENTO)
- [x] **Patients API** → tRPC ✅
- [x] **Appointments API** → tRPC ✅
- [ ] **Doctors API** → tRPC
- [ ] **Authentication API** → tRPC

### 📋 **Fase 3: APIs Secundárias** (PENDENTE)
- [ ] **Communication API** → tRPC
- [ ] **Reports API** → tRPC  
- [ ] **Forecasting API** → tRPC
- [ ] **Audit Logs API** → tRPC

### 🔧 **Fase 4: APIs Legacy** (FUTURO)
- [ ] **Patient Portal API** → tRPC
- [ ] **Dashboard APIs** → tRPC
- [ ] **Analytics APIs** → tRPC

## 🔄 Estratégia de Migração

### 1. **Coexistência Segura**
```
/api-legacy/    ← APIs REST existentes (manter funcionando)
/api/trpc/      ← Novas APIs tRPC (implementar gradualmente)
```

### 2. **Migração por Prioridade**
1. **Alta prioridade**: Patients, Appointments, Doctors
2. **Média prioridade**: Communication, Reports
3. **Baixa prioridade**: Analytics, Portal

### 3. **Processo por API**

#### Para cada endpoint REST:
1. **Analisar** endpoint existente
2. **Implementar** router tRPC equivalente
3. **Testar** funcionalidade
4. **Migrar** frontend gradualmente
5. **Deprecar** endpoint REST

## 📊 APIs REST Identificadas

### 🏥 **Core Healthcare**
```
GET  /api-legacy/patients/              → patients.list
POST /api-legacy/patients/              → patients.create
GET  /api-legacy/patients/[id]          → patients.getById
PUT  /api-legacy/patients/[id]          → patients.update
DEL  /api-legacy/patients/[id]          → patients.delete

GET  /api-legacy/appointments/          → appointments.list
POST /api-legacy/appointments/          → appointments.create
PUT  /api-legacy/appointments/[id]      → appointments.updateStatus
GET  /api-legacy/availability/          → appointments.getAvailableSlots
```

### 👨‍⚕️ **Doctors & Staff**
```
GET  /api-legacy/doctors/               → doctors.list
POST /api-legacy/doctors/               → doctors.create
GET  /api-legacy/doctors/[id]/schedule  → doctors.getSchedule
```

### 💬 **Communication**
```
GET  /api-legacy/communication/messages/     → communication.getMessages
POST /api-legacy/communication/messages/     → communication.sendMessage
GET  /api-legacy/communication/notifications/ → communication.getNotifications
```

### 📈 **Analytics & Reports**
```
GET  /api-legacy/forecasting/           → forecasting.getDemandForecast
POST /api-legacy/forecasting/           → forecasting.createForecast
GET  /api-legacy/reports/               → reports.generate
```

## 🛠️ Ferramentas de Migração

### 1. **Script de Análise**
```bash
# Descobrir todas as APIs REST
find src/app/api-legacy -name "route.ts" | xargs grep -l "export.*GET\|POST\|PUT\|DELETE"
```

### 2. **Template tRPC Router**
```typescript
// Template para novo router
export const newRouter = createTRPCRouter({
  list: protectedProcedure.input(z.object({})).query(async ({ ctx, input }) => {}),
  create: protectedProcedure.input(z.object({})).mutation(async ({ ctx, input }) => {}),
  update: protectedProcedure.input(z.object({})).mutation(async ({ ctx, input }) => {}),
  delete: adminProcedure.input(z.object({})).mutation(async ({ ctx, input }) => {}),
});
```

### 3. **Client Migration Helper**
```typescript
// Hook para migração gradual
export const usePatients = () => {
  // Use tRPC if available, fallback to REST
  return api.patients.list.useQuery() ?? useRestPatients();
};
```

## 📅 Timeline Estimado

- **Semana 1-2**: APIs Core (Patients, Appointments, Doctors)
- **Semana 3-4**: APIs Communication & Reports  
- **Semana 5-6**: APIs Legacy & Portal
- **Semana 7**: Cleanup e deprecação REST

## ✅ Critérios de Sucesso

### Para cada API migrada:
- [ ] Router tRPC implementado
- [ ] Validação Zod configurada
- [ ] Audit logs funcionando
- [ ] Testes passando
- [ ] Frontend migrado
- [ ] Documentação atualizada
- [ ] API REST deprecada

## 🔧 Próximos Passos

1. **Implementar Doctors Router**
2. **Migrar frontend patient components**
3. **Implementar Communication Router**
4. **Criar migration scripts**
5. **Setup monitoring tRPC**