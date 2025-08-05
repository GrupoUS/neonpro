"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBrazilianDate = exports.formatBrazilianDate = void 0;
// Brazilian date formatting placeholder
var formatBrazilianDate = function (date) { return date.toLocaleDateString('pt-BR'); };
exports.formatBrazilianDate = formatBrazilianDate;
var parseBrazilianDate = function (dateStr) { return new Date(dateStr); };
exports.parseBrazilianDate = parseBrazilianDate;
