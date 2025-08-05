// NFe Individual Document API Endpoint
// Story 5.5: Get, update, and delete individual NFe documents
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
exports.GET = GET;
exports.PATCH = PATCH;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      session,
      authError,
      id,
      _d,
      nfeDocument,
      fetchError,
      _e,
      clinic,
      clinicError,
      error_1;
    var params = _b.params;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 4, , 5]);
          supabase = (0, server_2.createClient)();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          (_c = _f.sent()), (session = _c.data.session), (authError = _c.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          id = params.id;
          return [4 /*yield*/, supabase.from("nfe_documents").select("*").eq("id", id).single()];
        case 2:
          (_d = _f.sent()), (nfeDocument = _d.data), (fetchError = _d.error);
          if (fetchError || !nfeDocument) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFe document not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id, name").eq("id", nfeDocument.clinic_id).single(),
          ];
        case 3:
          (_e = _f.sent()), (clinic = _e.data), (clinicError = _e.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: nfeDocument,
            }),
          ];
        case 4:
          error_1 = _f.sent();
          console.error("NFe fetch error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function PATCH(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      session,
      authError,
      id,
      body,
      _d,
      existingNfe,
      fetchError,
      _e,
      clinic,
      clinicError,
      _f,
      updatedNfe,
      updateError,
      error_2;
    var params = _b.params;
    return __generator(this, (_g) => {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 6, , 7]);
          supabase = (0, server_2.createClient)();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          (_c = _g.sent()), (session = _c.data.session), (authError = _c.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          id = params.id;
          return [4 /*yield*/, request.json()];
        case 2:
          body = _g.sent();
          return [4 /*yield*/, supabase.from("nfe_documents").select("*").eq("id", id).single()];
        case 3:
          (_d = _g.sent()), (existingNfe = _d.data), (fetchError = _d.error);
          if (fetchError || !existingNfe) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFe document not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id, name").eq("id", existingNfe.clinic_id).single(),
          ];
        case 4:
          (_e = _g.sent()), (clinic = _e.data), (clinicError = _e.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("nfe_documents")
              .update(__assign(__assign({}, body), { updated_at: new Date().toISOString() }))
              .eq("id", id)
              .select()
              .single(),
          ];
        case 5:
          (_f = _g.sent()), (updatedNfe = _f.data), (updateError = _f.error);
          if (updateError) {
            console.error("Error updating NFe document:", updateError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to update NFe document" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedNfe,
            }),
          ];
        case 6:
          error_2 = _g.sent();
          console.error("NFe update error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      session,
      authError,
      id,
      _d,
      existingNfe,
      fetchError,
      _e,
      clinic,
      clinicError,
      deleteError,
      error_3;
    var params = _b.params;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 5, , 6]);
          supabase = (0, server_2.createClient)();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          (_c = _f.sent()), (session = _c.data.session), (authError = _c.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          id = params.id;
          return [4 /*yield*/, supabase.from("nfe_documents").select("*").eq("id", id).single()];
        case 2:
          (_d = _f.sent()), (existingNfe = _d.data), (fetchError = _d.error);
          if (fetchError || !existingNfe) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFe document not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id, name").eq("id", existingNfe.clinic_id).single(),
          ];
        case 3:
          (_e = _f.sent()), (clinic = _e.data), (clinicError = _e.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          // Check if NFe can be deleted (only draft status can be deleted)
          if (existingNfe.status !== "draft") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Only draft NFe documents can be deleted" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.from("nfe_documents").delete().eq("id", id)];
        case 4:
          deleteError = _f.sent().error;
          if (deleteError) {
            console.error("Error deleting NFe document:", deleteError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to delete NFe document" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "NFe document deleted successfully",
            }),
          ];
        case 5:
          error_3 = _f.sent();
          console.error("NFe delete error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
