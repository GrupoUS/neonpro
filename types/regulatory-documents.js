"use strict";
// Regulatory Documents API Types
// Based on Story 12.1 - Gestão de Documentação Regulatória
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlertPriorityColor = exports.getDocumentStatusColor = exports.isDocumentExpired = exports.isDocumentExpiring = exports.PriorityLabels = exports.AlertTypeLabels = exports.DocumentStatusLabels = void 0;
// Document status helpers
exports.DocumentStatusLabels = {
    valid: 'Válido',
    expiring: 'Expirando',
    expired: 'Expirado',
    pending: 'Pendente'
};
exports.AlertTypeLabels = {
    '90_days_before': '90 dias para expirar',
    '30_days_before': '30 dias para expirar',
    '7_days_before': '7 dias para expirar',
    expired: 'Documento expirado',
    training_due: 'Treinamento pendente',
    document_review: 'Revisão de documento'
};
exports.PriorityLabels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica'
};
// Utility functions for status checks
var isDocumentExpiring = function (doc) {
    if (!doc.expiration_date)
        return false;
    var expirationDate = new Date(doc.expiration_date);
    var now = new Date();
    var daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
};
exports.isDocumentExpiring = isDocumentExpiring;
var isDocumentExpired = function (doc) {
    if (!doc.expiration_date)
        return false;
    var expirationDate = new Date(doc.expiration_date);
    var now = new Date();
    return expirationDate < now;
};
exports.isDocumentExpired = isDocumentExpired;
var getDocumentStatusColor = function (status) {
    switch (status) {
        case 'valid': return 'text-green-600';
        case 'expiring': return 'text-yellow-600';
        case 'expired': return 'text-red-600';
        case 'pending': return 'text-gray-600';
        default: return 'text-gray-600';
    }
};
exports.getDocumentStatusColor = getDocumentStatusColor;
var getAlertPriorityColor = function (priority) {
    switch (priority) {
        case 'low': return 'text-blue-600';
        case 'medium': return 'text-yellow-600';
        case 'high': return 'text-orange-600';
        case 'critical': return 'text-red-600';
        default: return 'text-gray-600';
    }
};
exports.getAlertPriorityColor = getAlertPriorityColor;
