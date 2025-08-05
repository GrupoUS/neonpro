// =====================================================
// Resource Management Dashboard Component
// Story 2.4: Smart Resource Management - Frontend
// =====================================================
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResourceManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var outline_1 = require("@heroicons/react/24/outline");
var sonner_1 = require("sonner");
function ResourceManagement(_a) {
  var clinicId = _a.clinicId,
    userRole = _a.userRole;
  var _b = (0, react_1.useState)([]),
    resources = _b[0],
    setResources = _b[1];
  var _c = (0, react_1.useState)(null),
    selectedResource = _c[0],
    setSelectedResource = _c[1];
  var _d = (0, react_1.useState)([]),
    allocations = _d[0],
    setAllocations = _d[1];
  var _e = (0, react_1.useState)(true),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)({
      type: "all",
      status: "all",
      category: "all",
    }),
    filters = _f[0],
    setFilters = _f[1];
  // =====================================================
  // Data Fetching
  // =====================================================
  (0, react_1.useEffect)(() => {
    fetchResources();
  }, [clinicId, filters]);
  var fetchResources = () =>
    __awaiter(this, void 0, void 0, function () {
      var params, response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            params = new URLSearchParams(
              __assign(
                __assign(
                  __assign(
                    { clinic_id: clinicId },
                    filters.type !== "all" && { type: filters.type },
                  ),
                  filters.status !== "all" && { status: filters.status },
                ),
                filters.category !== "all" && { category: filters.category },
              ),
            );
            return [4 /*yield*/, fetch("/api/resources?".concat(params))];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              setResources(data.data);
            } else {
              sonner_1.toast.error("Failed to fetch resources");
            }
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error fetching resources:", error_1);
            sonner_1.toast.error("Error loading resources");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var fetchAllocations = (resourceId) =>
    __awaiter(this, void 0, void 0, function () {
      var today, params, response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            today = new Date().toISOString().split("T")[0];
            params = new URLSearchParams({
              resource_id: resourceId,
              start_date: "".concat(today, "T00:00:00Z"),
              end_date: "".concat(today, "T23:59:59Z"),
            });
            return [4 /*yield*/, fetch("/api/resources/allocations?".concat(params))];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              setAllocations(data.data);
            }
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error fetching allocations:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // =====================================================
  // Resource Actions
  // =====================================================
  var updateResourceStatus = (resourceId, newStatus) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/resources", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: resourceId, status: newStatus }),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              sonner_1.toast.success("Resource status updated");
              fetchResources();
            } else {
              sonner_1.toast.error("Failed to update resource status");
            }
            return [3 /*break*/, 4];
          case 3:
            error_3 = _a.sent();
            console.error("Error updating resource status:", error_3);
            sonner_1.toast.error("Error updating resource status");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // =====================================================
  // UI Helpers
  // =====================================================
  var getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "cleaning":
        return "bg-purple-100 text-purple-800";
      case "reserved":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getResourceIcon = (type) => {
    switch (type) {
      case "room":
        return <outline_1.MapPinIcon className="h-5 w-5" />;
      case "equipment":
        return <outline_1.WrenchIcon className="h-5 w-5" />;
      case "staff":
        return <outline_1.UserIcon className="h-5 w-5" />;
      default:
        return <outline_1.SettingsIcon className="h-5 w-5" />;
    }
  };
  var formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  // =====================================================
  // Render Components
  // =====================================================
  var ResourceCard = (_a) => {
    var resource = _a.resource;
    return (
      <card_1.Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedResource(resource);
          fetchAllocations(resource.id);
        }}
      >
        <card_1.CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getResourceIcon(resource.type)}
              <card_1.CardTitle className="text-lg">{resource.name}</card_1.CardTitle>
            </div>
            <badge_1.Badge className={getStatusColor(resource.status)}>
              {resource.status}
            </badge_1.Badge>
          </div>
          <card_1.CardDescription>
            {resource.type} • {resource.category || "General"}
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-2 text-sm">
            {resource.location && (
              <div className="flex items-center text-gray-600">
                <outline_1.MapPinIcon className="h-4 w-4 mr-1" />
                {resource.location}
              </div>
            )}
            {resource.capacity && (
              <div className="flex items-center text-gray-600">
                <outline_1.UserIcon className="h-4 w-4 mr-1" />
                Capacity: {resource.capacity}
              </div>
            )}
            {resource.cost_per_hour && (
              <div className="flex items-center text-gray-600">
                <outline_1.ClockIcon className="h-4 w-4 mr-1" />${resource.cost_per_hour}/hour
              </div>
            )}
            {resource.next_maintenance && (
              <div className="flex items-center text-yellow-600">
                <outline_1.AlertTriangleIcon className="h-4 w-4 mr-1" />
                Maintenance due: {new Date(resource.next_maintenance).toLocaleDateString()}
              </div>
            )}
          </div>

          {userRole !== "patient" && (
            <div className="mt-4 flex space-x-2">
              <button_1.Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  updateResourceStatus(
                    resource.id,
                    resource.status === "available" ? "maintenance" : "available",
                  );
                }}
              >
                {resource.status === "available" ? "Set Maintenance" : "Set Available"}
              </button_1.Button>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var AllocationsList = () => (
    <div className="space-y-3">
      {allocations.length === 0
        ? <p className="text-gray-500 text-center py-4">No allocations for today</p>
        : allocations.map((allocation) => (
            <card_1.Card key={allocation.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {formatTime(allocation.start_time)} - {formatTime(allocation.end_time)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {allocation.allocation_type} {allocation.appointment_id && "• Appointment"}
                  </div>
                  {allocation.notes && (
                    <div className="text-sm text-gray-500 mt-1">{allocation.notes}</div>
                  )}
                </div>
                <badge_1.Badge
                  className={
                    allocation.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : allocation.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : allocation.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                  }
                >
                  {allocation.status}
                </badge_1.Badge>
              </div>
            </card_1.Card>
          ))}
    </div>
  );
  // =====================================================
  // Main Render
  // =====================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Management</h1>
          <p className="text-gray-600 mt-2">
            Manage clinic resources, allocations, and optimize utilization
          </p>
        </div>
        {userRole !== "patient" && (
          <dialog_1.Dialog>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <outline_1.PlusIcon className="h-4 w-4 mr-2" />
                Add Resource
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent>
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Add New Resource</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Create a new resource for your clinic
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              {/* Add Resource Form would go here */}
              <div className="text-center py-4 text-gray-500">
                Resource creation form will be implemented here
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        )}
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Filters</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label_1.Label htmlFor="type-filter">Resource Type</label_1.Label>
              <select_1.Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters((prev) => __assign(__assign({}, prev), { type: value }))
                }
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="All Types" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Types</select_1.SelectItem>
                  <select_1.SelectItem value="room">Rooms</select_1.SelectItem>
                  <select_1.SelectItem value="equipment">Equipment</select_1.SelectItem>
                  <select_1.SelectItem value="staff">Staff</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div>
              <label_1.Label htmlFor="status-filter">Status</label_1.Label>
              <select_1.Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => __assign(__assign({}, prev), { status: value }))
                }
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="All Statuses" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Statuses</select_1.SelectItem>
                  <select_1.SelectItem value="available">Available</select_1.SelectItem>
                  <select_1.SelectItem value="occupied">Occupied</select_1.SelectItem>
                  <select_1.SelectItem value="maintenance">Maintenance</select_1.SelectItem>
                  <select_1.SelectItem value="cleaning">Cleaning</select_1.SelectItem>
                  <select_1.SelectItem value="reserved">Reserved</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div>
              <label_1.Label htmlFor="category-filter">Category</label_1.Label>
              <select_1.Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters((prev) => __assign(__assign({}, prev), { category: value }))
                }
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="All Categories" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Categories</select_1.SelectItem>
                  <select_1.SelectItem value="treatment_room">Treatment Room</select_1.SelectItem>
                  <select_1.SelectItem value="consultation_room">
                    Consultation Room
                  </select_1.SelectItem>
                  <select_1.SelectItem value="laser_equipment">Laser Equipment</select_1.SelectItem>
                  <select_1.SelectItem value="aesthetic_device">
                    Aesthetic Device
                  </select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resources List */}
        <div className="lg:col-span-2">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Resources ({resources.length})</card_1.CardTitle>
              <card_1.CardDescription>
                Click on a resource to view its allocations and details
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {loading
                ? <div className="text-center py-8">Loading resources...</div>
                : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Resource Details */}
        <div>
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>
                {selectedResource ? selectedResource.name : "Resource Details"}
              </card_1.CardTitle>
              <card_1.CardDescription>
                {selectedResource
                  ? "Current allocations and status"
                  : "Select a resource to view details"}
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {selectedResource
                ? <tabs_1.Tabs defaultValue="allocations" className="w-full">
                    <tabs_1.TabsList className="grid w-full grid-cols-2">
                      <tabs_1.TabsTrigger value="allocations">Today's Schedule</tabs_1.TabsTrigger>
                      <tabs_1.TabsTrigger value="details">Details</tabs_1.TabsTrigger>
                    </tabs_1.TabsList>
                    <tabs_1.TabsContent value="allocations" className="mt-4">
                      <AllocationsList />
                    </tabs_1.TabsContent>
                    <tabs_1.TabsContent value="details" className="mt-4">
                      <div className="space-y-3 text-sm">
                        <div>
                          <strong>Type:</strong> {selectedResource.type}
                        </div>
                        <div>
                          <strong>Category:</strong> {selectedResource.category || "General"}
                        </div>
                        <div>
                          <strong>Status:</strong>
                          <badge_1.Badge
                            className={"ml-2 ".concat(getStatusColor(selectedResource.status))}
                          >
                            {selectedResource.status}
                          </badge_1.Badge>
                        </div>
                        {selectedResource.location && (
                          <div>
                            <strong>Location:</strong> {selectedResource.location}
                          </div>
                        )}
                        {selectedResource.capacity && (
                          <div>
                            <strong>Capacity:</strong> {selectedResource.capacity}
                          </div>
                        )}
                        {selectedResource.cost_per_hour && (
                          <div>
                            <strong>Cost per hour:</strong> ${selectedResource.cost_per_hour}
                          </div>
                        )}
                        {selectedResource.skills && selectedResource.skills.length > 0 && (
                          <div>
                            <strong>Skills:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedResource.skills.map((skill) => (
                                <badge_1.Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </badge_1.Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </tabs_1.TabsContent>
                  </tabs_1.Tabs>
                : <div className="text-center py-8 text-gray-500">
                    Select a resource from the list to view its details and current allocations
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>
  );
}
