Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBrazilianDate = exports.formatBrazilianDate = void 0;
// Brazilian date formatting placeholder
var formatBrazilianDate = (date) => date.toLocaleDateString("pt-BR");
exports.formatBrazilianDate = formatBrazilianDate;
var parseBrazilianDate = (dateStr) => new Date(dateStr);
exports.parseBrazilianDate = parseBrazilianDate;
