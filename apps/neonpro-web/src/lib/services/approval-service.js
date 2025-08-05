"use strict";
// Approval Service
// Handles approval workflow operations for accounts payable
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalService = void 0;
var ApprovalService = /** @class */ (function () {
  function ApprovalService() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    this.supabase = createClient(ComponentClient()
        // Approval Levels Management
        , 
        // Approval Levels Management
        async, getApprovalLevels(), Promise < ApprovalLevel[] > {
            try: {
                const: (_a = yield this.supabase
                    .from('approval_levels')
                    .select('*')
                    .eq('is_active', true)
                    .order('level_order'), data = _a.data, error = _a.error, _a),
                if: function (error) { },
                throw: error,
                return: data || []
            },
            catch: function (error) {
                console.error('Error fetching approval levels:', error);
                throw new Error('Falha ao carregar níveis de aprovação');
            }
        }, async, createApprovalLevel(levelData, (Partial)), Promise < ApprovalLevel > {
            try: {
                const: (_b = yield this.supabase
                    .from('approval_levels')
                    .insert([__assign(__assign({}, levelData), { is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })])
                    .select()
                    .single(), data = _b.data, error = _b.error, _b),
                if: function (error) { },
                throw: error,
                return: data
            },
            catch: function (error) {
                console.error('Error creating approval level:', error);
                throw new Error('Falha ao criar nível de aprovação');
            }
        }, async, updateApprovalLevel(id, string, levelData, (Partial)), Promise < ApprovalLevel > {
            try: {
                const: (_c = yield this.supabase
                    .from('approval_levels')
                    .update(__assign(__assign({}, levelData), { updated_at: new Date().toISOString() }))
                    .eq('id', id)
                    .select()
                    .single(), data = _c.data, error = _c.error, _c),
                if: function (error) { },
                throw: error,
                return: data
            },
            catch: function (error) {
                console.error('Error updating approval level:', error);
                throw new Error('Falha ao atualizar nível de aprovação');
            }
        }, async, deleteApprovalLevel(id, string), Promise < void  > {
            try: {
                const: (_d = yield this.supabase
                    .from('approval_levels')
                    .update({ is_active: false, updated_at: new Date().toISOString() })
                    .eq('id', id), error = _d.error, _d),
                if: function (error) { },
                throw: error
            },
            catch: function (error) {
                console.error('Error deleting approval level:', error);
                throw new Error('Falha ao excluir nível de aprovação');
            }
        }
        // Approval Users Management
        , 
        // Approval Users Management
        async, getApprovalUsers(), Promise < ApprovalUser[] > {
            try: {
                const: (_e = yield this.supabase
                    .from('approval_users')
                    .select("\n          *,\n          approval_levels (\n            id,\n            level_name,\n            level_order\n          )\n        ")
                    .eq('is_active', true)
                    .order('user_name'), data = _e.data, error = _e.error, _e),
                if: function (error) { },
                throw: error,
                return: data || []
            },
            catch: function (error) {
                console.error('Error fetching approval users:', error);
                throw new Error('Falha ao carregar usuários aprovadores');
            }
        }, async, createApprovalUser(userData, (Partial)), Promise < ApprovalUser > {
            try: {
                const: (_f = yield this.supabase
                    .from('approval_users')
                    .insert([__assign(__assign({}, userData), { is_active: true, created_at: new Date().toISOString() })])
                    .select()
                    .single(), data = _f.data, error = _f.error, _f),
                if: function (error) { },
                throw: error,
                return: data
            },
            catch: function (error) {
                console.error('Error creating approval user:', error);
                throw new Error('Falha ao criar usuário aprovador');
            }
        }, async, updateApprovalUser(id, string, userData, (Partial)), Promise < ApprovalUser > {
            try: {
                const: (_g = yield this.supabase
                    .from('approval_users')
                    .update(userData)
                    .eq('id', id)
                    .select()
                    .single(), data = _g.data, error = _g.error, _g),
                if: function (error) { },
                throw: error,
                return: data
            },
            catch: function (error) {
                console.error('Error updating approval user:', error);
                throw new Error('Falha ao atualizar usuário aprovador');
            }
        }, async, deleteApprovalUser(id, string), Promise < void  > {
            try: {
                const: (_h = yield this.supabase
                    .from('approval_users')
                    .update({ is_active: false })
                    .eq('id', id), error = _h.error, _h),
                if: function (error) { },
                throw: error
            },
            catch: function (error) {
                console.error('Error deleting approval user:', error);
                throw new Error('Falha ao excluir usuário aprovador');
            }
        }
        // Approval Requests Management
        , 
        // Approval Requests Management
        async, createApprovalRequest(requestData, {
            accounts_payable_id: string,
            amount: number,
            priority: 'low' | 'normal' | 'high' | 'urgent',
            reason: string,
            justification: string,
            due_date: string
        }), Promise < ApprovalRequest > {
            try: {
                // Get current user
                const: (_j = yield this.supabase.auth.getUser(), user = _j.data.user, _j),
                if: function (, user) { },
                throw: new Error('Usuário não autenticado')
                // Determine approval levels based on amount
                ,
                // Determine approval levels based on amount
                const: levels = yield this.getApprovalLevels(),
                const: applicableLevels = levels.filter(function (level) {
                    return requestData.amount >= level.min_amount &&
                        (level.max_amount === null || requestData.amount <= level.max_amount);
                }),
                if: function (applicableLevels) { },
                : .length === 0
            }
        });
  }
  return ApprovalService;
})();
{
  throw new Error("Nenhum nível de aprovação configurado para este valor");
}
// Check for auto-approval
var firstLevel = applicableLevels[0];
var isAutoApproved =
  firstLevel.auto_approve_below !== null && requestData.amount <= firstLevel.auto_approve_below;
// Create approval request
var _r = await this.supabase
    .from("approval_requests")
    .insert([
      {
        accounts_payable_id: requestData.accounts_payable_id,
        requester_id: user.id,
        requester_name: user.email || "Usuário",
        request_date: new Date().toISOString(),
        amount: requestData.amount,
        current_level: isAutoApproved ? applicableLevels.length + 1 : 1,
        status: isAutoApproved ? "approved" : "pending",
        priority: requestData.priority || "normal",
        reason: requestData.reason,
        justification: requestData.justification,
        due_date: requestData.due_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single(),
  request = _r.data,
  requestError = _r.error;
if (requestError) throw requestError;
// Create approval steps
var steps = applicableLevels.map(function (level, index) {
  return {
    approval_request_id: request.id,
    level_order: level.level_order,
    level_name: level.level_name,
    required_approvers: level.required_approvers,
    approved_count: isAutoApproved && index === 0 ? level.required_approvers : 0,
    status: isAutoApproved && index === 0 ? "approved" : "pending",
    deadline: new Date(Date.now() + level.approval_timeout_hours * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    completed_at: isAutoApproved && index === 0 ? new Date().toISOString() : undefined,
  };
});
var stepsError = (await this.supabase.from("approval_steps").insert(steps)).error;
if (stepsError) throw stepsError;
return request;
try {
} catch (error) {
  console.error("Error creating approval request:", error);
  throw new Error("Falha ao criar solicitação de aprovação");
}
async;
getApprovalRequest(id, string);
Promise < ApprovalRequest & {
    approval_chain: (ApprovalStep & { approvers: ApprovalAction[] })[]
} > {
    try: {
        // Get request details
        const: (_a = await this.supabase
            .from('approval_requests')
            .select("\n          *,\n          accounts_payable (\n            id,\n            invoice_number,\n            vendor_name,\n            category\n          )\n        ")
            .eq('id', id)
            .single(), request = _a.data, requestError = _a.error, _a),
        if: function (requestError) { },
        throw: requestError
        // Get approval steps
        ,
        // Get approval steps
        const: (_b = await this.supabase
            .from('approval_steps')
            .select('*')
            .eq('approval_request_id', id)
            .order('level_order'), steps = _b.data, stepsError = _b.error, _b),
        if: function (stepsError) { },
        throw: stepsError
        // Get approval actions for each step
        ,
        // Get approval actions for each step
        const: stepsWithActions = await Promise.all((steps || []).map(function (step) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, actions, actionsError;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('approval_actions')
                            .select('*')
                            .eq('approval_step_id', step.id)
                            .order('action_date')];
                    case 1:
                        _a = _b.sent(), actions = _a.data, actionsError = _a.error;
                        if (actionsError)
                            throw actionsError;
                        return [2 /*return*/, __assign(__assign({}, step), { approvers: actions || [] })];
                }
            });
        }); })),
        return: __assign(__assign({}, request), { approval_chain: stepsWithActions })
    },
    catch: function (error) {
        console.error('Error fetching approval request:', error);
        throw new Error('Falha ao carregar solicitação de aprovação');
    }
};
async;
getMyApprovalRequests();
Promise < ApprovalRequest[] > {
    try: {
        const: (_c = await this.supabase.auth.getUser(), user = _c.data.user, _c),
        if: function (, user) { },
        throw: new Error('Usuário não autenticado'),
        const: (_d = await this.supabase
            .from('approval_requests')
            .select("\n          *,\n          accounts_payable (\n            invoice_number,\n            vendor_name,\n            category\n          )\n        ")
            .eq('requester_id', user.id)
            .order('created_at', { ascending: false }), data = _d.data, error = _d.error, _d),
        if: function (error) { },
        throw: error,
        return: data || []
    },
    catch: function (error) {
        console.error('Error fetching my approval requests:', error);
        throw new Error('Falha ao carregar minhas solicitações');
    }
};
async;
getPendingApprovals();
Promise < ApprovalRequest[] > {
    try: {
        const: (_e = await this.supabase.auth.getUser(), user = _e.data.user, _e),
        if: function (, user) { },
        throw: new Error('Usuário não autenticado')
        // Get user's approval permissions
        ,
        // Get user's approval permissions
        const: (_f = await this.supabase
            .from('approval_users')
            .select('approval_level_id')
            .eq('user_id', user.id)
            .eq('is_active', true), userPermissions = _f.data, _f),
        if: function (, userPermissions) { }
    } || userPermissions.length === 0
};
{
  return [];
}
var levelIds = userPermissions.map(function (p) {
  return p.approval_level_id;
});
// Find requests where user can approve
var _s = await this.supabase
    .from("approval_requests")
    .select(
      "\n          *,\n          accounts_payable (\n            invoice_number,\n            vendor_name,\n            category\n          ),\n          approval_steps!inner (\n            id,\n            level_order,\n            level_name,\n            status,\n            deadline\n          )\n        ",
    )
    .eq("status", "pending")
    .in("approval_steps.level_order", levelIds) // This would need proper join logic
    .order("created_at", { ascending: false }),
  data = _s.data,
  error = _s.error;
if (error) throw error;
return data || [];
try {
} catch (error) {
  console.error("Error fetching pending approvals:", error);
  throw new Error("Falha ao carregar aprovações pendentes");
}
// Approval Actions
async;
processApprovalAction(stepId, string, action, 'approve' | 'reject' | 'request_info' | 'escalate', comments ?  : string);
Promise < void  > {
    try: {
        const: (_g = await this.supabase.auth.getUser(), user = _g.data.user, _g),
        if: function (, user) { },
        throw: new Error('Usuário não autenticado')
        // Get step details
        ,
        // Get step details
        const: (_h = await this.supabase
            .from('approval_steps')
            .select("\n          *,\n          approval_requests (*)\n        ")
            .eq('id', stepId)
            .single(), step = _h.data, stepError = _h.error, _h),
        if: function (stepError) { },
        throw: stepError
        // Verify user can approve this step
        ,
        // Verify user can approve this step
        const: (_j = await this.supabase
            .from('approval_users')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single(), userPermission = _j.data, _j),
        if: function (, userPermission) {
            throw new Error('Usuário não tem permissão para aprovar');
        }
        // Record the action
        ,
        // Record the action
        const: (_k = await this.supabase
            .from('approval_actions')
            .insert([{
                approval_step_id: stepId,
                approver_id: user.id,
                approver_name: user.email || 'Usuário',
                approver_email: user.email || '',
                action: action,
                comments: comments,
                action_date: new Date().toISOString(),
                can_override: userPermission.can_override
            }]), actionError = _k.error, _k),
        if: function (actionError) { },
        throw: actionError
        // Update step status
        ,
        // Update step status
        const: newApprovedCount = action === 'approve'
            ? step.approved_count + 1
            : step.approved_count,
        const: stepStatus = action === 'reject'
            ? 'rejected'
            : action === 'escalate'
                ? 'escalated'
                : newApprovedCount >= step.required_approvers
                    ? 'approved'
                    : 'pending',
        const: (_l = await this.supabase
            .from('approval_steps')
            .update({
            approved_count: newApprovedCount,
            status: stepStatus,
            completed_at: stepStatus !== 'pending' ? new Date().toISOString() : undefined
        })
            .eq('id', stepId), updateStepError = _l.error, _l),
        if: function (updateStepError) { },
        throw: updateStepError
        // Update request status if necessary
        ,
        // Update request status if necessary
        if: function (stepStatus) { }
    } === 'approved' || stepStatus === 'rejected'
};
{
  var updateRequestError = (
    await this.supabase
      .from("approval_requests")
      .update({
        current_level:
          stepStatus === "approved" && step.approval_requests.current_level < 3
            ? step.approval_requests.current_level + 1
            : step.approval_requests.current_level,
        status:
          stepStatus === "rejected"
            ? "rejected"
            : stepStatus === "approved" && step.level_order === 3
              ? "approved"
              : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", step.approval_request_id)
  ).error;
  if (updateRequestError) throw updateRequestError;
}
// Send notifications (would be implemented with notification service)
await this.sendApprovalNotification(step.approval_request_id, action, userPermission.user_name);
try {
} catch (error) {
  console.error("Error processing approval action:", error);
  throw new Error("Falha ao processar ação de aprovação");
}
async;
cancelApprovalRequest(requestId, string);
Promise < void  > {
    try: {
        const: (_m = await this.supabase.auth.getUser(), user = _m.data.user, _m),
        if: function (, user) { },
        throw: new Error('Usuário não autenticado')
        // Verify user can cancel (must be requester or admin)
        ,
        // Verify user can cancel (must be requester or admin)
        const: (_o = await this.supabase
            .from('approval_requests')
            .select('requester_id')
            .eq('id', requestId)
            .single(), request = _o.data, _o),
        if: function (, request) { }
    } || request.requester_id !== user.id
};
{
  // Check if user is admin
  var userPermission = (
    await this.supabase.from("approval_users").select("role").eq("user_id", user.id).single()
  ).data;
  if (!userPermission || !["admin", "super_admin"].includes(userPermission.role)) {
    throw new Error("Não autorizado a cancelar esta solicitação");
  }
}
var error = (
  await this.supabase
    .from("approval_requests")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
).error;
if (error) throw error;
try {
} catch (error) {
  console.error("Error cancelling approval request:", error);
  throw new Error("Falha ao cancelar solicitação de aprovação");
}
async;
sendApprovalNotification(requestId, string, action, string, approverName, string);
Promise < void  > {
    try: {
        // This would integrate with a notification service
        console: console,
        : .log("Notification: Request ".concat(requestId, " was ").concat(action, " by ").concat(approverName))
        // Could send email, push notification, etc.
        // await notificationService.send({
        //   type: 'approval_action',
        //   requestId,
        //   action,
        //   approverName
        // })
    },
    catch: function (error) {
        console.error('Error sending notification:', error);
        // Don't throw - notification failures shouldn't break approval flow
    }
};
// Utility Methods
async;
getApprovalStats();
Promise <
  {
    pending: number,
    approved: number,
    rejected: number,
    escalated: number,
    overdue: number,
  } >
  {
    try: {
      const:
        ((_p = await this.supabase.rpc("get_approval_stats")),
        (data = _p.data),
        (error = _p.error),
        _p),
      if: function (error) {},
      throw: error,
      return: data || {
        pending: 0,
        approved: 0,
        rejected: 0,
        escalated: 0,
        overdue: 0,
      },
    },
    catch: function (error) {
      console.error("Error fetching approval stats:", error);
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        escalated: 0,
        overdue: 0,
      };
    },
  };
async;
validateApprovalHierarchy();
Promise < {
    isValid: boolean,
    issues: string[]
} > {
    try: (_q = {
            const: levels = await this.getApprovalLevels(),
            const: users = await this.getApprovalUsers(),
            const: issues,
            string: string
        },
        _q[] =  = [],
        // Check if levels have gaps in order
        _q.const = orders = levels.map(function (l) { return l.level_order;
}).sort(
function (a, b) { return a - b; }
),
        _q.
for
=
function (let, i, i) {
            if (i === void 0) { i = 1; }
        }
,
        _q) <= orders.length,
    i: i
}++
{
  if (!orders.includes(i)) {
    issues.push("N\u00EDvel ".concat(i, " n\u00E3o existe na hierarquia"));
  }
}
var _loop_1 = function (level) {
  var levelUsers = users.filter(function (u) {
    return u.approval_level_id === level.id;
  });
  if (levelUsers.length < level.required_approvers) {
    issues.push(
      "N\u00EDvel "
        .concat(level.level_name, " requer ")
        .concat(level.required_approvers, " aprovadores mas s\u00F3 tem ")
        .concat(levelUsers.length),
    );
  }
};
// Check if levels have sufficient approvers
for (var _i = 0, levels_1 = levels; _i < levels_1.length; _i++) {
  var level = levels_1[_i];
  _loop_1(level);
}
// Check for overlapping amount ranges
for (var i = 0; i < levels.length; i++) {
  for (var j = i + 1; j < levels.length; j++) {
    var level1 = levels[i];
    var level2 = levels[j];
    var l1Min = level1.min_amount;
    var l1Max = level1.max_amount || Infinity;
    var l2Min = level2.min_amount;
    var l2Max = level2.max_amount || Infinity;
    if (l1Min <= l2Max && l1Max >= l2Min) {
      issues.push(
        "N\u00EDveis "
          .concat(level1.level_name, " e ")
          .concat(level2.level_name, " t\u00EAm faixas de valores sobrepostas"),
      );
    }
  }
}
return {
    isValid: issues.length === 0,
    issues: issues
};
try {
} catch (error) {
  console.error("Error validating approval hierarchy:", error);
  return {
        isValid: false,
        issues: ['Erro ao validar hierarquia de aprovação']
    };
}
exports.approvalService = new ApprovalService();
exports.default = exports.approvalService;
