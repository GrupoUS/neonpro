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
exports.communicationKeys = void 0;
exports.useMessages = useMessages;
exports.useMessage = useMessage;
exports.useSendMessage = useSendMessage;
exports.useMarkMessageAsRead = useMarkMessageAsRead;
exports.useDeleteMessage = useDeleteMessage;
exports.useThreads = useThreads;
exports.useThread = useThread;
exports.useCreateThread = useCreateThread;
exports.useUpdateThread = useUpdateThread;
exports.useArchiveThread = useArchiveThread;
exports.useTemplates = useTemplates;
exports.useTemplate = useTemplate;
exports.useCreateTemplate = useCreateTemplate;
exports.useUpdateTemplate = useUpdateTemplate;
exports.useDeleteTemplate = useDeleteTemplate;
exports.useDuplicateTemplate = useDuplicateTemplate;
exports.useCommunicationStats = useCommunicationStats;
exports.useInbox = useInbox;
exports.usePatientCommunication = usePatientCommunication;
exports.useTemplatesByCategory = useTemplatesByCategory;
exports.useRealtimeCommunication = useRealtimeCommunication;
var react_query_1 = require("@tanstack/react-query");
var react_1 = require("react");
var react_hot_toast_1 = require("react-hot-toast");
// Query keys for React Query
exports.communicationKeys = {
  all: ["communication"],
  // Messages
  messages: function () {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.all, true),
      ["messages"],
      false,
    );
  },
  messagesList: function (filters) {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.messages(), true),
      ["list", filters],
      false,
    );
  },
  message: function (id) {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.messages(), true),
      ["detail", id],
      false,
    );
  },
  messagesByThread: function (threadId) {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.messages(), true),
      ["thread", threadId],
      false,
    );
  },
  // Threads
  threads: function () {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.all, true),
      ["threads"],
      false,
    );
  },
  threadsList: function (filters) {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.threads(), true),
      ["list", filters],
      false,
    );
  },
  thread: function (id) {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.threads(), true),
      ["detail", id],
      false,
    );
  },
  threadsStats: function () {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.threads(), true),
      ["stats"],
      false,
    );
  },
  // Templates
  templates: function () {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.all, true),
      ["templates"],
      false,
    );
  },
  templatesList: function (filters) {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.templates(), true),
      ["list", filters],
      false,
    );
  },
  template: function (id) {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.templates(), true),
      ["detail", id],
      false,
    );
  },
  templatesByCategory: function (category) {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.templates(), true),
      ["category", category],
      false,
    );
  },
  // Stats
  stats: function () {
    return __spreadArray(__spreadArray([], exports.communicationKeys.all, true), ["stats"], false);
  },
  statsOverview: function () {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.stats(), true),
      ["overview"],
      false,
    );
  },
  statsMessages: function (period) {
    return __spreadArray(
      __spreadArray([], exports.communicationKeys.stats(), true),
      ["messages", period],
      false,
    );
  },
};
// API functions
var api = {
  // Messages
  getMessages: function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var params, response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            params = new URLSearchParams();
            if (filters) {
              Object.entries(filters).forEach(function (_a) {
                var key = _a[0],
                  value = _a[1];
                if (value !== undefined && value !== null) {
                  params.append(key, String(value));
                }
              });
            }
            return [4 /*yield*/, fetch("/api/communication/messages?".concat(params))];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to fetch messages");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  getMessage: function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, fetch("/api/communication/messages/".concat(id))];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to fetch message");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  sendMessage: function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to send message");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  markMessageAsRead: function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/messages/".concat(id, "/read"), {
                method: "POST",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to mark message as read");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  deleteMessage: function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/messages/".concat(id), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to delete message");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  },
  // Threads
  getThreads: function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var params, response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            params = new URLSearchParams();
            if (filters) {
              Object.entries(filters).forEach(function (_a) {
                var key = _a[0],
                  value = _a[1];
                if (value !== undefined && value !== null) {
                  params.append(key, String(value));
                }
              });
            }
            return [4 /*yield*/, fetch("/api/communication/threads?".concat(params))];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to fetch threads");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  getThread: function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, fetch("/api/communication/threads/".concat(id))];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to fetch thread");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  createThread: function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/threads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to create thread");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  updateThread: function (id, data) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/threads/".concat(id), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to update thread");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  archiveThread: function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/threads/".concat(id, "/archive"), {
                method: "POST",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to archive thread");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  // Templates
  getTemplates: function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var params, response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            params = new URLSearchParams();
            if (filters) {
              Object.entries(filters).forEach(function (_a) {
                var key = _a[0],
                  value = _a[1];
                if (value !== undefined && value !== null) {
                  params.append(key, String(value));
                }
              });
            }
            return [4 /*yield*/, fetch("/api/communication/templates?".concat(params))];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to fetch templates");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  getTemplate: function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, fetch("/api/communication/templates/".concat(id))];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to fetch template");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  createTemplate: function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to create template");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  updateTemplate: function (id, data) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/templates/".concat(id), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to update template");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  deleteTemplate: function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/templates/".concat(id), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to delete template");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  },
  duplicateTemplate: function (id, name) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/communication/templates/".concat(id, "/duplicate"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to duplicate template");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
  // Stats
  getCommunicationStats: function () {
    return __awaiter(this, void 0, void 0, function () {
      var response, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, fetch("/api/communication/stats")];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            error = _a.sent();
            throw new Error(error.error || "Failed to fetch communication stats");
          case 3:
            return [2 /*return*/, response.json()];
        }
      });
    });
  },
};
// Hooks for Messages
function useMessages(filters) {
  return (0, react_query_1.useQuery)({
    queryKey: exports.communicationKeys.messagesList(filters),
    queryFn: function () {
      return api.getMessages(filters);
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
function useMessage(id, enabled) {
  if (enabled === void 0) {
    enabled = true;
  }
  return (0, react_query_1.useQuery)({
    queryKey: exports.communicationKeys.message(id),
    queryFn: function () {
      return api.getMessage(id);
    },
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  });
}
function useSendMessage() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: api.sendMessage,
    onSuccess: function (data) {
      // Invalidate messages list to show new message
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.messages() });
      // Also invalidate threads if this message is part of a thread
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.threads() });
      react_hot_toast_1.toast.success("Message sent successfully");
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to send message");
    },
  });
}
function useMarkMessageAsRead() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: api.markMessageAsRead,
    onSuccess: function (data, messageId) {
      // Update the specific message in cache
      queryClient.setQueryData(exports.communicationKeys.message(messageId), {
        data: { message: data.data.message },
      });
      // Invalidate messages list to update read status
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.messages() });
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to mark message as read");
    },
  });
}
function useDeleteMessage() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: api.deleteMessage,
    onSuccess: function () {
      // Invalidate messages list
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.messages() });
      react_hot_toast_1.toast.success("Message deleted successfully");
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to delete message");
    },
  });
} // Hooks for Threads
function useThreads(filters) {
  return (0, react_query_1.useQuery)({
    queryKey: exports.communicationKeys.threadsList(filters),
    queryFn: function () {
      return api.getThreads(filters);
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
function useThread(id, enabled) {
  if (enabled === void 0) {
    enabled = true;
  }
  return (0, react_query_1.useQuery)({
    queryKey: exports.communicationKeys.thread(id),
    queryFn: function () {
      return api.getThread(id);
    },
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  });
}
function useCreateThread() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: api.createThread,
    onSuccess: function () {
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.threads() });
      react_hot_toast_1.toast.success("Thread created successfully");
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to create thread");
    },
  });
}
function useUpdateThread() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      var id = _a.id,
        data = _a.data;
      return api.updateThread(id, data);
    },
    onSuccess: function (data, _a) {
      var id = _a.id;
      // Update the specific thread in cache
      queryClient.setQueryData(exports.communicationKeys.thread(id), {
        data: { thread: data.data.thread },
      });
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.threads() });
      react_hot_toast_1.toast.success("Thread updated successfully");
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to update thread");
    },
  });
}
function useArchiveThread() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: api.archiveThread,
    onSuccess: function (data, threadId) {
      // Update the specific thread in cache
      queryClient.setQueryData(exports.communicationKeys.thread(threadId), {
        data: { thread: data.data.thread },
      });
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.threads() });
      react_hot_toast_1.toast.success("Thread archived successfully");
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to archive thread");
    },
  });
}
// Hooks for Templates
function useTemplates(filters) {
  return (0, react_query_1.useQuery)({
    queryKey: exports.communicationKeys.templatesList(filters),
    queryFn: function () {
      return api.getTemplates(filters);
    },
    staleTime: 60000, // 1 minute - templates change less frequently
    refetchOnWindowFocus: false,
  });
}
function useTemplate(id, enabled) {
  if (enabled === void 0) {
    enabled = true;
  }
  return (0, react_query_1.useQuery)({
    queryKey: exports.communicationKeys.template(id),
    queryFn: function () {
      return api.getTemplate(id);
    },
    enabled: enabled && !!id,
    staleTime: 300000, // 5 minutes - templates are fairly static
  });
}
function useCreateTemplate() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: api.createTemplate,
    onSuccess: function () {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.templates() });
      react_hot_toast_1.toast.success("Template created successfully");
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to create template");
    },
  });
}
function useUpdateTemplate() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      var id = _a.id,
        data = _a.data;
      return api.updateTemplate(id, data);
    },
    onSuccess: function (data, _a) {
      var id = _a.id;
      // Update the specific template in cache
      queryClient.setQueryData(exports.communicationKeys.template(id), {
        data: { template: data.data.template },
      });
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.templates() });
      react_hot_toast_1.toast.success("Template updated successfully");
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to update template");
    },
  });
}
function useDeleteTemplate() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: api.deleteTemplate,
    onSuccess: function () {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.templates() });
      react_hot_toast_1.toast.success("Template deleted successfully");
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to delete template");
    },
  });
}
function useDuplicateTemplate() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      var id = _a.id,
        name = _a.name;
      return api.duplicateTemplate(id, name);
    },
    onSuccess: function () {
      // Invalidate templates list to show new template
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.templates() });
      react_hot_toast_1.toast.success("Template duplicated successfully");
    },
    onError: function (error) {
      react_hot_toast_1.toast.error(error.message || "Failed to duplicate template");
    },
  });
}
// Hooks for Statistics
function useCommunicationStats() {
  return (0, react_query_1.useQuery)({
    queryKey: exports.communicationKeys.statsOverview(),
    queryFn: api.getCommunicationStats,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
// Specialized hooks for common use cases
function useInbox(filters) {
  var _a = (0, react_1.useState)(null),
    selectedMessage = _a[0],
    setSelectedMessage = _a[1];
  var messagesQuery = useMessages(
    __assign(__assign({}, filters), { status: "delivered", sort: "created_at", order: "desc" }),
  );
  var markAsRead = useMarkMessageAsRead();
  var handleSelectMessage = (0, react_1.useCallback)(
    function (messageId) {
      setSelectedMessage(messageId);
      // Auto-mark as read when selected
      markAsRead.mutate(messageId);
    },
    [markAsRead],
  );
  return __assign(__assign({}, messagesQuery), {
    selectedMessage: selectedMessage,
    setSelectedMessage: handleSelectMessage,
    markAsRead: markAsRead,
  });
}
function usePatientCommunication(patientId) {
  var _this = this;
  var threadsQuery = useThreads({
    patient_id: patientId,
    sort: "updated_at",
    order: "desc",
  });
  var messagesQuery = useMessages({
    recipient_id: patientId,
    sort: "created_at",
    order: "desc",
  });
  var createThread = useCreateThread();
  var sendMessage = useSendMessage();
  var startConversation = (0, react_1.useCallback)(
    function (subject) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          return [
            2 /*return*/,
            createThread.mutateAsync({
              patient_id: patientId,
              subject: subject,
              priority: "normal",
            }),
          ];
        });
      });
    },
    [createThread, patientId],
  );
  var sendQuickMessage = (0, react_1.useCallback)(
    function (content_1) {
      var args_1 = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
      }
      return __awaiter(
        _this,
        __spreadArray([content_1], args_1, true),
        void 0,
        function (content, channel) {
          if (channel === void 0) {
            channel = "sms";
          }
          return __generator(this, function (_a) {
            return [
              2 /*return*/,
              sendMessage.mutateAsync({
                recipient_id: patientId,
                recipient_type: "patient",
                content: content,
                channel: channel,
                priority: "normal",
              }),
            ];
          });
        },
      );
    },
    [sendMessage, patientId],
  );
  return {
    threads: threadsQuery,
    messages: messagesQuery,
    startConversation: startConversation,
    sendQuickMessage: sendQuickMessage,
    isCreatingThread: createThread.isPending,
    isSendingMessage: sendMessage.isPending,
  };
}
function useTemplatesByCategory(category) {
  return useTemplates({
    category: category,
    active: "true",
    sort: "name",
    order: "asc",
  });
}
// Real-time communication hook
function useRealtimeCommunication() {
  var _a, _b;
  var queryClient = (0, react_query_1.useQueryClient)();
  // This would integrate with WebSocket or Supabase real-time subscriptions
  // For now, we'll use polling as a fallback
  var stats = useCommunicationStats().data;
  var refreshInbox = (0, react_1.useCallback)(
    function () {
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.messages() });
      queryClient.invalidateQueries({ queryKey: exports.communicationKeys.threads() });
    },
    [queryClient],
  );
  return {
    stats: stats,
    refreshInbox: refreshInbox,
    unreadCount:
      ((_a = stats === null || stats === void 0 ? void 0 : stats.data) === null || _a === void 0
        ? void 0
        : _a.unread_messages) || 0,
    activeThreads:
      ((_b = stats === null || stats === void 0 ? void 0 : stats.data) === null || _b === void 0
        ? void 0
        : _b.active_threads) || 0,
  };
}
