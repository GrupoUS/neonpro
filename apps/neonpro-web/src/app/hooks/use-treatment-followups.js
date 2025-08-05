// =====================================================================================
// TREATMENT FOLLOW-UP HOOKS
// Epic 7.3: React hooks for follow-up automation UI integration
// =====================================================================================
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFollowups = useFollowups;
exports.useFollowup = useFollowup;
exports.useCreateFollowup = useCreateFollowup;
exports.useUpdateFollowup = useUpdateFollowup;
exports.useDeleteFollowup = useDeleteFollowup;
exports.useCompleteFollowup = useCompleteFollowup;
exports.useFollowupTemplates = useFollowupTemplates;
exports.useCreateFollowupTemplate = useCreateFollowupTemplate;
exports.useUpdateFollowupTemplate = useUpdateFollowupTemplate;
exports.useTreatmentProtocols = useTreatmentProtocols;
exports.useCreateTreatmentProtocol = useCreateTreatmentProtocol;
exports.useFollowupAnalytics = useFollowupAnalytics;
exports.useFollowupDashboardSummary = useFollowupDashboardSummary;
exports.useTodayFollowups = useTodayFollowups;
exports.usePendingFollowups = usePendingFollowups;
exports.useOverdueFollowups = useOverdueFollowups;
exports.useActiveFollowupTemplates = useActiveFollowupTemplates;
exports.useActiveTreatmentProtocols = useActiveTreatmentProtocols;
var react_query_1 = require("@tanstack/react-query");
var react_hot_toast_1 = require("react-hot-toast");
var treatment_followup_service_1 = require("@/app/lib/services/treatment-followup-service");
// =====================================================================================
// QUERY KEYS
// =====================================================================================
var QUERY_KEYS = {
  followups: (filters) => ["followups", filters],
  followup: (id) => ["followups", id],
  templates: (filters) => ["followup-templates", filters],
  template: (id) => ["followup-templates", id],
  protocols: (filters) => ["treatment-protocols", filters],
  protocol: (id) => ["treatment-protocols", id],
  analytics: (clinicId, dateFrom, dateTo) => ["followup-analytics", clinicId, dateFrom, dateTo],
  dashboardSummary: (clinicId) => ["followup-dashboard", clinicId],
};
// =====================================================================================
// FOLLOW-UP HOOKS
// =====================================================================================
/**
 * Hook to fetch follow-ups with filters
 */
function useFollowups(filters) {
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.followups(filters),
    queryFn: () => treatment_followup_service_1.treatmentFollowupService.getFollowups(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
/**
 * Hook to fetch single follow-up by ID
 */
function useFollowup(id) {
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.followup(id),
    queryFn: () => treatment_followup_service_1.treatmentFollowupService.getFollowupById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 2,
  });
}
/**
 * Hook to create new follow-up
 */
function useCreateFollowup() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (data) =>
      treatment_followup_service_1.treatmentFollowupService.createFollowup(data),
    onSuccess: (newFollowup) => {
      // Invalidate and refetch follow-ups list
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["followup-dashboard"] });
      // Add to cache
      queryClient.setQueryData(QUERY_KEYS.followup(newFollowup.id), newFollowup);
      react_hot_toast_1.toast.success("Follow-up criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating follow-up:", error);
      react_hot_toast_1.toast.error("Erro ao criar follow-up: ".concat(error.message));
    },
  });
}
/**
 * Hook to update follow-up
 */
function useUpdateFollowup() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (_a) => {
      var id = _a.id,
        updates = _a.updates;
      return treatment_followup_service_1.treatmentFollowupService.updateFollowup(id, updates);
    },
    onSuccess: (updatedFollowup) => {
      // Update specific follow-up in cache
      queryClient.setQueryData(QUERY_KEYS.followup(updatedFollowup.id), updatedFollowup);
      // Invalidate follow-ups list
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["followup-dashboard"] });
      react_hot_toast_1.toast.success("Follow-up atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating follow-up:", error);
      react_hot_toast_1.toast.error("Erro ao atualizar follow-up: ".concat(error.message));
    },
  });
}
/**
 * Hook to delete follow-up
 */
function useDeleteFollowup() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (id) => treatment_followup_service_1.treatmentFollowupService.deleteFollowup(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.followup(deletedId) });
      // Invalidate follow-ups list
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["followup-dashboard"] });
      react_hot_toast_1.toast.success("Follow-up excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting follow-up:", error);
      react_hot_toast_1.toast.error("Erro ao excluir follow-up: ".concat(error.message));
    },
  });
}
/**
 * Hook to complete follow-up
 */
function useCompleteFollowup() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (_a) => {
      var id = _a.id,
        notes = _a.notes;
      return treatment_followup_service_1.treatmentFollowupService.completeFollowup(id, notes);
    },
    onSuccess: (completedFollowup) => {
      // Update specific follow-up in cache
      queryClient.setQueryData(QUERY_KEYS.followup(completedFollowup.id), completedFollowup);
      // Invalidate follow-ups list
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["followup-dashboard"] });
      react_hot_toast_1.toast.success("Follow-up marcado como concluído!");
    },
    onError: (error) => {
      console.error("Error completing follow-up:", error);
      react_hot_toast_1.toast.error("Erro ao concluir follow-up: ".concat(error.message));
    },
  });
}
// =====================================================================================
// TEMPLATE HOOKS
// =====================================================================================
/**
 * Hook to fetch follow-up templates
 */
function useFollowupTemplates(filters) {
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.templates(filters),
    queryFn: () => treatment_followup_service_1.treatmentFollowupService.getTemplates(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes (templates change less frequently)
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
/**
 * Hook to create follow-up template
 */
function useCreateFollowupTemplate() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (data) =>
      treatment_followup_service_1.treatmentFollowupService.createTemplate(data),
    onSuccess: (newTemplate) => {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: ["followup-templates"] });
      // Add to cache
      queryClient.setQueryData(QUERY_KEYS.template(newTemplate.id), newTemplate);
      react_hot_toast_1.toast.success("Template de follow-up criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating follow-up template:", error);
      react_hot_toast_1.toast.error("Erro ao criar template: ".concat(error.message));
    },
  });
}
/**
 * Hook to update follow-up template
 */
function useUpdateFollowupTemplate() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (_a) => {
      var id = _a.id,
        updates = _a.updates;
      return treatment_followup_service_1.treatmentFollowupService.updateTemplate(id, updates);
    },
    onSuccess: (updatedTemplate) => {
      // Update specific template in cache
      queryClient.setQueryData(QUERY_KEYS.template(updatedTemplate.id), updatedTemplate);
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: ["followup-templates"] });
      react_hot_toast_1.toast.success("Template atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating follow-up template:", error);
      react_hot_toast_1.toast.error("Erro ao atualizar template: ".concat(error.message));
    },
  });
}
// =====================================================================================
// PROTOCOL HOOKS
// =====================================================================================
/**
 * Hook to fetch treatment protocols
 */
function useTreatmentProtocols(filters) {
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.protocols(filters),
    queryFn: () => treatment_followup_service_1.treatmentFollowupService.getProtocols(filters),
    staleTime: 1000 * 60 * 15, // 15 minutes (protocols change rarely)
    cacheTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
/**
 * Hook to create treatment protocol
 */
function useCreateTreatmentProtocol() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (data) =>
      treatment_followup_service_1.treatmentFollowupService.createProtocol(data),
    onSuccess: (newProtocol) => {
      // Invalidate protocols list
      queryClient.invalidateQueries({ queryKey: ["treatment-protocols"] });
      // Add to cache
      queryClient.setQueryData(QUERY_KEYS.protocol(newProtocol.id), newProtocol);
      react_hot_toast_1.toast.success("Protocolo de tratamento criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating treatment protocol:", error);
      react_hot_toast_1.toast.error("Erro ao criar protocolo: ".concat(error.message));
    },
  });
}
// =====================================================================================
// ANALYTICS HOOKS
// =====================================================================================
/**
 * Hook to fetch follow-up analytics
 */
function useFollowupAnalytics(clinicId, dateFrom, dateTo) {
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.analytics(clinicId, dateFrom, dateTo),
    queryFn: () =>
      treatment_followup_service_1.treatmentFollowupService.getAnalytics(
        clinicId,
        dateFrom,
        dateTo,
      ),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
/**
 * Hook to fetch dashboard summary
 */
function useFollowupDashboardSummary(clinicId) {
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.dashboardSummary(clinicId),
    queryFn: () =>
      treatment_followup_service_1.treatmentFollowupService.getDashboardSummary(clinicId),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 2, // 2 minutes (dashboard needs fresher data)
    cacheTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when returning to dashboard
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}
// =====================================================================================
// UTILITY HOOKS
// =====================================================================================
/**
 * Hook to get today's follow-ups
 */
function useTodayFollowups(clinicId) {
  var today = new Date();
  var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  return useFollowups({
    clinic_id: clinicId,
    date_from: todayStart.toISOString(),
    date_to: todayEnd.toISOString(),
    limit: 50,
  });
}
/**
 * Hook to get pending follow-ups
 */
function usePendingFollowups(clinicId) {
  return useFollowups({
    clinic_id: clinicId,
    status: ["pending"],
    limit: 100,
  });
}
/**
 * Hook to get overdue follow-ups
 */
function useOverdueFollowups(clinicId) {
  var now = new Date().toISOString();
  return useFollowups({
    clinic_id: clinicId,
    status: ["pending"],
    date_to: now,
    limit: 50,
  });
}
/**
 * Hook to get active templates for a clinic
 */
function useActiveFollowupTemplates(clinicId) {
  return useFollowupTemplates({
    clinic_id: clinicId,
    active: true,
    limit: 100,
  });
}
/**
 * Hook to get active protocols for a clinic
 */
function useActiveTreatmentProtocols(clinicId) {
  return useTreatmentProtocols({
    clinic_id: clinicId,
    active: true,
    limit: 100,
  });
}
