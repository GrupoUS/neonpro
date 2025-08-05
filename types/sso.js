"use strict";
// SSO Integration Types for NeonPro
// Story 1.3: SSO Integration Implementation
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSO_VALIDATION_SCHEMAS = exports.DEFAULT_SSO_PROVIDERS = void 0;
// Default SSO Providers Configuration
exports.DEFAULT_SSO_PROVIDERS = [
    {
        id: 'google',
        name: 'Google',
        type: 'oauth',
        enabled: true,
        config: {
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
            scopes: ['openid', 'email', 'profile'],
            clientId: '',
            redirectUri: '',
        },
        metadata: {
            iconUrl: '/icons/google.svg',
            brandColor: '#4285f4',
            description: 'Sign in with your Google account',
        },
    },
    {
        id: 'microsoft',
        name: 'Microsoft',
        type: 'oauth',
        enabled: true,
        config: {
            authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
            scopes: ['openid', 'email', 'profile'],
            clientId: '',
            redirectUri: '',
        },
        metadata: {
            iconUrl: '/icons/microsoft.svg',
            brandColor: '#0078d4',
            description: 'Sign in with your Microsoft account',
            enterpriseOnly: true,
        },
    },
    {
        id: 'azure-ad',
        name: 'Azure Active Directory',
        type: 'oauth',
        enabled: false,
        config: {
            authUrl: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize',
            tokenUrl: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token',
            userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
            scopes: ['openid', 'email', 'profile'],
            clientId: '',
            redirectUri: '',
        },
        metadata: {
            iconUrl: '/icons/azure-ad.svg',
            brandColor: '#0078d4',
            description: 'Sign in with your organization account',
            enterpriseOnly: true,
        },
    },
    {
        id: 'facebook',
        name: 'Facebook',
        type: 'oauth',
        enabled: false,
        config: {
            authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
            tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
            userInfoUrl: 'https://graph.facebook.com/v18.0/me',
            scopes: ['email', 'public_profile'],
            clientId: '',
            redirectUri: '',
        },
        metadata: {
            iconUrl: '/icons/facebook.svg',
            brandColor: '#1877f2',
            description: 'Sign in with Facebook',
        },
    },
    {
        id: 'apple',
        name: 'Apple',
        type: 'oauth',
        enabled: false,
        config: {
            authUrl: 'https://appleid.apple.com/auth/authorize',
            tokenUrl: 'https://appleid.apple.com/auth/token',
            scopes: ['email', 'name'],
            clientId: '',
            redirectUri: '',
        },
        metadata: {
            iconUrl: '/icons/apple.svg',
            brandColor: '#000000',
            description: 'Sign in with Apple ID',
        },
    },
];
exports.SSO_VALIDATION_SCHEMAS = {
    oauth: {
        required: ['clientId', 'authUrl', 'tokenUrl', 'redirectUri', 'scopes'],
        optional: ['clientSecret', 'userInfoUrl', 'issuer', 'jwksUri'],
        format: {
            clientId: /^[a-zA-Z0-9._-]+$/,
            authUrl: /^https:\/\/.+/,
            tokenUrl: /^https:\/\/.+/,
            redirectUri: /^https:\/\/.+/,
        },
    },
    saml: {
        required: ['samlEntryPoint', 'samlCert', 'issuer'],
        optional: ['redirectUri'],
        format: {
            samlEntryPoint: /^https:\/\/.+/,
            issuer: /^[a-zA-Z0-9._:-]+$/,
        },
    },
};
