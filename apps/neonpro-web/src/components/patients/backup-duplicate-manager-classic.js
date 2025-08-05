"use client";
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
exports.default = DuplicateManagerClassic;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function DuplicateManagerClassic(_a) {
  var duplicates = _a.duplicates,
    onMerge = _a.onMerge,
    onDismiss = _a.onDismiss;
  // Using React.useState with tuple access instead of destructuring
  var selectedGroupState = react_1.default.useState(null);
  var selectedGroup = selectedGroupState[0];
  var setSelectedGroup = selectedGroupState[1];
  var selectedPrimaryState = react_1.default.useState("");
  var selectedPrimary = selectedPrimaryState[0];
  var setSelectedPrimary = selectedPrimaryState[1];
  var processingState = react_1.default.useState(false);
  var processing = processingState[0];
  var setProcessing = processingState[1];
  var handleMerge = react_1.default.useCallback(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var group, secondaryIds;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!selectedGroup || !selectedPrimary) return [2 /*return*/];
              setProcessing(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, , 4, 5]);
              group = duplicates.find((g) => g.id === selectedGroup);
              if (!group) return [3 /*break*/, 3];
              secondaryIds = group.patients
                .filter((p) => p.id !== selectedPrimary)
                .map((p) => p.id);
              return [4 /*yield*/, onMerge(selectedGroup, selectedPrimary, secondaryIds)];
            case 2:
              _a.sent();
              setSelectedGroup(null);
              setSelectedPrimary("");
              _a.label = 3;
            case 3:
              return [3 /*break*/, 5];
            case 4:
              setProcessing(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [selectedGroup, selectedPrimary, duplicates, onMerge],
  );
  if (duplicates.length === 0) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6 text-center">
          <lucide_react_1.Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No duplicates found</h3>
          <p className="text-gray-500">Great! Your patient records are clean.</p>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <lucide_react_1.AlertTriangle className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold">
          Found {duplicates.length} potential duplicate
          {duplicates.length > 1 ? "s" : ""}
        </h2>
      </div>

      {duplicates.map((group) => (
        <card_1.Card key={group.id} className="border-amber-200">
          <card_1.CardHeader>
            <div className="flex items-center justify-between">
              <card_1.CardTitle className="text-base">Potential Duplicate Group</card_1.CardTitle>
              <badge_1.Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {Math.round(group.confidence * 100)}% confidence
              </badge_1.Badge>
            </div>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.patients.map((patient) => (
                <div
                  key={patient.id}
                  className={"p-4 border rounded-lg cursor-pointer transition-colors ".concat(
                    selectedPrimary === patient.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                  onClick={() => setSelectedPrimary(patient.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{patient.name}</h4>
                    {group.suggestedPrimary === patient.id && (
                      <badge_1.Badge variant="default" className="text-xs">
                        Suggested Primary
                      </badge_1.Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Birth Date: {patient.birthDate}</p>
                    {patient.email && <p>Email: {patient.email}</p>}
                    {patient.phone && <p>Phone: {patient.phone}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button_1.Button
                variant="outline"
                onClick={() => onDismiss(group.id)}
                disabled={processing}
              >
                Not a duplicate
              </button_1.Button>

              <div className="flex items-center gap-2">
                {selectedPrimary && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <lucide_react_1.ArrowRight className="h-4 w-4" />
                    <span>Merge into selected record</span>
                  </div>
                )}
                <button_1.Button
                  onClick={() => {
                    setSelectedGroup(group.id);
                    handleMerge();
                  }}
                  disabled={!selectedPrimary || processing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? "Merging..." : "Merge Records"}
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      ))}
    </div>
  );
}
