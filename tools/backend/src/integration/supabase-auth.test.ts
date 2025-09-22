import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../packages/types/src/database.types";

describe("Supabase Authentication Tests", () => {
  let supabase: ReturnType<typeof createClient<Database>>;

  const testUser = {
    email: `test.${Date.now()}@neonpro.test`,
    password: "TestPassword123!",
    fullName: "Test User",
  };

  beforeAll(async () => {
    const config = {
      url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
      anonKey:
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY ||
        "",
    };

    if (!config.url || !config.anonKey) {
      throw new Error("Missing Supabase configuration for auth tests"
    }

    supabase = createClient<Database>(config.url, config.anonKey
  }

  afterAll(async () => {
    // Cleanup: Sign out any test sessions
    await supabase.auth.signOut(
  }

  describe("User Registration", () => {
    it("should register a new user", async () => {
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            full_name: testUser.fullName,
          },
        },
      }

      expect(error).toBeNull(
      expect(data.user).toBeDefined(
      expect(data.user?.email).toBe(testUser.email
    }
  }

  describe("User Authentication", () => {
    it("should sign in with valid credentials", async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      }

      expect(error).toBeNull(
      expect(data.user).toBeDefined(
      expect(data.session).toBeDefined(
      expect(data.user?.email).toBe(testUser.email
    }

    it("should reject invalid credentials", async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: "WrongPassword123!",
      }

      expect(error).toBeDefined(
      expect(data.user).toBeNull(
      expect(data.session).toBeNull(
    }
  }

  describe("Session Management", () => {
    it("should maintain session after sign in", async () => {
      // Sign in first
      await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      }

      // Check session
      const { data, error } = await supabase.auth.getSession(

      expect(error).toBeNull(
      expect(data.session).toBeDefined(
      expect(data.session?.user.email).toBe(testUser.email
    }

    it("should sign out successfully", async () => {
      const { error } = await supabase.auth.signOut(

      expect(error).toBeNull(

      // Verify session is cleared
      const { data } = await supabase.auth.getSession(
      expect(data.session).toBeNull(
    }
  }
}
