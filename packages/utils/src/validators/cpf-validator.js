"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCPF = validateCPF;
exports.formatCPF = formatCPF;
/**
 * CPF (Cadastro de Pessoas Físicas) validator for Brazilian individuals
 */
function validateCPF(cpf) {
    // Remove non-numeric characters
    var cleanCPF = cpf.replace(/[^\d]/g, '');
    // Check if has 11 digits
    if (cleanCPF.length !== 11)
        return false;
    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF))
        return false;
    // Validate check digits
    var sum = 0;
    for (var i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    var remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9)))
        return false;
    sum = 0;
    for (var i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10)))
        return false;
    return true;
}
function formatCPF(cpf) {
    var cleanCPF = cpf.replace(/[^\d]/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
