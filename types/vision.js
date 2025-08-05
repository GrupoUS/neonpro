// Vision Analysis Types
// Epic 10.1: Automated Before/After Analysis
// Target: ≥95% accuracy, <30s processing time
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANALYSIS_STATUS_LABELS =
  exports.ANNOTATION_TYPE_LABELS =
  exports.TREATMENT_TYPE_LABELS =
  exports.ANALYSIS_REQUIREMENTS =
    void 0;
// Constants
exports.ANALYSIS_REQUIREMENTS = {
  MIN_ACCURACY: 0.95,
  MAX_PROCESSING_TIME: 30000, // 30 seconds in milliseconds
  MIN_CONFIDENCE: 0.8,
  MIN_QUALITY_SCORE: 0.85,
};
exports.TREATMENT_TYPE_LABELS = {
  "skin-aesthetic": "Estética da Pele",
  "medical-healing": "Cicatrização Médica",
  "body-contouring": "Contorno Corporal",
  "facial-rejuvenation": "Rejuvenescimento Facial",
  "scar-treatment": "Tratamento de Cicatrizes",
  pigmentation: "Pigmentação",
};
exports.ANNOTATION_TYPE_LABELS = {
  measurement: "Medição",
  highlight: "Destaque",
  comparison: "Comparação",
  annotation: "Anotação",
};
exports.ANALYSIS_STATUS_LABELS = {
  pending: "Pendente",
  processing: "Processando",
  completed: "Concluído",
  failed: "Falhou",
  cancelled: "Cancelado",
};
