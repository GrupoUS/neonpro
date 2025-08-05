"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = TesteAuthPage;
var server_1 = require("@clerk/nextjs/server");
var nextjs_1 = require("@clerk/nextjs");
function TesteAuthPage() {
  return __awaiter(this, void 0, void 0, function () {
    var userId, user;
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          userId = (0, server_1.auth)().userId;
          return [4 /*yield*/, (0, server_1.currentUser)()];
        case 1:
          user = _b.sent();
          return [
            2 /*return*/,
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-8 px-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">
                    🧪 Teste de Autenticação Clerk
                  </h1>

                  {/* Authentication Status */}
                  <div className="mb-8">
                    {userId
                      ? <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                          <h2 className="text-xl font-semibold text-emerald-900 mb-4">
                            ✅ Usuário Autenticado
                          </h2>
                          <div className="space-y-3 text-emerald-800">
                            <p>
                              <strong>User ID:</strong> {userId}
                            </p>
                            <p>
                              <strong>Email:</strong>{" "}
                              {((_a =
                                user === null || user === void 0
                                  ? void 0
                                  : user.emailAddresses[0]) === null || _a === void 0
                                ? void 0
                                : _a.emailAddress) || "N/A"}
                            </p>
                            <p>
                              <strong>Nome:</strong>{" "}
                              {user === null || user === void 0 ? void 0 : user.firstName}{" "}
                              {user === null || user === void 0 ? void 0 : user.lastName}
                            </p>
                            <p>
                              <strong>Criado em:</strong>{" "}
                              {(user === null || user === void 0 ? void 0 : user.createdAt)
                                ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                                : "N/A"}
                            </p>
                          </div>

                          <div className="mt-6">
                            <nextjs_1.SignOutButton>
                              <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                🚪 Sair da Conta
                              </button>
                            </nextjs_1.SignOutButton>
                          </div>
                        </div>
                      : <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                          <h2 className="text-xl font-semibold text-amber-900 mb-4">
                            ⚠️ Usuário Não Autenticado
                          </h2>
                          <p className="text-amber-800 mb-6">
                            Você precisa fazer login para acessar funcionalidades protegidas.
                          </p>

                          <div className="space-x-4">
                            <nextjs_1.SignInButton mode="redirect" redirectUrl="/teste-auth">
                              <button className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                🔑 Fazer Login
                              </button>
                            </nextjs_1.SignInButton>

                            <a
                              href="/auth/cadastrar"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
                            >
                              ➕ Criar Conta
                            </a>
                          </div>
                        </div>}
                  </div>

                  {/* Middleware Tests */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        🛡️ Testes de Middleware
                      </h3>
                      <div className="space-y-3">
                        <a
                          href="/dashboard"
                          className="block bg-blue-100 hover:bg-blue-200 text-blue-800 p-3 rounded-lg transition-colors"
                        >
                          📊 Dashboard (Protegido)
                        </a>
                        <a
                          href="/admin"
                          className="block bg-purple-100 hover:bg-purple-200 text-purple-800 p-3 rounded-lg transition-colors"
                        >
                          👑 Admin (Admin Only)
                        </a>
                        <a
                          href="/patients"
                          className="block bg-green-100 hover:bg-green-200 text-green-800 p-3 rounded-lg transition-colors"
                        >
                          🏥 Pacientes (Healthcare)
                        </a>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        🔍 Testes de Páginas Públicas
                      </h3>
                      <div className="space-y-3">
                        <a
                          href="/"
                          className="block bg-gray-100 hover:bg-gray-200 text-gray-800 p-3 rounded-lg transition-colors"
                        >
                          🏠 Home (Público)
                        </a>
                        <a
                          href="/pricing"
                          className="block bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-3 rounded-lg transition-colors"
                        >
                          💰 Pricing (Público)
                        </a>
                        <a
                          href="/demo"
                          className="block bg-cyan-100 hover:bg-cyan-200 text-cyan-800 p-3 rounded-lg transition-colors"
                        >
                          🎯 Demo (Público)
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Implementation Status */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      📋 Status da Implementação
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-600">✅</span>
                          <span>Clerk Provider configurado</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-600">✅</span>
                          <span>Middleware clerkMiddleware ativo</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-600">✅</span>
                          <span>Páginas de autenticação em português</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-600">✅</span>
                          <span>Headers de segurança LGPD</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-600">🔄</span>
                          <span>Integração com subscription middleware</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-600">🔄</span>
                          <span>Integração com RBAC middleware</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-600">🔄</span>
                          <span>Audit logging integration</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-red-600">⏳</span>
                          <span>Testes automatizados</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
          ];
      }
    });
  });
}
exports.metadata = {
  title: "Teste de Autenticação - NeonPro",
  description: "Página de teste para validar integração Clerk",
  robots: "noindex, nofollow",
};
