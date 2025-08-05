"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidDate = exports.parseBrazilianDate = exports.formatDate = void 0;
// Date utilities placeholder
var formatDate = function (date) {
  return date.toISOString();
};
exports.formatDate = formatDate;
var parseBrazilianDate = function (date) {
  return new Date(date);
};
exports.parseBrazilianDate = parseBrazilianDate;
var isValidDate = function (date) {
  return !isNaN(date.getTime());
};
exports.isValidDate = isValidDate;
