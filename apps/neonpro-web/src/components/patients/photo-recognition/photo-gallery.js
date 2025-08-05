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
exports.PhotoGallery = PhotoGallery;
/**
 * Patient Photo Gallery Component
 * Displays patient photos with privacy controls and management features
 *
 * @author APEX Master Developer
 */
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var label_1 = require("@/components/ui/label");
var use_toast_1 = require("@/components/ui/use-toast");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var PHOTO_TYPE_LABELS = {
  profile: "Perfil",
  before: "Antes",
  after: "Depois",
  progress: "Progresso",
  document: "Documento",
  other: "Outro",
};
var PHOTO_TYPE_COLORS = {
  profile: "bg-blue-100 text-blue-800",
  before: "bg-orange-100 text-orange-800",
  after: "bg-green-100 text-green-800",
  progress: "bg-purple-100 text-purple-800",
  document: "bg-gray-100 text-gray-800",
  other: "bg-yellow-100 text-yellow-800",
};
function PhotoGallery(_a) {
  var _this = this;
  var _b;
  var patientId = _a.patientId,
    patientName = _a.patientName,
    onPhotoDeleted = _a.onPhotoDeleted,
    _c = _a.allowDelete,
    allowDelete = _c === void 0 ? true : _c,
    _d = _a.allowDownload,
    allowDownload = _d === void 0 ? true : _d;
  var _e = (0, react_1.useState)([]),
    photos = _e[0],
    setPhotos = _e[1];
  var _f = (0, react_1.useState)(null),
    privacyControls = _f[0],
    setPrivacyControls = _f[1];
  var _g = (0, react_1.useState)(true),
    isLoading = _g[0],
    setIsLoading = _g[1];
  var _h = (0, react_1.useState)("all"),
    selectedPhotoType = _h[0],
    setSelectedPhotoType = _h[1];
  var _j = (0, react_1.useState)("grid"),
    viewMode = _j[0],
    setViewMode = _j[1];
  var _k = (0, react_1.useState)(null),
    selectedPhoto = _k[0],
    setSelectedPhoto = _k[1];
  var _l = (0, react_1.useState)(false),
    showPrivacyDialog = _l[0],
    setShowPrivacyDialog = _l[1];
  var toast = (0, use_toast_1.useToast)().toast;
  (0, react_1.useEffect)(
    function () {
      loadPhotos();
      loadPrivacyControls();
    },
    [patientId],
  );
  var loadPhotos = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, result, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            return [
              4 /*yield*/,
              fetch(
                "/api/patients/photos/upload?patientId="
                  .concat(patientId)
                  .concat(
                    selectedPhotoType !== "all" ? "&photoType=".concat(selectedPhotoType) : "",
                  ),
                {
                  headers: {
                    Authorization: "Bearer ".concat(localStorage.getItem("supabase_token")),
                  },
                },
              ),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to load photos");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            setPhotos(result.data || []);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            toast({
              title: "Erro ao carregar fotos",
              description: "Não foi possível carregar as fotos do paciente.",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadPrivacyControls = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, result, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/patients/photos/privacy?patientId=".concat(patientId), {
                headers: {
                  Authorization: "Bearer ".concat(localStorage.getItem("supabase_token")),
                },
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            setPrivacyControls(result.data);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Error loading privacy controls:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var updatePrivacyControls = function (newControls) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, result, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/patients/photos/privacy", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer ".concat(localStorage.getItem("supabase_token")),
                },
                body: JSON.stringify({
                  patientId: patientId,
                  privacyControls: __assign(__assign({}, privacyControls), newControls),
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to update privacy controls");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            setPrivacyControls(result.data);
            toast({
              title: "Configurações atualizadas",
              description: "As configurações de privacidade foram atualizadas com sucesso.",
            });
            return [3 /*break*/, 4];
          case 3:
            error_3 = _a.sent();
            toast({
              title: "Erro ao atualizar configurações",
              description: "Não foi possível atualizar as configurações de privacidade.",
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var deletePhoto = function (photoId) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch(
                "/api/patients/photos/privacy?photoId=".concat(photoId, "&reason=user_request"),
                {
                  method: "DELETE",
                  headers: {
                    Authorization: "Bearer ".concat(localStorage.getItem("supabase_token")),
                  },
                },
              ),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to delete photo");
            }
            setPhotos(
              photos.filter(function (photo) {
                return photo.id !== photoId;
              }),
            );
            onPhotoDeleted === null || onPhotoDeleted === void 0 ? void 0 : onPhotoDeleted(photoId);
            toast({
              title: "Foto excluída",
              description: "A foto foi excluída com sucesso.",
            });
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            toast({
              title: "Erro ao excluir foto",
              description: "Não foi possível excluir a foto.",
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var downloadPhoto = function (photo) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, blob, url, a, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch(photo.storageUrl)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.blob()];
          case 2:
            blob = _a.sent();
            url = window.URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = photo.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({
              title: "Download iniciado",
              description: "O download da foto foi iniciado.",
            });
            return [3 /*break*/, 4];
          case 3:
            error_5 = _a.sent();
            toast({
              title: "Erro no download",
              description: "Não foi possível fazer o download da foto.",
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var filteredPhotos = photos.filter(function (photo) {
    return selectedPhotoType === "all" || photo.photoType === selectedPhotoType;
  });
  var formatFileSize = function (bytes) {
    if (bytes === 0) return "0 Bytes";
    var k = 1024;
    var sizes = ["Bytes", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  if (isLoading) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Eye className="h-5 w-5" />
              Galeria de Fotos - {patientName}
            </card_1.CardTitle>
            <div className="flex items-center gap-2">
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={function () {
                  return setShowPrivacyDialog(true);
                }}
              >
                <lucide_react_1.Shield className="h-4 w-4 mr-2" />
                Privacidade
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center gap-4 mb-4">
            {/* Photo Type Filter */}
            <div className="flex items-center gap-2">
              <lucide_react_1.Filter className="h-4 w-4" />
              <select_1.Select value={selectedPhotoType} onValueChange={setSelectedPhotoType}>
                <select_1.SelectTrigger className="w-40">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                  {Object.entries(PHOTO_TYPE_LABELS).map(function (_a) {
                    var value = _a[0],
                      label = _a[1];
                    return (
                      <select_1.SelectItem key={value} value={value}>
                        {label}
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button_1.Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return setViewMode("grid");
                }}
              >
                <lucide_react_1.Grid className="h-4 w-4" />
              </button_1.Button>
              <button_1.Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return setViewMode("list");
                }}
              >
                <lucide_react_1.List className="h-4 w-4" />
              </button_1.Button>
            </div>

            <div className="ml-auto text-sm text-gray-500">{filteredPhotos.length} foto(s)</div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Photos Display */}
      {filteredPhotos.length === 0
        ? <card_1.Card>
            <card_1.CardContent className="p-12 text-center">
              <lucide_react_1.Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma foto encontrada</p>
            </card_1.CardContent>
          </card_1.Card>
        : <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {filteredPhotos.map(function (photo) {
              return (
                <card_1.Card key={photo.id} className="overflow-hidden">
                  {viewMode === "grid"
                    ? <div>
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={photo.storageUrl}
                            alt={photo.fileName}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={function () {
                              return setSelectedPhoto(photo);
                            }}
                          />
                          <div className="absolute top-2 left-2">
                            <badge_1.Badge className={PHOTO_TYPE_COLORS[photo.photoType]}>
                              {PHOTO_TYPE_LABELS[photo.photoType]}
                            </badge_1.Badge>
                          </div>
                        </div>
                        <card_1.CardContent className="p-4">
                          <div className="space-y-2">
                            <p className="font-medium text-sm truncate">{photo.fileName}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatFileSize(photo.fileSize)}</span>
                              <span>{formatDate(photo.uploadedAt)}</span>
                            </div>
                            <div className="flex gap-1">
                              {allowDownload && (
                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={function () {
                                    return downloadPhoto(photo);
                                  }}
                                >
                                  <lucide_react_1.Download className="h-3 w-3" />
                                </button_1.Button>
                              )}
                              {allowDelete && (
                                <alert_dialog_1.AlertDialog>
                                  <alert_dialog_1.AlertDialogTrigger asChild>
                                    <button_1.Button variant="outline" size="sm">
                                      <lucide_react_1.Trash2 className="h-3 w-3" />
                                    </button_1.Button>
                                  </alert_dialog_1.AlertDialogTrigger>
                                  <alert_dialog_1.AlertDialogContent>
                                    <alert_dialog_1.AlertDialogHeader>
                                      <alert_dialog_1.AlertDialogTitle>
                                        Excluir foto
                                      </alert_dialog_1.AlertDialogTitle>
                                      <alert_dialog_1.AlertDialogDescription>
                                        Tem certeza que deseja excluir esta foto? Esta ação não pode
                                        ser desfeita.
                                      </alert_dialog_1.AlertDialogDescription>
                                    </alert_dialog_1.AlertDialogHeader>
                                    <alert_dialog_1.AlertDialogFooter>
                                      <alert_dialog_1.AlertDialogCancel>
                                        Cancelar
                                      </alert_dialog_1.AlertDialogCancel>
                                      <alert_dialog_1.AlertDialogAction
                                        onClick={function () {
                                          return deletePhoto(photo.id);
                                        }}
                                      >
                                        Excluir
                                      </alert_dialog_1.AlertDialogAction>
                                    </alert_dialog_1.AlertDialogFooter>
                                  </alert_dialog_1.AlertDialogContent>
                                </alert_dialog_1.AlertDialog>
                              )}
                            </div>
                          </div>
                        </card_1.CardContent>
                      </div>
                    : <card_1.CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={photo.storageUrl}
                            alt={photo.fileName}
                            className="w-16 h-16 object-cover rounded cursor-pointer"
                            onClick={function () {
                              return setSelectedPhoto(photo);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{photo.fileName}</p>
                              <badge_1.Badge className={PHOTO_TYPE_COLORS[photo.photoType]}>
                                {PHOTO_TYPE_LABELS[photo.photoType]}
                              </badge_1.Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              <p>
                                {formatFileSize(photo.fileSize)} • {photo.dimensions.width}x
                                {photo.dimensions.height}
                              </p>
                              <p>{formatDate(photo.uploadedAt)}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {allowDownload && (
                              <button_1.Button
                                variant="outline"
                                size="sm"
                                onClick={function () {
                                  return downloadPhoto(photo);
                                }}
                              >
                                <lucide_react_1.Download className="h-4 w-4" />
                              </button_1.Button>
                            )}
                            {allowDelete && (
                              <alert_dialog_1.AlertDialog>
                                <alert_dialog_1.AlertDialogTrigger asChild>
                                  <button_1.Button variant="outline" size="sm">
                                    <lucide_react_1.Trash2 className="h-4 w-4" />
                                  </button_1.Button>
                                </alert_dialog_1.AlertDialogTrigger>
                                <alert_dialog_1.AlertDialogContent>
                                  <alert_dialog_1.AlertDialogHeader>
                                    <alert_dialog_1.AlertDialogTitle>
                                      Excluir foto
                                    </alert_dialog_1.AlertDialogTitle>
                                    <alert_dialog_1.AlertDialogDescription>
                                      Tem certeza que deseja excluir esta foto? Esta ação não pode
                                      ser desfeita.
                                    </alert_dialog_1.AlertDialogDescription>
                                  </alert_dialog_1.AlertDialogHeader>
                                  <alert_dialog_1.AlertDialogFooter>
                                    <alert_dialog_1.AlertDialogCancel>
                                      Cancelar
                                    </alert_dialog_1.AlertDialogCancel>
                                    <alert_dialog_1.AlertDialogAction
                                      onClick={function () {
                                        return deletePhoto(photo.id);
                                      }}
                                    >
                                      Excluir
                                    </alert_dialog_1.AlertDialogAction>
                                  </alert_dialog_1.AlertDialogFooter>
                                </alert_dialog_1.AlertDialogContent>
                              </alert_dialog_1.AlertDialog>
                            )}
                          </div>
                        </div>
                      </card_1.CardContent>}
                </card_1.Card>
              );
            })}
          </div>}

      {/* Photo Detail Dialog */}
      {selectedPhoto && (
        <dialog_1.Dialog
          open={!!selectedPhoto}
          onOpenChange={function () {
            return setSelectedPhoto(null);
          }}
        >
          <dialog_1.DialogContent className="max-w-4xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>{selectedPhoto.fileName}</dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedPhoto.storageUrl}
                alt={selectedPhoto.fileName}
                className="w-full h-auto max-h-96 object-contain rounded"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Tipo:</strong> {PHOTO_TYPE_LABELS[selectedPhoto.photoType]}
                  </p>
                  <p>
                    <strong>Tamanho:</strong> {formatFileSize(selectedPhoto.fileSize)}
                  </p>
                  <p>
                    <strong>Dimensões:</strong> {selectedPhoto.dimensions.width}x
                    {selectedPhoto.dimensions.height}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Enviado em:</strong> {formatDate(selectedPhoto.uploadedAt)}
                  </p>
                  <p>
                    <strong>Qualidade:</strong>{" "}
                    {Math.round(selectedPhoto.metadata.quality.score * 100)}%
                  </p>
                  {((_b = selectedPhoto.metadata.facialFeatures) === null || _b === void 0
                    ? void 0
                    : _b.detected) && (
                    <p>
                      <strong>Rosto detectado:</strong>{" "}
                      {Math.round(selectedPhoto.metadata.facialFeatures.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      )}

      {/* Privacy Controls Dialog */}
      {privacyControls && (
        <dialog_1.Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
          <dialog_1.DialogContent>
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Configurações de Privacidade</dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label_1.Label htmlFor="facial-recognition">
                  Permitir reconhecimento facial
                </label_1.Label>
                <switch_1.Switch
                  id="facial-recognition"
                  checked={privacyControls.allowFacialRecognition}
                  onCheckedChange={function (checked) {
                    return updatePrivacyControls({ allowFacialRecognition: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <label_1.Label htmlFor="photo-sharing">
                  Permitir compartilhamento de fotos
                </label_1.Label>
                <switch_1.Switch
                  id="photo-sharing"
                  checked={privacyControls.allowPhotoSharing}
                  onCheckedChange={function (checked) {
                    return updatePrivacyControls({ allowPhotoSharing: checked });
                  }}
                />
              </div>
              <div className="space-y-2">
                <label_1.Label>Nível de acesso</label_1.Label>
                <select_1.Select
                  value={privacyControls.accessLevel}
                  onValueChange={function (value) {
                    return updatePrivacyControls({ accessLevel: value });
                  }}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="public">Público</select_1.SelectItem>
                    <select_1.SelectItem value="restricted">Restrito</select_1.SelectItem>
                    <select_1.SelectItem value="private">Privado</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="text-sm text-gray-500">
                <p>Consentimento dado em: {formatDate(privacyControls.consentDate)}</p>
                <p>Retenção de dados: {privacyControls.dataRetentionPeriod} dias</p>
              </div>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      )}
    </div>
  );
}
