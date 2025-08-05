"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBRL = exports.formatBRL = void 0;
// Brazilian currency formatter
var formatBRL = function (amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
};
exports.formatBRL = formatBRL;
var parseBRL = function (value) {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
};
exports.parseBRL = parseBRL;
