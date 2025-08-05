"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SSO_PROVIDERS = exports.SSOErrorCode = void 0;
var SSOErrorCode;
(function (SSOErrorCode) {
  SSOErrorCode["INVALID_PROVIDER"] = "INVALID_PROVIDER";
  SSOErrorCode["AUTH_FAILED"] = "AUTH_FAILED";
  SSOErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
})(SSOErrorCode || (exports.SSOErrorCode = SSOErrorCode = {}));
// Default SSO providers configuration
exports.DEFAULT_SSO_PROVIDERS = [
  {
    id: "google",
    name: "Google",
    type: "oauth",
    enabled: true,
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      scope: "openid email profile",
    },
  },
  {
    id: "microsoft",
    name: "Microsoft",
    type: "oauth",
    enabled: true,
    config: {
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      scope: "openid email profile",
    },
  },
];
