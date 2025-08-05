"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIPE_CONFIG = exports.getStripe = exports.stripe = void 0;
var stripe_1 = require("stripe");
var stripe_js_1 = require("@stripe/stripe-js");
// Server-side Stripe instance
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});
// Client-side Stripe instance
var stripePromise;
var getStripe = function () {
  if (!stripePromise) {
    stripePromise = (0, stripe_js_1.loadStripe)(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
exports.getStripe = getStripe;
// Stripe configuration constants
exports.STRIPE_CONFIG = {
  currency: "usd",
  payment_method_types: ["card"],
  billing_address_collection: "auto",
  shipping_address_collection: {
    allowed_countries: ["US", "BR", "CA", "GB", "AU"],
  },
  automatic_tax: {
    enabled: false,
  },
};
