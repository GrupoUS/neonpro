"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EnhancedPatientList;
var react_1 = require("react");
var client_1 = require("@/app/utils/supabase/client");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var avatar_1 = require("@/components/ui/avatar");
var checkbox_1 = require("@/components/ui/checkbox");
var table_1 = require("@/components/ui/table");
var card_1 = require("@/components/ui/card");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function EnhancedPatientList(_a) {
  var _this = this;
  var onPatientSelect = _a.onPatientSelect,
    onPatientCreate = _a.onPatientCreate,
    _b = _a.compact,
    compact = _b === void 0 ? false : _b;
  var _c = (0, react_1.useState)([]),
    patients = _c[0],
    setPatients = _c[1];
  var _d = (0, react_1.useState)([]),
    filteredPatients = _d[0],
    setFilteredPatients = _d[1];
  var _e = (0, react_1.useState)(false),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  // Search and filter states
  var _g = (0, react_1.useState)(""),
    searchQuery = _g[0],
    setSearchQuery = _g[1];
  var _h = (0, react_1.useState)("name"),
    searchType = _h[0],
    setSearchType = _h[1];
  var _j = (0, react_1.useState)("all"),
    riskFilter = _j[0],
    setRiskFilter = _j[1];
  var _k = (0, react_1.useState)("all"),
    statusFilter = _k[0],
    setStatusFilter = _k[1];
  var _l = (0, react_1.useState)("all"),
    ageRangeFilter = _l[0],
    setAgeRangeFilter = _l[1];
  // View and pagination states
  var _m = (0, react_1.useState)("table"),
    viewMode = _m[0],
    setViewMode = _m[1];
  var _o = (0, react_1.useState)(1),
    currentPage = _o[0],
    setCurrentPage = _o[1];
  var itemsPerPage = (0, react_1.useState)(compact ? 5 : 10)[0];
  var _p = (0, react_1.useState)(new Set()),
    selectedPatients = _p[0],
    setSelectedPatients = _p[1];
  // Sort state
  var _q = (0, react_1.useState)("created_at"),
    sortField = _q[0],
    setSortField = _q[1];
  var _r = (0, react_1.useState)("desc"),
    sortDirection = _r[0],
    setSortDirection = _r[1];
  var supabase = (0, client_1.createClient)();
  // Load patients from Supabase
  var loadPatients = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, patientsData, patientsError, patientsWithAppointments, error_1, errorMessage;
        var _this = this;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              setLoading(true);
              setError(null);
              _b.label = 1;
            case 1:
              _b.trys.push([1, 4, 5, 6]);
              return [
                4 /*yield*/,
                supabase
                  .from("profiles")
                  .select(
                    "\n          *,\n          patient_profiles_extended(*),\n          patient_photos!inner(photo_url, photo_type, is_primary)\n        ",
                  )
                  .eq("role", "patient")
                  .order("created_at", { ascending: false }),
              ];
            case 2:
              (_a = _b.sent()), (patientsData = _a.data), (patientsError = _a.error);
              if (patientsError) throw patientsError;
              return [
                4 /*yield*/,
                Promise.all(
                  (patientsData || []).map(function (patient) {
                    return __awaiter(_this, void 0, void 0, function () {
                      var count, lastVisitData;
                      return __generator(this, function (_a) {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              supabase
                                .from("appointments")
                                .select("*", { count: "exact", head: true })
                                .eq("patient_id", patient.id)
                                .gte("appointment_date", new Date().toISOString())
                                .limit(5),
                            ];
                          case 1:
                            count = _a.sent().count;
                            return [
                              4 /*yield*/,
                              supabase
                                .from("medical_timeline")
                                .select("event_date")
                                .eq("patient_id", patient.id)
                                .eq("event_type", "appointment")
                                .order("event_date", { ascending: false })
                                .limit(1)
                                .single(),
                            ];
                          case 2:
                            lastVisitData = _a.sent().data;
                            return [
                              2 /*return*/,
                              __assign(__assign({}, patient), {
                                upcoming_appointments: count || 0,
                                last_visit:
                                  (lastVisitData === null || lastVisitData === void 0
                                    ? void 0
                                    : lastVisitData.event_date) || null,
                              }),
                            ];
                        }
                      });
                    });
                  }),
                ),
              ];
            case 3:
              patientsWithAppointments = _b.sent();
              setPatients(patientsWithAppointments);
              setFilteredPatients(patientsWithAppointments);
              sonner_1.toast.success(
                "".concat(patientsWithAppointments.length, " pacientes carregados"),
              );
              return [3 /*break*/, 6];
            case 4:
              error_1 = _b.sent();
              errorMessage =
                error_1 instanceof Error ? error_1.message : "Erro ao carregar pacientes";
              setError(errorMessage);
              sonner_1.toast.error("Erro: ".concat(errorMessage));
              console.error("Load patients error:", error_1);
              return [3 /*break*/, 6];
            case 5:
              setLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [supabase],
  );
  // Filter and search patients
  (0, react_1.useEffect)(
    function () {
      var filtered = __spreadArray([], patients, true);
      // Apply search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter(function (patient) {
          var _a, _b, _c, _d, _e, _f;
          var query = searchQuery.toLowerCase();
          switch (searchType) {
            case "name":
              return (_b =
                (_a = patient.raw_user_meta_data) === null || _a === void 0
                  ? void 0
                  : _a.full_name) === null || _b === void 0
                ? void 0
                : _b.toLowerCase().includes(query);
            case "phone":
              return (_c = patient.phone) === null || _c === void 0
                ? void 0
                : _c.toLowerCase().includes(query);
            case "email":
              return (_d = patient.email) === null || _d === void 0
                ? void 0
                : _d.toLowerCase().includes(query);
            case "cpf":
              return (_f =
                (_e = patient.raw_user_meta_data) === null || _e === void 0 ? void 0 : _e.cpf) ===
                null || _f === void 0
                ? void 0
                : _f.toLowerCase().includes(query);
            default:
              return false;
          }
        });
      }
      // Apply risk filter
      if (riskFilter !== "all") {
        filtered = filtered.filter(function (patient) {
          var _a;
          return (
            ((_a = patient.patient_profiles_extended) === null || _a === void 0
              ? void 0
              : _a.risk_level) === riskFilter
          );
        });
      }
      // Apply age range filter
      if (ageRangeFilter !== "all") {
        filtered = filtered.filter(function (patient) {
          var _a;
          if (
            !((_a = patient.raw_user_meta_data) === null || _a === void 0
              ? void 0
              : _a.date_of_birth)
          )
            return false;
          var age = calculateAge(patient.raw_user_meta_data.date_of_birth);
          switch (ageRangeFilter) {
            case "child":
              return age < 18;
            case "adult":
              return age >= 18 && age < 65;
            case "senior":
              return age >= 65;
            default:
              return true;
          }
        });
      }
      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter(function (patient) {
          var lastVisit = patient.last_visit;
          var daysSinceLastVisit = lastVisit
            ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
            : 9999;
          switch (statusFilter) {
            case "active":
              return daysSinceLastVisit <= 30;
            case "inactive":
              return daysSinceLastVisit > 90;
            case "new":
              return daysSinceLastVisit <= 7;
            default:
              return true;
          }
        });
      }
      // Apply sorting
      filtered.sort(function (a, b) {
        var _a, _b, _c, _d, _e, _f;
        var aValue, bValue;
        switch (sortField) {
          case "name":
            aValue =
              ((_a = a.raw_user_meta_data) === null || _a === void 0 ? void 0 : _a.full_name) || "";
            bValue =
              ((_b = b.raw_user_meta_data) === null || _b === void 0 ? void 0 : _b.full_name) || "";
            break;
          case "risk_score":
            aValue =
              ((_c = a.patient_profiles_extended) === null || _c === void 0
                ? void 0
                : _c.risk_score) || 0;
            bValue =
              ((_d = b.patient_profiles_extended) === null || _d === void 0
                ? void 0
                : _d.risk_score) || 0;
            break;
          case "completeness":
            aValue =
              ((_e = a.patient_profiles_extended) === null || _e === void 0
                ? void 0
                : _e.profile_completeness_score) || 0;
            bValue =
              ((_f = b.patient_profiles_extended) === null || _f === void 0
                ? void 0
                : _f.profile_completeness_score) || 0;
            break;
          case "last_visit":
            aValue = a.last_visit ? new Date(a.last_visit).getTime() : 0;
            bValue = b.last_visit ? new Date(b.last_visit).getTime() : 0;
            break;
          default:
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
        }
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      setFilteredPatients(filtered);
      setCurrentPage(1);
    },
    [
      patients,
      searchQuery,
      searchType,
      riskFilter,
      statusFilter,
      ageRangeFilter,
      sortField,
      sortDirection,
    ],
  );
  // Load patients on component mount
  (0, react_1.useEffect)(
    function () {
      loadPatients();
    },
    [loadPatients],
  );
  // Real-time subscriptions for patient updates
  (0, react_1.useEffect)(
    function () {
      var channel = supabase
        .channel("patients-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles" },
          function (payload) {
            console.log("Patient change received!", payload);
            loadPatients(); // Reload patients on any change
          },
        )
        .subscribe();
      return function () {
        supabase.removeChannel(channel);
      };
    },
    [supabase, loadPatients],
  );
  // Utility functions
  var calculateAge = function (dateOfBirth) {
    var today = new Date();
    var birthDate = new Date(dateOfBirth);
    var age = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  var getRiskColor = function (level) {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  var getStatusBadge = function (patient) {
    var lastVisit = patient.last_visit;
    var daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : 9999;
    if (daysSinceLastVisit <= 7) {
      return <badge_1.Badge variant="default">Novo</badge_1.Badge>;
    } else if (daysSinceLastVisit <= 30) {
      return <badge_1.Badge variant="secondary">Ativo</badge_1.Badge>;
    } else if (daysSinceLastVisit <= 90) {
      return <badge_1.Badge variant="outline">Regular</badge_1.Badge>;
    } else {
      return <badge_1.Badge variant="destructive">Inativo</badge_1.Badge>;
    }
  };
  var handlePatientSelection = function (patientId, selected) {
    var newSelection = new Set(selectedPatients);
    if (selected) {
      newSelection.add(patientId);
    } else {
      newSelection.delete(patientId);
    }
    setSelectedPatients(newSelection);
  };
  var handleSelectAll = function (selected) {
    if (selected) {
      var pagePatients = getCurrentPagePatients();
      setSelectedPatients(
        new Set(
          pagePatients.map(function (p) {
            return p.id;
          }),
        ),
      );
    } else {
      setSelectedPatients(new Set());
    }
  };
  var getCurrentPagePatients = function () {
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    return filteredPatients.slice(startIndex, endIndex);
  };
  var totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  // Render functions
  var renderTableView = function () {
    return (
      <div className="border rounded-lg">
        <table_1.Table>
          <table_1.TableHeader>
            <table_1.TableRow>
              <table_1.TableHead className="w-12">
                <checkbox_1.Checkbox
                  checked={
                    getCurrentPagePatients().length > 0 &&
                    getCurrentPagePatients().every(function (p) {
                      return selectedPatients.has(p.id);
                    })
                  }
                  onCheckedChange={handleSelectAll}
                />
              </table_1.TableHead>
              <table_1.TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={function () {
                  if (sortField === "name") {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("name");
                    setSortDirection("asc");
                  }
                }}
              >
                Paciente
              </table_1.TableHead>
              <table_1.TableHead>Contato</table_1.TableHead>
              <table_1.TableHead>Status</table_1.TableHead>
              <table_1.TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={function () {
                  if (sortField === "risk_score") {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("risk_score");
                    setSortDirection("desc");
                  }
                }}
              >
                Risco
              </table_1.TableHead>
              <table_1.TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={function () {
                  if (sortField === "completeness") {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("completeness");
                    setSortDirection("desc");
                  }
                }}
              >
                Perfil
              </table_1.TableHead>
              <table_1.TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={function () {
                  if (sortField === "last_visit") {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("last_visit");
                    setSortDirection("desc");
                  }
                }}
              >
                Último Atendimento
              </table_1.TableHead>
              <table_1.TableHead className="w-12"></table_1.TableHead>
            </table_1.TableRow>
          </table_1.TableHeader>
          <table_1.TableBody>
            {getCurrentPagePatients().map(function (patient) {
              var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
              return (
                <table_1.TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={function () {
                    return onPatientSelect === null || onPatientSelect === void 0
                      ? void 0
                      : onPatientSelect(patient);
                  }}
                >
                  <table_1.TableCell
                    onClick={function (e) {
                      return e.stopPropagation();
                    }}
                  >
                    <checkbox_1.Checkbox
                      checked={selectedPatients.has(patient.id)}
                      onCheckedChange={function (checked) {
                        return handlePatientSelection(patient.id, checked);
                      }}
                    />
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <div className="flex items-center gap-3">
                      <avatar_1.Avatar className="h-8 w-8">
                        <avatar_1.AvatarImage
                          src={
                            ((_a = patient.raw_user_meta_data) === null || _a === void 0
                              ? void 0
                              : _a.profile_picture) ||
                            ((_c =
                              (_b = patient.patient_photos) === null || _b === void 0
                                ? void 0
                                : _b.find(function (p) {
                                    return p.is_primary;
                                  })) === null || _c === void 0
                              ? void 0
                              : _c.photo_url)
                          }
                        />
                        <avatar_1.AvatarFallback>
                          {((_e =
                            (_d = patient.raw_user_meta_data) === null || _d === void 0
                              ? void 0
                              : _d.full_name) === null || _e === void 0
                            ? void 0
                            : _e.charAt(0)) || "P"}
                        </avatar_1.AvatarFallback>
                      </avatar_1.Avatar>
                      <div>
                        <div className="font-medium">
                          {((_f = patient.raw_user_meta_data) === null || _f === void 0
                            ? void 0
                            : _f.full_name) || "Nome não informado"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(
                            (_g = patient.raw_user_meta_data) === null || _g === void 0
                              ? void 0
                              : _g.date_of_birth
                          )
                            ? "".concat(
                                calculateAge(patient.raw_user_meta_data.date_of_birth),
                                " anos",
                              )
                            : "Idade não informada"}
                          {((_h = patient.raw_user_meta_data) === null || _h === void 0
                            ? void 0
                            : _h.gender) && " \u2022 ".concat(patient.raw_user_meta_data.gender)}
                        </div>
                      </div>
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <div className="space-y-1">
                      {patient.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <lucide_react_1.Phone className="h-3 w-3" />
                          {patient.phone}
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <lucide_react_1.Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      )}
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(patient)}
                      {patient.upcoming_appointments > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <lucide_react_1.Calendar className="h-3 w-3" />
                          {patient.upcoming_appointments} agendados
                        </div>
                      )}
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    {((_j = patient.patient_profiles_extended) === null || _j === void 0
                      ? void 0
                      : _j.risk_level) && (
                      <badge_1.Badge
                        className={getRiskColor(patient.patient_profiles_extended.risk_level)}
                        variant="outline"
                      >
                        {patient.patient_profiles_extended.risk_level === "low" && "Baixo"}
                        {patient.patient_profiles_extended.risk_level === "medium" && "Médio"}
                        {patient.patient_profiles_extended.risk_level === "high" && "Alto"}
                        {patient.patient_profiles_extended.risk_level === "critical" && "Crítico"}
                      </badge_1.Badge>
                    )}
                  </table_1.TableCell>
                  <table_1.TableCell>
                    {((_k = patient.patient_profiles_extended) === null || _k === void 0
                      ? void 0
                      : _k.profile_completeness_score) && (
                      <div className="flex items-center gap-2">
                        <progress_1.Progress
                          value={patient.patient_profiles_extended.profile_completeness_score * 100}
                          className="w-16"
                        />
                        <span className="text-sm">
                          {Math.round(
                            patient.patient_profiles_extended.profile_completeness_score * 100,
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </table_1.TableCell>
                  <table_1.TableCell>
                    {patient.last_visit
                      ? <div className="text-sm">
                          {new Date(patient.last_visit).toLocaleDateString("pt-BR")}
                        </div>
                      : <span className="text-sm text-muted-foreground">Nunca</span>}
                  </table_1.TableCell>
                  <table_1.TableCell
                    onClick={function (e) {
                      return e.stopPropagation();
                    }}
                  >
                    <dropdown_menu_1.DropdownMenu>
                      <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                          <lucide_react_1.MoreHorizontal className="h-4 w-4" />
                        </button_1.Button>
                      </dropdown_menu_1.DropdownMenuTrigger>
                      <dropdown_menu_1.DropdownMenuContent align="end">
                        <dropdown_menu_1.DropdownMenuLabel>Ações</dropdown_menu_1.DropdownMenuLabel>
                        <dropdown_menu_1.DropdownMenuItem
                          onClick={function () {
                            return onPatientSelect === null || onPatientSelect === void 0
                              ? void 0
                              : onPatientSelect(patient);
                          }}
                        >
                          <lucide_react_1.Eye className="mr-2 h-4 w-4" />
                          Ver Perfil
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem>
                          <lucide_react_1.Calendar className="mr-2 h-4 w-4" />
                          Agendar Consulta
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuSeparator />
                        <dropdown_menu_1.DropdownMenuItem>
                          <lucide_react_1.Settings className="mr-2 h-4 w-4" />
                          Configurações
                        </dropdown_menu_1.DropdownMenuItem>
                      </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                  </table_1.TableCell>
                </table_1.TableRow>
              );
            })}
          </table_1.TableBody>
        </table_1.Table>
      </div>
    );
  };
  return (
    <card_1.Card className={compact ? "" : "h-full"}>
      <card_1.CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Pacientes
            </card_1.CardTitle>
            <card_1.CardDescription>
              {filteredPatients.length} de {patients.length} pacientes
              {selectedPatients.size > 0 &&
                " \u2022 ".concat(selectedPatients.size, " selecionados")}
            </card_1.CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onPatientCreate && (
              <button_1.Button onClick={onPatientCreate} size="sm">
                <lucide_react_1.UserPlus className="mr-2 h-4 w-4" />
                Novo Paciente
              </button_1.Button>
            )}
            <button_1.Button variant="outline" size="sm" onClick={loadPatients} disabled={loading}>
              <lucide_react_1.RefreshCw
                className={"h-4 w-4 ".concat(loading ? "animate-spin" : "")}
              />
            </button_1.Button>
            <div className="flex items-center border rounded-md">
              <button_1.Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={function () {
                  return setViewMode("table");
                }}
              >
                <lucide_react_1.List className="h-4 w-4" />
              </button_1.Button>
              <button_1.Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={function () {
                  return setViewMode("grid");
                }}
              >
                <lucide_react_1.Grid className="h-4 w-4" />
              </button_1.Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label_1.Label htmlFor="search">Buscar</label_1.Label>
            <div className="flex gap-2">
              <select_1.Select
                value={searchType}
                onValueChange={function (value) {
                  return setSearchType(value);
                }}
              >
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="name">Nome</select_1.SelectItem>
                  <select_1.SelectItem value="phone">Telefone</select_1.SelectItem>
                  <select_1.SelectItem value="email">Email</select_1.SelectItem>
                  <select_1.SelectItem value="cpf">CPF</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
              <input_1.Input
                id="search"
                placeholder={"Buscar por ".concat(
                  searchType === "name" ? "nome" : searchType,
                  "...",
                )}
                value={searchQuery}
                onChange={function (e) {
                  return setSearchQuery(e.target.value);
                }}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label_1.Label htmlFor="risk-filter">Nível de Risco</label_1.Label>
            <select_1.Select value={riskFilter} onValueChange={setRiskFilter}>
              <select_1.SelectTrigger id="risk-filter">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                <select_1.SelectItem value="low">Baixo</select_1.SelectItem>
                <select_1.SelectItem value="medium">Médio</select_1.SelectItem>
                <select_1.SelectItem value="high">Alto</select_1.SelectItem>
                <select_1.SelectItem value="critical">Crítico</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          <div>
            <label_1.Label htmlFor="status-filter">Status</label_1.Label>
            <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
              <select_1.SelectTrigger id="status-filter">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
                <select_1.SelectItem value="inactive">Inativo</select_1.SelectItem>
                <select_1.SelectItem value="new">Novo</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          <div>
            <label_1.Label htmlFor="age-filter">Faixa Etária</label_1.Label>
            <select_1.Select value={ageRangeFilter} onValueChange={setAgeRangeFilter}>
              <select_1.SelectTrigger id="age-filter">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                <select_1.SelectItem value="child">Criança (&lt;18)</select_1.SelectItem>
                <select_1.SelectItem value="adult">Adulto (18-64)</select_1.SelectItem>
                <select_1.SelectItem value="senior">Idoso (65+)</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading
          ? <div className="flex items-center justify-center h-32">
              <lucide_react_1.RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando pacientes...</span>
            </div>
          : filteredPatients.length === 0
            ? <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum paciente encontrado</p>
                <p className="text-sm">Ajuste os filtros ou cadastre um novo paciente</p>
              </div>
            : <>
                {viewMode === "table" && renderTableView()}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages} • {filteredPatients.length} pacientes
                    </div>
                    <div className="flex items-center gap-2">
                      <button_1.Button
                        variant="outline"
                        size="sm"
                        onClick={function () {
                          return setCurrentPage(Math.max(1, currentPage - 1));
                        }}
                        disabled={currentPage <= 1}
                      >
                        <lucide_react_1.ChevronLeft className="h-4 w-4" />
                      </button_1.Button>
                      <span className="text-sm px-2">
                        {currentPage} / {totalPages}
                      </span>
                      <button_1.Button
                        variant="outline"
                        size="sm"
                        onClick={function () {
                          return setCurrentPage(Math.min(totalPages, currentPage + 1));
                        }}
                        disabled={currentPage >= totalPages}
                      >
                        <lucide_react_1.ChevronRight className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                  </div>
                )}
              </>}
      </card_1.CardContent>
    </card_1.Card>
  );
}
