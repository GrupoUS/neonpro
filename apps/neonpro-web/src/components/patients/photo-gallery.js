"use client";
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
exports.PhotoGallery = PhotoGallery;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
var supabase_storage_1 = require("@/lib/supabase-storage");
function PhotoGallery(_a) {
  var _this = this;
  var patientId = _a.patientId,
    _b = _a.readonly,
    readonly = _b === void 0 ? false : _b,
    onPhotoDeleted = _a.onPhotoDeleted,
    onPhotoUpdated = _a.onPhotoUpdated,
    className = _a.className;
  var _c = (0, react_1.useState)([]),
    photos = _c[0],
    setPhotos = _c[1];
  var _d = (0, react_1.useState)([]),
    filteredPhotos = _d[0],
    setFilteredPhotos = _d[1];
  var _e = (0, react_1.useState)(true),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  var _g = (0, react_1.useState)(null),
    selectedPhoto = _g[0],
    setSelectedPhoto = _g[1];
  var _h = (0, react_1.useState)("grid"),
    viewMode = _h[0],
    setViewMode = _h[1];
  var _j = (0, react_1.useState)("date_desc"),
    sortBy = _j[0],
    setSortBy = _j[1];
  // Filters
  var _k = (0, react_1.useState)(""),
    searchTerm = _k[0],
    setSearchTerm = _k[1];
  var _l = (0, react_1.useState)("all"),
    categoryFilter = _l[0],
    setCategoryFilter = _l[1];
  var _m = (0, react_1.useState)("all"),
    treatmentFilter = _m[0],
    setTreatmentFilter = _m[1];
  var _o = (0, react_1.useState)("all"),
    areaFilter = _o[0],
    setAreaFilter = _o[1];
  // Pagination
  var _p = (0, react_1.useState)(1),
    currentPage = _p[0],
    setCurrentPage = _p[1];
  var _q = (0, react_1.useState)(1),
    totalPages = _q[0],
    setTotalPages = _q[1];
  var _r = (0, react_1.useState)(false),
    hasMore = _r[0],
    setHasMore = _r[1];
  (0, react_1.useEffect)(
    function () {
      loadPhotos();
    },
    [patientId, currentPage],
  );
  (0, react_1.useEffect)(
    function () {
      applyFiltersAndSort();
    },
    [photos, searchTerm, categoryFilter, treatmentFilter, areaFilter, sortBy],
  );
  var loadPhotos = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var result, newPhotos_1, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            setError(null);
            return [
              4 /*yield*/,
              (0, supabase_storage_1.getPatientPhotos)(patientId, {
                page: currentPage,
                limit: 50, // Load more photos for better UX
              }),
            ];
          case 1:
            result = _a.sent();
            if (!result.success) {
              throw new Error(result.error || "Erro ao carregar fotos");
            }
            newPhotos_1 = result.data || [];
            if (currentPage === 1) {
              setPhotos(newPhotos_1);
            } else {
              setPhotos(function (prev) {
                return __spreadArray(__spreadArray([], prev, true), newPhotos_1, true);
              });
            }
            if (result.pagination) {
              setTotalPages(result.pagination.totalPages);
              setHasMore(currentPage < result.pagination.totalPages);
            }
            return [3 /*break*/, 4];
          case 2:
            err_1 = _a.sent();
            console.error("Erro ao carregar fotos:", err_1);
            setError(err_1 instanceof Error ? err_1.message : "Erro ao carregar fotos");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var applyFiltersAndSort = function () {
    var filtered = __spreadArray([], photos, true);
    // Apply search filter
    if (searchTerm) {
      var term_1 = searchTerm.toLowerCase();
      filtered = filtered.filter(function (photo) {
        return (
          photo.file_name.toLowerCase().includes(term_1) ||
          photo.metadata.treatmentType.toLowerCase().includes(term_1) ||
          photo.metadata.anatomicalArea.toLowerCase().includes(term_1) ||
          photo.metadata.notes.toLowerCase().includes(term_1)
        );
      });
    }
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(function (photo) {
        return photo.metadata.category === categoryFilter;
      });
    }
    // Apply treatment filter
    if (treatmentFilter !== "all") {
      filtered = filtered.filter(function (photo) {
        return photo.metadata.treatmentType === treatmentFilter;
      });
    }
    // Apply area filter
    if (areaFilter !== "all") {
      filtered = filtered.filter(function (photo) {
        return photo.metadata.anatomicalArea === areaFilter;
      });
    }
    // Apply sorting
    filtered.sort(function (a, b) {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name_asc":
          return a.file_name.localeCompare(b.file_name);
        case "name_desc":
          return b.file_name.localeCompare(a.file_name);
        case "size_desc":
          return b.file_size - a.file_size;
        case "size_asc":
          return a.file_size - b.file_size;
        default:
          return 0;
      }
    });
    setFilteredPhotos(filtered);
  };
  var handleDownload = function (photo) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, url, a, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, (0, supabase_storage_1.downloadPatientPhoto)(photo.file_path)];
          case 1:
            result = _a.sent();
            if (!result.success || !result.blob) {
              throw new Error(result.error || "Erro ao baixar foto");
            }
            url = URL.createObjectURL(result.blob);
            a = document.createElement("a");
            a.href = url;
            a.download = photo.file_name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Erro no download:", error_1);
            setError("Erro ao baixar foto");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleDelete = function (photo) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!confirm('Tem certeza que deseja deletar a foto "'.concat(photo.file_name, '"?'))) {
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, (0, supabase_storage_1.deletePatientPhoto)(photo.id)];
          case 2:
            result = _a.sent();
            if (!result.success) {
              throw new Error(result.error || "Erro ao deletar foto");
            }
            // Remove from local state
            setPhotos(function (prev) {
              return prev.filter(function (p) {
                return p.id !== photo.id;
              });
            });
            if (onPhotoDeleted) {
              onPhotoDeleted(photo.id);
            }
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Erro ao deletar:", error_2);
            setError("Erro ao deletar foto");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var formatFileSize = function (bytes) {
    if (bytes === 0) return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  var getCategoryColor = function (category) {
    switch (category) {
      case "before":
        return "text-blue-600 bg-blue-50";
      case "after":
        return "text-green-600 bg-green-50";
      case "during":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };
  var getCategoryLabel = function (category) {
    switch (category) {
      case "before":
        return "Antes";
      case "after":
        return "Depois";
      case "during":
        return "Durante";
      default:
        return category;
    }
  };
  // Get unique values for filters
  var uniqueTreatments = __spreadArray(
    [],
    new Set(
      photos.map(function (p) {
        return p.metadata.treatmentType;
      }),
    ),
    true,
  ).filter(Boolean);
  var uniqueAreas = __spreadArray(
    [],
    new Set(
      photos.map(function (p) {
        return p.metadata.anatomicalArea;
      }),
    ),
    true,
  ).filter(Boolean);
  if (loading && photos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando fotos...</p>
        </div>
      </div>
    );
  }
  return (
    <div className={(0, utils_1.cn)("space-y-6", className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input_1.Input
              placeholder="Buscar por nome, tratamento, área ou observações..."
              value={searchTerm}
              onChange={function (e) {
                return setSearchTerm(e.target.value);
              }}
              className="pl-9"
            />
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
              <lucide_react_1.Grid3X3 className="h-4 w-4" />
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

          {/* Sort */}
          <select_1.Select
            value={sortBy}
            onValueChange={function (value) {
              return setSortBy(value);
            }}
          >
            <select_1.SelectTrigger className="w-48">
              <lucide_react_1.ArrowUpDown className="h-4 w-4 mr-2" />
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="date_desc">Data (Mais recente)</select_1.SelectItem>
              <select_1.SelectItem value="date_asc">Data (Mais antiga)</select_1.SelectItem>
              <select_1.SelectItem value="name_asc">Nome (A-Z)</select_1.SelectItem>
              <select_1.SelectItem value="name_desc">Nome (Z-A)</select_1.SelectItem>
              <select_1.SelectItem value="size_desc">Tamanho (Maior)</select_1.SelectItem>
              <select_1.SelectItem value="size_asc">Tamanho (Menor)</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label_1.Label>Categoria</label_1.Label>
            <select_1.Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <select_1.SelectTrigger>
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
                <select_1.SelectItem value="before">Antes</select_1.SelectItem>
                <select_1.SelectItem value="during">Durante</select_1.SelectItem>
                <select_1.SelectItem value="after">Depois</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          <div className="space-y-2">
            <label_1.Label>Tratamento</label_1.Label>
            <select_1.Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
              <select_1.SelectTrigger>
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os tratamentos</select_1.SelectItem>
                {uniqueTreatments.map(function (treatment) {
                  return (
                    <select_1.SelectItem key={treatment} value={treatment}>
                      {treatment}
                    </select_1.SelectItem>
                  );
                })}
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          <div className="space-y-2">
            <label_1.Label>Área Anatômica</label_1.Label>
            <select_1.Select value={areaFilter} onValueChange={setAreaFilter}>
              <select_1.SelectTrigger>
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todas as áreas</select_1.SelectItem>
                {uniqueAreas.map(function (area) {
                  return (
                    <select_1.SelectItem key={area} value={area}>
                      {area}
                    </select_1.SelectItem>
                  );
                })}
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPhotos.length} de {photos.length} fotos
          {searchTerm && ' \u2022 Busca: "'.concat(searchTerm, '"')}
        </p>

        {filteredPhotos.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {formatFileSize(
              filteredPhotos.reduce(function (sum, photo) {
                return sum + photo.file_size;
              }, 0),
            )}{" "}
            total
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Photo Gallery */}
      {filteredPhotos.length === 0
        ? <div className="text-center py-12">
            <lucide_react_1.FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">
              {photos.length === 0
                ? "Nenhuma foto encontrada"
                : "Nenhuma foto corresponde aos filtros"}
            </p>
            <p className="text-sm text-muted-foreground">
              {photos.length === 0
                ? "As fotos enviadas aparecerão aqui"
                : "Tente ajustar os filtros de busca"}
            </p>
          </div>
        : <>
            {viewMode === "grid"
              ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredPhotos.map(function (photo) {
                    return (
                      <card_1.Card key={photo.id} className="overflow-hidden group">
                        <div className="aspect-square relative">
                          {photo.publicUrl && (
                            <img
                              src={photo.publicUrl}
                              alt={photo.file_name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}

                          {/* Overlay with actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button_1.Button
                              size="sm"
                              variant="secondary"
                              onClick={function () {
                                return setSelectedPhoto(photo);
                              }}
                            >
                              <lucide_react_1.ZoomIn className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button
                              size="sm"
                              variant="secondary"
                              onClick={function () {
                                return handleDownload(photo);
                              }}
                            >
                              <lucide_react_1.Download className="h-4 w-4" />
                            </button_1.Button>
                            {!readonly && (
                              <button_1.Button
                                size="sm"
                                variant="destructive"
                                onClick={function () {
                                  return handleDelete(photo);
                                }}
                              >
                                <lucide_react_1.Trash2 className="h-4 w-4" />
                              </button_1.Button>
                            )}
                          </div>

                          {/* Category badge */}
                          <div className="absolute top-2 left-2">
                            <badge_1.Badge className={getCategoryColor(photo.metadata.category)}>
                              {getCategoryLabel(photo.metadata.category)}
                            </badge_1.Badge>
                          </div>
                        </div>

                        <card_1.CardContent className="p-3">
                          <div className="space-y-2">
                            <p className="text-sm font-medium truncate">
                              {photo.metadata.treatmentType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {photo.metadata.anatomicalArea}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {(0, date_fns_1.format)(new Date(photo.created_at), "dd/MM/yyyy", {
                                  locale: locale_1.ptBR,
                                })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(photo.file_size)}
                              </span>
                            </div>
                          </div>
                        </card_1.CardContent>
                      </card_1.Card>
                    );
                  })}
                </div>
              : /* List View */
                <div className="space-y-2">
                  {filteredPhotos.map(function (photo) {
                    return (
                      <card_1.Card key={photo.id} className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Thumbnail */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            {photo.publicUrl && (
                              <img
                                src={photo.publicUrl}
                                alt={photo.file_name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{photo.file_name}</p>
                              <badge_1.Badge className={getCategoryColor(photo.metadata.category)}>
                                {getCategoryLabel(photo.metadata.category)}
                              </badge_1.Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <lucide_react_1.Stethoscope className="h-3 w-3" />
                                {photo.metadata.treatmentType}
                              </div>
                              <div className="flex items-center gap-1">
                                <lucide_react_1.MapPin className="h-3 w-3" />
                                {photo.metadata.anatomicalArea}
                              </div>
                              <div className="flex items-center gap-1">
                                <lucide_react_1.Calendar className="h-3 w-3" />
                                {(0, date_fns_1.format)(new Date(photo.created_at), "dd/MM/yyyy", {
                                  locale: locale_1.ptBR,
                                })}
                              </div>
                            </div>

                            {photo.metadata.notes && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {photo.metadata.notes}
                              </p>
                            )}
                          </div>

                          {/* File Size */}
                          <div className="text-sm text-muted-foreground">
                            {formatFileSize(photo.file_size)}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button_1.Button
                              size="sm"
                              variant="outline"
                              onClick={function () {
                                return setSelectedPhoto(photo);
                              }}
                            >
                              <lucide_react_1.Eye className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button
                              size="sm"
                              variant="outline"
                              onClick={function () {
                                return handleDownload(photo);
                              }}
                            >
                              <lucide_react_1.Download className="h-4 w-4" />
                            </button_1.Button>
                            {!readonly && (
                              <button_1.Button
                                size="sm"
                                variant="outline"
                                onClick={function () {
                                  return handleDelete(photo);
                                }}
                              >
                                <lucide_react_1.Trash2 className="h-4 w-4" />
                              </button_1.Button>
                            )}
                          </div>
                        </div>
                      </card_1.Card>
                    );
                  })}
                </div>}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-6">
                <button_1.Button
                  variant="outline"
                  onClick={function () {
                    return setCurrentPage(function (prev) {
                      return prev + 1;
                    });
                  }}
                  disabled={loading}
                >
                  {loading ? "Carregando..." : "Carregar mais fotos"}
                </button_1.Button>
              </div>
            )}
          </>}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedPhoto.file_name}</h3>
              <button_1.Button
                variant="ghost"
                size="sm"
                onClick={function () {
                  return setSelectedPhoto(null);
                }}
              >
                ✕
              </button_1.Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image */}
                <div className="lg:col-span-2">
                  <div className="max-h-96 flex items-center justify-center">
                    <img
                      src={selectedPhoto.publicUrl}
                      alt={selectedPhoto.file_name}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-4">
                  <div>
                    <label_1.Label className="text-sm font-medium">Categoria</label_1.Label>
                    <badge_1.Badge className={getCategoryColor(selectedPhoto.metadata.category)}>
                      {getCategoryLabel(selectedPhoto.metadata.category)}
                    </badge_1.Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <label_1.Label className="font-medium">Tratamento</label_1.Label>
                      <p className="text-muted-foreground">
                        {selectedPhoto.metadata.treatmentType}
                      </p>
                    </div>

                    <div>
                      <label_1.Label className="font-medium">Área Anatômica</label_1.Label>
                      <p className="text-muted-foreground">
                        {selectedPhoto.metadata.anatomicalArea}
                      </p>
                    </div>

                    <div>
                      <label_1.Label className="font-medium">Data</label_1.Label>
                      <p className="text-muted-foreground">
                        {(0, date_fns_1.format)(new Date(selectedPhoto.metadata.date), "PPP", {
                          locale: locale_1.ptBR,
                        })}
                      </p>
                    </div>

                    <div>
                      <label_1.Label className="font-medium">Upload</label_1.Label>
                      <p className="text-muted-foreground">
                        {(0, date_fns_1.format)(
                          new Date(selectedPhoto.created_at),
                          "PPP 'às' HH:mm",
                          { locale: locale_1.ptBR },
                        )}
                      </p>
                    </div>

                    <div>
                      <label_1.Label className="font-medium">Tamanho</label_1.Label>
                      <p className="text-muted-foreground">
                        {formatFileSize(selectedPhoto.file_size)}
                      </p>
                    </div>

                    {selectedPhoto.metadata.notes && (
                      <div>
                        <label_1.Label className="font-medium">Observações</label_1.Label>
                        <p className="text-muted-foreground">{selectedPhoto.metadata.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <button_1.Button
                      size="sm"
                      onClick={function () {
                        return handleDownload(selectedPhoto);
                      }}
                      className="flex-1"
                    >
                      <lucide_react_1.Download className="h-4 w-4 mr-2" />
                      Download
                    </button_1.Button>
                    {!readonly && (
                      <button_1.Button
                        size="sm"
                        variant="destructive"
                        onClick={function () {
                          handleDelete(selectedPhoto);
                          setSelectedPhoto(null);
                        }}
                      >
                        <lucide_react_1.Trash2 className="h-4 w-4" />
                      </button_1.Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
