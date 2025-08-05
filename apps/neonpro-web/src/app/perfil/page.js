"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = PerfilPage;
var nextjs_1 = require("@clerk/nextjs");
var server_1 = require("@clerk/nextjs/server");
var navigation_1 = require("next/navigation");
function PerfilPage() {
    return __awaiter(this, void 0, void 0, function () {
        var userId;
        return __generator(this, function (_a) {
            userId = (0, server_1.auth)().userId;
            // Redirect unauthenticated users
            if (!userId) {
                (0, navigation_1.redirect)('/auth/entrar');
            }
            return [2 /*return*/, (<div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Healthcare-focused header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Perfil Profissional
          </h1>
          <p className="text-slate-600">
            Gerencie suas informações profissionais e configurações de conta
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            🔒 Dados protegidos pela LGPD
          </div>
        </div>

        {/* Clerk UserProfile Component */}
        <div className="flex justify-center">
          <nextjs_1.UserProfile path="/perfil" routing="path" appearance={{
                        elements: {
                            rootBox: "w-full max-w-4xl",
                            card: "shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl",
                            navbar: "bg-slate-50 rounded-t-2xl",
                            navbarButton: "text-slate-700 hover:text-sky-600 hover:bg-sky-50",
                            navbarButtonActive: "text-sky-600 bg-sky-100",
                            pageScrollBox: "bg-white rounded-b-2xl",
                            headerTitle: "text-slate-900 font-semibold",
                            headerSubtitle: "text-slate-600",
                            formButtonPrimary: "bg-sky-500 hover:bg-sky-600 text-white font-medium",
                            formFieldInput: "border-slate-200 focus:border-sky-500 focus:ring-sky-500",
                            accordionTriggerButton: "text-slate-700 hover:text-slate-900",
                            badge: "bg-sky-100 text-sky-800",
                            formFieldSuccessText: "text-emerald-600",
                            formFieldErrorText: "text-red-600",
                            identityPreviewText: "text-slate-700",
                            identityPreviewEditButton: "text-sky-600 hover:text-sky-700"
                        },
                        variables: {
                            colorPrimary: "#0ea5e9",
                            colorBackground: "rgba(255, 255, 255, 0.9)",
                            colorInputBackground: "#f8fafc",
                            borderRadius: "0.75rem",
                            colorSuccess: "#10b981",
                            colorDanger: "#ef4444"
                        }
                    }}/>
        </div>

        {/* Healthcare compliance information */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🏥 Informações para Profissionais de Saúde
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>Proteção de Dados:</strong> Todas as informações são criptografadas e 
                armazenadas em conformidade com a LGPD e normas do CFM.
              </p>
              <p>
                <strong>Registro Profissional:</strong> Mantenha seus dados de registro 
                profissional sempre atualizados para garantir o acesso completo ao sistema.
              </p>
              <p>
                <strong>Segurança:</strong> Recomendamos ativar a autenticação de dois fatores 
                para máxima segurança dos dados dos pacientes.
              </p>
            </div>
          </div>

          {/* LGPD Rights Information */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">
              ⚖️ Seus Direitos sob a LGPD
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-800">
              <div>
                <p className="font-medium">Acesso e Portabilidade</p>
                <p>Solicite uma cópia dos seus dados pessoais</p>
              </div>
              <div>
                <p className="font-medium">Correção</p>
                <p>Atualize informações incorretas ou incompletas</p>
              </div>
              <div>
                <p className="font-medium">Exclusão (Direito ao Esquecimento)</p>
                <p>Solicite a remoção dos seus dados pessoais</p>
              </div>
              <div>
                <p className="font-medium">Limitação do Tratamento</p>
                <p>Limite como seus dados são processados</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-xs text-amber-700">
                Para exercer seus direitos, entre em contato com nosso DPO: 
                <a href="mailto:dpo@neonpro.com.br" className="text-amber-900 hover:underline font-medium">
                  dpo@neonpro.com.br
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>)];
        });
    });
}
exports.metadata = {
    title: 'Perfil Profissional - NeonPro Saúde',
    description: 'Gerencie seu perfil profissional e configurações de conta com segurança LGPD',
};
