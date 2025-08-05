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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      body,
      _a,
      profile,
      profileError,
      _b,
      bookingResult,
      bookingError,
      response,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, undefined, 7]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _c.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { success: false, error_message: "Unauthorized" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          // Validate required fields
          if (
            !body.patient_id ||
            !body.professional_id ||
            !body.service_type_id ||
            !body.start_time ||
            !body.end_time
          ) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  success: false,
                  error_message: "Dados obrigatórios não fornecidos",
                },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 4:
          (_a = _c.sent()), (profile = _a.data), (profileError = _a.error);
          if (
            profileError ||
            !(profile === null || profile === void 0 ? void 0 : profile.clinic_id)
          ) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  success: false,
                  error_message: "Perfil de usuário não encontrado",
                },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.rpc("book_appointment", {
              p_clinic_id: profile.clinic_id,
              p_patient_id: body.patient_id,
              p_professional_id: body.professional_id,
              p_service_type_id: body.service_type_id,
              p_start_time: body.start_time.toISOString(),
              p_end_time: body.end_time.toISOString(),
              p_notes: body.notes || null,
              p_internal_notes: body.internal_notes || null,
              p_created_by: user.id,
            }),
          ];
        case 5:
          (_b = _c.sent()), (bookingResult = _b.data), (bookingError = _b.error);
          if (bookingError) {
            console.error("Booking error:", bookingError);
            // Check for specific errors
            if (bookingError.message.includes("conflict")) {
              return [
                2 /*return*/,
                server_2.NextResponse.json(
                  {
                    success: false,
                    error_message: "Conflito de horário detectado",
                    error_details: bookingError.message,
                  },
                  { status: 409 },
                ),
              ];
            }
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  success: false,
                  error_message: "Erro ao agendar",
                  error_details: bookingError.message,
                },
                { status: 500 },
              ),
            ];
          }
          if (!bookingResult || !bookingResult.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  success: false,
                  error_message:
                    (bookingResult === null || bookingResult === void 0
                      ? void 0
                      : bookingResult.error_message) || "Erro desconhecido ao agendar",
                },
                { status: 400 },
              ),
            ];
          }
          response = {
            success: true,
            appointment_id: bookingResult.appointment_id,
            message: "Agendamento criado com sucesso",
          };
          return [2 /*return*/, server_2.NextResponse.json(response, { status: 201 })];
        case 6:
          error_1 = _c.sent();
          console.error("API Error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                success: false,
                error_message: "Erro interno do servidor",
              },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      profile,
      searchParams,
      search,
      status_1,
      professional_id,
      service_type_id,
      date_from,
      date_to,
      query,
      endDate,
      _a,
      appointmentsData,
      error,
      appointments,
      searchLower_1,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, undefined, 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _b.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 3:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Clinic not found" }, { status: 400 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          search = searchParams.get("search");
          status_1 = searchParams.get("status");
          professional_id = searchParams.get("professional_id");
          service_type_id = searchParams.get("service_type_id");
          date_from = searchParams.get("date_from");
          date_to = searchParams.get("date_to");
          query = supabase
            .from("appointments")
            .select(
              "\n        id,\n        patient_id,\n        professional_id,\n        service_type_id,\n        status,\n        start_time,\n        end_time,\n        notes,\n        created_at,\n        patients:patient_id (\n          id,\n          full_name,\n          phone,\n          email\n        ),\n        professionals:professional_id (\n          id,\n          full_name,\n          specialization\n        ),\n        service_types:service_type_id (\n          id,\n          name,\n          duration_minutes,\n          price\n        )\n      ",
            )
            .eq("clinic_id", profile.clinic_id);
          // Apply filters
          if (status_1 && status_1 !== "all") {
            query = query.eq("status", status_1);
          }
          if (professional_id) {
            query = query.eq("professional_id", professional_id);
          }
          if (service_type_id) {
            query = query.eq("service_type_id", service_type_id);
          }
          if (date_from) {
            query = query.gte("start_time", date_from);
          }
          if (date_to) {
            endDate = new Date(date_to);
            endDate.setDate(endDate.getDate() + 1);
            query = query.lt("start_time", endDate.toISOString());
          }
          return [4 /*yield*/, query.order("start_time", { ascending: true })];
        case 4:
          (_a = _b.sent()), (appointmentsData = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: error.message }, { status: 500 }),
            ];
          }
          appointments = appointmentsData;
          if (search && appointments) {
            searchLower_1 = search.toLowerCase();
            appointments = appointments.filter((appointment) => {
              var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
              var patientName =
                ((_c =
                  (_b = (_a = appointment.patients) === null || _a === void 0 ? void 0 : _a[0]) ===
                    null || _b === void 0
                    ? void 0
                    : _b.full_name) === null || _c === void 0
                  ? void 0
                  : _c.toLowerCase()) || "";
              var notes =
                ((_d = appointment.notes) === null || _d === void 0 ? void 0 : _d.toLowerCase()) ||
                "";
              var professionalName =
                ((_g =
                  (_f =
                    (_e = appointment.professionals) === null || _e === void 0 ? void 0 : _e[0]) ===
                    null || _f === void 0
                    ? void 0
                    : _f.full_name) === null || _g === void 0
                  ? void 0
                  : _g.toLowerCase()) || "";
              var serviceName =
                ((_k =
                  (_j =
                    (_h = appointment.service_types) === null || _h === void 0 ? void 0 : _h[0]) ===
                    null || _j === void 0
                    ? void 0
                    : _j.name) === null || _k === void 0
                  ? void 0
                  : _k.toLowerCase()) || "";
              return (
                patientName.includes(searchLower_1) ||
                notes.includes(searchLower_1) ||
                professionalName.includes(searchLower_1) ||
                serviceName.includes(searchLower_1)
              );
            });
          }
          return [2 /*return*/, server_2.NextResponse.json(appointments)];
        case 5:
          error_2 = _b.sent();
          console.error("API Error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
