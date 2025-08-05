// ============================================================================
// Session Management System - Database Migration
// NeonPro - Session Management & Security
// ============================================================================
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
exports.SessionMigration = void 0;
exports.runSessionMigration = runSessionMigration;
exports.rollbackSessionMigration = rollbackSessionMigration;
var supabase_js_1 = require("@supabase/supabase-js");
var fs_1 = require("fs");
var path_1 = require("path");
/**
 * Classe para gerenciar migrações do sistema de sessões
 */
var SessionMigration = /** @class */ (() => {
  function SessionMigration(supabase) {
    this.supabase = supabase;
  }
  /**
   * Executa a migração completa do sistema de sessões
   */
  SessionMigration.prototype.runMigration = function () {
    return __awaiter(this, void 0, void 0, function () {
      var tablesExist, migrationSuccess, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            console.log("🚀 Starting session system migration...");
            return [4 /*yield*/, this.checkTablesExist()];
          case 1:
            tablesExist = _a.sent();
            if (tablesExist) {
              console.log("⚠️ Session tables already exist. Skipping migration.");
              return [2 /*return*/, { success: true }];
            }
            // 2. Executar o schema SQL
            return [4 /*yield*/, this.executeSchema()];
          case 2:
            // 2. Executar o schema SQL
            _a.sent();
            return [4 /*yield*/, this.verifyMigration()];
          case 3:
            migrationSuccess = _a.sent();
            if (!migrationSuccess) {
              throw new Error("Migration verification failed");
            }
            console.log("✅ Session system migration completed successfully!");
            return [2 /*return*/, { success: true }];
          case 4:
            error_1 = _a.sent();
            console.error("❌ Migration failed:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verifica se as tabelas do sistema de sessões já existem
   */
  SessionMigration.prototype.checkTablesExist = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("information_schema.tables")
                .select("table_name")
                .eq("table_schema", "public")
                .in("table_name", [
                  "user_sessions",
                  "device_registrations",
                  "session_audit_logs",
                  "security_events",
                  "ip_blacklist",
                  "session_policies",
                ]),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.log("Could not check existing tables, proceeding with migration");
              return [2 /*return*/, false];
            }
            return [2 /*return*/, data && data.length > 0];
          case 2:
            error_2 = _b.sent();
            console.log("Could not check existing tables, proceeding with migration");
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa o schema SQL
   */
  SessionMigration.prototype.executeSchema = function () {
    return __awaiter(this, void 0, void 0, function () {
      var schemaPath, schemaSQL, commands, i, command, error, directError, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            schemaPath = path_1.default.join(__dirname, "schema.sql");
            schemaSQL = fs_1.default.readFileSync(schemaPath, "utf8");
            commands = schemaSQL
              .split(";")
              .map((cmd) => cmd.trim())
              .filter((cmd) => cmd.length > 0 && !cmd.startsWith("--"));
            console.log("\uD83D\uDCDD Executing ".concat(commands.length, " SQL commands..."));
            i = 0;
            _a.label = 1;
          case 1:
            if (!(i < commands.length)) return [3 /*break*/, 8];
            command = commands[i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 6, , 7]);
            console.log(
              "\u23F3 Executing command ".concat(i + 1, "/").concat(commands.length, "..."),
            );
            return [
              4 /*yield*/,
              this.supabase.rpc("exec_sql", {
                sql_query: command,
              }),
            ];
          case 3:
            error = _a.sent().error;
            if (!error) return [3 /*break*/, 5];
            return [4 /*yield*/, this.supabase.from("_temp_migration").select("*").limit(0)];
          case 4:
            directError = _a.sent().error;
            if (directError) {
              console.log("\u26A0\uFE0F Command ".concat(i + 1, " failed, but continuing..."));
            }
            _a.label = 5;
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_3 = _a.sent();
            console.log("\u26A0\uFE0F Command ".concat(i + 1, " failed:"), error_3);
            return [3 /*break*/, 7];
          case 7:
            i++;
            return [3 /*break*/, 1];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verifica se a migração foi bem-sucedida
   */
  SessionMigration.prototype.verifyMigration = function () {
    return __awaiter(this, void 0, void 0, function () {
      var tables, _i, tables_1, table, error, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            tables = [
              "user_sessions",
              "device_registrations",
              "session_audit_logs",
              "security_events",
              "ip_blacklist",
              "session_policies",
            ];
            (_i = 0), (tables_1 = tables);
            _a.label = 1;
          case 1:
            if (!(_i < tables_1.length)) return [3 /*break*/, 4];
            table = tables_1[_i];
            return [4 /*yield*/, this.supabase.from(table).select("*").limit(0)];
          case 2:
            error = _a.sent().error;
            if (error) {
              console.error("\u274C Table ".concat(table, " verification failed:"), error);
              return [2 /*return*/, false];
            }
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            console.log("✅ All tables verified successfully");
            return [2 /*return*/, true];
          case 5:
            error_4 = _a.sent();
            console.error("❌ Migration verification failed:", error_4);
            return [2 /*return*/, false];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa rollback da migração (remove todas as tabelas)
   */
  SessionMigration.prototype.rollback = function () {
    return __awaiter(this, void 0, void 0, function () {
      var tables, _i, _a, table, error, error_5, enums, _b, enums_1, enumType, error_6, error_7;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 13, , 14]);
            console.log("🔄 Starting session system rollback...");
            tables = [
              "user_sessions",
              "device_registrations",
              "session_audit_logs",
              "security_events",
              "ip_blacklist",
              "session_policies",
            ];
            (_i = 0), (_a = tables.reverse());
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            table = _a[_i];
            _c.label = 2;
          case 2:
            _c.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase.rpc("exec_sql", {
                sql_query: "DROP TABLE IF EXISTS ".concat(table, " CASCADE"),
              }),
            ];
          case 3:
            error = _c.sent().error;
            if (error) {
              console.log("\u26A0\uFE0F Could not drop table ".concat(table, ":"), error);
            } else {
              console.log("\uD83D\uDDD1\uFE0F Dropped table ".concat(table));
            }
            return [3 /*break*/, 5];
          case 4:
            error_5 = _c.sent();
            console.log("\u26A0\uFE0F Could not drop table ".concat(table, ":"), error_5);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            enums = [
              "session_status",
              "device_status",
              "audit_event_type",
              "security_event_type",
              "threat_level",
            ];
            (_b = 0), (enums_1 = enums);
            _c.label = 7;
          case 7:
            if (!(_b < enums_1.length)) return [3 /*break*/, 12];
            enumType = enums_1[_b];
            _c.label = 8;
          case 8:
            _c.trys.push([8, 10, , 11]);
            return [
              4 /*yield*/,
              this.supabase.rpc("exec_sql", {
                sql_query: "DROP TYPE IF EXISTS ".concat(enumType, " CASCADE"),
              }),
            ];
          case 9:
            _c.sent();
            console.log("\uD83D\uDDD1\uFE0F Dropped enum ".concat(enumType));
            return [3 /*break*/, 11];
          case 10:
            error_6 = _c.sent();
            console.log("\u26A0\uFE0F Could not drop enum ".concat(enumType, ":"), error_6);
            return [3 /*break*/, 11];
          case 11:
            _b++;
            return [3 /*break*/, 7];
          case 12:
            console.log("✅ Session system rollback completed!");
            return [2 /*return*/, { success: true }];
          case 13:
            error_7 = _c.sent();
            console.error("❌ Rollback failed:", error_7);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_7 instanceof Error ? error_7.message : "Unknown error",
              },
            ];
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verifica o status atual da migração
   */
  SessionMigration.prototype.getStatus = function () {
    return __awaiter(this, void 0, void 0, function () {
      var tables, tableStatus, allExist, _i, tables_2, table, error, exists, error_8, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            tables = [
              "user_sessions",
              "device_registrations",
              "session_audit_logs",
              "security_events",
              "ip_blacklist",
              "session_policies",
            ];
            tableStatus = [];
            allExist = true;
            (_i = 0), (tables_2 = tables);
            _a.label = 1;
          case 1:
            if (!(_i < tables_2.length)) return [3 /*break*/, 6];
            table = tables_2[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.supabase.from(table).select("*").limit(0)];
          case 3:
            error = _a.sent().error;
            exists = !error;
            tableStatus.push({ name: table, exists: exists });
            if (!exists) {
              allExist = false;
            }
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            tableStatus.push({ name: table, exists: false });
            allExist = false;
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [
              2 /*return*/,
              {
                migrated: allExist,
                tables: tableStatus,
              },
            ];
          case 7:
            error_9 = _a.sent();
            return [
              2 /*return*/,
              {
                migrated: false,
                tables: [],
                error: error_9 instanceof Error ? error_9.message : "Unknown error",
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  return SessionMigration;
})();
exports.SessionMigration = SessionMigration;
/**
 * Função utilitária para executar migração
 */
function runSessionMigration(supabaseUrl, supabaseKey) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, migration;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
          migration = new SessionMigration(supabase);
          return [4 /*yield*/, migration.runMigration()];
        case 1:
          return [2 /*return*/, _a.sent()];
      }
    });
  });
}
/**
 * Função utilitária para rollback
 */
function rollbackSessionMigration(supabaseUrl, supabaseKey) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, migration;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
          migration = new SessionMigration(supabase);
          return [4 /*yield*/, migration.rollback()];
        case 1:
          return [2 /*return*/, _a.sent()];
      }
    });
  });
}
/**
 * Script CLI para executar migração
 */
if (require.main === module) {
  var command = process.argv[2];
  var supabaseUrl = process.env.SUPABASE_URL;
  var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables");
    process.exit(1);
  }
  var migration = new SessionMigration((0, supabase_js_1.createClient)(supabaseUrl, supabaseKey));
  switch (command) {
    case "migrate":
      migration.runMigration().then((result) => {
        if (result.success) {
          console.log("✅ Migration completed successfully!");
          process.exit(0);
        } else {
          console.error("❌ Migration failed:", result.error);
          process.exit(1);
        }
      });
      break;
    case "rollback":
      migration.rollback().then((result) => {
        if (result.success) {
          console.log("✅ Rollback completed successfully!");
          process.exit(0);
        } else {
          console.error("❌ Rollback failed:", result.error);
          process.exit(1);
        }
      });
      break;
    case "status":
      migration.getStatus().then((status) => {
        console.log("📊 Migration Status:");
        console.log("Migrated: ".concat(status.migrated ? "✅" : "❌"));
        console.log("\nTables:");
        status.tables.forEach((table) => {
          console.log("  ".concat(table.name, ": ").concat(table.exists ? "✅" : "❌"));
        });
        if (status.error) {
          console.error("Error:", status.error);
        }
        process.exit(0);
      });
      break;
    default:
      console.log("Usage: node migration.js [migrate|rollback|status]");
      process.exit(1);
  }
}
exports.default = SessionMigration;
