"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var client_1 = require("@prisma/client");
exports.prisma = globalThis.__prisma || new client_1.PrismaClient({
    log: ['error', 'warn'],
    // Configurações de conexão otimizadas
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = exports.prisma;
}
exports.default = exports.prisma;
