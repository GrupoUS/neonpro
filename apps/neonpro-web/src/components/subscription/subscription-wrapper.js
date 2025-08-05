"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SubscriptionWrapper;
var react_1 = require("react");
var auth_context_1 = require("@/contexts/auth-context");
var use_subscription_1 = require("@/hooks/use-subscription");
// Debug: Log the imported SubscriptionProvider
console.log('SubscriptionProvider:', use_subscription_1.SubscriptionProvider);
function SubscriptionWrapper(_a) {
    var children = _a.children;
    var user = (0, auth_context_1.useAuth)().user;
    // Convert auth context user to supabase user format
    var supabaseUser = user ? {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata || {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        confirmation_sent_at: null,
        confirmed_at: null,
        email_change: null,
        email_change_sent_at: null,
        email_change_token: null,
        email_change_confirm_status: 0,
        invited_at: null,
        action_link: null,
        phone: null,
        phone_confirmed_at: null,
        phone_change: null,
        phone_change_token: null,
        phone_change_sent_at: null,
        recovery_sent_at: null,
        new_email: null,
        new_phone: null
    } : null;
    return <use_subscription_1.SubscriptionProvider user={supabaseUser}>{children}</use_subscription_1.SubscriptionProvider>;
}
