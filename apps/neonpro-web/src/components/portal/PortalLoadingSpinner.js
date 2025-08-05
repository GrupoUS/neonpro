"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PortalLoadingSpinner;
exports.PortalPageLoader = PortalPageLoader;
exports.PortalComponentLoader = PortalComponentLoader;
// ===============================================
// Portal Loading Spinner Component
// Story 4.3: Patient Portal & Self-Service
// ===============================================
function PortalLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        {/* Main Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

        {/* Inner Dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="ml-4">
        <p className="text-gray-600 text-sm">Carregando portal...</p>
      </div>
    </div>
  );
}
function PortalPageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Large Spinner */}
        <div className="relative mx-auto">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Carregando Portal</h2>
          <p className="text-gray-600">Preparando sua experiência...</p>
        </div>

        {/* Loading Steps */}
        <div className="text-sm text-gray-500 space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
            <span>Verificando autenticação</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div
              className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <span>Carregando dados</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div
              className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <span>Configurando interface</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function PortalComponentLoader(_a) {
  var _b = _a.message,
    message = _b === void 0 ? "Carregando..." : _b;
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-3">
        <div className="relative mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}
