// i18n Utility Hook
// Story 1.3, Task 2: Simple i18n hook for PT-BR translations
// Created: Lightweight internationalization for patient portal
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTranslation = useTranslation;
exports.translate = translate;
var pt_br_1 = require("./pt-br");
function useTranslation() {
    var t = function (key, fallback) {
        try {
            var keys = key.split('.');
            var value = pt_br_1.ptBR;
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var k = keys_1[_i];
                value = value === null || value === void 0 ? void 0 : value[k];
            }
            if (typeof value === 'string') {
                return value;
            }
            if (fallback) {
                return fallback;
            }
            // Fallback to key itself if translation not found
            return key;
        }
        catch (error) {
            console.warn("Translation not found for key: ".concat(key));
            return fallback || key;
        }
    };
    return { t: t, ptBR: pt_br_1.ptBR };
}
// Simple helper for direct usage without hook
function translate(key, fallback) {
    try {
        var keys = key.split('.');
        var value = pt_br_1.ptBR;
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var k = keys_2[_i];
            value = value === null || value === void 0 ? void 0 : value[k];
        }
        if (typeof value === 'string') {
            return value;
        }
        return fallback || key;
    }
    catch (error) {
        console.warn("Translation not found for key: ".concat(key));
        return fallback || key;
    }
}
