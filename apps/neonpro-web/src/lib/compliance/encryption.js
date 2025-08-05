"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.lgpdEncryptionService =
  exports.encryptionService =
  exports.LGPDEncryptionService =
  exports.EncryptionService =
    void 0;
var crypto_1 = require("crypto");
var EncryptionService = /** @class */ (function () {
  function EncryptionService() {
    this.algorithm = "aes-256-gcm";
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
  }
  EncryptionService.prototype.getKey = function () {
    var key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error("ENCRYPTION_KEY not found in environment variables");
    }
    return Buffer.from(key, "hex");
  };
  EncryptionService.prototype.encrypt = function (text) {
    var key = this.getKey();
    var iv = crypto_1.default.randomBytes(this.ivLength);
    var cipher = crypto_1.default.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from("neonpro", "utf8"));
    var encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    var tag = cipher.getAuthTag();
    return {
      encrypted: encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };
  };
  EncryptionService.prototype.decrypt = function (encryptedData) {
    var key = this.getKey();
    var decipher = crypto_1.default.createDecipher(this.algorithm, key);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));
    decipher.setAAD(Buffer.from("neonpro", "utf8"));
    var decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };
  EncryptionService.prototype.hashSensitiveData = function (data) {
    return crypto_1.default.createHash("sha256").update(data).digest("hex");
  };
  EncryptionService.prototype.generateSecureId = function () {
    return crypto_1.default.randomBytes(16).toString("hex");
  };
  return EncryptionService;
})();
exports.EncryptionService = EncryptionService;
var LGPDEncryptionService = /** @class */ (function (_super) {
  __extends(LGPDEncryptionService, _super);
  function LGPDEncryptionService() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  LGPDEncryptionService.prototype.encryptPersonalData = function (data) {
    var sensitiveFields = ["cpf", "rg", "email", "phone", "address"];
    var encrypted = __assign({}, data);
    for (var _i = 0, sensitiveFields_1 = sensitiveFields; _i < sensitiveFields_1.length; _i++) {
      var field = sensitiveFields_1[_i];
      if (encrypted[field] && typeof encrypted[field] === "string") {
        var encryptionResult = this.encrypt(encrypted[field]);
        encrypted[field] = "enc:"
          .concat(encryptionResult.encrypted, ":")
          .concat(encryptionResult.iv, ":")
          .concat(encryptionResult.tag);
      }
    }
    return encrypted;
  };
  LGPDEncryptionService.prototype.decryptPersonalData = function (data) {
    var decrypted = __assign({}, data);
    for (var _i = 0, _a = Object.entries(decrypted); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        value = _b[1];
      if (typeof value === "string" && value.startsWith("enc:")) {
        var _c = value.split(":"),
          encrypted = _c[1],
          iv = _c[2],
          tag = _c[3];
        try {
          decrypted[key] = this.decrypt({ encrypted: encrypted, iv: iv, tag: tag });
        } catch (error) {
          console.error("Failed to decrypt field ".concat(key, ":"), error);
          decrypted[key] = "[ENCRYPTED]";
        }
      }
    }
    return decrypted;
  };
  return LGPDEncryptionService;
})(EncryptionService);
exports.LGPDEncryptionService = LGPDEncryptionService;
exports.encryptionService = new EncryptionService();
exports.lgpdEncryptionService = new LGPDEncryptionService();
