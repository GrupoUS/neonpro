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
exports.intelligentSecurityMiddleware = intelligentSecurityMiddleware;
/**
 * 🛡️ Main Security Middleware Function
 */
function intelligentSecurityMiddleware(request) {
  return __awaiter(this, void 0, void 0, function () {
    var startTime,
      ip,
      userAgent,
      route,
      method,
      threatAnalysis,
      limits,
      rateLimitResult,
      response_1,
      response_2,
      response,
      response;
    return __generator(this, (_a) => {
      startTime = Date.now();
      ip = getClientIP(request);
      userAgent = request.headers.get("user-agent") || "unknown";
      route = request.nextUrl.pathname;
      method = request.method;
      try {
        // 1. Check if IP is in trusted cache (fastest path)
        if (trustedIPsCache.get(ip)) {
          return [2 /*return*/, NextResponse.next()];
        }
        threatAnalysis = ThreatDetection.analyzeSuspiciousActivity(ip, userAgent, route, method);
        limits = IntelligentRateLimit.getAdaptiveLimits(route, method);
        rateLimitResult = IntelligentRateLimit.checkRateLimit(ip, route, limits);
        // 4. Record security event
        ThreatDetection.recordEvent({
          ip: ip,
          userAgent: userAgent,
          route: route,
          method: method,
          timestamp: Date.now(),
          suspicious: threatAnalysis.suspicious,
          reason: threatAnalysis.reason,
        });
        // 5. Make security decision
        if (!rateLimitResult.allowed) {
          response_1 = new NextResponse(
            JSON.stringify({
              error: "Rate limit exceeded",
              retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                "X-RateLimit-Limit": String(limits.requests),
                "X-RateLimit-Remaining": String(rateLimitResult.remaining),
                "X-RateLimit-Reset": String(rateLimitResult.resetTime),
              },
            },
          );
          // Record performance metric
          performanceMonitor.recordAPIPerformance({
            route: route,
            method: method,
            statusCode: 429,
            responseTime: Date.now() - startTime,
            userId: undefined,
            clinicId: undefined,
            userAgent: userAgent,
            timestamp: Date.now(),
          });
          return [2 /*return*/, response_1];
        }
        // 6. Block high-risk requests
        if (threatAnalysis.riskScore >= 8) {
          response_2 = new NextResponse(
            JSON.stringify({
              error: "Request blocked for security reasons",
              requestId: "sec_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
            }),
            {
              status: 403,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          performanceMonitor.recordAPIPerformance({
            route: route,
            method: method,
            statusCode: 403,
            responseTime: Date.now() - startTime,
            userId: undefined,
            clinicId: undefined,
            userAgent: userAgent,
            timestamp: Date.now(),
          });
          return [2 /*return*/, response_2];
        }
        response = NextResponse.next();
        // Security headers
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("X-Frame-Options", "DENY");
        response.headers.set("X-XSS-Protection", "1; mode=block");
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
        // Rate limit info headers (for debugging)
        if (process.env.NODE_ENV === "development") {
          response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
          response.headers.set("X-Threat-Score", String(threatAnalysis.riskScore));
        }
        // 8. Mark as trusted if legitimate long-term user
        if (!threatAnalysis.suspicious && rateLimitResult.remaining > limits.requests * 0.8) {
          trustedIPsCache.set(ip, true);
        }
        return [2 /*return*/, response];
      } catch (error) {
        console.error("Security middleware error:", error);
        response = NextResponse.next();
        performanceMonitor.recordAPIPerformance({
          route: route,
          method: method,
          statusCode: 200, // Pass-through
          responseTime: Date.now() - startTime,
          userId: undefined,
          clinicId: undefined,
          userAgent: userAgent,
          timestamp: Date.now(),
        });
        return [2 /*return*/, response];
      }
      return [2 /*return*/];
    });
  });
}
/**
 * 🌐 Get client IP address
 */
function getClientIP(request) {
  // Try various headers for IP detection (Vercel, CloudFlare, etc.)
  var forwarded = request.headers.get("x-forwarded-for");
  var realIP = request.headers.get("x-real-ip");
  var cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();
  // Fallback to connection IP
  return request.ip || "unknown";
}
