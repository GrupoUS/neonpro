Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.formatPatientId = formatPatientId;
exports.formatCPF = formatCPF;
exports.formatPhone = formatPhone;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function cn() {
  var inputs = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    inputs[_i] = arguments[_i];
  }
  return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
// Healthcare-specific utility functions
function formatPatientId(id) {
  if (!id || id.length < 4) return id;
  return "****".concat(id.slice(-4));
}
function formatCPF(cpf) {
  if (!cpf) return "";
  var numbers = cpf.replace(/\D/g, "");
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function formatPhone(phone) {
  if (!phone) return "";
  var numbers = phone.replace(/\D/g, "");
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}
