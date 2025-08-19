// CommonJS wrapper for webauthn-service
const webAuthnService = {
  validateCredential: (_credential) => {
    return { valid: true, user: { id: 'test-user' } };
  },

  getCredentials: (_userId) => {
    return [];
  },

  createCredential: (_options) => {
    return {
      id: 'test-credential',
      publicKey: 'test-public-key',
      counter: 0,
    };
  },

  validateChallenge: (_challenge) => {
    return true;
  },

  getPublicKeyCredentialRequestOptions: (_userId) => {
    return {
      challenge: 'test-challenge',
      allowCredentials: [],
      userVerification: 'required',
    };
  },

  getPublicKeyCredentialCreationOptions: (user) => {
    return {
      challenge: 'test-challenge',
      rp: { name: 'NeonPro', id: 'localhost' },
      user: { id: user.id, name: user.email, displayName: user.name },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
    };
  },
};

module.exports = { webAuthnService };
