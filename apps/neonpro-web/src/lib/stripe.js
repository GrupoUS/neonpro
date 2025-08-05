Object.defineProperty(exports, "__esModule", { value: true });
exports.fromStripeAmount =
  exports.toStripeAmount =
  exports.formatCurrency =
  exports.BRAZIL_PAYMENT_METHODS =
  exports.STRIPE_CONFIG =
  exports.stripe =
  exports.getStripe =
    void 0;
var stripe_js_1 = require("@stripe/stripe-js");
var stripe_1 = require("stripe");
// Client-side Stripe instance
var stripePromise;
var getStripe = () => {
  if (!stripePromise) {
    stripePromise = (0, stripe_js_1.loadStripe)(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
exports.getStripe = getStripe;
// Server-side Stripe instance
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
  typescript: true,
});
// Stripe configuration constants
exports.STRIPE_CONFIG = {
  currency: "brl",
  paymentMethods: ["card", "pix"],
  locale: "pt-BR",
  appearance: {
    theme: "stripe",
    variables: {
      colorPrimary: "#0570de",
      colorBackground: "#ffffff",
      colorText: "#30313d",
      colorDanger: "#df1b41",
      fontFamily: "system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
  },
};
// Payment method types for Brazil
exports.BRAZIL_PAYMENT_METHODS = ["card", "boleto", "pix"];
// Currency formatter for Brazil
var formatCurrency = (amount) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100); // Stripe uses cents
};
exports.formatCurrency = formatCurrency;
// Convert amount to Stripe format (cents)
var toStripeAmount = (amount) => Math.round(amount * 100);
exports.toStripeAmount = toStripeAmount;
// Convert Stripe amount to display format
var fromStripeAmount = (amount) => amount / 100;
exports.fromStripeAmount = fromStripeAmount;
exports.default = exports.stripe;
