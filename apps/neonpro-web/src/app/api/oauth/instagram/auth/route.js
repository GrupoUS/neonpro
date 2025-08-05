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
exports.GET = GET;
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var instagram_handler_1 = require("@/lib/oauth/platforms/instagram-handler");
var token_encryption_1 = require("@/lib/oauth/token-encryption");
/**
 * Instagram OAuth Authentication Initiation Endpoint
 * Initiates the OAuth flow by redirecting users to Instagram authorization
 * Research-backed implementation following Meta Graph API best practices
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      user,
      searchParams,
      redirectTo,
      profile,
      state,
      instagramHandler,
      authUrl,
      error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          user = session.user;
          searchParams = request.nextUrl.searchParams;
          redirectTo = searchParams.get("redirect_to") || "/dashboard/social-media";
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 3:
          profile = _a.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "User clinic context not found" },
                { status: 400 },
              ),
            ];
          }
          state = {
            userId: user.id,
            clinicId: profile.clinic_id,
            platform: "instagram",
            nonce: token_encryption_1.TokenEncryptionService.generateSecureState(),
            createdAt: new Date(),
            redirectTo: redirectTo,
          };
          instagramHandler = new instagram_handler_1.InstagramOAuthHandler();
          authUrl = instagramHandler.getAuthorizationUrl(state);
          // Return authorization URL for client-side redirect
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              authUrl: authUrl,
              state: state.nonce,
            }),
          ];
        case 4:
          error_1 = _a.sent();
          console.error("Instagram OAuth initiation error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to initiate Instagram authentication",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle preflight OPTIONS requests for CORS
 */
function OPTIONS() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        new server_1.NextResponse(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }),
      ];
    });
  });
}
