// CommonJS wrapper for webauthn-client
const webAuthnClient = {
  isSupported: () => {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.credentials !== 'undefined' &&
      typeof navigator.credentials.create === 'function'
    );
  },

  register: async (options) => {
    // Mock implementation for testing
    return {
      id: 'mock-credential-id',
      response: {
        clientDataJSON: new ArrayBuffer(0),
        attestationObject: new ArrayBuffer(0),
      },
      type: 'public-key',
    };
  },

  authenticate: async (_options) => {
    // Mock implementation for testing
    return {
      id: 'mock-credential-id',
      response: {
        clientDataJSON: new ArrayBuffer(0),
        authenticatorData: new ArrayBuffer(0),
        signature: new ArrayBuffer(0),
        userHandle: new ArrayBuffer(0),
      },
      type: 'public-key',
    };
  },

  getCredentials: () => {
    return [];
  },
};

module.exports = { webAuthnClient };
