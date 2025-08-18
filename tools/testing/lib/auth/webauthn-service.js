// CommonJS wrapper for webauthn-service
const webAuthnService = {
  validateCredential: (credential) => {
    return { valid: true, user: { id: 'test-user' } };
  },

  getCredentials: (userId) => {
    return [];
  },

  createCredential: (options) => {
    return {
      id: 'test-credential',
      publicKey: 'test-public-key',
      counter: 0,
    };
  },

  validateChallenge: (challenge) => {
    return true;
  },

  getPublicKeyCredentialRequestOptions: (userId) => {
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
