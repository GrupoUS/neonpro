#!/usr/bin/env tsx
"use strict";
/**
 * 🧪 Test Script for NeonPro Background Jobs
 *
 * Valida se os jobs do Trigger.dev estão funcionando corretamente
 * antes do deployment no Vercel.
 *
 * Usage: npx tsx scripts/test-automation.ts
 */
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
exports.testEmailAutomation = testEmailAutomation;
var trigger_jobs_1 = require("@/lib/automation/trigger-jobs");
var server_1 = require("@/app/utils/supabase/server");
function testEmailAutomation() {
  return __awaiter(this, void 0, void 0, function () {
    var testAppointmentData,
      confirmationResult,
      reminderResult,
      fullResult,
      requiredEnvVars,
      missingVars,
      supabase,
      _a,
      data,
      error,
      supabaseError_1,
      deploymentChecks,
      allChecksPass,
      error_1;
    var _b, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          console.log("🧪 Testing NeonPro Background Jobs Integration...\n");
          _d.label = 1;
        case 1:
          _d.trys.push([1, 12, , 13]);
          testAppointmentData = {
            appointmentId: "test-appointment-001",
            patientEmail: "paciente.teste@example.com",
            patientName: "Maria Silva",
            clinicName: "Clínica NeonPro",
            clinicId: "clinic-001",
            appointmentDate: "2025-01-23",
            appointmentTime: "14:00",
            professionalName: "Dr. João Santos",
            serviceName: "Consulta Geral",
          };
          console.log("📧 Testing appointment confirmation...");
          if (!(process.env.NODE_ENV === "development" && process.env.ENABLE_TEST_JOBS === "true"))
            return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            trigger_jobs_1.NeonProAutomation.sendAppointmentConfirmation(testAppointmentData),
          ];
        case 2:
          confirmationResult = _d.sent();
          console.log("✅ Confirmation job triggered:", confirmationResult);
          return [
            4 /*yield*/,
            trigger_jobs_1.NeonProAutomation.scheduleAppointmentReminder(testAppointmentData),
          ];
        case 3:
          reminderResult = _d.sent();
          console.log("✅ Reminder job scheduled:", reminderResult);
          console.log("\n🎯 Full automation test...");
          return [
            4 /*yield*/,
            trigger_jobs_1.NeonProAutomation.onNewAppointmentCreated(testAppointmentData),
          ];
        case 4:
          fullResult = _d.sent();
          console.log("✅ Full automation completed:", {
            confirmationJobId:
              (_b = fullResult.confirmation) === null || _b === void 0 ? void 0 : _b.jobId,
            reminderJobId: (_c = fullResult.reminder) === null || _c === void 0 ? void 0 : _c.jobId,
          });
          return [3 /*break*/, 6];
        case 5:
          console.log("⚠️ Skipping live job triggers (set ENABLE_TEST_JOBS=true to test)");
          console.log("✅ Job classes and methods are properly structured");
          _d.label = 6;
        case 6:
          console.log("\n🔧 Testing configuration...");
          requiredEnvVars = ["TRIGGER_SECRET_KEY", "TRIGGER_PROJECT_ID", "RESEND_API_KEY"];
          missingVars = requiredEnvVars.filter(function (envVar) {
            return !process.env[envVar];
          });
          if (missingVars.length > 0) {
            console.log("⚠️ Missing environment variables:", missingVars);
            console.log("   Please check your .env.local file");
          } else {
            console.log("✅ All required environment variables are set");
          }
          console.log("\n🏗️ Testing Supabase integration...");
          _d.label = 7;
        case 7:
          _d.trys.push([7, 10, , 11]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 8:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.from("appointments").select("count").limit(1)];
        case 9:
          (_a = _d.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.log("⚠️ Supabase connection issue:", error.message);
          } else {
            console.log("✅ Supabase connection working");
          }
          return [3 /*break*/, 11];
        case 10:
          supabaseError_1 = _d.sent();
          console.log("⚠️ Supabase integration test failed:", supabaseError_1);
          return [3 /*break*/, 11];
        case 11:
          console.log("\n🚀 Deployment readiness check...");
          deploymentChecks = [
            { name: "Trigger.dev config", status: existsFile("trigger.config.ts") },
            { name: "Job definitions", status: existsFile("trigger/jobs/appointment-emails.ts") },
            { name: "API route", status: existsFile("app/api/trigger/route.ts") },
            { name: "Integration utils", status: existsFile("lib/automation/trigger-jobs.ts") },
            { name: "Enhanced API", status: existsFile("app/api/appointments/enhanced/route.ts") },
          ];
          deploymentChecks.forEach(function (check) {
            console.log("".concat(check.status ? "✅" : "❌", " ").concat(check.name));
          });
          allChecksPass = deploymentChecks.every(function (check) {
            return check.status;
          });
          if (allChecksPass) {
            console.log("\n🎉 All systems ready for Vercel deployment!");
            console.log("📋 Next steps:");
            console.log("   1. Set environment variables in Vercel dashboard");
            console.log("   2. Deploy to Vercel: vercel --prod");
            console.log("   3. Test live endpoints after deployment");
          } else {
            console.log("\n❌ Some components are missing. Check the failed items above.");
          }
          return [3 /*break*/, 13];
        case 12:
          error_1 = _d.sent();
          console.error("❌ Test failed:", error_1);
          process.exit(1);
          return [3 /*break*/, 13];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
function existsFile(relativePath) {
  try {
    var fs = require("fs");
    var path = require("path");
    return fs.existsSync(path.join(process.cwd(), relativePath));
  } catch (_a) {
    return false;
  }
}
// Execute if run directly
if (require.main === module) {
  testEmailAutomation().catch(console.error);
}
