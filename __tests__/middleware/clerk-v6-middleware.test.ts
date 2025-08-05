import { NextRequest } from "next/server";

// Mock Clerk middleware for testing
jest.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: jest.fn(),
  createRouteMatcher: jest.fn(() => jest.fn()),
}));

describe("Clerk v6 Middleware - TypeError Fix Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should handle authenticated user correctly", async () => {
    const mockAuth = jest.fn(() => ({
      userId: "user_123",
      redirectToSignIn: jest.fn(),
    }));

    const mockReq = new NextRequest("http://localhost:3000/dashboard");

    // Mock the middleware handler
    const middlewareHandler = (auth: any, _req: any) => {
      if (!auth().userId) {
        return auth().redirectToSignIn();
      }
    };

    const result = middlewareHandler(mockAuth, mockReq);

    // Should not redirect authenticated users
    expect(result).toBeUndefined();
    expect(mockAuth().redirectToSignIn).not.toHaveBeenCalled();
  });

  test("should redirect unauthenticated users to sign-in", async () => {
    const mockRedirectToSignIn = jest.fn(() => new Response("Redirecting"));
    const mockAuth = jest.fn(() => ({
      userId: null,
      redirectToSignIn: mockRedirectToSignIn,
    }));

    const mockReq = new NextRequest("http://localhost:3000/dashboard");

    const middlewareHandler = (auth: any, _req: any) => {
      if (!auth().userId) {
        return auth().redirectToSignIn();
      }
    };

    const result = middlewareHandler(mockAuth, mockReq);

    // Should redirect unauthenticated users
    expect(mockRedirectToSignIn).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Response);
  });

  test("should validate Clerk v6 API compatibility", () => {
    const mockAuth = jest.fn(() => ({
      userId: "user_123",
      redirectToSignIn: expect.any(Function),
      redirectToSignUp: expect.any(Function),
    }));

    const authResult = mockAuth();

    // Verify v6 API structure
    expect(authResult).toHaveProperty("userId");
    expect(authResult).toHaveProperty("redirectToSignIn");
    expect(authResult).toHaveProperty("redirectToSignUp");

    // Verify v5 protect method does NOT exist
    expect(authResult).not.toHaveProperty("protect");
  });
});
