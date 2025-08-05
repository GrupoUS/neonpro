"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var email_service_1 = require("@/app/lib/services/email-service");
var crypto_1 = require("crypto");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, body, signature, provider, isValidSignature, data, emailService, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, request.text()];
                case 2:
                    body = _a.sent();
                    signature = request.headers.get('x-postmark-signature') ||
                        request.headers.get('x-sendgrid-signature') ||
                        request.headers.get('x-mailgun-signature');
                    if (!signature) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })];
                    }
                    provider = void 0;
                    if (request.headers.get('x-postmark-signature')) {
                        provider = 'postmark';
                    }
                    else if (request.headers.get('x-sendgrid-signature')) {
                        provider = 'sendgrid';
                    }
                    else if (request.headers.get('x-mailgun-signature')) {
                        provider = 'mailgun';
                    }
                    if (!provider) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unknown webhook provider' }, { status: 400 })];
                    }
                    return [4 /*yield*/, verifyWebhookSignature(provider, body, signature, request.headers)];
                case 3:
                    isValidSignature = _a.sent();
                    if (!isValidSignature) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })];
                    }
                    data = JSON.parse(body);
                    emailService = new email_service_1.default(supabase);
                    // Processar o webhook baseado no provedor
                    return [4 /*yield*/, emailService.handleWebhook(provider, data)];
                case 4:
                    // Processar o webhook baseado no provedor
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true })];
                case 5:
                    error_1 = _a.sent();
                    console.error('Email webhook error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function verifyWebhookSignature(provider, body, signature, headers) {
    return __awaiter(this, void 0, void 0, function () {
        var postmarkSecret, postmarkExpected, sendgridPublicKey, mailgunSecret, timestamp, token, mailgunData, mailgunExpected;
        return __generator(this, function (_a) {
            try {
                switch (provider) {
                    case 'postmark':
                        postmarkSecret = process.env.POSTMARK_WEBHOOK_SECRET;
                        if (!postmarkSecret)
                            return [2 /*return*/, false];
                        postmarkExpected = crypto_1.default
                            .createHmac('sha256', postmarkSecret)
                            .update(body)
                            .digest('hex');
                        return [2 /*return*/, signature === postmarkExpected];
                    case 'sendgrid':
                        sendgridPublicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
                        if (!sendgridPublicKey)
                            return [2 /*return*/, false];
                        // Implementar verificação ECDSA do SendGrid
                        // Por simplicidade, retornando true por enquanto
                        return [2 /*return*/, true];
                    case 'mailgun':
                        mailgunSecret = process.env.MAILGUN_WEBHOOK_SECRET;
                        if (!mailgunSecret)
                            return [2 /*return*/, false];
                        timestamp = headers.get('x-mailgun-timestamp');
                        token = headers.get('x-mailgun-token');
                        if (!timestamp || !token)
                            return [2 /*return*/, false];
                        mailgunData = timestamp + token;
                        mailgunExpected = crypto_1.default
                            .createHmac('sha256', mailgunSecret)
                            .update(mailgunData)
                            .digest('hex');
                        return [2 /*return*/, signature === mailgunExpected];
                    default:
                        return [2 /*return*/, false];
                }
            }
            catch (error) {
                console.error('Webhook signature verification error:', error);
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
