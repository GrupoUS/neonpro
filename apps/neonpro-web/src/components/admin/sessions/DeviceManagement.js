/**
 * Device Management Component
 * Story 1.4: Session Management & Security
 *
 * Comprehensive device management interface for tracking,
 * monitoring, and controlling user devices and sessions.
 */
"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DeviceManagement;
var react_1 = require("react");
var table_1 = require("@/components/ui/table");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var session_1 = require("@/types/session");
var useSession_1 = require("@/hooks/useSession");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// ============================================================================
// DEVICE DETAILS MODAL
// ============================================================================
function DeviceDetailsModal(_a) {
  var device = _a.device,
    isOpen = _a.isOpen,
    onClose = _a.onClose,
    onAction = _a.onAction;
  if (!device) return null;
  var handleAction = (action) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, onAction(device.id, action)];
          case 1:
            _a.sent();
            onClose();
            return [2 /*return*/];
        }
      });
    });
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="max-w-2xl">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center space-x-2">
            {getDeviceIcon(device.device_type)}
            <span>Detalhes do Dispositivo</span>
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Informações detalhadas e ações disponíveis para este dispositivo
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nome do Dispositivo
              </label>
              <p className="text-sm font-mono">{device.device_name || "Não informado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <p className="text-sm">{device.device_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Sistema Operacional
              </label>
              <p className="text-sm">{device.os || "Não informado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Navegador</label>
              <p className="text-sm">{device.browser || "Não informado"}</p>
            </div>
          </div>

          {/* Status and Trust */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(device.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nível de Confiança
              </label>
              <div className="mt-1">{getTrustLevelBadge(device.trust_level)}</div>
            </div>
          </div>

          {/* Location and Network */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Localização</label>
              <p className="text-sm">
                {device.location
                  ? "".concat(device.location.city, ", ").concat(device.location.country)
                  : "Não disponível"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">IP Address</label>
              <p className="text-sm font-mono">{device.ip_address}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Primeiro Acesso</label>
              <p className="text-sm">
                {(0, date_fns_1.format)(new Date(device.first_seen), "dd/MM/yyyy HH:mm", {
                  locale: locale_1.ptBR,
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Último Acesso</label>
              <p className="text-sm">
                {(0, date_fns_1.format)(new Date(device.last_seen), "dd/MM/yyyy HH:mm", {
                  locale: locale_1.ptBR,
                })}
              </p>
            </div>
          </div>

          {/* Fingerprint */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Device Fingerprint</label>
            <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
              {device.fingerprint}
            </p>
          </div>

          {/* Metadata */}
          {device.metadata && Object.keys(device.metadata).length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Metadados</label>
              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(device.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <dialog_1.DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            {device.status === session_1.DeviceStatus.ACTIVE && (
              <button_1.Button variant="outline" size="sm" onClick={() => handleAction("block")}>
                <lucide_react_1.Ban className="h-4 w-4 mr-2" />
                Bloquear
              </button_1.Button>
            )}
            {device.status === session_1.DeviceStatus.BLOCKED && (
              <button_1.Button variant="outline" size="sm" onClick={() => handleAction("unblock")}>
                <lucide_react_1.CheckCircle className="h-4 w-4 mr-2" />
                Desbloquear
              </button_1.Button>
            )}
            {device.trust_level !== session_1.DeviceTrustLevel.TRUSTED && (
              <button_1.Button variant="outline" size="sm" onClick={() => handleAction("trust")}>
                <lucide_react_1.ShieldCheck className="h-4 w-4 mr-2" />
                Confiar
              </button_1.Button>
            )}
            {device.trust_level === session_1.DeviceTrustLevel.TRUSTED && (
              <button_1.Button variant="outline" size="sm" onClick={() => handleAction("untrust")}>
                <lucide_react_1.ShieldX className="h-4 w-4 mr-2" />
                Remover Confiança
              </button_1.Button>
            )}
          </div>
          <div className="flex space-x-2">
            <button_1.Button variant="destructive" size="sm" onClick={() => handleAction("delete")}>
              <lucide_react_1.Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </button_1.Button>
            <button_1.Button variant="outline" onClick={onClose}>
              Fechar
            </button_1.Button>
          </div>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function getDeviceIcon(deviceType) {
  var type = deviceType.toLowerCase();
  if (type.includes("mobile") || type.includes("phone")) {
    return <lucide_react_1.Smartphone className="h-4 w-4" />;
  }
  if (type.includes("tablet")) {
    return <lucide_react_1.Tablet className="h-4 w-4" />;
  }
  return <lucide_react_1.Monitor className="h-4 w-4" />;
}
function getStatusBadge(status) {
  var _a;
  var config =
    ((_a = {}),
    (_a[session_1.DeviceStatus.ACTIVE] = {
      variant: "default",
      color: "text-green-600",
      icon: lucide_react_1.CheckCircle,
    }),
    (_a[session_1.DeviceStatus.INACTIVE] = {
      variant: "secondary",
      color: "text-gray-600",
      icon: lucide_react_1.Clock,
    }),
    (_a[session_1.DeviceStatus.BLOCKED] = {
      variant: "destructive",
      color: "text-red-600",
      icon: lucide_react_1.Ban,
    }),
    (_a[session_1.DeviceStatus.SUSPICIOUS] = {
      variant: "destructive",
      color: "text-orange-600",
      icon: lucide_react_1.AlertTriangle,
    }),
    _a);
  var _b = config[status] || config[session_1.DeviceStatus.INACTIVE],
    variant = _b.variant,
    color = _b.color,
    Icon = _b.icon;
  return (
    <badge_1.Badge variant={variant} className={"".concat(color, " flex items-center space-x-1")}>
      <Icon className="h-3 w-3" />
      <span>{status}</span>
    </badge_1.Badge>
  );
}
function getTrustLevelBadge(trustLevel) {
  var _a;
  var config =
    ((_a = {}),
    (_a[session_1.DeviceTrustLevel.TRUSTED] = {
      variant: "default",
      color: "text-green-600",
      icon: lucide_react_1.ShieldCheck,
    }),
    (_a[session_1.DeviceTrustLevel.UNKNOWN] = {
      variant: "secondary",
      color: "text-gray-600",
      icon: lucide_react_1.Shield,
    }),
    (_a[session_1.DeviceTrustLevel.SUSPICIOUS] = {
      variant: "destructive",
      color: "text-red-600",
      icon: lucide_react_1.ShieldX,
    }),
    _a);
  var _b = config[trustLevel] || config[session_1.DeviceTrustLevel.UNKNOWN],
    variant = _b.variant,
    color = _b.color,
    Icon = _b.icon;
  return (
    <badge_1.Badge variant={variant} className={"".concat(color, " flex items-center space-x-1")}>
      <Icon className="h-3 w-3" />
      <span>{trustLevel}</span>
    </badge_1.Badge>
  );
}
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function DeviceManagement(_a) {
  var devices = _a.devices,
    onDeviceAction = _a.onDeviceAction;
  var _b = (0, useSession_1.useDeviceManagement)(),
    refreshDevices = _b.refreshDevices,
    bulkAction = _b.bulkAction;
  var _c = (0, react_1.useState)({
      search: "",
      status: "all",
      trustLevel: "all",
      deviceType: "all",
      lastSeen: "all",
    }),
    filters = _c[0],
    setFilters = _c[1];
  var _d = (0, react_1.useState)([]),
    selectedDevices = _d[0],
    setSelectedDevices = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedDevice = _e[0],
    setSelectedDevice = _e[1];
  var _f = (0, react_1.useState)(false),
    isDetailsModalOpen = _f[0],
    setIsDetailsModalOpen = _f[1];
  // ============================================================================
  // FILTERING AND SORTING
  // ============================================================================
  var filteredDevices = (0, react_1.useMemo)(() => {
    var filtered = __spreadArray([], devices, true);
    // Search filter
    if (filters.search) {
      var searchLower_1 = filters.search.toLowerCase();
      filtered = filtered.filter(
        (device) =>
          (device.device_name && device.device_name.toLowerCase().includes(searchLower_1)) ||
          device.device_type.toLowerCase().includes(searchLower_1) ||
          device.ip_address.toLowerCase().includes(searchLower_1) ||
          (device.os && device.os.toLowerCase().includes(searchLower_1)) ||
          (device.browser && device.browser.toLowerCase().includes(searchLower_1)),
      );
    }
    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((device) => device.status === filters.status);
    }
    // Trust level filter
    if (filters.trustLevel !== "all") {
      filtered = filtered.filter((device) => device.trust_level === filters.trustLevel);
    }
    // Device type filter
    if (filters.deviceType !== "all") {
      filtered = filtered.filter((device) => device.device_type === filters.deviceType);
    }
    // Last seen filter
    if (filters.lastSeen !== "all") {
      var now = new Date();
      var cutoff_1 = new Date();
      switch (filters.lastSeen) {
        case "1h":
          cutoff_1.setHours(now.getHours() - 1);
          break;
        case "24h":
          cutoff_1.setHours(now.getHours() - 24);
          break;
        case "7d":
          cutoff_1.setDate(now.getDate() - 7);
          break;
        case "30d":
          cutoff_1.setDate(now.getDate() - 30);
          break;
      }
      filtered = filtered.filter((device) => new Date(device.last_seen) >= cutoff_1);
    }
    // Sort by last seen (most recent first)
    return filtered.sort(
      (a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime(),
    );
  }, [devices, filters]);
  // Get unique device types for filter
  var deviceTypes = (0, react_1.useMemo)(() => {
    var types = new Set(devices.map((device) => device.device_type));
    return Array.from(types);
  }, [devices]);
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  var handleDeviceAction = (deviceId, action) =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, onDeviceAction(deviceId, action)];
          case 1:
            _a.sent();
            return [4 /*yield*/, refreshDevices()];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to ".concat(action, " device:"), error_1);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleBulkAction = (action) =>
    __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, bulkAction(selectedDevices, action)];
          case 1:
            _a.sent();
            setSelectedDevices([]);
            return [4 /*yield*/, refreshDevices()];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Failed to bulk ".concat(action, " devices:"), error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleViewDetails = (device) => {
    setSelectedDevice(device);
    setIsDetailsModalOpen(true);
  };
  var handleRefresh = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, refreshDevices()];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Failed to refresh devices:", error_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <>
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle>Gerenciamento de Dispositivos</card_1.CardTitle>
              <card_1.CardDescription>
                Monitore e gerencie dispositivos conectados às sessões
              </card_1.CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {selectedDevices.length > 0 && (
                <>
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("block")}
                  >
                    <lucide_react_1.Ban className="h-4 w-4 mr-2" />
                    Bloquear Selecionados ({selectedDevices.length})
                  </button_1.Button>
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("trust")}
                  >
                    <lucide_react_1.ShieldCheck className="h-4 w-4 mr-2" />
                    Confiar Selecionados
                  </button_1.Button>
                </>
              )}
              <button_1.Button variant="outline" size="sm" onClick={handleRefresh}>
                <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input_1.Input
                  placeholder="Buscar dispositivos..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => __assign(__assign({}, prev), { search: e.target.value }))
                  }
                  className="pl-8"
                />
              </div>
            </div>

            <select_1.Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => __assign(__assign({}, prev), { status: value }))
              }
            >
              <select_1.SelectTrigger className="w-[140px]">
                <select_1.SelectValue placeholder="Status" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                {Object.values(session_1.DeviceStatus).map((status) => (
                  <select_1.SelectItem key={status} value={status}>
                    {status}
                  </select_1.SelectItem>
                ))}
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select
              value={filters.trustLevel}
              onValueChange={(value) =>
                setFilters((prev) => __assign(__assign({}, prev), { trustLevel: value }))
              }
            >
              <select_1.SelectTrigger className="w-[140px]">
                <select_1.SelectValue placeholder="Confiança" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                {Object.values(session_1.DeviceTrustLevel).map((level) => (
                  <select_1.SelectItem key={level} value={level}>
                    {level}
                  </select_1.SelectItem>
                ))}
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select
              value={filters.deviceType}
              onValueChange={(value) =>
                setFilters((prev) => __assign(__assign({}, prev), { deviceType: value }))
              }
            >
              <select_1.SelectTrigger className="w-[140px]">
                <select_1.SelectValue placeholder="Tipo" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                {deviceTypes.map((type) => (
                  <select_1.SelectItem key={type} value={type}>
                    {type}
                  </select_1.SelectItem>
                ))}
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select
              value={filters.lastSeen}
              onValueChange={(value) =>
                setFilters((prev) => __assign(__assign({}, prev), { lastSeen: value }))
              }
            >
              <select_1.SelectTrigger className="w-[120px]">
                <select_1.SelectValue placeholder="Atividade" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                <select_1.SelectItem value="1h">1 hora</select_1.SelectItem>
                <select_1.SelectItem value="24h">24 horas</select_1.SelectItem>
                <select_1.SelectItem value="7d">7 dias</select_1.SelectItem>
                <select_1.SelectItem value="30d">30 dias</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Devices Table */}
          <div className="rounded-md border">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={
                        selectedDevices.length === filteredDevices.length &&
                        filteredDevices.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDevices(filteredDevices.map((device) => device.id));
                        } else {
                          setSelectedDevices([]);
                        }
                      }}
                    />
                  </table_1.TableHead>
                  <table_1.TableHead>Dispositivo</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Confiança</table_1.TableHead>
                  <table_1.TableHead>Localização</table_1.TableHead>
                  <table_1.TableHead>Último Acesso</table_1.TableHead>
                  <table_1.TableHead className="w-[50px]">Ações</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredDevices.length === 0
                  ? <table_1.TableRow>
                      <table_1.TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum dispositivo encontrado
                      </table_1.TableCell>
                    </table_1.TableRow>
                  : filteredDevices.map((device) => (
                      <table_1.TableRow key={device.id}>
                        <table_1.TableCell>
                          <input
                            type="checkbox"
                            checked={selectedDevices.includes(device.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDevices((prev) =>
                                  __spreadArray(__spreadArray([], prev, true), [device.id], false),
                                );
                              } else {
                                setSelectedDevices((prev) => prev.filter((id) => id !== device.id));
                              }
                            }}
                          />
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center space-x-3">
                            {getDeviceIcon(device.device_type)}
                            <div>
                              <div className="font-medium">
                                {device.device_name || device.device_type}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {device.os} • {device.browser}
                              </div>
                            </div>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>{getStatusBadge(device.status)}</table_1.TableCell>
                        <table_1.TableCell>
                          {getTrustLevelBadge(device.trust_level)}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center space-x-1">
                            <lucide_react_1.MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {device.location
                                ? ""
                                    .concat(device.location.city, ", ")
                                    .concat(device.location.country)
                                : "Não disponível"}
                            </span>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center space-x-1">
                            <lucide_react_1.Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {(0, date_fns_1.format)(new Date(device.last_seen), "dd/MM HH:mm", {
                                locale: locale_1.ptBR,
                              })}
                            </span>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <dropdown_menu_1.DropdownMenu>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                              <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                                <lucide_react_1.MoreHorizontal className="h-4 w-4" />
                              </button_1.Button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent align="end">
                              <dropdown_menu_1.DropdownMenuLabel>
                                Ações
                              </dropdown_menu_1.DropdownMenuLabel>
                              <dropdown_menu_1.DropdownMenuSeparator />
                              <dropdown_menu_1.DropdownMenuItem
                                onClick={() => handleViewDetails(device)}
                              >
                                <lucide_react_1.Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </dropdown_menu_1.DropdownMenuItem>
                              {device.status === session_1.DeviceStatus.ACTIVE && (
                                <dropdown_menu_1.DropdownMenuItem
                                  onClick={() => handleDeviceAction(device.id, "block")}
                                >
                                  <lucide_react_1.Ban className="h-4 w-4 mr-2" />
                                  Bloquear
                                </dropdown_menu_1.DropdownMenuItem>
                              )}
                              {device.status === session_1.DeviceStatus.BLOCKED && (
                                <dropdown_menu_1.DropdownMenuItem
                                  onClick={() => handleDeviceAction(device.id, "unblock")}
                                >
                                  <lucide_react_1.CheckCircle className="h-4 w-4 mr-2" />
                                  Desbloquear
                                </dropdown_menu_1.DropdownMenuItem>
                              )}
                              {device.trust_level !== session_1.DeviceTrustLevel.TRUSTED && (
                                <dropdown_menu_1.DropdownMenuItem
                                  onClick={() => handleDeviceAction(device.id, "trust")}
                                >
                                  <lucide_react_1.ShieldCheck className="h-4 w-4 mr-2" />
                                  Confiar
                                </dropdown_menu_1.DropdownMenuItem>
                              )}
                              <dropdown_menu_1.DropdownMenuSeparator />
                              <dropdown_menu_1.DropdownMenuItem
                                onClick={() => handleDeviceAction(device.id, "delete")}
                                className="text-red-600"
                              >
                                <lucide_react_1.Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </dropdown_menu_1.DropdownMenuItem>
                            </dropdown_menu_1.DropdownMenuContent>
                          </dropdown_menu_1.DropdownMenu>
                        </table_1.TableCell>
                      </table_1.TableRow>
                    ))}
              </table_1.TableBody>
            </table_1.Table>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              Mostrando {filteredDevices.length} de {devices.length} dispositivos
            </span>
            <div className="flex items-center space-x-4">
              <span>
                {filteredDevices.filter((d) => d.status === session_1.DeviceStatus.ACTIVE).length}{" "}
                ativos
              </span>
              <span>
                {
                  filteredDevices.filter(
                    (d) => d.trust_level === session_1.DeviceTrustLevel.TRUSTED,
                  ).length
                }{" "}
                confiáveis
              </span>
              <span>
                {filteredDevices.filter((d) => d.status === session_1.DeviceStatus.BLOCKED).length}{" "}
                bloqueados
              </span>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Device Details Modal */}
      <DeviceDetailsModal
        device={selectedDevice}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDevice(null);
        }}
        onAction={handleDeviceAction}
      />
    </>
  );
}
