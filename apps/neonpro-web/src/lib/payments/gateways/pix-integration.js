"use strict";
/**
 * PIX Integration for Brazilian Instant Payments
 * Implements PIX payment processing with QR code generation and real-time status tracking
 */
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
exports.pixIntegration = exports.PixIntegration = exports.PixPaymentStatus = void 0;
exports.createPixIntegration = createPixIntegration;
var client_1 = require("@/lib/supabase/client");
var crypto_1 = require("crypto");
var PixPaymentStatus;
(function (PixPaymentStatus) {
    PixPaymentStatus["PENDING"] = "pending";
    PixPaymentStatus["PAID"] = "paid";
    PixPaymentStatus["EXPIRED"] = "expired";
    PixPaymentStatus["CANCELLED"] = "cancelled";
    PixPaymentStatus["FAILED"] = "failed";
})(PixPaymentStatus || (exports.PixPaymentStatus = PixPaymentStatus = {}));
/**
 * PIX Payment Integration Service
 * Handles Brazilian instant payment processing
 */
var PixIntegration = /** @class */ (function () {
    function PixIntegration(config) {
        this.supabase = (0, client_1.createClient)();
        this.config = config;
    }
    /**
     * Create a new PIX payment
     */
    PixIntegration.prototype.createPayment = function (paymentData) {
        return __awaiter(this, void 0, void 0, function () {
            var paymentId, expirationMinutes, expiresAt, qrCodeData, qrCodeImage, _a, payment, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        paymentId = this.generatePaymentId();
                        expirationMinutes = paymentData.expirationMinutes || 30;
                        expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
                        qrCodeData = this.generatePixQRCode({
                            pixKey: this.config.pixKey,
                            amount: paymentData.amount,
                            description: paymentData.description,
                            merchantName: this.config.merchantName,
                            merchantCity: this.config.merchantCity,
                            txId: paymentId
                        });
                        return [4 /*yield*/, this.generateQRCodeImage(qrCodeData)
                            // Store payment in database
                        ];
                    case 1:
                        qrCodeImage = _b.sent();
                        return [4 /*yield*/, this.supabase
                                .from('pix_payments')
                                .insert({
                                id: paymentId,
                                amount: paymentData.amount,
                                currency: paymentData.currency,
                                description: paymentData.description,
                                payer_name: paymentData.payerName,
                                payer_document: paymentData.payerDocument,
                                payer_email: paymentData.payerEmail,
                                qr_code: qrCodeData,
                                qr_code_image: qrCodeImage,
                                pix_key: this.config.pixKey,
                                status: PixPaymentStatus.PENDING,
                                expires_at: expiresAt.toISOString(),
                                additional_info: paymentData.additionalInfo
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), payment = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to create PIX payment: ".concat(error.message));
                        }
                        // Register webhook for payment status updates
                        return [4 /*yield*/, this.registerWebhook(paymentId)];
                    case 3:
                        // Register webhook for payment status updates
                        _b.sent();
                        return [2 /*return*/, {
                                id: paymentId,
                                qrCode: qrCodeData,
                                qrCodeImage: qrCodeImage,
                                pixKey: this.config.pixKey,
                                amount: paymentData.amount,
                                status: PixPaymentStatus.PENDING,
                                expiresAt: expiresAt,
                                createdAt: new Date()
                            }];
                    case 4:
                        error_1 = _b.sent();
                        console.error('PIX payment creation failed:', error_1);
                        throw new Error("PIX payment creation failed: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get PIX payment status
     */
    PixIntegration.prototype.getPaymentStatus = function (paymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, payment, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('pix_payments')
                                .select('status, expires_at')
                                .eq('id', paymentId)
                                .single()];
                    case 1:
                        _a = _b.sent(), payment = _a.data, error = _a.error;
                        if (error || !payment) {
                            throw new Error('Payment not found');
                        }
                        if (!(payment.status === PixPaymentStatus.PENDING &&
                            new Date() > new Date(payment.expires_at))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updatePaymentStatus(paymentId, PixPaymentStatus.EXPIRED)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, PixPaymentStatus.EXPIRED];
                    case 3: return [2 /*return*/, payment.status];
                    case 4:
                        error_2 = _b.sent();
                        console.error('Failed to get PIX payment status:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle PIX webhook notifications
     */
    PixIntegration.prototype.handleWebhook = function (webhookData) {
        return __awaiter(this, void 0, void 0, function () {
            var paymentId, status_1, paidAt, payerInfo, updateData, error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        paymentId = webhookData.paymentId, status_1 = webhookData.status, paidAt = webhookData.paidAt, payerInfo = webhookData.payerInfo;
                        updateData = {
                            status: status_1,
                            updated_at: new Date().toISOString()
                        };
                        if (paidAt) {
                            updateData.paid_at = paidAt.toISOString();
                        }
                        if (payerInfo) {
                            updateData.payer_bank = payerInfo.bank;
                            updateData.payer_info = payerInfo;
                        }
                        return [4 /*yield*/, this.supabase
                                .from('pix_payments')
                                .update(updateData)
                                .eq('id', paymentId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Failed to update payment status: ".concat(error.message));
                        }
                        if (!(status_1 === PixPaymentStatus.PAID)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.processSuccessfulPayment(paymentId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error('PIX webhook processing failed:', error_3);
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel a PIX payment
     */
    PixIntegration.prototype.cancelPayment = function (paymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.updatePaymentStatus(paymentId, PixPaymentStatus.CANCELLED)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Failed to cancel PIX payment:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate PIX QR Code data according to Brazilian Central Bank standards
     */
    PixIntegration.prototype.generatePixQRCode = function (data) {
        // PIX QR Code format according to Brazilian Central Bank specification
        // This is a simplified implementation - in production, use a certified PIX library
        var payload = [
            '00020126', // Payload Format Indicator
            '01040014', // Point of Initiation Method
            "26".concat(this.formatPixKey(data.pixKey)), // Merchant Account Information
            '52040000', // Merchant Category Code
            '5303986', // Transaction Currency (986 = BRL)
            "54".concat(String(data.amount.toFixed(2)).padStart(2, '0')).concat(data.amount.toFixed(2)), // Transaction Amount
            '5802BR', // Country Code
            "59".concat(String(data.merchantName.length).padStart(2, '0')).concat(data.merchantName), // Merchant Name
            "60".concat(String(data.merchantCity.length).padStart(2, '0')).concat(data.merchantCity), // Merchant City
            "62".concat(this.formatAdditionalData(data.txId, data.description)),
        ].join('');
        // Calculate CRC16
        var crc = this.calculateCRC16(payload + '6304');
        return payload + '6304' + crc;
    };
    /**
     * Format PIX key for QR code
     */
    PixIntegration.prototype.formatPixKey = function (pixKey) {
        var keyData = "0014".concat(pixKey);
        return "".concat(String(keyData.length).padStart(2, '0')).concat(keyData);
    };
    /**
     * Format additional data for QR code
     */
    PixIntegration.prototype.formatAdditionalData = function (txId, description) {
        var txIdField = "05".concat(String(txId.length).padStart(2, '0')).concat(txId);
        var descField = description ? "02".concat(String(description.length).padStart(2, '0')).concat(description) : '';
        var additionalData = txIdField + descField;
        return "".concat(String(additionalData.length).padStart(2, '0')).concat(additionalData);
    };
    /**
     * Calculate CRC16 for PIX QR code
     */
    PixIntegration.prototype.calculateCRC16 = function (data) {
        // CRC16-CCITT implementation for PIX
        var crc = 0xFFFF;
        for (var i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (var j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                }
                else {
                    crc <<= 1;
                }
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    };
    /**
     * Generate QR code image from data
     */
    PixIntegration.prototype.generateQRCodeImage = function (qrCodeData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In production, use a QR code generation library like 'qrcode'
                // For now, return a placeholder base64 image
                return [2 /*return*/, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="];
            });
        });
    };
    /**
     * Generate unique payment ID
     */
    PixIntegration.prototype.generatePaymentId = function () {
        return "pix_".concat(crypto_1.default.randomUUID().replace(/-/g, ''));
    };
    /**
     * Register webhook for payment status updates
     */
    PixIntegration.prototype.registerWebhook = function (paymentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In production, register webhook with PIX provider
                console.log("Webhook registered for payment ".concat(paymentId));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update payment status in database
     */
    PixIntegration.prototype.updatePaymentStatus = function (paymentId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('pix_payments')
                            .update({
                            status: status,
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', paymentId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Failed to update payment status: ".concat(error.message));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process successful payment
     */
    PixIntegration.prototype.processSuccessfulPayment = function (paymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, payment, error, updateError, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('pix_payments')
                                .select('*')
                                .eq('id', paymentId)
                                .single()];
                    case 1:
                        _a = _b.sent(), payment = _a.data, error = _a.error;
                        if (error || !payment) {
                            throw new Error('Payment not found');
                        }
                        return [4 /*yield*/, this.supabase
                                .from('ap_payments')
                                .update({
                                status: 'completed',
                                payment_method: 'pix',
                                transaction_id: paymentId,
                                paid_at: new Date().toISOString()
                            })
                                .eq('pix_payment_id', paymentId)];
                    case 2:
                        updateError = (_b.sent()).error;
                        if (updateError) {
                            console.error('Failed to update main payment record:', updateError);
                        }
                        // Send confirmation email
                        return [4 /*yield*/, this.sendPaymentConfirmation(payment)];
                    case 3:
                        // Send confirmation email
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _b.sent();
                        console.error('Failed to process successful payment:', error_5);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send payment confirmation email
     */
    PixIntegration.prototype.sendPaymentConfirmation = function (payment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would use the existing email service
                console.log("Payment confirmation sent for ".concat(payment.id));
                return [2 /*return*/];
            });
        });
    };
    return PixIntegration;
}());
exports.PixIntegration = PixIntegration;
/**
 * PIX Integration Factory
 */
function createPixIntegration() {
    var config = {
        apiKey: process.env.PIX_API_KEY || '',
        apiSecret: process.env.PIX_API_SECRET || '',
        environment: process.env.PIX_ENVIRONMENT || 'sandbox',
        webhookUrl: process.env.PIX_WEBHOOK_URL || '',
        pixKey: process.env.PIX_KEY || '',
        merchantName: process.env.PIX_MERCHANT_NAME || 'NeonPro Clinic',
        merchantCity: process.env.PIX_MERCHANT_CITY || 'São Paulo'
    };
    return new PixIntegration(config);
}
// Export default instance
exports.pixIntegration = createPixIntegration();
