Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidDate = exports.parseBrazilianDate = exports.formatDate = void 0;
// Date utilities placeholder
var formatDate = (date) => date.toISOString();
exports.formatDate = formatDate;
var parseBrazilianDate = (date) => new Date(date);
exports.parseBrazilianDate = parseBrazilianDate;
var isValidDate = (date) => !Number.isNaN(date.getTime());
exports.isValidDate = isValidDate;
