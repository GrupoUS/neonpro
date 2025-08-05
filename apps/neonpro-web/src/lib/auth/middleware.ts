// lib/auth/middleware.ts
export function authMiddleware() {
  return {
    isAuthenticated: true,
    userId: "demo-user",
    roles: ["user"],
  };
}

export function requireAuth(request: Request) {
  const authorization = request.headers.get("authorization");
  return {
    isAuthenticated: !!authorization,
    userId: "demo-user",
  };
}
