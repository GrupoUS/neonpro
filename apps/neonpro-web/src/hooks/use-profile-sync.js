// hooks/use-profile-sync.ts
// VIBECODE V1.0 - Professional OAuth Profile Synchronization Hook
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-22
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProfileSync = useProfileSync;
var client_1 = require("@/lib/supabase/client");
var auth_context_1 = require("@/contexts/auth-context");
var react_1 = require("react");
var sonner_1 = require("sonner");
function useProfileSync() {
  var _this = this;
  var _a = (0, auth_context_1.useAuth)(),
    user = _a.user,
    session = _a.session,
    getValidSession = _a.getValidSession;
  var _b = (0, react_1.useState)(null),
    profile = _b[0],
    setProfile = _b[1];
  var _c = (0, react_1.useState)(null),
    syncStatus = _c[0],
    setSyncStatus = _c[1];
  var _d = (0, react_1.useState)(true),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(false),
    isUpdating = _e[0],
    setIsUpdating = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  var _g = (0, react_1.useState)(null),
    supabase = _g[0],
    setSupabase = _g[1];
  // Initialize Supabase client
  (0, react_1.useEffect)(function () {
    var initSupabase = function () {
      return __awaiter(_this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, (0, client_1.createClient)()];
            case 1:
              client = _a.sent();
              setSupabase(client);
              return [2 /*return*/];
          }
        });
      });
    };
    initSupabase();
  }, []);
  // Fetch user profile from database
  var fetchProfile = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error_1, err_1;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!(user === null || user === void 0 ? void 0 : user.id) || !supabase)
                return [2 /*return*/, null];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                supabase.from("profiles").select("*").eq("id", user.id).single(),
              ];
            case 2:
              (_a = _b.sent()), (data = _a.data), (error_1 = _a.error);
              if (error_1) {
                console.error("❌ Error fetching profile:", error_1);
                setError("Erro ao carregar perfil: ".concat(error_1.message));
                return [2 /*return*/, null];
              }
              console.log("✅ Profile fetched successfully:", data.email);
              setError(null);
              return [2 /*return*/, data];
            case 3:
              err_1 = _b.sent();
              console.error("❌ Unexpected error fetching profile:", err_1);
              setError("Erro inesperado ao carregar perfil");
              return [2 /*return*/, null];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [user === null || user === void 0 ? void 0 : user.id, supabase],
  );
  // Fetch profile sync status
  var fetchSyncStatus = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error_2, err_2;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!(user === null || user === void 0 ? void 0 : user.id))
                return [2 /*return*/, null];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, , 4]);
              return [4 /*yield*/, supabase.rpc("get_profile_sync_status", { user_id: user.id })];
            case 2:
              (_a = _b.sent()), (data = _a.data), (error_2 = _a.error);
              if (error_2) {
                console.error("❌ Error fetching sync status:", error_2);
                return [2 /*return*/, null];
              }
              return [2 /*return*/, data];
            case 3:
              err_2 = _b.sent();
              console.error("❌ Unexpected error fetching sync status:", err_2);
              return [2 /*return*/, null];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [user === null || user === void 0 ? void 0 : user.id, supabase],
  );
  // Refresh profile data
  var refreshProfile = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, profileData, statusData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              setIsLoading(true);
              _b.label = 1;
            case 1:
              _b.trys.push([1, , 3, 4]);
              return [4 /*yield*/, Promise.all([fetchProfile(), fetchSyncStatus()])];
            case 2:
              (_a = _b.sent()), (profileData = _a[0]), (statusData = _a[1]);
              setProfile(profileData);
              setSyncStatus(statusData);
              return [3 /*break*/, 4];
            case 3:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchProfile, fetchSyncStatus],
  );
  // Update profile data
  var updateProfile = (0, react_1.useCallback)(
    function (updates) {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, validSession, sessionError, error_3, err_3;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!(user === null || user === void 0 ? void 0 : user.id)) {
                setError("Usuário não autenticado");
                return [2 /*return*/, false];
              }
              setIsUpdating(true);
              setError(null);
              _b.label = 1;
            case 1:
              _b.trys.push([1, 5, 6, 7]);
              return [4 /*yield*/, getValidSession()];
            case 2:
              (_a = _b.sent()), (validSession = _a.session), (sessionError = _a.error);
              if (sessionError || !validSession) {
                setError("Sessão inválida. Faça login novamente.");
                return [2 /*return*/, false];
              }
              return [
                4 /*yield*/,
                supabase
                  .from("profiles")
                  .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                  .eq("id", user.id),
              ];
            case 3:
              error_3 = _b.sent().error;
              if (error_3) {
                console.error("❌ Error updating profile:", error_3);
                setError("Erro ao atualizar perfil: ".concat(error_3.message));
                return [2 /*return*/, false];
              }
              // Refresh profile after update
              return [4 /*yield*/, refreshProfile()];
            case 4:
              // Refresh profile after update
              _b.sent();
              sonner_1.toast.success("Perfil atualizado com sucesso!");
              console.log("✅ Profile updated successfully");
              return [2 /*return*/, true];
            case 5:
              err_3 = _b.sent();
              console.error("❌ Unexpected error updating profile:", err_3);
              setError("Erro inesperado ao atualizar perfil");
              return [2 /*return*/, false];
            case 6:
              setIsUpdating(false);
              return [7 /*endfinally*/];
            case 7:
              return [2 /*return*/];
          }
        });
      });
    },
    [
      user === null || user === void 0 ? void 0 : user.id,
      getValidSession,
      supabase,
      refreshProfile,
    ],
  );
  // Sync profile with Google data
  var syncWithGoogle = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_4, err_4;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!(user === null || user === void 0 ? void 0 : user.id) || !session) {
                setError("Usuário não autenticado");
                return [2 /*return*/, false];
              }
              setIsUpdating(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              console.log("🔄 Syncing profile with Google data...");
              return [
                4 /*yield*/,
                supabase.rpc("sync_google_profile_data", {
                  user_id: user.id,
                  raw_user_metadata: user.user_metadata || {},
                }),
              ];
            case 2:
              error_4 = _a.sent().error;
              if (error_4) {
                console.error("❌ Error syncing with Google:", error_4);
                setError("Erro na sincroniza\u00E7\u00E3o: ".concat(error_4.message));
                return [2 /*return*/, false];
              }
              // Refresh profile after sync
              return [4 /*yield*/, refreshProfile()];
            case 3:
              // Refresh profile after sync
              _a.sent();
              sonner_1.toast.success("Perfil sincronizado com Google!");
              console.log("✅ Profile synced with Google successfully");
              return [2 /*return*/, true];
            case 4:
              err_4 = _a.sent();
              console.error("❌ Unexpected error syncing with Google:", err_4);
              setError("Erro inesperado na sincronização");
              return [2 /*return*/, false];
            case 5:
              setIsUpdating(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [user, session, supabase, refreshProfile],
  );
  // Resolve profile conflicts
  var resolveConflict = (0, react_1.useCallback)(
    function (resolutionData) {
      return __awaiter(_this, void 0, void 0, function () {
        var error_5, err_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!(user === null || user === void 0 ? void 0 : user.id)) {
                setError("Usuário não autenticado");
                return [2 /*return*/, false];
              }
              setIsUpdating(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              console.log("🔧 Resolving profile conflict...");
              return [
                4 /*yield*/,
                supabase.rpc("resolve_profile_conflict", {
                  user_id: user.id,
                  resolution_data: resolutionData,
                  keep_google_data: true,
                }),
              ];
            case 2:
              error_5 = _a.sent().error;
              if (error_5) {
                console.error("❌ Error resolving conflict:", error_5);
                setError("Erro ao resolver conflito: ".concat(error_5.message));
                return [2 /*return*/, false];
              }
              // Refresh profile after resolution
              return [4 /*yield*/, refreshProfile()];
            case 3:
              // Refresh profile after resolution
              _a.sent();
              sonner_1.toast.success("Conflito resolvido com sucesso!");
              console.log("✅ Profile conflict resolved successfully");
              return [2 /*return*/, true];
            case 4:
              err_5 = _a.sent();
              console.error("❌ Unexpected error resolving conflict:", err_5);
              setError("Erro inesperado ao resolver conflito");
              return [2 /*return*/, false];
            case 5:
              setIsUpdating(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [user === null || user === void 0 ? void 0 : user.id, supabase, refreshProfile],
  );
  // Toggle Google sync
  var toggleGoogleSync = (0, react_1.useCallback)(
    function (enabled) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!(user === null || user === void 0 ? void 0 : user.id)) {
                setError("Usuário não autenticado");
                return [2 /*return*/, false];
              }
              return [4 /*yield*/, updateProfile({ google_sync_enabled: enabled })];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      });
    },
    [user === null || user === void 0 ? void 0 : user.id, updateProfile],
  );
  // Load profile on mount and user change
  (0, react_1.useEffect)(
    function () {
      if (user === null || user === void 0 ? void 0 : user.id) {
        refreshProfile();
      } else {
        setProfile(null);
        setSyncStatus(null);
        setIsLoading(false);
      }
    },
    [user === null || user === void 0 ? void 0 : user.id, refreshProfile],
  );
  // Setup real-time subscription for profile changes
  (0, react_1.useEffect)(
    function () {
      if (!(user === null || user === void 0 ? void 0 : user.id)) return;
      console.log("📡 Setting up real-time profile subscription");
      var subscription = supabase
        .channel("profile-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: "id=eq.".concat(user.id),
          },
          function (payload) {
            console.log("📡 Profile changed:", payload);
            if (payload.eventType === "UPDATE") {
              setProfile(payload.new);
              sonner_1.toast.info("Perfil atualizado automaticamente");
            }
          },
        )
        .subscribe();
      return function () {
        console.log("📡 Cleaning up profile subscription");
        subscription.unsubscribe();
      };
    },
    [user === null || user === void 0 ? void 0 : user.id, supabase],
  );
  return {
    profile: profile,
    syncStatus: syncStatus,
    isLoading: isLoading,
    isUpdating: isUpdating,
    error: error,
    refreshProfile: refreshProfile,
    updateProfile: updateProfile,
    syncWithGoogle: syncWithGoogle,
    resolveConflict: resolveConflict,
    toggleGoogleSync: toggleGoogleSync,
  };
}
