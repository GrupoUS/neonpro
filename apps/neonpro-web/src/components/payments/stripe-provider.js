"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useElements = exports.useStripe = void 0;
exports.default = StripeProvider;
var react_1 = require("react");
var stripe_js_1 = require("@stripe/stripe-js");
var react_stripe_js_1 = require("@stripe/react-stripe-js");
// Inicializar Stripe (só uma vez)
var stripePromise = (0, stripe_js_1.loadStripe)(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
function StripeProvider(_a) {
  var children = _a.children;
  return <react_stripe_js_1.Elements stripe={stripePromise}>{children}</react_stripe_js_1.Elements>;
}
// Hook para usar Stripe de forma mais conveniente
var react_stripe_js_2 = require("@stripe/react-stripe-js");
Object.defineProperty(exports, "useStripe", {
  enumerable: true,
  get: () => react_stripe_js_2.useStripe,
});
Object.defineProperty(exports, "useElements", {
  enumerable: true,
  get: () => react_stripe_js_2.useElements,
});
